import React, { useState } from 'react';
import { Upload, Hash, FileText, DollarSign, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  computeSHA256,
  initiateUpload,
  uploadFile,
  registerAsset,
  setAssetPolicy,
  type AssetMetadata,
  type AssetPolicy
} from '@/services/aa-api-client';
import { getUserDID } from '@/services/aa-api-client';

type Step = 'upload' | 'metadata' | 'policy' | 'complete';

export const CreatorFlow: React.FC = () => {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [sha256, setSha256] = useState<string>('');
  const [assetId, setAssetId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Metadata
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  
  // Policy
  const [rights, setRights] = useState('stream,download');
  const [priceAmount, setPriceAmount] = useState('10');
  const [priceAsset, setPriceAsset] = useState('QCT');
  const [destChain, setDestChain] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setLoading(true);
    
    try {
      const hash = await computeSHA256(selectedFile);
      setSha256(hash);
      toast.success('File hash computed', { description: hash.substring(0, 16) + '...' });
    } catch (error) {
      toast.error('Failed to compute hash', { description: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file || !sha256) return;
    
    setLoading(true);
    try {
      // Step 1: Initiate upload
      const { uploadUrl, assetId: newAssetId } = await initiateUpload(sha256, file.type, file.size);
      setAssetId(newAssetId);
      
      // Step 2: PUT file to signed URL
      await uploadFile(uploadUrl, file);
      
      toast.success('File uploaded successfully');
      setStep('metadata');
    } catch (error) {
      toast.error('Upload failed', { description: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterMetadata = async () => {
    if (!assetId || !title) return;
    
    setLoading(true);
    try {
      const userDid = await getUserDID();
      const metadata: AssetMetadata = {
        title,
        description,
        creator: userDid,
        contentType: file?.type || 'application/octet-stream',
        tags: tags.split(',').map(t => t.trim()).filter(Boolean)
      };
      
      await registerAsset(assetId, metadata);
      toast.success('Asset registered');
      setStep('policy');
    } catch (error) {
      toast.error('Registration failed', { description: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSetPolicy = async () => {
    if (!assetId) return;
    
    setLoading(true);
    try {
      const userDid = await getUserDID();
      const policy: AssetPolicy = {
        rights: rights.split(',').map(r => r.trim()).filter(Boolean),
        priceAmount: parseFloat(priceAmount),
        priceAsset,
        payToDid: userDid,
        destChain: destChain || undefined
      };
      
      await setAssetPolicy(assetId, policy);
      toast.success('Policy set successfully');
      setStep('complete');
    } catch (error) {
      toast.error('Policy update failed', { description: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Create Asset</h1>
        <div className="flex gap-2">
          {['upload', 'metadata', 'policy', 'complete'].map((s, i) => (
            <div
              key={s}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s ? 'bg-primary text-primary-foreground' : 
                ['metadata', 'policy', 'complete'].slice(0, ['upload', 'metadata', 'policy', 'complete'].indexOf(step)).includes(s as Step)
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {step === 'upload' && (
        <Card className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="file">Select File</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileSelect}
              disabled={loading}
            />
          </div>
          
          {sha256 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                SHA-256 Hash
              </Label>
              <div className="p-3 bg-muted rounded-md font-mono text-sm break-all">
                {sha256}
              </div>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!file || !sha256 || loading}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </Button>
        </Card>
      )}

      {step === 'metadata' && (
        <Card className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Asset title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your asset"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="art, music, video"
            />
          </div>

          <Button
            onClick={handleRegisterMetadata}
            disabled={!title || loading}
            className="w-full"
          >
            <FileText className="w-4 h-4 mr-2" />
            Register Asset
          </Button>
        </Card>
      )}

      {step === 'policy' && (
        <Card className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="rights">Rights (comma-separated)</Label>
            <Input
              id="rights"
              value={rights}
              onChange={(e) => setRights(e.target.value)}
              placeholder="stream,download,resell"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priceAmount">Price Amount</Label>
              <Input
                id="priceAmount"
                type="number"
                value={priceAmount}
                onChange={(e) => setPriceAmount(e.target.value)}
                placeholder="10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceAsset">Price Asset</Label>
              <Input
                id="priceAsset"
                value={priceAsset}
                onChange={(e) => setPriceAsset(e.target.value)}
                placeholder="QCT"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="destChain">Destination Chain (optional)</Label>
            <Input
              id="destChain"
              value={destChain}
              onChange={(e) => setDestChain(e.target.value)}
              placeholder="ethereum, polygon, etc."
            />
          </div>

          <Button
            onClick={handleSetPolicy}
            disabled={!rights || !priceAmount || loading}
            className="w-full"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Set Policy
          </Button>
        </Card>
      )}

      {step === 'complete' && (
        <Card className="p-6 space-y-6 text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-primary" />
          <div>
            <h2 className="text-2xl font-bold mb-2">Asset Created!</h2>
            <p className="text-muted-foreground">
              Your asset has been successfully uploaded and configured.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Asset ID</Label>
            <div className="p-3 bg-muted rounded-md font-mono text-sm break-all">
              {assetId}
            </div>
          </div>
          <Button
            onClick={() => {
              setStep('upload');
              setFile(null);
              setSha256('');
              setAssetId('');
              setTitle('');
              setDescription('');
              setTags('');
              setRights('stream,download');
              setPriceAmount('10');
              setPriceAsset('QCT');
              setDestChain('');
            }}
            className="w-full"
          >
            Create Another Asset
          </Button>
        </Card>
      )}
    </div>
  );
};

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CreatorFlow } from '@/components/aa/CreatorFlow';
import { AssetLibrary } from '@/components/aa/AssetLibrary';
import { AssetDetail } from '@/components/aa/AssetDetail';
import { DIDLogin } from '@/components/aa/DIDLogin';
import { SharedAssetView } from '@/components/aa/SharedAssetView';

export const AAWallet: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<Navigate to="/aa/library" replace />} />
        <Route path="/library" element={<AssetLibrary />} />
        <Route path="/create" element={<CreatorFlow />} />
        <Route path="/asset/:assetId" element={<AssetDetail />} />
        <Route path="/login" element={<DIDLogin />} />
        <Route path="/shared" element={<SharedAssetView />} />
      </Routes>
    </div>
  );
};

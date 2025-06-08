
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, Lock, Eye, Database, Users, Globe } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="container py-6 max-w-4xl mx-auto">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              iQube Protocol Privacy Policy
            </CardTitle>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-sm max-w-none">
              <section>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Overview
                </h2>
                <p className="text-muted-foreground mb-4">
                  The iQube Protocol is built on the foundation of user privacy and data sovereignty. 
                  This privacy policy explains how we collect, use, and protect your information within 
                  the iQube ecosystem, emphasizing our commitment to your data privacy and control.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Collection and iQube Structure
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <div>
                    <h3 className="font-medium text-foreground mb-2">MetaQube (Public Layer)</h3>
                    <p>Contains non-sensitive metadata about your iQube including:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>iQube identifier and type</li>
                      <li>Designer information</li>
                      <li>Date minted</li>
                      <li>Related iQubes</li>
                      <li>Verifiability, accuracy, and risk scores</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-foreground mb-2">BlakQube (Private Layer)</h3>
                    <p>Contains your private, encrypted data including:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Professional information</li>
                      <li>Web3 interests and preferences</li>
                      <li>Location data (city level only)</li>
                      <li>Wallet addresses and blockchain interactions</li>
                      <li>Tokens and chains of interest</li>
                    </ul>
                    <p className="mt-2 font-medium">
                      This data is encrypted using advanced cryptographic methods and stored in your 
                      private BlakQube layer, accessible only to you.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-foreground mb-2">TokenQube (Ownership Layer)</h3>
                    <p>Contains blockchain-based ownership and access control data:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Token ID and ownership records</li>
                      <li>Access grants and permissions</li>
                      <li>Smart contract addresses</li>
                      <li>Network information</li>
                    </ul>
                  </div>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Data Encryption and Security
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Your BlakQube data is protected using industry-standard encryption protocols:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>AES-256 encryption for data at rest</li>
                    <li>End-to-end encryption for data in transit</li>
                    <li>Individual encryption keys per user</li>
                    <li>Zero-knowledge architecture - we cannot access your private data</li>
                    <li>Decentralized storage options available</li>
                  </ul>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className="text-lg font-semibold mb-3">Data Usage and AI Interactions</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>When you interact with our AI agents (Learn, Earn, Connect, MonDAI):</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Conversation data is stored locally and encrypted</li>
                    <li>AI responses are generated based on your explicit queries</li>
                    <li>Context from your iQube is used only to enhance response relevance</li>
                    <li>No conversation data is shared with third parties</li>
                    <li>You can delete conversation history at any time</li>
                  </ul>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className="text-lg font-semibold mb-3">External Connections</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>When you connect external services (LinkedIn, Twitter, Discord, etc.):</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Data import is entirely optional and user-controlled</li>
                    <li>Only explicitly requested data is imported</li>
                    <li>All imported data is encrypted in your BlakQube</li>
                    <li>You can disconnect services and delete imported data at any time</li>
                    <li>We use OAuth protocols and never store your passwords</li>
                  </ul>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Data Sharing and Community
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    You have complete control over what data is shared with the community:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Only MetaQube (public) data is visible to others by default</li>
                    <li>BlakQube data remains private unless you explicitly grant access</li>
                    <li>Granular permissions allow selective data sharing</li>
                    <li>All sharing is consensual and revocable</li>
                    <li>Community interactions are logged for transparency</li>
                  </ul>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className="text-lg font-semibold mb-3">Your Rights and Controls</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>As an iQube owner, you have the right to:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Access all your data stored in your iQube</li>
                    <li>Modify or delete any data in your BlakQube</li>
                    <li>Export your data in standard formats</li>
                    <li>Revoke access permissions at any time</li>
                    <li>Delete your iQube and all associated data</li>
                    <li>Opt out of any data collection or processing</li>
                  </ul>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className="text-lg font-semibold mb-3">Blockchain and Decentralization</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    The iQube Protocol leverages blockchain technology for:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Immutable ownership records</li>
                    <li>Decentralized access control</li>
                    <li>Transparent permission management</li>
                    <li>User-controlled data sovereignty</li>
                  </ul>
                  <p className="mt-2">
                    Blockchain transactions are public by nature, but only contain metadata 
                    and access control information, never your private data.
                  </p>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className="text-lg font-semibold mb-3">Compliance and Legal</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    The iQube Protocol is designed to comply with major privacy regulations:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>GDPR (General Data Protection Regulation)</li>
                    <li>CCPA (California Consumer Privacy Act)</li>
                    <li>SOX (Sarbanes-Oxley Act) compliance for applicable data</li>
                    <li>Industry-standard security frameworks</li>
                  </ul>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className="text-lg font-semibold mb-3">Contact and Updates</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    For privacy-related questions or concerns:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Email: privacy@iqube.protocol</li>
                    <li>Discord: Official iQube Community</li>
                    <li>Telegram: @iQubeProtocol</li>
                  </ul>
                  <p className="mt-4">
                    This privacy policy may be updated to reflect changes in our practices or 
                    applicable laws. We will notify users of significant changes through the platform.
                  </p>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

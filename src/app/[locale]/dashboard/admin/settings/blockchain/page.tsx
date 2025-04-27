'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'react-hot-toast';
import {
  Server,
  Shield,
  Link,
  AlertTriangle,
  ExternalLink,
  Clock,
  FileText,
  Copy,
  HelpCircle,
  Check,
  Key,
  RefreshCw,
  BadgeCheck,
  Info,
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function BlockchainSettingsPage() {
  const params = useParams();
  const locale = params?.locale as string || 'en';
  const baseUrl = `/${locale}/dashboard/admin/settings`;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  
  const [blockchainSettings, setBlockchainSettings] = useState({
    general: {
      provider: 'iota',
      networkType: 'mainnet',
      autoAnchor: true,
      retryCount: 3,
      batchSize: 10,
      walletSeed: '9F86D081884C7D659A2FEAA0C55AD015A3BF4F1B2B0B822CD15D6C15B0F00A08',
      minConfirmations: 5,
    },
    verification: {
      verificationMethod: 'onchain',
      permitPublic: true,
      requireProof: true,
      useSmartContracts: false,
      verificationTimeout: 30,
    },
    advanced: {
      customNode: '',
      useCustomNode: false,
      gasLimit: 2000000,
      gasPriceStrategy: 'medium',
      customGasPrice: '5',
      apiTimeout: 30,
      webhookUrl: '',
      enableWebhooks: false,
    }
  });
  
  const [nodeStatus, setNodeStatus] = useState({
    connected: true,
    nodeVersion: 'v1.5.7',
    protocol: 'IOTA Mainnet',
    syncStatus: 'Synchronized',
    milestoneIndex: '52436988',
    peerCount: 5,
    lastTx: '2023-10-15T18:35:12Z',
    successRate: '99.8%'
  });
  
  const handleGeneralSettingChange = (field: string, value: any) => {
    setBlockchainSettings(prev => ({
      ...prev,
      general: {
        ...prev.general,
        [field]: value
      }
    }));
  };
  
  const handleVerificationSettingChange = (field: string, value: any) => {
    setBlockchainSettings(prev => ({
      ...prev,
      verification: {
        ...prev.verification,
        [field]: value
      }
    }));
  };
  
  const handleAdvancedSettingChange = (field: string, value: any) => {
    setBlockchainSettings(prev => ({
      ...prev,
      advanced: {
        ...prev.advanced,
        [field]: value
      }
    }));
  };
  
  const saveSettings = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Blockchain settings saved successfully');
    } catch (error) {
      toast.error('Failed to save blockchain settings');
    } finally {
      setIsLoading(false);
    }
  };
  
  const testConnection = async () => {
    setIsTesting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setNodeStatus({
        ...nodeStatus,
        connected: true,
        syncStatus: 'Synchronized',
        lastTx: new Date().toISOString()
      });
      toast.success('Successfully connected to blockchain node');
    } catch (error) {
      toast.error('Failed to connect to blockchain node');
    } finally {
      setIsTesting(false);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };
  
  const generateNewSeed = () => {
    // Simulate generating a new seed
    const newSeed = Array.from({ length: 64 }, () => 
      "0123456789ABCDEF"[Math.floor(Math.random() * 16)]
    ).join('');
    
    handleGeneralSettingChange('walletSeed', newSeed);
    toast.success('Generated new wallet seed');
  };
  
  return (
    <SettingsLayout baseUrl={baseUrl}>
      <div className="space-y-6">
        <Tabs defaultValue="general">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Server className="mr-2 h-5 w-5" />
                  <CardTitle>Blockchain Configuration</CardTitle>
                </div>
                <CardDescription>
                  Configure blockchain provider and settings for storing credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="provider">Blockchain Provider</Label>
                    <Select 
                      value={blockchainSettings.general.provider} 
                      onValueChange={(value) => handleGeneralSettingChange('provider', value)}
                    >
                      <SelectTrigger id="provider">
                        <SelectValue placeholder="Select blockchain provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="iota">IOTA</SelectItem>
                        <SelectItem value="ethereum">Ethereum</SelectItem>
                        <SelectItem value="polygon">Polygon</SelectItem>
                        <SelectItem value="solana">Solana</SelectItem>
                        <SelectItem value="hyperledger">Hyperledger</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="networkType">Network Type</Label>
                    <Select 
                      value={blockchainSettings.general.networkType} 
                      onValueChange={(value) => handleGeneralSettingChange('networkType', value)}
                    >
                      <SelectTrigger id="networkType">
                        <SelectValue placeholder="Select network type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mainnet">Mainnet</SelectItem>
                        <SelectItem value="testnet">Testnet</SelectItem>
                        <SelectItem value="devnet">Devnet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoAnchor">Auto Anchor</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically anchor credentials to the blockchain when issued
                    </p>
                  </div>
                  <Switch
                    id="autoAnchor"
                    checked={blockchainSettings.general.autoAnchor}
                    onCheckedChange={(checked) => handleGeneralSettingChange('autoAnchor', checked)}
                  />
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="retryCount">Retry Count</Label>
                    <Input
                      id="retryCount"
                      type="number"
                      min="1"
                      max="10"
                      value={blockchainSettings.general.retryCount}
                      onChange={(e) => handleGeneralSettingChange('retryCount', parseInt(e.target.value) || 3)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Number of retry attempts for failed blockchain operations
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="batchSize">Batch Size</Label>
                    <Input
                      id="batchSize"
                      type="number"
                      min="1"
                      max="100"
                      value={blockchainSettings.general.batchSize}
                      onChange={(e) => handleGeneralSettingChange('batchSize', parseInt(e.target.value) || 10)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Number of credentials to process in a single batch
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="walletSeed">Wallet Seed (Private Key)</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateNewSeed}
                      className="flex items-center"
                    >
                      <RefreshCw className="mr-2 h-3 w-3" />
                      Generate New
                    </Button>
                  </div>
                  <div className="relative">
                    <Input
                      id="walletSeed"
                      type="password"
                      value={blockchainSettings.general.walletSeed}
                      onChange={(e) => handleGeneralSettingChange('walletSeed', e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => copyToClipboard(blockchainSettings.general.walletSeed)}
                    >
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy</span>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    The private key used to sign blockchain transactions. Keep this secure!
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="minConfirmations">Minimum Confirmations</Label>
                  <Input
                    id="minConfirmations"
                    type="number"
                    min="1"
                    max="100"
                    value={blockchainSettings.general.minConfirmations}
                    onChange={(e) => handleGeneralSettingChange('minConfirmations', parseInt(e.target.value) || 5)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum number of confirmations required to consider a transaction final
                  </p>
                </div>
                
                <div className="rounded-md bg-muted p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Info className="h-5 w-5 text-blue-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400">Node Information</h3>
                      <div className="mt-2 text-sm text-muted-foreground grid gap-1 sm:grid-cols-2">
                        <div className="flex justify-between sm:block">
                          <span className="font-medium">Status:</span>
                          <span className={nodeStatus.connected ? 'text-green-500' : 'text-red-500'}>
                            {nodeStatus.connected ? 'Connected' : 'Disconnected'}
                          </span>
                        </div>
                        <div className="flex justify-between sm:block">
                          <span className="font-medium">Version:</span>
                          <span>{nodeStatus.nodeVersion}</span>
                        </div>
                        <div className="flex justify-between sm:block">
                          <span className="font-medium">Protocol:</span>
                          <span>{nodeStatus.protocol}</span>
                        </div>
                        <div className="flex justify-between sm:block">
                          <span className="font-medium">Sync Status:</span>
                          <span>{nodeStatus.syncStatus}</span>
                        </div>
                        <div className="flex justify-between sm:block">
                          <span className="font-medium">Milestone:</span>
                          <span>{nodeStatus.milestoneIndex}</span>
                        </div>
                        <div className="flex justify-between sm:block">
                          <span className="font-medium">Peers:</span>
                          <span>{nodeStatus.peerCount}</span>
                        </div>
                        <div className="flex justify-between sm:block">
                          <span className="font-medium">Last TX:</span>
                          <span>{nodeStatus.lastTx}</span>
                        </div>
                        <div className="flex justify-between sm:block">
                          <span className="font-medium">Success Rate:</span>
                          <span>{nodeStatus.successRate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button
                    variant="outline"
                    onClick={testConnection}
                    disabled={isTesting}
                    className="flex items-center"
                  >
                    {isTesting ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Testing Connection...
                      </>
                    ) : (
                      <>
                        <Link className="mr-2 h-4 w-4" />
                        Test Node Connection
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="verification" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <BadgeCheck className="mr-2 h-5 w-5" />
                  <CardTitle>Verification Options</CardTitle>
                </div>
                <CardDescription>
                  Configure how credentials are verified on the blockchain
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="verificationMethod">Verification Method</Label>
                  <Select 
                    value={blockchainSettings.verification.verificationMethod} 
                    onValueChange={(value) => handleVerificationSettingChange('verificationMethod', value)}
                  >
                    <SelectTrigger id="verificationMethod">
                      <SelectValue placeholder="Select verification method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="onchain">On-chain (Full Verification)</SelectItem>
                      <SelectItem value="hybrid">Hybrid (Selected Data On-chain)</SelectItem>
                      <SelectItem value="hash">Hash-only (Fingerprint Verification)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Method used to verify credentials on the blockchain
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="permitPublic">Allow Public Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow public access to verify credentials without authentication
                    </p>
                  </div>
                  <Switch
                    id="permitPublic"
                    checked={blockchainSettings.verification.permitPublic}
                    onCheckedChange={(checked) => handleVerificationSettingChange('permitPublic', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="requireProof">Require Cryptographic Proof</Label>
                    <p className="text-sm text-muted-foreground">
                      Require verification to include cryptographic proof of credential integrity
                    </p>
                  </div>
                  <Switch
                    id="requireProof"
                    checked={blockchainSettings.verification.requireProof}
                    onCheckedChange={(checked) => handleVerificationSettingChange('requireProof', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="useSmartContracts">Use Smart Contracts</Label>
                    <p className="text-sm text-muted-foreground">
                      Use smart contracts for complex verification logic (Ethereum/Polygon only)
                    </p>
                  </div>
                  <Switch
                    id="useSmartContracts"
                    checked={blockchainSettings.verification.useSmartContracts}
                    onCheckedChange={(checked) => handleVerificationSettingChange('useSmartContracts', checked)}
                    disabled={blockchainSettings.general.provider === 'iota'}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="verificationTimeout">Verification Timeout (seconds)</Label>
                  <Input
                    id="verificationTimeout"
                    type="number"
                    min="5"
                    max="120"
                    value={blockchainSettings.verification.verificationTimeout}
                    onChange={(e) => handleVerificationSettingChange('verificationTimeout', parseInt(e.target.value) || 30)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum time to wait for blockchain verification to complete
                  </p>
                </div>
                
                <div className="rounded-md bg-amber-50 p-4 dark:bg-amber-900/20">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">Verification Trade-offs</h3>
                      <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                        <p>Different verification methods have different trade-offs:</p>
                        <ul className="list-disc space-y-1 pl-5 mt-1">
                          <li><strong>On-chain:</strong> Most secure, but highest cost and slowest</li>
                          <li><strong>Hybrid:</strong> Balance of security, cost, and speed</li>
                          <li><strong>Hash-only:</strong> Fastest and lowest cost, but limited verification capabilities</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  <CardTitle>Revocation Settings</CardTitle>
                </div>
                <CardDescription>
                  Configure credential revocation options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Credential revocation settings are managed separately in the Credentials section.
                  Visit <a href={`/${locale}/dashboard/admin/credentials/revocation`} className="text-primary underline">Revocation Settings</a> to configure these options.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Server className="mr-2 h-5 w-5" />
                  <CardTitle>Advanced Node Settings</CardTitle>
                </div>
                <CardDescription>
                  Configure advanced blockchain node settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="useCustomNode">Use Custom Node</Label>
                    <p className="text-sm text-muted-foreground">
                      Connect to a custom blockchain node instead of default nodes
                    </p>
                  </div>
                  <Switch
                    id="useCustomNode"
                    checked={blockchainSettings.advanced.useCustomNode}
                    onCheckedChange={(checked) => handleAdvancedSettingChange('useCustomNode', checked)}
                  />
                </div>
                
                {blockchainSettings.advanced.useCustomNode && (
                  <div className="space-y-2">
                    <Label htmlFor="customNode">Custom Node URL</Label>
                    <Input
                      id="customNode"
                      placeholder="https://example.com:14265"
                      value={blockchainSettings.advanced.customNode}
                      onChange={(e) => handleAdvancedSettingChange('customNode', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      URL of your custom blockchain node including protocol and port
                    </p>
                  </div>
                )}
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="gasPriceStrategy">Gas Price Strategy (Ethereum/Polygon)</Label>
                  <Select 
                    value={blockchainSettings.advanced.gasPriceStrategy} 
                    onValueChange={(value) => handleAdvancedSettingChange('gasPriceStrategy', value)}
                    disabled={blockchainSettings.general.provider === 'iota'}
                  >
                    <SelectTrigger id="gasPriceStrategy">
                      <SelectValue placeholder="Select gas price strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">Slow (Lowest Fee)</SelectItem>
                      <SelectItem value="medium">Medium (Standard Fee)</SelectItem>
                      <SelectItem value="fast">Fast (High Fee)</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {blockchainSettings.advanced.gasPriceStrategy === 'custom' && (
                  <div className="space-y-2">
                    <Label htmlFor="customGasPrice">Custom Gas Price (Gwei)</Label>
                    <Input
                      id="customGasPrice"
                      value={blockchainSettings.advanced.customGasPrice}
                      onChange={(e) => handleAdvancedSettingChange('customGasPrice', e.target.value)}
                      disabled={blockchainSettings.general.provider === 'iota'}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="gasLimit">Gas Limit (Ethereum/Polygon)</Label>
                  <Input
                    id="gasLimit"
                    type="number"
                    min="21000"
                    value={blockchainSettings.advanced.gasLimit}
                    onChange={(e) => handleAdvancedSettingChange('gasLimit', parseInt(e.target.value) || 2000000)}
                    disabled={blockchainSettings.general.provider === 'iota'}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum gas allowed for transactions (Ethereum/Polygon only)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="apiTimeout">API Timeout (seconds)</Label>
                  <Input
                    id="apiTimeout"
                    type="number"
                    min="5"
                    max="300"
                    value={blockchainSettings.advanced.apiTimeout}
                    onChange={(e) => handleAdvancedSettingChange('apiTimeout', parseInt(e.target.value) || 30)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Timeout for blockchain API requests
                  </p>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableWebhooks">Enable Webhooks</Label>
                    <p className="text-sm text-muted-foreground">
                      Send webhook notifications for blockchain events
                    </p>
                  </div>
                  <Switch
                    id="enableWebhooks"
                    checked={blockchainSettings.advanced.enableWebhooks}
                    onCheckedChange={(checked) => handleAdvancedSettingChange('enableWebhooks', checked)}
                  />
                </div>
                
                {blockchainSettings.advanced.enableWebhooks && (
                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">Webhook URL</Label>
                    <Input
                      id="webhookUrl"
                      placeholder="https://example.com/webhook"
                      value={blockchainSettings.advanced.webhookUrl}
                      onChange={(e) => handleAdvancedSettingChange('webhookUrl', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      URL to receive blockchain event notifications
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Key className="mr-2 h-5 w-5" />
                  <CardTitle>API Access</CardTitle>
                </div>
                <CardDescription>
                  Manage API keys for blockchain interaction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Administrator API Key</h3>
                    <p className="text-sm text-muted-foreground">
                      Full access to blockchain operations
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Key className="mr-2 h-4 w-4" />
                    Manage Key
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Verification API Key</h3>
                    <p className="text-sm text-muted-foreground">
                      Read-only access for verification operations
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Key className="mr-2 h-4 w-4" />
                    Manage Key
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Issuance API Key</h3>
                    <p className="text-sm text-muted-foreground">
                      Create and issue new credentials
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Key className="mr-2 h-4 w-4" />
                    Manage Key
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card>
          <CardFooter className="flex justify-end space-x-2 pt-6">
            <Button variant="outline">Reset to Defaults</Button>
            <Button 
              onClick={saveSettings} 
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </SettingsLayout>
  );
} 
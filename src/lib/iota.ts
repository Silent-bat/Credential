import { Client, initLogger } from "@iota/sdk";

// Initialize the IOTA logger
initLogger();

// Create a client instance
let client: Client | null = null;

// Initialize the IOTA client
export async function getIotaClient() {
  if (!client) {
    if (!process.env.IOTA_NODE_URL) {
      throw new Error("IOTA_NODE_URL environment variable is not set");
    }
    
    client = new Client({
      nodes: [process.env.IOTA_NODE_URL],
    });
  }
  
  return client;
}

// Store certificate data on the IOTA blockchain
export async function storeCertificateOnBlockchain(certData: any) {
  try {
    const client = await getIotaClient();
    
    // Convert certData to JSON string
    const dataString = JSON.stringify(certData);
    
    // Create a new wallet
    const secretManager = {
      mnemonic: generateSeed(),
    };
    
    const wallet = await client.createWallet({
      storagePath: "./wallet-database",
      coinType: 4218, // IOTA coin type
      secretManager,
    });
    
    // Get or create an account
    const account = await wallet.createAccount({
      alias: 'Certificate Account',
    });
    
    // Prepare data for the blockchain
    const blockData = {
      tag: 'BCDiploma',
      data: Buffer.from(dataString).toString('hex')
    };
    
    // Submit data to the blockchain
    const blockId = await account.sendTaggedData(blockData);
    
    return {
      success: true,
      blockId,
      explorerUrl: `${process.env.IOTA_EXPLORER_URL}/block/${blockId}`
    };
  } catch (error) {
    console.error("Error storing certificate on blockchain:", error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

// Verify a certificate on the blockchain
export async function verifyCertificateOnBlockchain(blockId: string) {
  try {
    const client = await getIotaClient();
    
    // Fetch the block
    const block = await client.getBlock(blockId);
    
    if (!block) {
      return {
        success: false,
        verified: false,
        error: "Block not found"
      };
    }
    
    // Extract and parse the certificate data
    // This is a simplified version, in reality you would need to extract the data
    // from the block payload which depends on the specific structure used when storing
    const certData = JSON.parse(Buffer.from(block.payload.tag, 'hex').toString());
    
    return {
      success: true,
      verified: true,
      data: certData
    };
  } catch (error) {
    console.error("Error verifying certificate:", error);
    return {
      success: false,
      verified: false,
      error: (error as Error).message
    };
  }
}

// Generate a seed for IOTA wallet
function generateSeed(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9';
  let seed = '';
  for (let i = 0; i < 81; i++) {
    seed += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return seed;
}

// Mock implementation of IOTA SDK for development
// This file provides stub implementations of IOTA functions

// Export mock functions for blockchain verification
export async function verifyCertificateOnBlockchain(certificateHash: string, transactionId?: string): Promise<boolean> {
  console.log(`[Mock] Verifying certificate on blockchain: ${certificateHash}, txId: ${transactionId}`);
  // For development, just return true
  return true;
}

// Export mock function for certificate issuance
export async function issueCertificateOnBlockchain(certificateHash: string, metadata: any): Promise<string> {
  console.log(`[Mock] Issuing certificate on blockchain: ${certificateHash}`);
  // Return a mock transaction ID
  return "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}

// Export a mock client for direct SDK access if needed
export const iotaClient = {
  connect: async () => console.log("[Mock] IOTA client connected"),
  disconnect: async () => console.log("[Mock] IOTA client disconnected"),
  getBalance: async () => ({ available: "1000000" }),
  getAddresses: async () => (["mock-address-1", "mock-address-2"]),
  sendTransaction: async () => ({ transactionId: "mock-transaction-id" })
}; 
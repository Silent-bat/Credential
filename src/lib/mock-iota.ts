// Mock implementation of IOTA SDK for development
// This file provides stub implementations of IOTA functions

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

// This is a mock implementation for interacting with IOTA blockchain
// In a production environment, this would be replaced with actual IOTA client implementation

import { v4 as uuidv4 } from 'uuid';

// Mock database to store certificate hashes and transaction IDs
const mockBlockchainDb: Record<string, string> = {};

/**
 * Mock function to upload a certificate hash to the IOTA blockchain
 * In a real-world scenario, this would create a transaction on the IOTA Tangle
 * 
 * @param pdfHash - The hash of the PDF certificate file
 * @returns A promise that resolves to a transaction ID
 */
export async function uploadCertificateToBlockchain(pdfHash: string): Promise<string> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate a mock transaction ID
  const txId = `IOTA${uuidv4().replace(/-/g, '').substring(0, 64)}`;
  
  // Store the hash and transaction ID in our mock database
  mockBlockchainDb[txId] = pdfHash;
  
  console.log(`[MOCK] Certificate hash ${pdfHash.substring(0, 10)}... uploaded to blockchain with txId: ${txId}`);
  
  return txId;
}

/**
 * Mock function to verify a certificate hash on the IOTA blockchain
 * In a real-world scenario, this would verify the transaction on the IOTA Tangle
 * 
 * @param pdfHash - The hash of the PDF certificate file to verify
 * @param txId - The transaction ID to check
 * @returns A promise that resolves to a boolean indicating if the certificate is verified
 */
export async function verifyCertificateOnBlockchain(pdfHash: string, txId: string): Promise<boolean> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Check if the transaction ID exists in our mock database
  if (!mockBlockchainDb[txId]) {
    console.log(`[MOCK] Transaction ID ${txId} not found in blockchain`);
    return false;
  }
  
  // Check if the hash matches
  const verified = mockBlockchainDb[txId] === pdfHash;
  
  console.log(`[MOCK] Certificate verification ${verified ? 'successful' : 'failed'} for txId: ${txId}`);
  
  return verified;
}

/**
 * Generate a unique verification ID for a certificate
 * 
 * @returns A verification ID string
 */
export function generateVerificationId(): string {
  return uuidv4().replace(/-/g, '').substring(0, 16);
}

/**
 * Get the verification URL for a certificate
 * 
 * @param verificationId - The verification ID of the certificate
 * @param baseUrl - The base URL of the application
 * @returns The full verification URL
 */
export function getVerificationUrl(verificationId: string, baseUrl: string): string {
  return `${baseUrl}/verify/${verificationId}`;
} 
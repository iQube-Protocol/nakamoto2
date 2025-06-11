
import { MetaQube } from '@/lib/types';

// Helper function to calculate Trust Score
const calculateTrustScore = (accuracyScore: number, verifiabilityScore: number): number => {
  return Math.round((accuracyScore + verifiabilityScore) / 2);
};

// Helper function to calculate Reliability Index
const calculateReliabilityIndex = (sensitivityScore: number, riskScore: number): number => {
  return Math.round((sensitivityScore + (100 - riskScore)) / 2);
};

export const monDaiQubeData: MetaQube = {
  "iQube-Identifier": "Qrypto Persona iQube",
  "iQube-Type": "DataQube",
  "iQube-Designer": "COYN Protocol",
  "iQube-Use": "Personal cryptocurrency profile and preferences data",
  "Owner-Type": "Private",
  "Owner-Identifiability": "AES-256",
  "Date-Minted": "2024-01-15",
  "Related-iQubes": [],
  "X-of-Y": "1/1",
  "Sensitivity-Score": 88,
  "Verifiability-Score": 87,
  "Accuracy-Score": 92,
  "Risk-Score": 15,
  get "Trust-Score"() { return calculateTrustScore(this["Accuracy-Score"], this["Verifiability-Score"]); },
  get "Reliability-Index"() { return calculateReliabilityIndex(this["Sensitivity-Score"], this["Risk-Score"]); }
};

export const veniceQubeData: MetaQube = {
  "iQube-Identifier": "Venice iQube",
  "iQube-Type": "AgentQube",
  "iQube-Designer": "COYN Protocol",
  "iQube-Use": "AI service that protects privacy and prevents censorship",
  "Owner-Type": "Private",
  "Owner-Identifiability": "AES-256",
  "Date-Minted": "2024-02-01",
  "Related-iQubes": [],
  "X-of-Y": "1/1",
  "Sensitivity-Score": 85,
  "Verifiability-Score": 90,
  "Accuracy-Score": 95,
  "Risk-Score": 12,
  get "Trust-Score"() { return calculateTrustScore(this["Accuracy-Score"], this["Verifiability-Score"]); },
  get "Reliability-Index"() { return calculateReliabilityIndex(this["Sensitivity-Score"], this["Risk-Score"]); }
};

export const metisQubeData: MetaQube = {
  "iQube-Identifier": "Metis iQube",
  "iQube-Type": "AgentQube",
  "iQube-Designer": "COYN Protocol",
  "iQube-Use": "An algorithm that evaluates risks associated with wallets and tokens",
  "Owner-Type": "Private",
  "Owner-Identifiability": "AES-256",
  "Date-Minted": "2024-01-20",
  "Related-iQubes": [],
  "X-of-Y": "1/1",
  "Sensitivity-Score": 82,
  "Verifiability-Score": 85,
  "Accuracy-Score": 89,
  "Risk-Score": 25,
  get "Trust-Score"() { return calculateTrustScore(this["Accuracy-Score"], this["Verifiability-Score"]); },
  get "Reliability-Index"() { return calculateReliabilityIndex(this["Sensitivity-Score"], this["Risk-Score"]); }
};

export const gdriveQubeData: MetaQube = {
  "iQube-Identifier": "GDrive iQube",
  "iQube-Type": "DataQube",
  "iQube-Designer": "COYN Protocol",
  "iQube-Use": "Google Drive document and file storage integration",
  "Owner-Type": "Private",
  "Owner-Identifiability": "AES-256",
  "Date-Minted": "2024-02-10",
  "Related-iQubes": [],
  "X-of-Y": "1/1",
  "Sensitivity-Score": 90,
  "Verifiability-Score": 88,
  "Accuracy-Score": 86,
  "Risk-Score": 18,
  get "Trust-Score"() { return calculateTrustScore(this["Accuracy-Score"], this["Verifiability-Score"]); },
  get "Reliability-Index"() { return calculateReliabilityIndex(this["Sensitivity-Score"], this["Risk-Score"]); }
};

export const contentQubeData: MetaQube = {
  "iQube-Identifier": "Content iQube",
  "iQube-Type": "DataQube",
  "iQube-Designer": "COYN Protocol",
  "iQube-Use": "User-generated content and media storage",
  "Owner-Type": "Private",
  "Owner-Identifiability": "AES-256",
  "Date-Minted": "2024-01-25",
  "Related-iQubes": [],
  "X-of-Y": "1/1",
  "Sensitivity-Score": 75,
  "Verifiability-Score": 81,
  "Accuracy-Score": 83,
  "Risk-Score": 22,
  get "Trust-Score"() { return calculateTrustScore(this["Accuracy-Score"], this["Verifiability-Score"]); },
  get "Reliability-Index"() { return calculateReliabilityIndex(this["Sensitivity-Score"], this["Risk-Score"]); }
};

export const modelQubeData: MetaQube = {
  "iQube-Identifier": "Model iQube",
  "iQube-Type": "AgentQube",
  "iQube-Designer": "COYN Protocol",
  "iQube-Use": "AI model configurations and training data",
  "Owner-Type": "Private",
  "Owner-Identifiability": "AES-256",
  "Date-Minted": "2024-02-15",
  "Related-iQubes": [],
  "X-of-Y": "1/1",
  "Sensitivity-Score": 78,
  "Verifiability-Score": 89,
  "Accuracy-Score": 94,
  "Risk-Score": 19,
  get "Trust-Score"() { return calculateTrustScore(this["Accuracy-Score"], this["Verifiability-Score"]); },
  get "Reliability-Index"() { return calculateReliabilityIndex(this["Sensitivity-Score"], this["Risk-Score"]); }
};

export const qubeData = {
  monDai: monDaiQubeData,
  venice: veniceQubeData,
  metis: metisQubeData,
  gdrive: gdriveQubeData,
  content: contentQubeData,
  model: modelQubeData
};

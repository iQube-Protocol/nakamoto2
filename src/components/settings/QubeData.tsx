
import { MetaQube } from "@/lib/types";

// Sample metaQube data for MonDAI (DataQube)
export const monDaiQubeData: MetaQube = {
  "iQube-Identifier": "MonDAI iQube",
  "iQube-Type": "DataQube",
  "iQube-Designer": "Aigent MonDAI",
  "iQube-Use": "For learning, earning and networking in web3 communities",
  "Owner-Type": "Person",
  "Owner-Identifiability": "Semi-Identifiable",
  "Date-Minted": new Date().toISOString(),
  "Related-iQubes": ["ContentQube1", "AgentQube1"],
  "X-of-Y": "5 of 20",
  "Sensitivity-Score": 4,
  "Verifiability-Score": 5,
  "Accuracy-Score": 5,
  "Risk-Score": 4
};

// Sample metaQube data for Metis (AgentQube)
export const metisQubeData: MetaQube = {
  "iQube-Identifier": "Metis iQube",
  "iQube-Type": "AgentQube",
  "iQube-Designer": "Aigent Metis",
  "iQube-Use": "Advanced agent for data analysis and insights",
  "Owner-Type": "Organization",
  "Owner-Identifiability": "Identifiable",
  "Date-Minted": new Date().toISOString(),
  "Related-iQubes": ["DataQube1", "ContentQube2"],
  "X-of-Y": "3 of 15",
  "Sensitivity-Score": 3,
  "Verifiability-Score": 8,
  "Accuracy-Score": 7,
  "Risk-Score": 3
};

// Sample metaQube data for GDrive (ToolQube)
export const gdriveQubeData: MetaQube = {
  "iQube-Identifier": "GDrive iQube",
  "iQube-Type": "ToolQube",
  "iQube-Designer": "Aigent Connect",
  "iQube-Use": "Connect to Google Drive for document management",
  "Owner-Type": "Person",
  "Owner-Identifiability": "Identifiable",
  "Date-Minted": new Date().toISOString(),
  "Related-iQubes": ["DataQube1"],
  "X-of-Y": "1 of 10",
  "Sensitivity-Score": 5,
  "Verifiability-Score": 9,
  "Accuracy-Score": 8,
  "Risk-Score": 4
};

// Sample metaQube data for Content (ContentQube)
export const contentQubeData: MetaQube = {
  "iQube-Identifier": "Content iQube",
  "iQube-Type": "ContentQube",
  "iQube-Designer": "Aigent Content",
  "iQube-Use": "Manage and share web3 educational content",
  "Owner-Type": "Person",
  "Owner-Identifiability": "Semi-Identifiable",
  "Date-Minted": new Date().toISOString(),
  "Related-iQubes": ["DataQube1"],
  "X-of-Y": "2 of 8",
  "Sensitivity-Score": 2,
  "Verifiability-Score": 7,
  "Accuracy-Score": 6,
  "Risk-Score": 3
};

// Sample metaQube data for Model (ModelQube)
export const modelQubeData: MetaQube = {
  "iQube-Identifier": "Model iQube",
  "iQube-Type": "ModelQube",
  "iQube-Designer": "Aigent Model",
  "iQube-Use": "AI model for data analysis and predictions",
  "Owner-Type": "Organization",
  "Owner-Identifiability": "Identifiable",
  "Date-Minted": new Date().toISOString(),
  "Related-iQubes": ["AgentQube1", "DataQube1"],
  "X-of-Y": "1 of 5",
  "Sensitivity-Score": 5,
  "Verifiability-Score": 6,
  "Accuracy-Score": 7,
  "Risk-Score": 4
};

export const qubeData = {
  monDai: monDaiQubeData,
  metis: metisQubeData,
  gdrive: gdriveQubeData,
  content: contentQubeData,
  model: modelQubeData
};

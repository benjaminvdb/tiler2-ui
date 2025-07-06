import { Client } from "@langchain/langgraph-sdk";

export const createClient = (
  apiUrl: string,
  apiKey: string | undefined,
): Client => {
  if (!apiKey) {
    throw new Error("API key is required to create client");
  }
  
  return new Client({
    apiKey,
    apiUrl,
  });
};

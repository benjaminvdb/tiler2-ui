import { Client } from "@langchain/langgraph-sdk";

export const createClient = (
  apiUrl: string,
  apiKey: string | undefined,
): Client => {
  return new Client({
    apiKey,
    apiUrl,
  });
};

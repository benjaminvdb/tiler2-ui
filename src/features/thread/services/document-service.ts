import { env } from "@/env";

export async function fetchDocumentPresignedUrl(
  filename: string,
  accessToken: string,
): Promise<string> {
  const apiUrl = env.API_URL;
  if (!apiUrl) {
    throw new Error("API URL is not configured");
  }

  const response = await fetch(
    `${apiUrl}/api/v1/documents/presigned-url?filename=${encodeURIComponent(filename)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch document URL: ${response.statusText}`);
  }

  const data = await response.json();
  return data.url;
}

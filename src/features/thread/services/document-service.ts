/**
 * Service for fetching pre-signed URLs to access secure document storage.
 */

import { env } from "@/env";
import { sanitizeExternalUrl } from "@/shared/utils/url-security";

export async function fetchDocumentPresignedUrl(
  filename: string,
  accessToken: string,
): Promise<string> {
  const apiUrl = env.API_URL;
  if (!apiUrl) {
    throw new Error("API URL is not configured");
  }

  const response = await fetch(
    `${apiUrl}/documents/presigned-url?filename=${encodeURIComponent(filename)}`,
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
  const safeUrl = sanitizeExternalUrl((data as { url?: unknown }).url, {
    allowHttp: import.meta.env.MODE === "development",
  });
  if (!safeUrl) {
    throw new Error("Invalid presigned document URL");
  }
  return safeUrl;
}

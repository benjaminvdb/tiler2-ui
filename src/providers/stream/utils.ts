export async function sleep(ms = 4000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function checkGraphStatus(
  apiUrl: string,
  apiKey: string | null,
): Promise<boolean> {
  try {
    const res = await fetch(`${apiUrl}/info`, {
      ...(apiKey && {
        headers: {
          "X-Api-Key": apiKey,
        },
      }),
    });

    return res.ok;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export { DEFAULT_API_URL, DEFAULT_ASSISTANT_ID } from "@/config";

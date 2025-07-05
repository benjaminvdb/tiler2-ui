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

export const DEFAULT_API_URL = "http://localhost:2024";
export const DEFAULT_ASSISTANT_ID = "agent";

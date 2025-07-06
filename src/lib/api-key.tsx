export const getApiKey = (): string | null => {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("lg:chat:apiKey") ?? null;
  } catch (error) {
    console.error("Failed to retrieve API key from localStorage:", error);
    return null;
  }
};

export const setApiKey = (key: string): void => {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("lg:chat:apiKey", key);
  } catch (error) {
    console.error("Failed to store API key in localStorage:", error);
  }
};

export const clearApiKey = (): void => {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem("lg:chat:apiKey");
  } catch (error) {
    console.error("Failed to clear API key from localStorage:", error);
  }
};

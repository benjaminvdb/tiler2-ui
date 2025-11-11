"use client";

/**
 * Network status monitoring provider.
 * Detects online/offline status and notifies user of connectivity changes.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

interface NetworkStatusContextType {
  isOnline: boolean;
}

const NetworkStatusContext = createContext<NetworkStatusContextType>({
  isOnline: true,
});

export const useNetworkStatus = (): NetworkStatusContextType =>
  useContext(NetworkStatusContext);

export const NetworkStatusProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Connection restored", {
        duration: 3000,
        id: "network-status", // Deduplicate toasts
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error("You are offline. Some features may not work.", {
        duration: Infinity, // Keep showing until online
        id: "network-status",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <NetworkStatusContext.Provider value={{ isOnline }}>
      {children}
    </NetworkStatusContext.Provider>
  );
};

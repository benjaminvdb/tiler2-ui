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

const NETWORK_STATUS_TOAST_ID = "network-status";
const ONLINE_TOAST_DURATION_MS = 3000;

// eslint-disable-next-line react-refresh/only-export-components
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
        duration: ONLINE_TOAST_DURATION_MS,
        id: NETWORK_STATUS_TOAST_ID,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error("You are offline. Some features may not work.", {
        duration: Infinity,
        id: NETWORK_STATUS_TOAST_ID,
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

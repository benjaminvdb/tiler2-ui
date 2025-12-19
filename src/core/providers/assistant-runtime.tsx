import { AssistantRuntimeProvider, useAssistantApi } from "@assistant-ui/react";
import {
  unstable_useRemoteThreadListRuntime as useRemoteThreadListRuntime,
} from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import type { AssistantApi } from "@assistant-ui/react";
import { getClientConfig } from "@/core/config/client";
import { useAuthenticatedFetch } from "@/core/services/http-client";
import { useBackendThreadListAdapter } from "./assistant-adapters";

interface AssistantProviderProps {
  children: React.ReactNode;
}

// Singleton ref holder outside component to avoid React hook lint issues
// This is safe because each thread gets its own instance of the runtime hook
const globalApiRef: { current: AssistantApi | null } = { current: null };

// Custom runtime hook that uses outer context for thread ID resolution
function useAuthenticatedChatRuntime(
  apiUrl: string,
  getAccessTokenSilently: () => Promise<string>,
  isAuthenticated: boolean,
) {
  // Get the outer context's API - this connects to OUR adapter
  const api = useAssistantApi();
  const threadState = api.threadListItem().getState();
  console.log('[useAuthenticatedChatRuntime] Called for thread:', threadState);

  // Store API in global ref so transport callback can access it
  useEffect(() => {
    globalApiRef.current = api;
    console.log('[useAuthenticatedChatRuntime] Updated globalApiRef');
  }, [api]);

  // Create transport - we create a new one each render but useChatRuntime handles this
  const transport = new AssistantChatTransport({
    api: `${apiUrl}/ai/chat`,
    headers: async () => {
      if (!isAuthenticated) return {};
      try {
        const token = await getAccessTokenSilently();
        return token ? { Authorization: `Bearer ${token}` } : {};
      } catch {
        return {};
      }
    },
    // Override the request to use our adapter's thread ID
    // We must include ALL required fields since returning body overrides the default
    prepareSendMessagesRequest: async (requestOptions) => {
      // Get thread ID from our outer adapter via the ref
      const currentApi = globalApiRef.current;
      if (!currentApi) {
        throw new Error("AssistantApi not available");
      }
      const { remoteId } = await currentApi.threadListItem().initialize();
      return {
        body: {
          ...(requestOptions.body as object),
          id: remoteId, // Override the thread ID with our adapter's remoteId
          messages: requestOptions.messages,
          trigger: requestOptions.trigger,
          messageId: requestOptions.messageId,
          metadata: requestOptions.requestMetadata,
        },
      };
    },
  });

  return useChatRuntime({
    transport,
  });
}

// Debug component to log runtime state
const RuntimeDebugger = () => {
  const api = useAssistantApi();
  useEffect(() => {
    const state = api.threads().getState();
    console.log('[RuntimeDebugger] Initial state:', {
      mainThreadId: state.mainThreadId,
      threadIds: state.threadIds,
      isLoading: state.isLoading,
    });
  }, [api]);
  return null;
};

// Inner component that creates the runtime - keyed by auth status to force remount
const AssistantProviderInner = ({
  children,
  isAuthenticated,
}: AssistantProviderProps & { isAuthenticated: boolean }) => {
  // Library requires hook-as-callback pattern for runtimeHook prop
  "use no memo";

  const apiUrl = getClientConfig().apiUrl;
  const fetchWithAuth = useAuthenticatedFetch();
  const { getAccessTokenSilently } = useAuth0();

  // Create thread list adapter with history provider
  const adapter = useBackendThreadListAdapter(
    apiUrl,
    fetchWithAuth,
    getAccessTokenSilently,
    isAuthenticated,
  );

  const runtime = useRemoteThreadListRuntime({
    // Pass custom hook that configures transport with auth and proper thread ID
    runtimeHook: () =>
      // eslint-disable-next-line react-hooks/rules-of-hooks -- library API requires hook-as-callback pattern
      useAuthenticatedChatRuntime(apiUrl, getAccessTokenSilently, isAuthenticated),
    adapter,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <RuntimeDebugger />
      {children}
    </AssistantRuntimeProvider>
  );
};

export const AssistantProvider = ({ children }: AssistantProviderProps) => {
  const { isAuthenticated } = useAuth0();

  // Key the inner provider by auth status to force complete remount when auth changes
  // This ensures the runtime re-fetches thread list with valid auth token
  return (
    <AssistantProviderInner
      key={isAuthenticated ? "authenticated" : "unauthenticated"}
      isAuthenticated={isAuthenticated}
    >
      {children}
    </AssistantProviderInner>
  );
};

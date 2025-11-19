export const PAGINATION_CONFIG = {
  /** Number of threads to fetch per page. Reduced from 100 to optimize payload size. */
  THREAD_LIST_PAGE_SIZE: 30,

  /** Number of thread history states to fetch with LangGraph SDK's fetchStateHistory. */
  THREAD_HISTORY_PAGE_SIZE: 20,

  /** Trigger pagination 200px before reaching the end for better UX. */
  PREFETCH_THRESHOLD: "200px 0px",

  /** Debounce delay to prevent rapid-fire API calls during fast scrolling. */
  SCROLL_DEBOUNCE_MS: 200,
} as const;

/**
 * Maintenance mode page displayed when VITE_MAINTENANCE_MODE=true.
 *
 * Design principles:
 * - Self-contained with no external dependencies (works even if other parts fail)
 * - Uses inline styles as fallback (works even if CSS fails to load)
 * - Lightweight and fast to render
 * - Accessible with proper semantic HTML
 * - Branded with sustainability theme colors
 */

/**
 * Inline styles ensure the page renders correctly even if Tailwind/CSS fails to load.
 * Colors match the sustainability theme from globals.css.
 */
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "1.5rem",
    backgroundColor: "#f5f3ef", // --stone
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  card: {
    maxWidth: "32rem",
    width: "100%",
    textAlign: "center" as const,
    padding: "2.5rem",
    backgroundColor: "#f9f8f6", // --off-white
    borderRadius: "0.75rem",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
  },
  iconContainer: {
    marginBottom: "1.5rem",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 400,
    color: "#0b3d2e", // --forest-green
    marginBottom: "1rem",
    fontFamily: "Lora, Georgia, serif",
    letterSpacing: "0.01em",
  },
  description: {
    fontSize: "1rem",
    color: "#5a5850", // --muted-foreground
    lineHeight: 1.7,
    marginBottom: "1.5rem",
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.625rem 1.25rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#f9f8f6", // --off-white
    backgroundColor: "#0b3d2e", // --forest-green
    border: "none",
    borderRadius: "0.375rem",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  buttonHover: {
    backgroundColor: "#093326", // slightly darker forest-green
  },
  footer: {
    marginTop: "1.5rem",
    fontSize: "0.875rem",
    color: "#5a5850", // --muted-foreground
  },
  link: {
    color: "#0b3d2e", // --forest-green
    textDecoration: "underline",
    textUnderlineOffset: "2px",
  },
};

/**
 * Simple leaf/plant icon as inline SVG to avoid external dependencies.
 */
const MaintenanceIcon = (): React.JSX.Element => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#93b1a6"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {/* Wrench/tool icon representing maintenance */}
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

/**
 * Refresh icon for the retry button.
 */
const RefreshIcon = (): React.JSX.Element => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
  </svg>
);

/**
 * Maintenance page component displayed when the application is in maintenance mode.
 * Fully self-contained to ensure it renders even if other parts of the app fail.
 */
export const MaintenancePage = (): React.JSX.Element => {
  const handleRetry = (): void => {
    window.location.reload();
  };

  return (
    <div style={styles.container}>
      <main
        style={styles.card}
        role="main"
        aria-labelledby="maintenance-title"
      >
        <div style={styles.iconContainer}>
          <MaintenanceIcon />
        </div>

        <h1
          id="maintenance-title"
          style={styles.title}
        >
          We&apos;ll be back soon
        </h1>

        <p style={styles.description}>
          We&apos;re currently performing scheduled maintenance to improve your
          experience. This won&apos;t take long.
        </p>

        <button
          type="button"
          onClick={handleRetry}
          style={styles.button}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor =
              styles.buttonHover.backgroundColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor =
              styles.button.backgroundColor;
          }}
          aria-label="Refresh page to check if maintenance is complete"
        >
          <RefreshIcon />
          Try again
        </button>

        <footer style={styles.footer}>
          <p>
            Questions?{" "}
            <a
              href="mailto:chat@linknature.io"
              style={styles.link}
            >
              Contact support
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
};

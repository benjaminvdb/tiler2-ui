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

import { Wrench } from "lucide-react";

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
    padding: "clamp(1.75rem, 4vw, 2.5rem)",
    backgroundColor: "#f9f8f6", // --off-white
    borderRadius: "0.75rem",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column" as const,
    gap: "0.5rem",
    marginBottom: "1.25rem",
  },
  iconWrap: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "clamp(2.5rem, 7vw, 3.25rem)",
    height: "clamp(2.5rem, 7vw, 3.25rem)",
  },
  title: {
    fontSize: "clamp(1.75rem, 4.5vw, 2.25rem)",
    fontWeight: 400,
    color: "#0b3d2e", // --forest-green
    marginBottom: 0,
    fontFamily: "Lora, Georgia, serif",
    letterSpacing: "0.01em",
  },
  description: {
    fontSize: "clamp(1rem, 2.7vw, 1.125rem)",
    color: "#5a5850", // --muted-foreground
    lineHeight: 1.7,
    marginBottom: "1.25rem",
  },
  helperText: {
    fontSize: "0.9375rem",
    color: "#5a5850", // --muted-foreground
    lineHeight: 1.6,
    marginBottom: "1.5rem",
  },
  footer: {
    marginTop: "1.5rem",
    fontSize: "0.875rem",
    color: "#5a5850", // --muted-foreground
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
    alignItems: "center",
  },
  link: {
    color: "#0b3d2e", // --forest-green
    textDecoration: "underline",
    textUnderlineOffset: "2px",
  },
};

/**
 * Wrench icon indicating maintenance.
 */
const MaintenanceIcon = (): React.JSX.Element => (
  <div
    style={styles.iconWrap}
    className="maintenance-icon"
  >
    <Wrench
      aria-hidden="true"
      focusable="false"
      color="#5a7a6a"
      strokeWidth={1.6}
      style={{ width: "100%", height: "100%" }}
    />
  </div>
);

const SUPPORT_EMAIL = "chat@linknature.io";

/**
 * Maintenance page component displayed when the application is in maintenance mode.
 * Fully self-contained to ensure it renders even if other parts of the app fail.
 */
export const MaintenancePage = (): React.JSX.Element => {
  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes maintenance-float {
            0%, 100% { transform: translateY(0) rotate(-2deg); }
            50% { transform: translateY(-4px) rotate(2deg); }
          }
          .maintenance-icon svg {
            animation: maintenance-float 3.6s ease-in-out infinite;
            transform-origin: 50% 50%;
          }
          @media (prefers-reduced-motion: reduce) {
            .maintenance-icon svg {
              animation: none;
            }
          }
        `}
      </style>
      <main
        style={styles.card}
        role="main"
        aria-labelledby="maintenance-title"
      >
        <div style={styles.headerRow}>
          <MaintenanceIcon />

          <h1
            id="maintenance-title"
            style={styles.title}
          >
            Back in a moment
          </h1>
        </div>

        <p style={styles.description}>
          We&apos;re doing a bit of scheduled maintenance. Shouldn&apos;t be
          long.
        </p>

        <footer style={styles.footer}>
          Questions? Contact support:
          <span>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              style={styles.link}
            >
              {SUPPORT_EMAIL}
            </a>
          </span>
        </footer>
      </main>
    </div>
  );
};

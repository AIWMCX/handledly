/**
 * Skip-to-content link for keyboard and screen reader users.
 * Becomes visible only on focus (Tab key).
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:text-sm focus:font-medium focus:shadow-depth-3 focus:outline-none focus:ring-2 focus:ring-accent"
    >
      Skip to main content
    </a>
  );
}

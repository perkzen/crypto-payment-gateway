/**
 * Route configuration for breadcrumbs and navigation
 * Add new routes here to automatically update breadcrumbs throughout the app
 */
export const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  payments: 'Payments',
  settings: 'Settings',
  'api-keys': 'API Keys',
  webhooks: 'Webhooks',
  // Add more routes here as needed
};

/**
 * Formats a route segment into a human-readable label
 * Uses the route config if available, otherwise capitalizes the segment
 */
export function formatRouteSegment(segment: string): string {
  return (
    ROUTE_LABELS[segment] ??
    segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  );
}


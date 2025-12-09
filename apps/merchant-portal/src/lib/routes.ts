/**
 *  * Route constants used throughout the Merchant Portal application
 *
 */
export const ROUTES = {
  DASHBOARD: 'dashboard',
  PAYMENTS: 'payments',
  SIGN_IN: 'sign-in',
  SETTINGS: 'settings',
  API_KEYS: 'api-keys',
  WEBHOOKS: 'webhooks',
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];

/**
 * Full path constants for navigation and links
 */
export const ROUTE_PATHS = {
  DASHBOARD: '/dashboard',
  PAYMENTS: '/dashboard/payments',
  SETTINGS: '/dashboard/settings',
  API_KEYS: '/dashboard/settings/api-keys',
  WEBHOOKS: '/dashboard/settings/webhooks',
  SIGN_IN: '/sign-in',
} as const;

export type RoutePath = (typeof ROUTE_PATHS)[keyof typeof ROUTE_PATHS];

/**
 * Route configuration for breadcrumbs and navigation
 * Add new routes here to automatically update breadcrumbs throughout the app
 */
export const ROUTE_LABELS: Partial<Record<Route, string>> = {
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.PAYMENTS]: 'Payments',
  [ROUTES.SETTINGS]: 'Settings',
  [ROUTES.API_KEYS]: 'API Keys',
  [ROUTES.WEBHOOKS]: 'Webhooks',
} as const;

/**
 * Formats a route segment into a human-readable label
 * Uses the route config if available, otherwise capitalizes the segment
 */
export function formatRouteSegment(segment: Route): string {
  return (
    ROUTE_LABELS[segment] ??
    segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  );
}

/**
 * Stub for @base-org/account
 * This is an optional dependency that's only needed when using Base Account connector.
 * Since we're not using Base Account, we provide a stub to prevent build errors.
 */

export function createBaseAccountSDK(_params: unknown) {
  throw new Error(
    '@base-org/account is not installed. Base Account connector is not configured.',
  );
}

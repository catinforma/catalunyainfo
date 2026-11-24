/**
 * Master switch for AdSense (see lib/ads/config.ts). Kept in a file with no
 * imports so next.config.ts can read it through lib/security-headers.ts.
 * False = no ad code, the CSP closes again and the first-party banner returns.
 */
export const ADS_LIVE = true;

export const LOCAL_MODULES_KEY = "ghn_mfe_local_modules";
export const LOCAL_MODULES_DEV_STATUS_KEY = "ghn_mfe_development";

// Legacy single-bucket key — kept only so any pre-1.2.0 saved state can be detected and cleared.
export const DEVTOOLS_LOCAL_MODULES_KEY = "devtools_local_modules";

// New hostname-keyed extension storage
export const EXTENSION_OVERRIDES_KEY = "ghn_inspector_overrides";
export const EXTENSION_API_DEFAULTS_KEY = "ghn_inspector_api_defaults";

export function getHostnameFromUrl(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

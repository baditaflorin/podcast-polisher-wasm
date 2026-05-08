export const buildInfo = {
  version: __APP_VERSION__,
  commit: __APP_COMMIT__,
  builtAt: __APP_BUILT_AT__
} as const;

export const appLinks = {
  repositoryUrl: __REPOSITORY_URL__,
  pagesUrl: __PAGES_URL__,
  supportUrl: __SUPPORT_URL__
} as const;

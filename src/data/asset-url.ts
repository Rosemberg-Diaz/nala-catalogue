// Database URLs stay independent of deployment paths; adapt only local assets.
export function assetUrl(url: string) {
  return url.startsWith('/images/') ? `${import.meta.env.BASE_URL}${url.slice(1)}` : url;
}

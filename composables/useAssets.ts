const assetCache = new Map<string, string>();

export const useAssets = (image: string) => {
  const { $directus } = useNuxtApp();

  if (assetCache.has(image)) {
    return assetCache.get(image);
  }

  const url = `${$directus.url}assets/${image}`;
  assetCache.set(image, url);

  return url;
};
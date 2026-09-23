export const ARTICLES_PER_PAGE = 12;

export const paginate = <T>(items: T[], page: number, perPage: number): T[] => {
  if (!items || items.length === 0) return [];
  if (page <= 0) return [];
  
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  
  if (startIndex >= items.length) return [];
  
  return items.slice(startIndex, endIndex);
};

export const getTotalPages = (totalItems: number, perPage: number): number => {
  if (totalItems <= 0) return 1;
  return Math.ceil(totalItems / perPage);
};

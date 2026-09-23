import { describe, expect, it } from 'vitest';
import { paginate, getTotalPages } from './pagination';

describe('pagination.ts', () => {
  describe('paginate', () => {
    it('should return first perPage items for page 1', () => {
      // Given
      const items = Array.from({ length: 30 }, (_, i) => i + 1);
      const page = 1;
      const perPage = 12;

      // When
      const result = paginate(items, page, perPage);

      // Then
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    });

    it('should return corresponding items for intermediate page', () => {
      // Given
      const items = Array.from({ length: 30 }, (_, i) => i + 1);
      const page = 2;
      const perPage = 12;

      // When
      const result = paginate(items, page, perPage);

      // Then
      expect(result).toEqual([13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]);
    });

    it('should return remainder for last page', () => {
      // Given
      const items = Array.from({ length: 30 }, (_, i) => i + 1);
      const page = 3;
      const perPage = 12;

      // When
      const result = paginate(items, page, perPage);

      // Then
      expect(result).toEqual([25, 26, 27, 28, 29, 30]);
    });

    it('should return full last page when items length is exact multiple of perPage', () => {
      // Given
      const items = Array.from({ length: 24 }, (_, i) => i + 1);
      const page = 2;
      const perPage = 12;

      // When
      const result = paginate(items, page, perPage);

      // Then
      expect(result).toEqual([13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]);
    });

    it('should return empty array for out of range page', () => {
      // Given
      const items = Array.from({ length: 12 }, (_, i) => i + 1);
      const page = 2;
      const perPage = 12;

      // When
      const result = paginate(items, page, perPage);

      // Then
      expect(result).toEqual([]);
    });

    it('should return empty array when input is empty array', () => {
      // Given
      const items: number[] = [];
      const page = 1;
      const perPage = 12;

      // When
      const result = paginate(items, page, perPage);

      // Then
      expect(result).toEqual([]);
    });

    it('should return empty array for page <= 0', () => {
      // Given
      const items = Array.from({ length: 12 }, (_, i) => i + 1);
      const page = 0;
      const perPage = 12;

      // When
      const result = paginate(items, page, perPage);

      // Then
      expect(result).toEqual([]);
    });
  });

  describe('getTotalPages', () => {
    it('should round up when totalItems is not divisible by perPage', () => {
      // Given
      const totalItems = 30;
      const perPage = 12;

      // When
      const result = getTotalPages(totalItems, perPage);

      // Then
      expect(result).toBe(3);
    });

    it('should return exact pages when totalItems is divisible by perPage', () => {
      // Given
      const totalItems = 24;
      const perPage = 12;

      // When
      const result = getTotalPages(totalItems, perPage);

      // Then
      expect(result).toBe(2);
    });

    it('should return 1 when totalItems <= perPage', () => {
      // Given
      const totalItems = 12;
      const perPage = 12;

      // When
      const result = getTotalPages(totalItems, perPage);

      // Then
      expect(result).toBe(1);
    });

    it('should return 1 when totalItems is 0', () => {
      // Given
      const totalItems = 0;
      const perPage = 12;

      // When
      const result = getTotalPages(totalItems, perPage);

      // Then
      expect(result).toBe(1);
    });
  });

  describe('invariants', () => {
    const testCases = [
      { items: Array.from({ length: 30 }, (_, i) => i + 1), perPage: 12 },
      { items: Array.from({ length: 24 }, (_, i) => i + 1), perPage: 12 },
      { items: Array.from({ length: 5 }, (_, i) => i + 1), perPage: 12 },
      { items: [], perPage: 12 },
      { items: Array.from({ length: 100 }, (_, i) => i + 1), perPage: 10 },
    ];

    it('should equal the original array when concatenating all pages', () => {
      for (const { items, perPage } of testCases) {
        if (items.length === 0) {
          expect(paginate(items, 1, perPage)).toEqual([]);
          continue;
        }
        
        const totalPages = getTotalPages(items.length, perPage);
        const concatenatedPages = Array.from({ length: totalPages }, (_, i) =>
          paginate(items, i + 1, perPage)
        ).flat();

        expect(concatenatedPages).toEqual(items);
      }
    });

    it('should have no more than perPage items on any page', () => {
      for (const { items, perPage } of testCases) {
        const totalPages = getTotalPages(items.length, perPage);
        for (let page = 1; page <= totalPages; page++) {
          const result = paginate(items, page, perPage);
          expect(result.length).toBeLessThanOrEqual(perPage);
        }
      }
    });
  });
});

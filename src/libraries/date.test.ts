import { describe, expect, it } from 'vitest';
import { toIsoDateString } from './date';

describe('date.ts', () => {
  describe('toIsoDateString', () => {
    it('should convert YYYY/MM/DD to YYYY-MM-DD', () => {
      // Given
      const input = '2020/10/25';
      // When
      const result = toIsoDateString(input);
      // Then
      expect(result).toBe('2020-10-25');
    });

    it('should zero-pad month and day', () => {
      // Given
      const input = '2026/4/1';
      // When
      const result = toIsoDateString(input);
      // Then
      expect(result).toBe('2026-04-01');
    });

    it('should throw when the date string is invalid', () => {
      // Given
      const input = 'invalid';
      // When / Then
      expect(() => toIsoDateString(input)).toThrow(Error);
    });
  });
});

import { describe, it, expect } from 'vitest';

// Simple utility function for testing
const formatIssueTitle = (title) => {
  return title ? title.trim().substring(0, 100) : '';
};

const isIssuePriority = (priority) => {
  return ['low', 'medium', 'high'].includes(priority?.toLowerCase());
};

describe('Frontend Utilities', () => {
  describe('formatIssueTitle', () => {
    it('should format title correctly', () => {
      const title = '  Test Issue  ';
      expect(formatIssueTitle(title)).toBe('Test Issue');
    });

    it('should truncate long titles to 100 characters', () => {
      const longTitle = 'a'.repeat(150);
      expect(formatIssueTitle(longTitle).length).toBe(100);
    });

    it('should return empty string for null or undefined', () => {
      expect(formatIssueTitle(null)).toBe('');
      expect(formatIssueTitle(undefined)).toBe('');
    });
  });

  describe('isIssuePriority', () => {
    it('should validate correct priorities', () => {
      expect(isIssuePriority('low')).toBe(true);
      expect(isIssuePriority('medium')).toBe(true);
      expect(isIssuePriority('high')).toBe(true);
    });

    it('should be case insensitive', () => {
      expect(isIssuePriority('LOW')).toBe(true);
      expect(isIssuePriority('High')).toBe(true);
      expect(isIssuePriority('MEDIUM')).toBe(true);
    });

    it('should reject invalid priorities', () => {
      expect(isIssuePriority('urgent')).toBe(false);
      expect(isIssuePriority('critical')).toBe(false);
      expect(isIssuePriority('')).toBe(false);
    });
  });
});

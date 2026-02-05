import { describe, it, expect } from 'vitest';

// Simple utility functions for testing
const formatIssueTitle = (title) => {
  return title ? title.trim().substring(0, 100) : '';
};

const isIssuePriority = (priority) => {
  return ['low', 'medium', 'high'].includes(priority?.toLowerCase());
};

const calculateDaysOverdue = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = now - due;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

describe('Utility Functions Unit Tests', () => {
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

  describe('calculateDaysOverdue', () => {
    it('should return 0 for future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      expect(calculateDaysOverdue(futureDate)).toBe(0);
    });

    it('should calculate days correctly for past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      const daysOverdue = calculateDaysOverdue(pastDate);
      expect(daysOverdue).toBeGreaterThan(0);
    });
  });
});

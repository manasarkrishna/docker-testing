const { validateEmail, validateUsername, validatePassword } = require('../utils/validators');

describe('Validation Utilities', () => {
  describe('Email Validation', () => {
    test('should validate correct email format', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.user@domain.co.uk')).toBe(true);
    });

    test('should reject invalid email formats', () => {
      expect(validateEmail('invalid.email')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('Username Validation', () => {
    test('should validate username with 3 or more characters', () => {
      expect(validateUsername('john')).toBe(true);
      expect(validateUsername('user123')).toBe(true);
    });

    test('should reject username with less than 3 characters', () => {
      expect(validateUsername('ab')).toBe(false);
      expect(validateUsername('a')).toBe(false);
      expect(validateUsername('')).toBe(false);
    });

    test('should reject null or undefined', () => {
      expect(validateUsername(null)).toBe(false);
      expect(validateUsername(undefined)).toBe(false);
    });
  });

  describe('Password Validation', () => {
    test('should validate password with 6 or more characters', () => {
      expect(validatePassword('password123')).toBe(true);
      expect(validatePassword('123456')).toBe(true);
    });

    test('should reject password with less than 6 characters', () => {
      expect(validatePassword('pass')).toBe(false);
      expect(validatePassword('12345')).toBe(false);
      expect(validatePassword('')).toBe(false);
    });

    test('should reject null or undefined', () => {
      expect(validatePassword(null)).toBe(false);
      expect(validatePassword(undefined)).toBe(false);
    });
  });
});

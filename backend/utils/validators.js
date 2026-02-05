// Utility functions for validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateUsername = (username) => {
  return username !== null && username !== undefined && username.length >= 3;
};

const validatePassword = (password) => {
  return password !== null && password !== undefined && password.length >= 6;
};

module.exports = {
  validateEmail,
  validateUsername,
  validatePassword,
};

import crypto from 'crypto';

export function generateToken(length = 25) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?/`~';
  const charsLen = charset.length;
  let token = '';
  // Use crypto.randomInt for secure random indices
  for (let i = 0; i < length; i++) {
    const idx = crypto.randomInt(0, charsLen);
    token += charset[idx];
  }
  return token;
}
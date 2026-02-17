import crypto from 'crypto';

export function generateToken(length = 25) {
  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?/`~';
  const charsLen = charset.length;
  let token = '';
  // Use crypto.randomInt for secure random indices
  for (let i = 0; i < length; i++) {
    const idx = crypto.randomInt(0, charsLen);
    token += charset[idx];
  }
  return token;
}

export const validateRequired = (
  value: any,
  fieldName: string,
): string | null => {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} wajib diisi`;
  }
  return null;
};

export const validateString = (
  value: any,
  fieldName: string,
): string | null => {
  if (typeof value !== 'string') {
    return `${fieldName} harus berupa string`;
  }
  return null;
};

export const validateMinLength = (
  value: string,
  min: number,
  fieldName: string,
): string | null => {
  if (value.length < min) {
    return `${fieldName} minimal ${min} karakter`;
  }
  return null;
};

export const validateMaxLength = (
  value: string,
  max: number,
  fieldName: string,
): string | null => {
  if (value.length > max) {
    return `${fieldName} maksimal ${max} karakter`;
  }
  return null;
};

export const validateEmail = (
  value: string,
  fieldName: string,
): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return `${fieldName} harus berupa email yang valid`;
  }
  return null;
};

export const validateArray = (value: any, fieldName: string): string | null => {
  if (!Array.isArray(value)) {
    return `${fieldName} harus berupa array`;
  }
  return null;
};

export const validateArrayOfNumbers = (
  value: any[],
  fieldName: string,
): string | null => {
  for (const item of value) {
    if (typeof item !== 'number' || isNaN(item)) {
      return `${fieldName} harus berisi angka`;
    }
  }
  return null;
};

// English validation messages
export const validateRequiredEn = (
  value: any,
  fieldName: string,
): string | null => {
  if (value === null || value === undefined || value === '') {
    return `The ${fieldName} field is required`;
  }
  return null;
};

export const validateStringEn = (
  value: any,
  fieldName: string,
): string | null => {
  if (typeof value !== 'string') {
    return `The ${fieldName} must be a string`;
  }
  return null;
};

export const validateMinLengthEn = (
  value: string,
  min: number,
  fieldName: string,
): string | null => {
  if (value.length < min) {
    return `The ${fieldName} must be at least ${min} characters`;
  }
  return null;
};

export const validateMaxLengthEn = (
  value: string,
  max: number,
  fieldName: string,
): string | null => {
  if (value.length > max) {
    return `The ${fieldName} may not be greater than ${max} characters`;
  }
  return null;
};

export const validateEmailEn = (
  value: string,
  fieldName: string,
): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return `The ${fieldName} must be a valid email address`;
  }
  return null;
};

export const validateArrayEn = (
  value: any,
  fieldName: string,
): string | null => {
  if (!Array.isArray(value)) {
    return `The ${fieldName} must be an array`;
  }
  return null;
};

export const validateArrayOfNumbersEn = (
  value: any[],
  fieldName: string,
): string | null => {
  for (const item of value) {
    if (typeof item !== 'number' || isNaN(item)) {
      return `The ${fieldName} must contain numbers`;
    }
  }
  return null;
};

export const validateNumeric = (
  value: any,
  fieldName: string,
): string | null => {
  if (typeof value !== 'number' || isNaN(value)) {
    return `${fieldName} harus berupa angka`;
  }
  return null;
};

export const validateNumericEn = (
  value: any,
  fieldName: string,
): string | null => {
  if (typeof value !== 'number' || isNaN(value)) {
    return `The ${fieldName} must be a number`;
  }
  return null;
};

export const validateArrayOfStrings = (
  value: any[],
  fieldName: string,
): string | null => {
  for (const item of value) {
    if (typeof item !== 'string') {
      return `${fieldName} harus berisi string`;
    }
  }
  return null;
};

export const validateArrayOfStringsEn = (
  value: any[],
  fieldName: string,
): string | null => {
  for (const item of value) {
    if (typeof item !== 'string') {
      return `The ${fieldName} must contain strings`;
    }
  }
  return null;
};

export const validateDate = (value: any, fieldName: string): string | null => {
  if (!value || isNaN(new Date(value).getTime())) {
    return `${fieldName} harus berupa tanggal yang valid`;
  }
  return null;
};

export const validateDateEn = (
  value: any,
  fieldName: string,
): string | null => {
  if (!value || isNaN(new Date(value).getTime())) {
    return `The ${fieldName} must be a valid date`;
  }
  return null;
};

export const validateIn = (
  value: any,
  allowedValues: any[],
  fieldName: string,
): string | null => {
  if (!allowedValues.includes(value)) {
    return `${fieldName} harus salah satu dari: ${allowedValues.join(', ')}`;
  }
  return null;
};

export const validateInEn = (
  value: any,
  allowedValues: any[],
  fieldName: string,
): string | null => {
  if (!allowedValues.includes(value)) {
    return `The ${fieldName} must be one of: ${allowedValues.join(', ')}`;
  }
  return null;
};

// Simplified validation function
export const validateField = (
  value: any,
  rules: {
    id: Array<{
      validator: (val: any, ...args: any[]) => string | null;
      args?: any[];
    }>;
    en: Array<{
      validator: (val: any, ...args: any[]) => string | null;
      args?: any[];
    }>;
  },
): { id: string | null; en: string | null } => {
  let errorId: string | null = null;
  let errorEn: string | null = null;

  for (const rule of rules.id) {
    const error = rule.validator(value, ...(rule.args || []));
    if (error) {
      errorId = error;
      break;
    }
  }

  for (const rule of rules.en) {
    const error = rule.validator(value, ...(rule.args || []));
    if (error) {
      errorEn = error;
      break;
    }
  }

  return { id: errorId, en: errorEn };
};

// Validation rules configuration
export const getValidationRules = () => ({
  name: {
    id: [
      { validator: validateRequired, args: ['nama'] },
      { validator: validateString, args: ['nama'] },
      { validator: validateMinLength, args: [2, 'nama'] },
      { validator: validateMaxLength, args: [255, 'nama'] },
    ],
    en: [
      { validator: validateRequiredEn, args: ['name'] },
      { validator: validateStringEn, args: ['name'] },
      { validator: validateMinLengthEn, args: [2, 'name'] },
      { validator: validateMaxLengthEn, args: [255, 'name'] },
    ],
  },
  email: {
    id: [
      { validator: validateRequired, args: ['email'] },
      { validator: validateString, args: ['email'] },
      { validator: validateEmail, args: ['email'] },
    ],
    en: [
      { validator: validateRequiredEn, args: ['email'] },
      { validator: validateStringEn, args: ['email'] },
      { validator: validateEmailEn, args: ['email'] },
    ],
  },
  password: {
    id: [
      { validator: validateRequired, args: ['kata sandi'] },
      { validator: validateString, args: ['kata sandi'] },
      { validator: validateMinLength, args: [6, 'kata sandi'] },
    ],
    en: [
      { validator: validateRequiredEn, args: ['password'] },
      { validator: validateStringEn, args: ['password'] },
      { validator: validateMinLengthEn, args: [6, 'password'] },
    ],
  },
  phone_number: {
    id: [
      { validator: validateRequired, args: ['nomor telepon'] },
      { validator: validateString, args: ['nomor telepon'] },
      { validator: validateMinLength, args: [5, 'nomor telepon'] },
      { validator: validateMaxLength, args: [20, 'nomor telepon'] },
    ],
    en: [
      { validator: validateRequiredEn, args: ['phone number'] },
      { validator: validateStringEn, args: ['phone number'] },
      { validator: validateMinLengthEn, args: [5, 'phone number'] },
      { validator: validateMaxLengthEn, args: [20, 'phone number'] },
    ],
  },
  city: {
    id: [
      { validator: validateRequired, args: ['kota'] },
      { validator: validateString, args: ['kota'] },
      { validator: validateMinLength, args: [2, 'kota'] },
      { validator: validateMaxLength, args: [255, 'kota'] },
    ],
    en: [
      { validator: validateRequiredEn, args: ['city'] },
      { validator: validateStringEn, args: ['city'] },
      { validator: validateMinLengthEn, args: [2, 'city'] },
      { validator: validateMaxLengthEn, args: [255, 'city'] },
    ],
  },
  priority_needs: {
    id: [
      { validator: validateArray, args: ['kebutuhan prioritas'] },
      { validator: validateArrayOfStrings, args: ['kebutuhan prioritas'] },
    ],
    en: [
      { validator: validateArrayEn, args: ['priority needs'] },
      { validator: validateArrayOfStringsEn, args: ['priority needs'] },
    ],
  },
  otp: {
    id: [
      { validator: validateRequired, args: ['otp'] },
      { validator: validateString, args: ['otp'] },
      { validator: validateMinLength, args: [6, 'otp'] },
      { validator: validateMaxLength, args: [6, 'otp'] },
    ],
    en: [
      { validator: validateRequiredEn, args: ['otp'] },
      { validator: validateStringEn, args: ['otp'] },
      { validator: validateMinLengthEn, args: [6, 'otp'] },
      { validator: validateMaxLengthEn, args: [6, 'otp'] },
    ],
  },
  user_id: {
    id: [
      { validator: validateRequired, args: ['id pengguna'] },
      { validator: validateString, args: ['id pengguna'] },
    ],
    en: [
      { validator: validateRequiredEn, args: ['user id'] },
      { validator: validateStringEn, args: ['user id'] },
    ],
  },
  id: {
    id: [
      { validator: validateRequired, args: ['id'] },
      { validator: validateString, args: ['id'] },
    ],
    en: [
      { validator: validateRequiredEn, args: ['id'] },
      { validator: validateStringEn, args: ['id'] },
    ],
  },
  birth_date: {
    id: [
      { validator: validateRequired, args: ['tanggal lahir'] },
      { validator: validateDate, args: ['tanggal lahir'] },
    ],
    en: [
      { validator: validateRequiredEn, args: ['birth date'] },
      { validator: validateDateEn, args: ['birth date'] },
    ],
  },
  born_place: {
    id: [
      { validator: validateRequired, args: ['tempat lahir'] },
      { validator: validateString, args: ['tempat lahir'] },
      { validator: validateMinLength, args: [2, 'tempat lahir'] },
      { validator: validateMaxLength, args: [255, 'tempat lahir'] },
    ],
    en: [
      { validator: validateRequiredEn, args: ['born place'] },
      { validator: validateStringEn, args: ['born place'] },
      { validator: validateMinLengthEn, args: [2, 'born place'] },
      { validator: validateMaxLengthEn, args: [255, 'born place'] },
    ],
  },
  gender: {
    id: [
      { validator: validateRequired, args: ['jenis kelamin'] },
      { validator: validateIn, args: [['male', 'female'], 'jenis kelamin'] },
    ],
    en: [
      { validator: validateRequiredEn, args: ['gender'] },
      { validator: validateInEn, args: [['male', 'female'], 'gender'] },
    ],
  },
});

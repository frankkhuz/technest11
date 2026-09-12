// Shared input validation used across auth, value, and vendor forms.

// Nigerian mobile numbers: 11 digits starting with 0, or +234, followed by
// 7/8/9 then 0/1 then 8 more digits — e.g. 08012345678, +2348012345678.
export const NIGERIA_PHONE_REGEX = /^(?:\+234|0)[789][01]\d{8}$/;
export const NIGERIA_PHONE_TITLE =
  "Enter a valid Nigerian number, e.g. 08012345678 or +2348012345678";

export function isValidNigerianPhone(value: string): boolean {
  return NIGERIA_PHONE_REGEX.test(value.trim());
}

// At least 8 characters, one uppercase letter, one number, one symbol.
export const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;
export const PASSWORD_TITLE =
  "At least 8 characters, with one uppercase letter, one number, and one symbol";

export function isValidPassword(value: string): boolean {
  return PASSWORD_REGEX.test(value);
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

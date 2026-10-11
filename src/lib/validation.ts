export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

/** Singapore mobile/landline: 8 digits starting with 3, 6, 8 or 9, optional +65. */
export function normalizeSgPhone(value: string): string | null {
  const digits = value.replace(/[^\d+]/g, "").replace(/^\+?65/, "");
  return /^[3689]\d{7}$/.test(digits) ? `+65 ${digits.slice(0, 4)} ${digits.slice(4)}` : null;
}

export const isSgPostalCode = (value: string) => /^\d{6}$/.test(value.trim());

export function sanitizePhone(phone: string | undefined | null): string {
  if (!phone) return '';
  return phone.replace(/[^\d+\-]/g, '');
}

export function hasPhone(phone: string | undefined | null): boolean {
  return sanitizePhone(phone).length > 0;
}

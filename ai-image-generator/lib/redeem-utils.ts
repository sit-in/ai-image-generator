export type RedeemCodeType = 'BASIC' | 'STANDARD' | 'PREMIUM';

export function generateRedeemCode(type: RedeemCodeType): string {
  const prefix = type;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = Array(3).fill(0).map(() => 
    Array(4).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('')
  );
  return `${prefix}-${segments.join('-')}`;
}

export function getAmountByType(type: RedeemCodeType): number {
  switch (type) {
    case 'BASIC':
      return 100;
    case 'STANDARD':
      return 300;
    case 'PREMIUM':
      return 1000;
    default:
      return 0;
  }
}

export function validateRedeemCode(code: string): boolean {
  const codePattern = /^(BASIC|STANDARD|PREMIUM)-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return codePattern.test(code);
} 
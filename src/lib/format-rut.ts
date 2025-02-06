export function formatRUT(rut: string): string {
  // Remove any dots, dashes and spaces
  let value = rut.replace(/[.-\s]/g, '');
  
  if (value.length <= 1) return value;

  // Extract verification digit
  const dv = value.slice(-1);
  const rutBody = value.slice(0, -1);
  
  // Add thousands separator
  let formatted = rutBody.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  // Add verification digit with dash
  return `${formatted}-${dv}`;
}

export function isValidRUT(rut: string): boolean {
  if (!/^[0-9]{7,8}-[0-9kK]$/.test(rut)) return false;
  
  const rutDigits = rut.split('-')[0].replace(/\./g, '');
  const dv = rut.split('-')[1].toLowerCase();
  
  let sum = 0;
  let multiplier = 2;
  
  for (let i = rutDigits.length - 1; i >= 0; i--) {
    sum += parseInt(rutDigits[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const expectedDV = 11 - (sum % 11);
  const calculatedDV = expectedDV === 11 ? '0' : expectedDV === 10 ? 'k' : expectedDV.toString();
  
  return calculatedDV === dv;
}
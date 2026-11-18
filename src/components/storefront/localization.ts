// Currency labels change; amounts are never converted or stored in a second catalog.
export function parsePrice(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) && value >= 0 ? value : null;
  if (typeof value !== "string" || !value.trim()) return null;
  const amount = value.trim().replace(/^(?:Rs\.?|LKR|₨|USD|\$)\s*/i, "").replace(/\s*(?:LKR|Rs\.?)$/i, "").replace(/\s/g, "");
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(amount)) return null;
  const number = Number(amount.replace(/,/g, ""));
  return Number.isFinite(number) ? number : null;
}

export function formatLkr(amount: number, decimals = true): string {
  return "Rs. " + new Intl.NumberFormat("en-LK", { minimumFractionDigits: decimals ? 2 : 0, maximumFractionDigits: 2 }).format(amount);
}

export function displayPrice(value: string): string {
  const amount = parsePrice(value);
  return amount === null ? value : formatLkr(amount, amount % 1 !== 0);
}

// Accept local trunk-prefix and international Sri Lankan mobile/landline formats.
export function sriLankaPhone(value: string): string {
  if (!/^[+\d\s().-]+$/.test(value.trim())) return "";
  let digits = value.replace(/[^0-9]/g, "");
  if (digits.startsWith("0094")) digits = digits.slice(2);
  if (/^0[1-9]\d{8}$/.test(digits)) digits = "94" + digits.slice(1);
  return /^94[1-9]\d{8}$/.test(digits) ? digits : "";
}

export function displaySriLankaPhone(value: string): string {
  const number = sriLankaPhone(value);
  return number ? `+94 ${number.slice(2,4)} ${number.slice(4,7)} ${number.slice(7)}` : "";
}

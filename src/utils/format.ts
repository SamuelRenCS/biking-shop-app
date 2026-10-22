/** "$ 1,999.99" / "$ 120": the Figma price style, with decimals only when there are cents. */
export function formatPrice(amount: number): string {
  const hasCents = Math.round(amount * 100) % 100 !== 0;
  const value = amount.toLocaleString("en-US", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return `$ ${value}`;
}

/** Amazon-style sale vs list price helpers */

export type PriceDisplay = {
  hasDiscount: boolean;
  priceUgx: number;
  listPriceUgx: number | null;
  saveUgx: number;
  percentOff: number;
};

export function getPriceDisplay(
  priceUgx: number,
  compareAtPriceUgx?: number | null,
): PriceDisplay {
  const list =
    typeof compareAtPriceUgx === 'number' &&
    Number.isFinite(compareAtPriceUgx) &&
    compareAtPriceUgx > priceUgx
      ? Math.round(compareAtPriceUgx)
      : null;
  const save = list != null ? list - Math.round(priceUgx) : 0;
  const percentOff = list != null && list > 0 ? Math.round((save / list) * 100) : 0;
  return {
    hasDiscount: list != null && save > 0 && percentOff > 0,
    priceUgx: Math.round(priceUgx),
    listPriceUgx: list,
    saveUgx: save,
    percentOff,
  };
}

/** Parse mobile string prices like "95,000" */
export function parsePriceString(price: string): number {
  const n = Number.parseFloat(String(price).replace(/,/g, '').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

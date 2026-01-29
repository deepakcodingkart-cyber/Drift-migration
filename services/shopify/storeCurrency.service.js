import { shopifyQuery } from "../../shopify/graphql.js";

const SHOP_QUERY = `
  query {
    shop {
      currencyCode
      enabledPresentmentCurrencies
    }
  }
`;

let cachedCurrencies = null;

export async function getStoreSupportedCurrencies() {
  if (cachedCurrencies) return cachedCurrencies;

  const data = await shopifyQuery(SHOP_QUERY);

  cachedCurrencies = [
    data.shop.currencyCode,
    ...(data.shop.enabledPresentmentCurrencies || [])
  ];

  return cachedCurrencies;
}

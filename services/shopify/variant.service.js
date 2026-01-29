import { shopifyQuery } from "../../shopify/graphql.js";

const VARIANT_QUERY = `
  query ($id: ID!) {
    productVariant(id: $id) {
      id
    }
  }
`;

export async function checkVariantExists(variantId) {
  if (!variantId) return false;

  const gid = variantId.startsWith("gid://")
    ? variantId
    : `gid://shopify/ProductVariant/${variantId}`;

  try {
    const data = await shopifyQuery(VARIANT_QUERY, { id: gid });
    return Boolean(data?.productVariant?.id);
  } catch {
    return false;
  }
}

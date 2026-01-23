import { shopifyQuery } from "../../shopify/graphql.js";

/**
 * Find Shopify customer using email
 * ❌ Does NOT create customer
 * Returns Shopify Customer GID or null
 */
export async function resolveShopifyCustomerByEmail(email) {
  if (!email) {
    throw new Error("Email is required to resolve Shopify customer");
  }

  const normalizedEmail = email.toLowerCase().trim();

  const query = `
    query findCustomer($query: String!) {
      customers(first: 1, query: $query) {
        edges {
          node {
            id
          }
        }
      }
    }
  `;

  const res = await shopifyQuery(query, {
    query: `email:${normalizedEmail}`
  });

  return res?.customers?.edges?.[0]?.node?.id || null;
}

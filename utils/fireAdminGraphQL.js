/**
 * Shopify Admin API version
 * Keep centralized for easy upgrades
 */
const SHOPIFY_ADMIN_API_VERSION = "2025-07";

/**
 * 🔥 Generic Shopify Admin GraphQL executor
 *
 * Responsibilities:
 * - Auth headers
 * - HTTP error handling
 * - GraphQL error logging
 * - Return parsed JSON
 */
export async function fireAdminGraphQL(
  shopDomain,
  accessToken,
  query,
  variables = {}
) {
  const url = `https://${shopDomain}/admin/api/${SHOPIFY_ADMIN_API_VERSION}/graphql.json`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    // ❌ HTTP level error (auth / throttling / infra)
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Shopify GraphQL HTTP Error ${response.status}: ${errorText}`
      );
    }

    const json = await response.json();

    // ⚠️ GraphQL execution errors
    if (json.errors && json.errors.length) {
      console.error(
        "[Shopify GraphQL Errors]",
        JSON.stringify(json.errors, null, 2)
      );
    }

    return json;
  } catch (error) {
    console.error("[fireAdminGraphQL FAILED]", error);
    throw error;
  }
}

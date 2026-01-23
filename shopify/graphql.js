import { createShopifyClient } from "./client.js";

/**
 * 🔥 Generic Shopify GraphQL executor
 *
 * Responsibilities:
 * - Execute GraphQL query/mutation
 * - Catch HTTP + GraphQL errors
 * - Return ONLY data layer
 *
 * NOTE:
 * - No business logic here
 * - Safe for execution modules
 */
export async function shopifyQuery(query, variables = {}) {

  try {
    const client = createShopifyClient(); // ✅ CALL THE FUNCTION

    const res = await client.post("/graphql.json", {
      query,
      variables
    });

    //  Shopify GraphQL-level errors
    if (res.data?.errors?.length) {
      console.error(
        "Shopify GraphQL Errors:",
        JSON.stringify(res.data.errors, null, 2)
      );
      throw new Error(res.data.errors.map(e => e.message).join("; "));
    }

    return res.data?.data;

  } catch (error) {
    // Axios error (HTTP / network)
    if (error.response) {
      console.error(
        "Shopify HTTP Error:",
        error.response.status,
        JSON.stringify(error.response.data, null, 2)
      );
    } else {
      console.error("Shopify Client Error:", error.message);
    }

    throw error;
  }
}

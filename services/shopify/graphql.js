import { createShopifyClient } from "./client.js";

export async function shopifyQuery(query, variables = {}) {

  try {
    const client = createShopifyClient(); // ✅ CALL THE FUNCTION

    const res = await client.post("/graphql.json", {
      query,
      variables
    });

    if (res.data?.errors) {
      throw new Error(JSON.stringify(res.data.errors));
    }

    return res.data?.data;
  } catch (error) {
    console.error(
      "❌ Shopify GraphQL Error:",
      error.response?.status,
      error.response?.data || error.message
    );
    throw error;
  }
}

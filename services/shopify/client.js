import axios from "axios";

export function createShopifyClient() {
  const {
    SHOP,
    ADMIN_TOKEN,
    SHOPIFY_API_VERSION
  } = process.env;

  // 🔐 ENV validation
  if (!SHOP || !ADMIN_TOKEN || !SHOPIFY_API_VERSION) {
    throw new Error(
      "❌ Missing Shopify ENV vars (SHOP, ADMIN_TOKEN, SHOPIFY_API_VERSION)"
    );
  }

  // 🚀 Axios instance
  return axios.create({
    baseURL: `https://${SHOP}/admin/api/${SHOPIFY_API_VERSION}`,
    headers: {
      "X-Shopify-Access-Token": ADMIN_TOKEN,
      "Content-Type": "application/json"
    },
    timeout: 15000
  });
}

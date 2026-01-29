import { shopifyQuery } from "../../shopify/graphql.js";

const CUSTOMER_QUERY = `
  query ($id: ID!) {
    customer(id: $id) {
      id
    }
  }
`;

export async function checkCustomerExists(customerId) {
  console.log("customer", customerId)
  
  const gid = customerId.startsWith("gid://")
    ? customerId
    : `gid://shopify/Customer/${customerId}`;

  try {
    const data = await shopifyQuery(CUSTOMER_QUERY, { id: gid });
    return Boolean(data?.customer?.id);
  } catch {
    return false;
  }
}

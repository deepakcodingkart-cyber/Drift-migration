import { shopifyQuery } from "../../shopify/graphql.js";

/**
 * Revoke (detach) a Shopify Customer Payment Method
 */
export async function revokePaymentMethod(shopifyPaymentMethodId) {
  if (!shopifyPaymentMethodId) {
    throw new Error("shopifyPaymentMethodId is required");
  }

  const mutation = `
    mutation revokePaymentMethod($customerPaymentMethodId: ID!) {
      customerPaymentMethodRevoke(
        customerPaymentMethodId: $customerPaymentMethodId
      ) {
        revokedCustomerPaymentMethodId
        userErrors {
          field
          message
        }
      }
    }
  `;

  const res = await shopifyQuery(mutation, {
    customerPaymentMethodId: shopifyPaymentMethodId
  });
  console.log("Revoke payment method response:", JSON.stringify(res, null, 2));

  const result = res?.customerPaymentMethodRevoke;

  if (!result) {
    throw new Error("Empty Shopify revoke response");
  }

  if (result.userErrors?.length) {
    throw new Error(
      result.userErrors.map(e => e.message).join("; ")
    );
  }

  if (!result.revokedCustomerPaymentMethodId) {
    throw new Error("Payment method revoke failed");
  }

  return result.revokedCustomerPaymentMethodId;
}

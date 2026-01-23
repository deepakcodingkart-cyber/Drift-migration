import { shopifyQuery } from "../../shopify/graphql.js";

/**
 * Creates a Shopify Customer Payment Method using remote reference
 *
 * Used during PAYMENT EXECUTION phase
 */
export async function createCustomerPaymentMethod(
  customerId,
  remoteReference
) {
  const query = `
    mutation customerPaymentMethodRemoteCreate(
      $customerId: ID!,
      $remoteReference: CustomerPaymentMethodRemoteInput!
    ) {
      customerPaymentMethodRemoteCreate(
        customerId: $customerId,
        remoteReference: $remoteReference
      ) {
        customerPaymentMethod { id }
        userErrors { message }
      }
    }
  `;

  const data = await shopifyQuery(query, {
    customerId,
    remoteReference
  });

  const result = data?.customerPaymentMethodRemoteCreate;

  if (result?.userErrors?.length) {
    throw new Error(
      result.userErrors.map(e => e.message).join("; ")
    );
  }

  if (!result?.customerPaymentMethod?.id) {
    throw new Error("Shopify did not return payment method id");
  }

  return result.customerPaymentMethod.id;
}

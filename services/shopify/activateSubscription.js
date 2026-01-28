import { shopifyQuery } from "../../shopify/graphql.js";

export async function activateSubscription(shopifySubscriptionId) {
  if (!shopifySubscriptionId) {
    throw new Error("shopifySubscriptionId is required");
  }

  const id = shopifySubscriptionId.startsWith("gid://")
    ? shopifySubscriptionId
    : `gid://shopify/SubscriptionContract/${shopifySubscriptionId}`;

  // FIX: Change 'id' to 'subscriptionContractId' in the mutation arguments
  const mutation = `
    mutation activateSubscription($subscriptionContractId: ID!) {
      subscriptionContractActivate(subscriptionContractId: $subscriptionContractId) {
        contract {
          id
          status
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  console.log("Activating subscription with id:", id);

  // FIX: Pass 'subscriptionContractId' in the variables object
  const res = await shopifyQuery(mutation, { subscriptionContractId: id });

  const result = res?.subscriptionContractActivate;

  if (!result) {
    throw new Error("Empty Shopify activation response");
  }

  if (result.userErrors?.length) {
    throw new Error(
      result.userErrors.map(e => e.message).join("; ")
    );
  }

  return result.contract.id;
}
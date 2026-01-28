import { shopifyQuery } from "../../shopify/graphql.js";

export async function pauseSubscription(shopifySubscriptionId) {
  if (!shopifySubscriptionId) {
    throw new Error("shopifySubscriptionId is required");
  }
  const id = shopifySubscriptionId.startsWith("gid://")
    ? shopifySubscriptionId
    : `gid://shopify/SubscriptionContract/${shopifySubscriptionId}`;

  const mutation = `
    mutation pauseSubscription($subscriptionContractId: ID!) {
      subscriptionContractPause(subscriptionContractId: $subscriptionContractId) {
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

  // Use the specific key 'subscriptionContractId'
  const res = await shopifyQuery(mutation, { subscriptionContractId: id });

  const result = res?.subscriptionContractPause;

  if (!result) {
    throw new Error("Empty Shopify pause response");
  }

  if (result.userErrors?.length) {
    throw new Error(result.userErrors.map(e => e.message).join("; "));
  }

  if (result.contract?.status !== "PAUSED") {
    throw new Error("Subscription not paused");
  }

  return result.contract.id;
}
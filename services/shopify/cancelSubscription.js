import { shopifyQuery } from "../../shopify/graphql.js";


export async function cancelSubscription(shopifySubscriptionId) {
  if (!shopifySubscriptionId) {
    throw new Error("shopifySubscriptionId is required");
  }

  const id = shopifySubscriptionId.startsWith("gid://")
    ? shopifySubscriptionId
    : `gid://shopify/SubscriptionContract/${shopifySubscriptionId}`;

  const mutation = `
    mutation cancelSubscription($subscriptionContractId: ID!) {
      subscriptionContractCancel(subscriptionContractId: $subscriptionContractId) {
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

  const result = res?.subscriptionContractCancel;

  if (!result) {
    throw new Error("Empty Shopify cancel response");
  }

  if (result.userErrors?.length) {
    throw new Error(result.userErrors.map(e => e.message).join("; "));
  }

  if (result.contract?.status !== "CANCELLED") {
    throw new Error("Subscription not cancelled");
  }

  return result.contract.id;
}
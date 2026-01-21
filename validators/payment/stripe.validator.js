// validators/payment/stripe.validator.js

function isEmpty(val) {
  return val === null || val === undefined || val === "";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function validateStripeRow(row, index, seenCardIds) {
  console.log("Validating Stripe row:", row, "at index:", index);
  const errors = [];
  const rowNumber = index + 1;

  const customerId = row["id"];
  const email = row["Email"];
  const cardId = row["Card ID"];

  /* ---------- CUSTOMER ID ---------- */
  if (isEmpty(customerId)) {
    errors.push({
      row: rowNumber,
      field: "id",
      message: "Stripe customer id is required"
    });
  }

  /* ---------- EMAIL ---------- */
  if (isEmpty(email) || !isValidEmail(email)) {
    errors.push({
      row: rowNumber,
      field: "Email",
      message: "Valid email is required"
    });
  }

  /* ---------- CARD ID ---------- */
  if (isEmpty(cardId)) {
    errors.push({
      row: rowNumber,
      field: "Card ID",
      message: "Card ID is required"
    });
  } else if (!cardId.startsWith("pm_")) {
    errors.push({
      row: rowNumber,
      field: "Card ID",
      message: "Stripe Card ID must start with pm_"
    });
  }

  /* ---------- DUPLICATE CHECK ---------- */
  if (cardId) {
    if (seenCardIds.has(cardId)) {
      errors.push({
        row: rowNumber,
        field: "Card ID",
        message: "Duplicate Stripe Card ID detected"
      });
    }
    seenCardIds.add(cardId);
  }
  console.log("Validation errors for row", rowNumber, ":", errors);
  return errors;
}

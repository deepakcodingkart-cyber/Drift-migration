// validators/payment/braintree.validator.js

function isEmpty(val) {
  return val === null || val === undefined || val === "";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function validateBraintreeRow(row, index, seenTokens) {
  const errors = [];
  const rowNumber = index + 1;

  const customerId = row["id"];
  const email = row["Email"];
  const token = row["Payment Method Token"];

  /* ---------- CUSTOMER ID ---------- */
  if (isEmpty(customerId)) {
    errors.push({
      row: rowNumber,
      field: "id",
      message: "Braintree customer id is required"
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

  /* ---------- PAYMENT TOKEN ---------- */
  if (isEmpty(token)) {
    errors.push({
      row: rowNumber,
      field: "Payment Method Token",
      message: "Payment Method Token is required"
    });
  }

  /* ---------- DUPLICATE CHECK ---------- */
  if (token) {
    if (seenTokens.has(token)) {
      errors.push({
        row: rowNumber,
        field: "Payment Method Token",
        message: "Duplicate Braintree payment token detected"
      });
    }
    seenTokens.add(token);
  }

  return errors;
}

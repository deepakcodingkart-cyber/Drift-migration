function isEmpty(val) {
  return val === null || val === undefined || val === "";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


export async function validatePaypalRow(row, index, seenPaypalIds) {
  console.log("Validating Paypal row:", row, "at index:", index);
  const errors = [];
  const rowNumber = index + 1;

  const email = row["Email"];
  const paypalId = row["Paypal ID"];

  if (isEmpty(email) || !isValidEmail(email)) {
    errors.push({
      row: rowNumber,
      field: "Email",
      message: "Valid Email is required"
    });
  }

  if (!paypalId || !paypalId.startsWith("B-")) {
    errors.push({
      row: rowNumber,
      field: "Paypal ID",
      message: "Paypal ID must start with B-"
    });
  }

  if (seenPaypalIds.has(paypalId)) {
    errors.push({
      row: rowNumber,
      field: "Paypal ID",
      message: "Duplicate Paypal ID detected"
    });
  }

  seenPaypalIds.add(paypalId);

  console.log("Validation errors for row", rowNumber, ":", errors);

  return errors;
}

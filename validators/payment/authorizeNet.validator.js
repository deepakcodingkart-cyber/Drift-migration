function isEmpty(val) {
  return val === null || val === undefined || val === "";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function validateAuthorizeNetRow(row, index, seenProfiles) {
  const errors = [];
  const rowNumber = index + 1;

  const email = row["Email"];
  const profileId = row["Customer Profile Id"];
  const paymentProfileId = row["Customer Payment Profile Id"];

  if (isEmpty(email) || !isValidEmail(email)) {
    errors.push({
      row: rowNumber,
      field: "Email",
      message: "Valid Email is required"
    });
  }

  if (!/^\d+$/.test(profileId)) {
    errors.push({
      row: rowNumber,
      field: "Customer Profile Id",
      message: "Customer Profile Id must be numeric"
    });
  }

  if (!/^\d+$/.test(paymentProfileId)) {
    errors.push({
      row: rowNumber,
      field: "Customer Payment Profile Id",
      message: "Customer Payment Profile Id must be numeric"
    });
  }

  const uniqueKey = `${profileId}_${paymentProfileId}`;
  if (seenProfiles.has(uniqueKey)) {
    errors.push({
      row: rowNumber,
      field: "Customer Payment Profile Id",
      message: "Duplicate payment profile detected"
    });
  }

  seenProfiles.add(uniqueKey);

  return errors;
}

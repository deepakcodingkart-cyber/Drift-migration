import parseFile from "../utils/fileParser.js";
import { validateSubscriptionRow } from "../validators/subscriptionRow.validator.js";
import { shopifyValidation } from "../validators/shopify.validator.js";


export async function validateCsvController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required"
      });
    }

    // ✅ FILE TYPE VALIDATION (YAHI RAKHNA HAI)
    if (
      !req.file.mimetype.includes("csv") &&
      !req.file.mimetype.includes("excel") &&
      !req.file.mimetype.includes("spreadsheetml")
    ) {
      return res.status(400).json({
        success: false,
        message: "Only CSV or Excel files are allowed"
      });
    }

    const rows = parseFile(req.file.buffer);

    const allErrors = [];
    const validRows = [];

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];

      /* ---------- STEP 1: LOCAL VALIDATION ---------- */
      const rowErrors = await validateSubscriptionRow(row, index);

      /* ---------- STEP 2: SHOPIFY VALIDATION ---------- */
      const shopifyErrors = await shopifyValidation(row, index);

      /* ---------- COLLECT ALL ERRORS ---------- */
      const combinedErrors = [
        ...rowErrors,
        ...shopifyErrors
      ];

      if (combinedErrors.length > 0) {
        allErrors.push(...combinedErrors);
        continue;
      }

      /* ---------- STEP 3: FULLY VALID ---------- */
      validRows.push(row);
    }

    return res.json({
      success: true,
      totalRows: rows.length,
      validRows: validRows.length,
      errorCount: allErrors.length,
      errors: allErrors,
      data: validRows
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to parse / validate file",
      error: err.message
    });
  }
}

import { parseFileStream } from "../utils/fileParser.js";
import { validateSubscriptionRow } from "../validators/subscriptionRow.validator.js";
// import { shopifyValidation } from "../validators/shopify.validator.js";

export async function validateCsvController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required"
      });
    }

    // ✅ FILE TYPE VALIDATION (UNCHANGED)
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


    const allErrors = [];
    const validRows = [];

    let rowIndex = 0;

    await parseFileStream(req.file.buffer, async (row) => {
      const index = rowIndex++;

      /* ---------- STEP 1: LOCAL VALIDATION ---------- */
      const rowErrors = await validateSubscriptionRow(row, index);

      /* ---------- STEP 2: SHOPIFY VALIDATION ---------- */
      // const shopifyErrors = await shopifyValidation(row, index);

      const combinedErrors = [
        ...rowErrors,
        // ...shopifyErrors
      ];

      if (combinedErrors.length > 0) {
        allErrors.push(...combinedErrors);
        return;
      }

      /* ---------- STEP 3: FULLY VALID ---------- */
      validRows.push(row);
    });

    return res.json({
      success: true,
      totalRows: rowIndex,
      validRows: validRows.length,
      errorCount: allErrors.length,
      errors: allErrors,
      data: validRows
    });

  } catch (err) {
    console.error("Error in validateCsvController:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to parse / validate file",
      error: err.message
    });
  }
}

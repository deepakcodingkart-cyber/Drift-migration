
import axios from "axios";
import { ApiSupportCountries } from "../constants/apiSupportCountries.js";
import  { COUNTRIES_RULES }  from "../constants/countries.js" ;

/**
 * Cache structure:
 * key   → `${countryCode}-${zipCode}`
 * value → {
 *   valid: boolean,
 *   states: string[],   // state / province abbreviations
 *   error?: string
 * }
 */
const zipCache = new Map();

export async function validateZipAndProvince({
  countryCode,
  zipCode,
  provinceCode
}) {
  const code = countryCode.toUpperCase();
  const zip = String(zipCode).trim();
  const cacheKey = `${code}-${zip}`;

  /* --------------------------------------------------
   * STEP 0: CACHE CHECK
   * If already validated once, reuse result
   * -------------------------------------------------- */
  if (zipCache.has(cacheKey)) {
    return zipCache.get(cacheKey);
  }

  /* ==================================================
   * CASE 1: COUNTRY SUPPORTED BY ZIP API
   * ================================================== */
  if (ApiSupportCountries.includes(code)) {
    try {
      const response = await axios.get(
        `https://api.zippopotam.us/${code.toLowerCase()}/${zip}`,
        { timeout: 5000 }
      );

      // Extract state abbreviations from API response
      const apiStates =
        response.data.places?.map(
          place => place["state abbreviation"]
        ) || [];

      const result = {
        valid: apiStates.includes(provinceCode),
        states: apiStates,
        error: apiStates.includes(provinceCode)
          ? null
          : `Province code ${provinceCode} does not match ZIP ${zip}`
      };

      // Save processed result in cache
      zipCache.set(cacheKey, result);
      return result;

    } catch (err) {
      // 404 or API error → ZIP invalid
      const result = {
        valid: false,
        states: [],
        error: `ZIP code ${zip} is not valid for country ${code}`
      };

      zipCache.set(cacheKey, result);
      return result;
    }
  }

  /* ==================================================
   * CASE 2: FALLBACK TO LOCAL JSON (countries.json)
   * ================================================== */
  const countryRule = COUNTRIES_RULES[code];

  // Country not supported anywhere
  if (!countryRule) {
    return {
      valid: false,
      error: `Country ${code} is not supported for ZIP validation`
    };
  }

  /* ---------- PIN REQUIRED CHECK ---------- */
  if (countryRule.pin_required) {
    if (!zip) {
      return {
        valid: false,
        error: "ZIP / PIN code is required"
      };
    }

    const regex = new RegExp(countryRule.regex);
    if (!regex.test(zip)) {
      return {
        valid: false,
        error: `ZIP code ${zip} format is invalid`
      };
    }
  }

  /* ---------- PROVINCE CHECK ---------- */
  if (
    provinceCode &&
    Array.isArray(countryRule.provinces) &&
    !countryRule.provinces.includes(provinceCode)
  ) {
    return {
      valid: false,
      error: `Province code ${provinceCode} is not valid for country ${code}`
    };
  }

  /* ---------- ALL GOOD ---------- */
  return {
    valid: true,
    states: countryRule.provinces || []
  };
}

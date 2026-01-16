export const COUNTRIES_RULES = {
  "CO": {
    "name": "Colombia",
    "regex": "^\\d{6}$",
    "pin_required": true,
    "provinces": ["DC", "ANT", "VAL", "ATL", "BOL", "SAN"]
  },
  "PE": {
    "name": "Peru",
    "regex": "^\\d{5}$",
    "pin_required": true,
    "provinces": ["LMA", "ARE", "CUS", "CAL", "LIB", "PIU"]
  },
  "CL": {
    "name": "Chile",
    "regex": "^\\d{7}$",
    "pin_required": true,
    "provinces": ["RM", "VS", "RS", "BI", "CO", "AR"]
  },
  "CR": {
    "name": "Costa Rica",
    "regex": "^\\d{4,5}$",
    "pin_required": true,
    "provinces": ["SJ", "AL", "CA", "HE", "GU", "PU", "LI"]
  },
  "PA": {
    "name": "Panama",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["PAN", "COL", "CHI", "HER", "LOS", "VER"]
  },
  "VE": {
    "name": "Venezuela",
    "regex": "^\\d{4}$",
    "pin_required": true,
    "provinces": ["CCS", "ZUL", "MIR", "CAR", "LAR", "ARA"]
  },
  "OM": {
    "name": "Oman",
    "regex": "^\\d{3}$",
    "pin_required": true,
    "provinces": ["MU", "BA", "ZA", "DA", "SH"]
  },
  "JO": {
    "name": "Jordan",
    "regex": "^\\d{5}$",
    "pin_required": true,
    "provinces": ["AM", "IR", "ZR", "BA", "MA"]
  },
  "LB": {
    "name": "Lebanon",
    "regex": "^(\\d{4}(\\s\\d{4})?)?$",
    "pin_required": true,
    "provinces": ["BE", "JL", "BA", "AS", "NA"]
  },
  "BH": {
    "name": "Bahrain",
    "regex": "^\\d{3,4}$",
    "pin_required": true,
    "provinces": ["CAP", "MUH", "NOR", "SOU"]
  },
  "KZ": {
    "name": "Kazakhstan",
    "regex": "^\\d{6}$",
    "pin_required": true,
    "provinces": ["ALA", "AST", "ALM", "AKM", "AKT"]
  },
  "UZ": {
    "name": "Uzbekistan",
    "regex": "^\\d{6}$",
    "pin_required": true,
    "provinces": ["TAS", "SAM", "FER", "BUX", "NAM"]
  },
  "NP": {
    "name": "Nepal",
    "regex": "^\\d{5}$",
    "pin_required": true,
    "provinces": ["P1", "P2", "P3", "P4", "P5", "P6", "P7"]
  },
  "KH": {
    "name": "Cambodia",
    "regex": "^\\d{5}$",
    "pin_required": true,
    "provinces": ["PP", "SR", "BT", "SHV", "KM"]
  },
  "MM": {
    "name": "Myanmar",
    "regex": "^\\d{5}$",
    "pin_required": true,
    "provinces": ["YGN", "MDY", "AYY", "BGO", "MGW"]
  },
  "IQ": {
    "name": "Iraq",
    "regex": "^\\d{5}$",
    "pin_required": true,
    "provinces": ["BG", "BA", "NI", "AN", "QI"]
  },
  "RS": {
    "name": "Serbia",
    "regex": "^\\d{5,6}$",
    "pin_required": true,
    "provinces": ["BG", "VO", "MA", "SU", "NI"]
  },
  "KE": {
    "name": "Kenya",
    "regex": "^\\d{5}$",
    "pin_required": true,
    "provinces": ["NAI", "MOM", "KIS", "NAK", "ELD"]
  },
  "TZ": {
    "name": "Tanzania",
    "regex": "^\\d{5}$",
    "pin_required": true,
    "provinces": ["DAR", "ARU", "MWN", "ZAN", "DOD"]
  },
  "ET": {
    "name": "Ethiopia",
    "regex": "^\\d{4}$",
    "pin_required": true,
    "provinces": ["AA", "OR", "AM", "TI", "SN"]
  },
  "UG": {
    "name": "Uganda",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["KLA", "EBS", "NIL", "WES", "CEN"]
  },
  "DZ": {
    "name": "Algeria",
    "regex": "^\\d{5}$",
    "pin_required": true,
    "provinces": ["AL", "OR", "CO", "AN", "SE"]
  },
  "TN": {
    "name": "Tunisia",
    "regex": "^\\d{4}$",
    "pin_required": true,
    "provinces": ["TU", "SF", "AR", "BI", "JE"]
  },
  "SD": {
    "name": "Sudan",
    "regex": "^\\d{5}$",
    "pin_required": true,
    "provinces": ["KH", "KA", "GE", "NR", "WN"]
  },
  "AZ": {
    "name": "Azerbaijan",
    "regex": "^[A-Z]{2}\\s?\\d{4}$",
    "pin_required": true,
    "provinces": ["BA", "GA", "SU", "LA", "XA"]
  },
  "GE": {
    "name": "Georgia",
    "regex": "^\\d{4}$",
    "pin_required": true,
    "provinces": ["TB", "AJ", "KA", "IM", "GU"]
  },
  "AM": {
    "name": "Armenia",
    "regex": "^\\d{4}$",
    "pin_required": true,
    "provinces": ["ER", "SH", "LO", "KT", "AV"]
  },
  "AL": {
    "name": "Albania",
    "regex": "^\\d{4}$",
    "pin_required": true,
    "provinces": ["TR", "DR", "EL", "KO", "VL"]
  },
  "BA": {
    "name": "Bosnia and Herzegovina",
    "regex": "^\\d{5}$",
    "pin_required": true,
    "provinces": ["BIH", "SRP", "BDN"]
  },
  "ME": {
    "name": "Montenegro",
    "regex": "^\\d{5}$",
    "pin_required": true,
    "provinces": ["PG", "NK", "PV", "BU", "KO"]
  },
  "CY": {
    "name": "Cyprus",
    "regex": "^\\d{4}$",
    "pin_required": true,
    "provinces": ["NI", "LI", "LA", "PA", "FA"]
  },
  "QA": {
    "name": "Qatar",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["DOH", "RAY", "WAK", "KHO", "DAA"]
  },
  "LY": {
    "name": "Libya",
    "regex": "^\\d{5}$",
    "pin_required": true,
    "provinces": ["TR", "BE", "MI", "ZA", "JA"]
  },
  "SN": {
    "name": "Senegal",
    "regex": "^\\d{5}$",
    "pin_required": true,
    "provinces": ["DK", "TH", "KL", "SL", "ZG"]
  },
  "CM": {
    "name": "Cameroon",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["CE", "LT", "OU", "AD", "EN"]
  },
  "CI": {
    "name": "Ivory Coast",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["AB", "YM", "BS", "DN", "LG"]
  },
  "ZW": {
    "name": "Zimbabwe",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["HA", "BU", "MN", "MS", "MC"]
  },
  "JM": {
    "name": "Jamaica",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["KIN", "JAM", "STA", "STC", "STP", "TRE", "HAN"]
  },
  "BS": {
    "name": "Bahamas",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["NP", "GB", "AB", "EL", "EX", "AN"]
  },
  "TT": {
    "name": "Trinidad and Tobago",
    "regex": "^\\d{6}$",
    "pin_required": true,
    "provinces": ["POS", "SFO", "ARI", "CHA", "TOB"]
  },
  "BB": {
    "name": "Barbados",
    "regex": "^BB\\d{5}$",
    "pin_required": true,
    "provinces": ["CC", "JA", "LU", "MI", "PH", "ST"]
  },
  "MU": {
    "name": "Mauritius",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["PL", "PW", "BR", "RR", "GP", "MK"]
  },
  "SC": {
    "name": "Seychelles",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["AN", "BE", "GL", "MA", "PR"]
  },
  "BN": {
    "name": "Brunei",
    "regex": "^[A-Z]{2}\\d{4}$",
    "pin_required": true,
    "provinces": ["BE", "BM", "TE", "TU"]
  },
  "MO": {
    "name": "Macau",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["MO", "CO"]
  },
  "MN": {
    "name": "Mongolia",
    "regex": "^\\d{5}$",
    "pin_required": true,
    "provinces": ["UB", "AR", "BU", "GA", "HO"]
  },
  "LA": {
    "name": "Laos",
    "regex": "^\\d{5}$",
    "pin_required": true,
    "provinces": ["VT", "LP", "SV", "CH", "BK"]
  },
  "BO": {
    "name": "Bolivia",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["LP", "SC", "CB", "OR", "PT", "BE"]
  },
  "PY": {
    "name": "Paraguay",
    "regex": "^\\d{4}$",
    "pin_required": true,
    "provinces": ["ASU", "CON", "COR", "ITA", "GUA"]
  },
  "UY": {
    "name": "Uruguay",
    "regex": "^\\d{5}$",
    "pin_required": true,
    "provinces": ["MO", "CA", "MA", "RO", "SA"]
  },
  "EC": {
    "name": "Ecuador",
    "regex": "^\\d{6}$",
    "pin_required": true,
    "provinces": ["GY", "PI", "AZ", "MA", "LO"]
  },
  "SY": {
    "name": "Syria",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["DA", "AL", "HO", "LA", "HA"]
  },
  "YE": {
    "name": "Yemen",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["SA", "AD", "TA", "HO", "IB"]
  },
  "AF": {
    "name": "Afghanistan",
    "regex": "^\\d{4}$",
    "pin_required": true,
    "provinces": ["KA", "HE", "KA", "MA", "KU"]
  },
  "SV": {
    "name": "El Salvador",
    "regex": "^CP \\d{4}$",
    "pin_required": true,
    "provinces": ["SS", "SA", "SO", "LI", "PA", "CU"]
  },
  "HN": {
    "name": "Honduras",
    "regex": "^\\d{5}$",
    "pin_required": true,
    "provinces": ["FM", "CO", "AT", "CH", "EP"]
  },
  "NI": {
    "name": "Nicaragua",
    "regex": "^\\d{5}$",
    "pin_required": true,
    "provinces": ["MN", "LE", "MS", "GR", "CH"]
  },
  "CU": {
    "name": "Cuba",
    "regex": "^\\d{5}$",
    "pin_required": true,
    "provinces": ["LH", "SC", "HO", "CM", "MT"]
  },
  "HT": {
    "name": "Haiti",
    "regex": "^HT\\d{4}$",
    "pin_required": true,
    "provinces": ["OU", "NO", "SU", "AR", "CE"]
  },
  "FJ": {
    "name": "Fiji",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["CE", "WE", "NO", "EA", "RO"]
  },
  "PG": {
    "name": "Papua New Guinea",
    "regex": "^\\d{3}$",
    "pin_required": true,
    "provinces": ["NCD", "CPM", "MOR", "WHP", "EBP"]
  },
  "SB": {
    "name": "Solomon Islands",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["CH", "GU", "MA", "WE", "IS"]
  },
  "VU": {
    "name": "Vanuatu",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["MA", "PE", "SH", "TA", "TO"]
  },
  "TO": {
    "name": "Tonga",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["TO", "HA", "VA", "EU", "NI"]
  },
  "WS": {
    "name": "Samoa",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["TU", "AA", "AL", "FA", "GE"]
  },
  "MV": {
    "name": "Maldives",
    "regex": "^\\d{5}$",
    "pin_required": true,
    "provinces": ["MLE", "ADU", "FUH", "KUL", "HIN"]
  },
  "BT": {
    "name": "Bhutan",
    "regex": "^\\d{3}$",
    "pin_required": true,
    "provinces": ["TH", "PU", "PA", "GE", "SA"]
  },
  "TJ": {
    "name": "Tajikistan",
    "regex": "^\\d{6}$",
    "pin_required": true,
    "provinces": ["DU", "SU", "KT", "GB"]
  },
  "KG": {
    "name": "Kyrgyzstan",
    "regex": "^\\d{6}$",
    "pin_required": true,
    "provinces": ["BI", "OS", "JA", "IK", "TA"]
  },
  "TM": {
    "name": "Turkmenistan",
    "regex": "^\\d{6}$",
    "pin_required": true,
    "provinces": ["AS", "AH", "BA", "DA", "MA"]
  },
  "PS": {
    "name": "Palestine",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["GZ", "WE", "JE", "RA", "HE"]
  },
  "AO": {
    "name": "Angola",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["LUA", "BGO", "BIE", "CAB", "CNN", "HUA"]
  },
  "BW": {
    "name": "Botswana",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["CE", "KG", "KL", "KW", "NE", "NW"]
  },
  "BF": {
    "name": "Burkina Faso",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["OUA", "BOB", "KAD", "MOU", "SNG"]
  },
  "BI": {
    "name": "Burundi",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["BU", "GI", "KA", "MU", "NG"]
  },
  "CV": {
    "name": "Cape Verde",
    "regex": "^\\d{4}$",
    "pin_required": true,
    "provinces": ["PR", "SV", "BR", "SL", "BO"]
  },
  "CF": {
    "name": "Central African Republic",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["BGF", "BAM", "HKO", "LOB", "NMG"]
  },
  "TD": {
    "name": "Chad",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["NDJ", "BAT", "LAC", "LOG", "SAL"]
  },
  "KM": {
    "name": "Comoros",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["GRM", "ANJ", "MOH"]
  },
  "CG": {
    "name": "Congo (Brazzaville)",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["BZV", "PNR", "KOU", "LIK", "PLA"]
  },
  "CD": {
    "name": "Congo (Kinshasa)",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["KIN", "BCO", "EQA", "KAT", "ORI"]
  },
  "DJ": {
    "name": "Djibouti",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["DJI", "ART", "DIK", "OBK", "TAD"]
  },
  "GQ": {
    "name": "Equatorial Guinea",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["SS", "CS", "BN", "LT", "WN"]
  },
  "ER": {
    "name": "Eritrea",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["ASM", "ANS", "DEB", "GASH", "SEM"]
  },
  "GA": {
    "name": "Gabon",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["LBV", "EST", "HOG", "NGU", "WNT"]
  },
  "GM": {
    "name": "Gambia",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["BAN", "LWR", "MID", "UPR", "WES"]
  },
  "GN": {
    "name": "Guinea",
    "regex": "^\\d{3}$",
    "pin_required": true,
    "provinces": ["CKY", "BKE", "KNK", "LBE", "MAM"]
  },
  "GW": {
    "name": "Guinea-Bissau",
    "regex": "^\\d{4}$",
    "pin_required": true,
    "provinces": ["BSU", "BAF", "GAB", "OIO", "QUI"]
  },
  "LR": {
    "name": "Liberia",
    "regex": "^\\d{4}$",
    "pin_required": true,
    "provinces": ["MON", "BAR", "GBN", "LFA", "NIM"]
  },
  "MG": {
    "name": "Madagascar",
    "regex": "^\\d{3}$",
    "pin_required": true,
    "provinces": ["TNR", "ATS", "MAJ", "TOA", "TOL"]
  },
  "MW": {
    "name": "Malawi",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["BL", "LL", "MZ", "ZA", "CH"]
  },
  "ML": {
    "name": "Mali",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["BKO", "KY", "KU", "SM", "MO"]
  },
  "MR": {
    "name": "Mauritania",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["NKC", "AD", "BR", "TR", "IN"]
  },
  "MZ": {
    "name": "Mozambique",
    "regex": "^\\d{4}$",
    "pin_required": true,
    "provinces": ["MPM", "GA", "IN", "SO", "TE"]
  },
  "NA": {
    "name": "Namibia",
    "regex": "^\\d{5}$",
    "pin_required": true,
    "provinces": ["WH", "ER", "KU", "HA", "KA"]
  },
  "NE": {
    "name": "Niger",
    "regex": "^\\d{4}$",
    "pin_required": true,
    "provinces": ["NI", "AG", "DI", "MA", "TA"]
  },
  "RW": {
    "name": "Rwanda",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["KIG", "ES", "NO", "SO", "WE"]
  },
  "ST": {
    "name": "Sao Tome and Principe",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["ST", "PR"]
  },
  "SL": {
    "name": "Sierra Leone",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["FREETOWN", "BO", "KEN", "MAK"]
  },
  "SO": {
    "name": "Somalia",
    "regex": "^[A-Z]{2}\\s?\\d{5}$",
    "pin_required": true,
    "provinces": ["MG", "AW", "BA", "BR", "GE"]
  },
  "SS": {
    "name": "South Sudan",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["JUBA", "WE", "EE", "UN", "LK"]
  },
  "SZ": {
    "name": "Eswatini",
    "regex": "^[A-Z]\\d{3}$",
    "pin_required": true,
    "provinces": ["HH", "LU", "MA", "SH"]
  },
  "TG": {
    "name": "Togo",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["LO", "MA", "PL", "CE", "KA"]
  },
  "ZM": {
    "name": "Zambia",
    "regex": "^\\d{5}$",
    "pin_required": true,
    "provinces": ["LSK", "CB", "CE", "EA", "WE"]
  },
  "BJ": {
    "name": "Benin",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["OU", "LI", "CO", "BO", "AT"]
  },
  "LS": {
    "name": "Lesotho",
    "regex": "^\\d{3}$",
    "pin_required": true,
    "provinces": ["MSU", "BB", "LE", "MA", "QU"]
  },
  "TL": {
    "name": "Timor-Leste",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["DIL", "BAU", "ERM", "LIQ", "VIQ"]
  },
  "AG": {
    "name": "Antigua and Barbuda",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["STJ", "STP", "STG", "STC", "STM", "STL"]
  },
  "DM": {
    "name": "Dominica",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["STG", "STJ", "STL", "STP", "STW"]
  },
  "GD": {
    "name": "Grenada",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["STG", "STA", "STD", "STJ", "STM", "STP"]
  },
  "KN": {
    "name": "Saint Kitts and Nevis",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["BAS", "CHA", "GIB", "NIC", "SAN"]
  },
  "LC": {
    "name": "Saint Lucia",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["CAS", "CHO", "GRO", "SOU", "VIE"]
  },
  "VC": {
    "name": "Saint Vincent and the Grenadines",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["KIN", "CHA", "GEO", "GRE", "STG"]
  },
  "TV": {
    "name": "Tuvalu",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["FUN", "NAN", "NUI", "VAI"]
  },
  "KI": {
    "name": "Kiribati",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["TAR", "GIL", "LIN", "PHO"]
  },
  "NR": {
    "name": "Nauru",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["YAR", "AIW", "BOE", "MEN"]
  },
  "PW": {
    "name": "Palau",
    "regex": "^96940$",
    "pin_required": true,
    "provinces": ["NGY", "AIR", "KOR", "MEL"]
  },
  "FM": {
    "name": "Micronesia",
    "regex": "^9694[1-4]$",
    "pin_required": true,
    "provinces": ["POH", "CHU", "KOS", "YAP"]
  },

  "KP": {
    "name": "North Korea",
    "regex": "^.*$",
    "pin_required": false,
    "provinces": ["PYO", "HAM", "PYO", "KAN"]
  },
  "PF": {
    "name": "French Polynesia",
    "regex": "^987\\d{2}$",
    "pin_required": true,
    "provinces": ["PAPEETE", "MOOREA", "BORA BORA"]
  },
  "NC": {
    "name": "New Caledonia",
    "regex": "^988\\d{2}$",
    "pin_required": true,
    "provinces": ["NOUMEA", "DUMBEA", "MONT-DORE"]
  },
  "WF": {
    "name": "Wallis and Futuna",
    "regex": "^986\\d{2}$",
    "pin_required": true,
    "provinces": ["MATA-UTU", "ALIA", "SIGAVE"]
  },
  "AQ": {
  "name": "Antarctica",
  "regex": "^.*$",
  "pin_required": false,
  "provinces": []
  },
  "EH": {
  "name": "Western Sahara",
  "regex": "^\\d{5}$",
  "pin_required": true,
  "provinces": ["ESM", "DAK", "BOU"]
  }
}
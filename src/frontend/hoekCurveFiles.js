// Metadata for the client-provided Hoek static curve CSV files.
// The CSV files are stored in public/sample-data/hoek so the frontend can fetch them.

const HOEK_CURVE_BASE_PATH = "/sample-data/hoek";

export const hoekCurveFiles = [
  {
    id: "hoek-expansion-shell-17mm",
    productId: 15,
    productName: "Expansion shell anchored 17mm diameter steel rockbolt",
    supplier: "Hoek",
    methodology: "static",
    facility: "Luleå University",
    xKey: "deformation",
    yKey: "load",
    xUnit: "mm",
    yUnit: "tonnes",
    fileName: "Hoek expansion shell anchored 17mm diameter steel rockbolt.csv",
  },
  {
    id: "hoek-cement-grouted-20mm",
    productId: 16,
    productName: "Cement grouted 20mm diameter steel rebar",
    supplier: "Hoek",
    methodology: "static",
    facility: "Luleå University",
    xKey: "deformation",
    yKey: "load",
    xUnit: "mm",
    yUnit: "tonnes",
    fileName: "Hoek cement grouted 20mm diameter steel rebar.csv",
  },
  {
    id: "hoek-resin-grouted-20mm",
    productId: 17,
    productName: "Resin grouted 20mm diameter steel rebar",
    supplier: "Hoek",
    methodology: "static",
    facility: "Luleå University",
    xKey: "deformation",
    yKey: "load",
    xUnit: "mm",
    yUnit: "tonnes",
    fileName: "Hoek resin grouted 20mm diameter steel rebar.csv",
  },
  {
    id: "hoek-resin-grouted-22mm",
    productId: 18,
    productName: "Resin grouted 22mm fibreglass rod",
    supplier: "Hoek",
    methodology: "static",
    facility: "Luleå University",
    xKey: "deformation",
    yKey: "load",
    xUnit: "mm",
    yUnit: "tonnes",
    fileName: "Hoek resin grouted 22mm fibreglass rod.csv",
  },
  {
    id: "hoek-type-ss-39",
    productId: 19,
    productName: "Type SS 39 Split Set stabiliser",
    supplier: "Hoek",
    methodology: "static",
    facility: "Luleå University",
    xKey: "deformation",
    yKey: "load",
    xUnit: "mm",
    yUnit: "tonnes",
    fileName: "Hoek type SS 39 Split Set stabiliser.csv",
  },
  {
    id: "hoek-exl-swellex",
    productId: 20,
    productName: "EXL Swellex dowel",
    supplier: "Hoek",
    methodology: "static",
    facility: "Luleå University",
    xKey: "deformation",
    yKey: "load",
    xUnit: "mm",
    yUnit: "tonnes",
    fileName: "Hoek EXL Swellex dowel.csv",
  },
];

export const getHoekCurvePath = (fileName) => {
  // encodeURI keeps spaces and special characters safe for browser fetch requests.
  return encodeURI(`${HOEK_CURVE_BASE_PATH}/${fileName}`);
};
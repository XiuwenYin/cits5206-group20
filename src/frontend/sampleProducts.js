// Client-provided sample product data used by the first public listing page.
// This local data keeps the FR1 page testable before the backend products API is ready.

export const sampleProducts = [
  {
    id: 1,
    supplier: "Supplier A",
    product_name: "Resin Bolt A D20 mm x 2.4 m",
    bolt_length: "2.4",
    bolt_diameter: "20",
    bolt_category: "Encapsulated",
    equipment_compatibility: ["Handheld", "Mechanized Bolting Machine A", "Multi-OEM"],
  },
  {
    id: 2,
    supplier: "Supplier A",
    product_name: "Hybrid Bolt D39 x 2.4 m",
    bolt_length: "2.4",
    bolt_diameter: "20",
    bolt_category: "Hybrid",
    equipment_compatibility: ["Handheld", "Mechanized Bolting Machine A", "Multi-OEM"],
  },
  {
    id: 3,
    supplier: "Hoek",
    product_name: "Cement grouted 20mm diameter steel rebar",
    bolt_length: "3",
    bolt_diameter: "20",
    bolt_category: "Encapsulated",
    equipment_compatibility: ["Handheld", "Multi-OEM"],
  },
  {
    id: 4,
    supplier: "Hoek",
    product_name: "EXL Swellex dowel",
    bolt_length: "3",
    bolt_diameter: "26",
    bolt_category: "Encapsulated",
    equipment_compatibility: ["Handheld", "Multi-OEM"],
  },
];
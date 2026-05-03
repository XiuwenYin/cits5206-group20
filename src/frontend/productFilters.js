export const initialFilters = {
  supplier: "",
  length: "",
  category: "",
  equipment: "",
  methodology: "",
};

// Temporary helper for sample data.
// Supplier A sample data is dynamic, while Hoek sample data is static.
// Later this should come directly from the backend test records.
export const getProductMethodologies = (product) => {
  if (Array.isArray(product.test_methodologies)) {
    return product.test_methodologies;
  }

  return product.supplier === "Hoek" ? ["static"] : ["dynamic"];
};

export const formatMethodology = (methodology) => {
  if (!methodology) return "";
  return methodology.charAt(0).toUpperCase() + methodology.slice(1);
};

export const getUniqueOptions = (items, getValue) => {
  return Array.from(new Set(items.map(getValue).filter(Boolean))).sort();
};

export const getFilterOptions = (products) => {
  const methodologies = products.flatMap((product) =>
    getProductMethodologies(product)
  );

  return {
    suppliers: getUniqueOptions(products, (product) => product.supplier),
    lengths: getUniqueOptions(products, (product) => product.bolt_length),
    categories: getUniqueOptions(products, (product) => product.bolt_category),
    equipmentTypes: getUniqueOptions(
      products.flatMap((product) => product.equipment_compatibility),
      (equipment) => equipment
    ),
    methodologies: Array.from(new Set(methodologies)).sort(),
  };
};

export const filterProducts = (products, filters) => {
  return products.filter((product) => {
    const productMethodologies = getProductMethodologies(product);

    const matchesSupplier =
      !filters.supplier || product.supplier === filters.supplier;

    const matchesLength =
      !filters.length || product.bolt_length === filters.length;

    const matchesCategory =
      !filters.category || product.bolt_category === filters.category;

    const matchesEquipment =
      !filters.equipment ||
      product.equipment_compatibility.includes(filters.equipment);

    const matchesMethodology =
      !filters.methodology ||
      productMethodologies.includes(filters.methodology);

    return (
      matchesSupplier &&
      matchesLength &&
      matchesCategory &&
      matchesEquipment &&
      matchesMethodology
    );
  });
};
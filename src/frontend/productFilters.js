export const initialFilters = {
  supplier: "",
  length: "",
  category: "",
  equipment: "",
  methodology: "",
};

export const getProductMethodologies = (product) => {
  if (Array.isArray(product.test_methodologies)) {
    return product.test_methodologies;
  }
  return [];
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
    suppliers: getUniqueOptions(products, (p) => p.supplier),
    lengths: getUniqueOptions(products, (p) => p.length_m),
    categories: getUniqueOptions(products, (p) => p.category?.categoryName),
    equipmentTypes: getUniqueOptions(
      products.flatMap((p) => p.equipment ?? []),
      (e) => e.equipment_type_name
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
      !filters.length || String(product.length_m) === String(filters.length);

    const matchesCategory =
      !filters.category || product.category?.categoryName === filters.category;

    const matchesEquipment =
      !filters.equipment ||
      (product.equipment ?? []).some(
        (e) => e.equipment_type_name === filters.equipment
      );

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

import { getHoekCurvePath, hoekCurveFiles } from "./hoekCurveFiles";

// Parse the simple Hoek CSV format:
// Deformation (mm), Load (tonnes)
// number, number
export const parseHoekCurveCsv = (csvText) => {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  // Skip the header row.
  return lines.slice(1)
    .map((line) => {
      const [deformationRaw, loadRaw] = line.split(",");
      const deformation = Number.parseFloat(deformationRaw);
      const load = Number.parseFloat(loadRaw);

      if (Number.isNaN(deformation) || Number.isNaN(load)) {
        return null;
      }

      return {
        deformation,
        load,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.deformation - b.deformation);
};

export const loadHoekCurve = async (curveFile) => {
  const response = await fetch(getHoekCurvePath(curveFile.fileName));

  if (!response.ok) {
    throw new Error(`Failed to load curve CSV: ${curveFile.fileName}`);
  }

  const csvText = await response.text();

  return {
    ...curveFile,
    points: parseHoekCurveCsv(csvText),
  };
};

export const loadHoekCurves = async () => {
  return Promise.all(hoekCurveFiles.map(loadHoekCurve));
};
export const DEFAULT_OCCUPANCY_PERCENTAGE = 0;

export const OCCUPANCY_PERCENTAGE_ERROR =
  "Occupancy percentage must be a number between 0 and 100.";

export const parseOccupancyPercentage = (
  value: unknown,
  fallback = DEFAULT_OCCUPANCY_PERCENTAGE
) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    throw new Error(OCCUPANCY_PERCENTAGE_ERROR);
  }

  return parsed;
};

export const calculateAvailableArea = (
  totalArea: unknown,
  occupancyPercentage: unknown = DEFAULT_OCCUPANCY_PERCENTAGE
) => {
  const parsedArea = Number(totalArea);

  if (!Number.isFinite(parsedArea) || parsedArea < 0) {
    return 0;
  }

  const parsedOccupancy = parseOccupancyPercentage(occupancyPercentage);
  const availableArea = (parsedArea * (100 - parsedOccupancy)) / 100;

  return Math.round(availableArea * 100) / 100;
};

export const buildAvailabilityFields = (
  totalArea: unknown,
  occupancyPercentage: unknown = DEFAULT_OCCUPANCY_PERCENTAGE
) => {
  const normalizedOccupancyPercentage = parseOccupancyPercentage(occupancyPercentage);

  return {
    occupancyPercentage: normalizedOccupancyPercentage,
    availableArea: calculateAvailableArea(totalArea, normalizedOccupancyPercentage),
  };
};

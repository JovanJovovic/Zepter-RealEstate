export const generatePublicId = (): string => {
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const timestampPart = Date.now().toString(36).toUpperCase();

  return `ZRE-${timestampPart}-${randomPart}`;
};
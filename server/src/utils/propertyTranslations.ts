import type { IProperty, IPropertyTranslation, SupportedLanguage } from "../models/Property.js";
import {
  DEFAULT_OCCUPANCY_PERCENTAGE,
  calculateAvailableArea,
} from "./propertyAvailability.js";

export const supportedLanguages: SupportedLanguage[] = ["sr", "en", "ru", "de"];

export const defaultLanguage: SupportedLanguage = "sr";

export const normalizeLanguage = (value: unknown): SupportedLanguage => {
  const language = Array.isArray(value) ? value[0] : value;

  if (typeof language === "string" && supportedLanguages.includes(language as SupportedLanguage)) {
    return language as SupportedLanguage;
  }

  return defaultLanguage;
};

const hasValue = (value: unknown) => {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && value !== "";
};

const firstValue = <T>(translatedValue: T | undefined, fallbackValue: T | undefined) => {
  return hasValue(translatedValue) ? translatedValue : fallbackValue;
};

export const localizeProperty = (property: IProperty, language: SupportedLanguage) => {
  const rawPropertyObject = property.toObject();
  const occupancyPercentage =
    typeof rawPropertyObject.occupancyPercentage === "number"
      ? rawPropertyObject.occupancyPercentage
      : DEFAULT_OCCUPANCY_PERCENTAGE;
  const propertyObject = {
    ...rawPropertyObject,
    transactionType: rawPropertyObject.transactionType === "sale" ? "sale" : "rent",
    occupancyPercentage,
    availableArea:
      typeof rawPropertyObject.availableArea === "number"
        ? rawPropertyObject.availableArea
        : calculateAvailableArea(rawPropertyObject.sizeSqm, occupancyPercentage),
  };
  const availableLanguages = Array.from(
    new Set([
      defaultLanguage,
      ...(propertyObject.translations || []).map((translation: IPropertyTranslation) => translation.language),
    ])
  );
  const translation = propertyObject.translations?.find(
    (item: IPropertyTranslation) => item.language === language
  );

  const applyTranslation = (item: IPropertyTranslation, resolvedLanguage: SupportedLanguage) => ({
    ...propertyObject,
    title: firstValue(item.title, propertyObject.title),
    location: {
      ...propertyObject.location,
      ...(item.location || {}),
    },
    sizeLabel: firstValue(item.sizeLabel, propertyObject.sizeLabel),
    floorLabel: firstValue(item.floorLabel, propertyObject.floorLabel),
    floors: firstValue(item.floors, propertyObject.floors),
    shortDescription: firstValue(item.shortDescription, propertyObject.shortDescription),
    fullDescription: firstValue(item.fullDescription, propertyObject.fullDescription),
    aboutProperty: firstValue(item.aboutProperty, propertyObject.aboutProperty),
    language: resolvedLanguage,
    availableLanguages,
  });

  if (translation) {
    return applyTranslation(translation, language);
  }

  if (language === defaultLanguage) {
    return {
      ...propertyObject,
      language: defaultLanguage,
      availableLanguages,
    };
  }

  const defaultTranslation = propertyObject.translations?.find(
    (item: IPropertyTranslation) => item.language === defaultLanguage
  );

  if (defaultTranslation) {
    return {
      ...applyTranslation(defaultTranslation, defaultLanguage),
      requestedLanguage: language,
    };
  }

  return {
    ...propertyObject,
    language: defaultLanguage,
    requestedLanguage: language,
    availableLanguages,
  };
};

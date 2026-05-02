import type { IProperty, IPropertyTranslation, SupportedLanguage } from "../models/Property.js";

export const supportedLanguages: SupportedLanguage[] = ["en", "sr", "ru", "de"];

export const defaultLanguage: SupportedLanguage = "en";

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
  const propertyObject = property.toObject();
  const availableLanguages = Array.from(
    new Set([
      defaultLanguage,
      ...(propertyObject.translations || []).map((translation: IPropertyTranslation) => translation.language),
    ])
  );

  if (language === defaultLanguage) {
    return {
      ...propertyObject,
      language: defaultLanguage,
      availableLanguages,
    };
  }

  const translation = propertyObject.translations?.find(
    (item: IPropertyTranslation) => item.language === language
  );

  if (!translation) {
    return {
      ...propertyObject,
      language: defaultLanguage,
      requestedLanguage: language,
      availableLanguages,
    };
  }

  return {
    ...propertyObject,
    title: firstValue(translation.title, propertyObject.title),
    location: {
      ...propertyObject.location,
      ...(translation.location || {}),
    },
    sizeLabel: firstValue(translation.sizeLabel, propertyObject.sizeLabel),
    floorLabel: firstValue(translation.floorLabel, propertyObject.floorLabel),
    floors: firstValue(translation.floors, propertyObject.floors),
    shortDescription: firstValue(translation.shortDescription, propertyObject.shortDescription),
    fullDescription: firstValue(translation.fullDescription, propertyObject.fullDescription),
    aboutProperty: firstValue(translation.aboutProperty, propertyObject.aboutProperty),
    language,
    availableLanguages,
  };
};

import type { PropertyCondition, PropertyType, SupportedLanguage } from '../types/property';

export const propertyTypeOptions: Array<{ value: PropertyType; label: string }> = [
  { value: 'houses', label: 'Houses' },
  { value: 'retails', label: 'Retails' },
  { value: 'offices', label: 'Offices' },
  { value: 'warehouses', label: 'Warehouses' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'agricultural', label: 'Agricultural' },
  { value: 'apartments', label: 'Apartments' },
  { value: 'land', label: 'Land' },
  { value: 'other', label: 'Other' },
];

const propertyTypeLabels: Record<SupportedLanguage, Record<PropertyType, string>> = {
  en: Object.fromEntries(propertyTypeOptions.map((option) => [option.value, option.label])) as Record<PropertyType, string>,
  sr: {
    houses: 'Kuće',
    retails: 'Lokali',
    offices: 'Kancelarije',
    warehouses: 'Magacini',
    industrial: 'Industrijski prostor',
    agricultural: 'Poljoprivredno zemljište',
    apartments: 'Stanovi',
    land: 'Zemljište',
    other: 'Ostalo',
  },
  ru: Object.fromEntries(propertyTypeOptions.map((option) => [option.value, option.label])) as Record<PropertyType, string>,
  de: Object.fromEntries(propertyTypeOptions.map((option) => [option.value, option.label])) as Record<PropertyType, string>,
};

export const conditionOptions: Array<{ value: PropertyCondition; label: string }> = [
  { value: 'available', label: 'Available' },
  { value: 'ongoing-reconstruction', label: 'Ongoing reconstruction' },
  { value: 'major-refitting', label: 'Major refitting' },
  { value: 'minor-refitting', label: 'Minor refitting' },
  { value: 'in-construction', label: 'In construction' },
  { value: 'not-specified', label: 'Not specified' },
];

const conditionLabels: Record<SupportedLanguage, Record<PropertyCondition, string>> = {
  en: Object.fromEntries(conditionOptions.map((option) => [option.value, option.label])) as Record<PropertyCondition, string>,
  sr: {
    available: 'Dostupno',
    'ongoing-reconstruction': 'Rekonstrukcija u toku',
    'major-refitting': 'Veće adaptacije',
    'minor-refitting': 'Manje adaptacije',
    'in-construction': 'U izgradnji',
    'not-specified': 'Nije navedeno',
  },
  ru: Object.fromEntries(conditionOptions.map((option) => [option.value, option.label])) as Record<PropertyCondition, string>,
  de: Object.fromEntries(conditionOptions.map((option) => [option.value, option.label])) as Record<PropertyCondition, string>,
};

export const roomOptions = ['0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '>4'];

export const sizeOptions = [
  { label: 'from 20 to 35 sqm', min: '20', max: '35' },
  { label: 'from 35 to 50 sqm', min: '35', max: '50' },
  { label: 'from 50 to 75 sqm', min: '50', max: '75' },
  { label: 'from 75 to 100 sqm', min: '75', max: '100' },
  { label: 'from 100 to 150 sqm', min: '100', max: '150' },
  { label: 'from 150 to 200 sqm', min: '150', max: '200' },
  { label: 'from 200 to 400 sqm', min: '200', max: '400' },
  { label: 'from 400 sqm', min: '400', max: '' },
];

const sizeLabelsSr = [
  'od 20 do 35 m²',
  'od 35 do 50 m²',
  'od 50 do 75 m²',
  'od 75 do 100 m²',
  'od 100 do 150 m²',
  'od 150 do 200 m²',
  'od 200 do 400 m²',
  'od 400 m²',
];

export const specialRequirementOptions = [
  { value: 'phone', label: 'Phone' },
  { value: 'internet', label: 'Internet' },
  { value: 'parking', label: 'Parking' },
  { value: 'invalid-access', label: 'Invalid access' },
  { value: 'video-surveillance', label: 'Video surveillance' },
  { value: 'security', label: 'Security' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'water', label: 'Water' },
];

const specialRequirementLabels: Record<SupportedLanguage, Record<string, string>> = {
  en: Object.fromEntries(specialRequirementOptions.map((option) => [option.value, option.label])),
  sr: {
    phone: 'Telefon',
    internet: 'Internet',
    parking: 'Parking',
    'invalid-access': 'Pristup za osobe sa invaliditetom',
    'video-surveillance': 'Video-nadzor',
    security: 'Obezbeđenje',
    electricity: 'Struja',
    water: 'Voda',
  },
  ru: Object.fromEntries(specialRequirementOptions.map((option) => [option.value, option.label])),
  de: Object.fromEntries(specialRequirementOptions.map((option) => [option.value, option.label])),
};

export const categoryLabels = {
  commercial: 'Commercial',
  private: 'Private',
  'project-development': 'Project in Development',
};

export const getPropertyTypeOptions = (language: SupportedLanguage = 'en') => {
  const labels = propertyTypeLabels[language] || propertyTypeLabels.en;
  return propertyTypeOptions.map((option) => ({ ...option, label: labels[option.value] || option.label }));
};

export const getConditionOptions = (language: SupportedLanguage = 'en') => {
  const labels = conditionLabels[language] || conditionLabels.en;
  return conditionOptions.map((option) => ({ ...option, label: labels[option.value] || option.label }));
};

export const getSpecialRequirementOptions = (language: SupportedLanguage = 'en') => {
  const labels = specialRequirementLabels[language] || specialRequirementLabels.en;
  return specialRequirementOptions.map((option) => ({ ...option, label: labels[option.value] || option.label }));
};

export const getSizeOptions = (language: SupportedLanguage = 'en') => {
  if (language !== 'sr') return sizeOptions;
  return sizeOptions.map((option, index) => ({ ...option, label: sizeLabelsSr[index] || option.label }));
};

export const getCategoryLabels = (language: SupportedLanguage = 'en') => {
  if (language === 'sr') {
    return {
      commercial: 'Komercijalne nekretnine',
      private: 'Privatne nekretnine',
      'project-development': 'Projekti u razvoju',
    };
  }

  return categoryLabels;
};

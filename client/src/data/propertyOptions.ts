import type { PropertyCondition, PropertyType } from '../types/property';

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

export const conditionOptions: Array<{ value: PropertyCondition; label: string }> = [
  { value: 'available', label: 'Available' },
  { value: 'ongoing-reconstruction', label: 'Ongoing reconstruction' },
  { value: 'major-refitting', label: 'Major refitting' },
  { value: 'minor-refitting', label: 'Minor refitting' },
  { value: 'in-construction', label: 'In construction' },
  { value: 'not-specified', label: 'Not specified' },
];

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

export const categoryLabels = {
  commercial: 'Commercial',
  private: 'Private',
  'project-development': 'Project in Development',
};

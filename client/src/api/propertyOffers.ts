import { API_URL } from '../utils/asset';

export interface PropertyOfferFormPayload {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  propertyType: string;
  city: string;
  municipality?: string;
  address?: string;
  fullLocation?: string;
  area: string;
  proposedPrice: string;
  currency: string;
  description?: string;
  images?: FileList | File[];
  floorPlans?: FileList | File[];
  documents?: FileList | File[];
}

const appendFiles = (formData: FormData, key: string, files?: FileList | File[]) => {
  if (!files) return;
  Array.from(files).forEach((file) => {
    formData.append(key, file);
  });
};

export const createPropertyOffer = async (payload: PropertyOfferFormPayload) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (key === 'images' || key === 'floorPlans' || key === 'documents') return;
    if (value === undefined || value === null || value === '') return;
    formData.append(key, String(value));
  });

  appendFiles(formData, 'images', payload.images);
  appendFiles(formData, 'floorPlans', payload.floorPlans);
  appendFiles(formData, 'documents', payload.documents);

  const response = await fetch(`${API_URL}/property-offers`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Property offer could not be submitted.');
  }

  return response.json() as Promise<{ message: string; offer: { id: string; status: string; createdAt: string } }>;
};

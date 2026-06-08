import { API_URL } from '../utils/asset';

export interface AssistantInquiryPayload {
  question: string;
  email?: string;
  phone?: string;
  sourcePage?: string;
  pageTitle?: string;
  propertyId?: string;
  propertyName?: string;
}

export const createAssistantInquiry = async (payload: AssistantInquiryPayload) => {
  const response = await fetch(`${API_URL}/assistant-inquiries`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Question could not be submitted.');
  }

  return response.json();
};

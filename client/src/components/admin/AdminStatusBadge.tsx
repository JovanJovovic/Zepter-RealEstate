import { getCopy } from '../../data/localization';
import type { SupportedLanguage } from '../../types/property';

interface AdminStatusBadgeProps {
  value?: string | boolean;
  tone?: 'published' | 'draft' | 'archived' | 'active' | 'inactive' | 'featured' | 'neutral';
  language?: SupportedLanguage;
}

const toneFromValue = (value?: string | boolean): AdminStatusBadgeProps['tone'] => {
  if (value === true) return 'featured';
  if (value === false) return 'neutral';
  if (value === 'published') return 'published';
  if (value === 'draft') return 'draft';
  if (value === 'archived') return 'archived';
  if (value === 'active') return 'active';
  if (value === 'inactive') return 'inactive';
  if (value === 'answered') return 'active';
  if (value === 'new' || value === 'in-progress') return 'neutral';
  if (value === 'accepted') return 'active';
  if (value === 'rejected') return 'archived';
  if (value === 'contacted') return 'draft';
  if (value === 'reviewed') return 'neutral';
  return 'neutral';
};

const labelFromValue = (value: string | boolean | undefined, language: SupportedLanguage) => {
  const adminCopy = getCopy(language).admin;
  const copy = adminCopy.common;
  if (value === true) return copy.featured;
  if (value === false) return copy.standard;
  if (!value) return copy.notSet;
  if (value === 'published') return copy.published;
  if (value === 'draft') return copy.draft;
  if (value === 'archived') return copy.archived;
  if (value === 'active') return copy.active;
  if (value === 'inactive') return copy.inactive;
  if (value === 'new') return adminCopy.assistantInquiries.statusNew;
  if (value === 'in-progress') return adminCopy.assistantInquiries.statusInProgress;
  if (value === 'answered') return adminCopy.assistantInquiries.statusAnswered;
  if (value === 'reviewed') return adminCopy.propertyOffers.statusReviewed;
  if (value === 'contacted') return adminCopy.propertyOffers.statusContacted;
  if (value === 'accepted') return adminCopy.propertyOffers.statusAccepted;
  if (value === 'rejected') return adminCopy.propertyOffers.statusRejected;
  return String(value).replace(/-/g, ' ');
};

const AdminStatusBadge = ({ value, tone, language = 'sr' }: AdminStatusBadgeProps) => {
  const badgeTone = tone || toneFromValue(value);

  return <span className={`admin-status admin-status--${badgeTone}`}>{labelFromValue(value, language)}</span>;
};

export default AdminStatusBadge;

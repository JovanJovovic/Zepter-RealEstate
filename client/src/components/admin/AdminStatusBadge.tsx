interface AdminStatusBadgeProps {
  value?: string | boolean;
  tone?: 'published' | 'draft' | 'archived' | 'active' | 'inactive' | 'featured' | 'neutral';
}

const toneFromValue = (value?: string | boolean): AdminStatusBadgeProps['tone'] => {
  if (value === true) return 'featured';
  if (value === false) return 'neutral';
  if (value === 'published') return 'published';
  if (value === 'draft') return 'draft';
  if (value === 'archived') return 'archived';
  if (value === 'active') return 'active';
  if (value === 'inactive') return 'inactive';
  return 'neutral';
};

const labelFromValue = (value?: string | boolean) => {
  if (value === true) return 'Featured';
  if (value === false) return 'Standard';
  if (!value) return 'Not set';
  return String(value).replace(/-/g, ' ');
};

const AdminStatusBadge = ({ value, tone }: AdminStatusBadgeProps) => {
  const badgeTone = tone || toneFromValue(value);

  return <span className={`admin-status admin-status--${badgeTone}`}>{labelFromValue(value)}</span>;
};

export default AdminStatusBadge;

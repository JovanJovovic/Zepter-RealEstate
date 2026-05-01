import type { AdminMessage } from '../../types/admin';

interface AdminNoticeProps {
  message: AdminMessage | null;
}

const AdminNotice = ({ message }: AdminNoticeProps) => {
  if (!message) return null;

  return <div className={`admin-notice admin-notice--${message.type}`}>{message.text}</div>;
};

export default AdminNotice;

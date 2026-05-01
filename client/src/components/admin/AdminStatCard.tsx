interface AdminStatCardProps {
  label: string;
  value: string | number;
  text: string;
}

const AdminStatCard = ({ label, value, text }: AdminStatCardProps) => {
  return (
    <div className="admin-stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{text}</p>
    </div>
  );
};

export default AdminStatCard;

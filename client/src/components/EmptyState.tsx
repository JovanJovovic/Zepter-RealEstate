interface EmptyStateProps {
  title: string;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({ title, text, actionLabel, onAction }: EmptyStateProps) => {
  return (
    <div className="empty-state">
      <span className="empty-state__mark">ZRE</span>
      <h2>{title}</h2>
      <p>{text}</p>
      {actionLabel && onAction && (
        <button className="btn btn--primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

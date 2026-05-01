const LoadingState = ({ text = 'Loading content...' }: { text?: string }) => {
  return (
    <div className="loading-state">
      <span />
      <p>{text}</p>
    </div>
  );
};

export default LoadingState;

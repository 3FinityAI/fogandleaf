const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-secondary-600">{message}</p>
    </div>
  </div>
);

export default LoadingSpinner;

import { AlertTriangle } from "lucide-react";

const ErrorDisplay = ({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try Again",
}) => (
  <div className="text-center py-12">
    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-secondary-900 mb-2">{title}</h3>
    {message && <p className="text-secondary-600 mb-4">{message}</p>}
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        {retryLabel}
      </button>
    )}
  </div>
);

export default ErrorDisplay;

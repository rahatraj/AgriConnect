import { AlertTriangle } from "lucide-react";

const ErrorComponent = ({ message, onDismiss }) => {
  return (
    <div className="mt-10 flex flex-col items-center justify-center h-64 bg-red-100 text-red-700 p-6 rounded-lg shadow-lg">
      <AlertTriangle className="w-10 h-10 mb-2" />
      <p className="text-lg font-semibold">{message || "Something went wrong!"}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="btn btn-error mt-4">
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorComponent;

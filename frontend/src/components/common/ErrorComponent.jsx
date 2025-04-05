const ErrorComponent = ({ error, onDismiss }) => {
  return (
    <div className="mt-10 flex flex-col items-center justify-center h-64 bg-red-100 text-red-700 p-6 rounded-lg shadow-lg">
      <AlertTriangle className="w-10 h-10 mb-2" />

      <p className="text-lg font-semibold">
        {error?.message || "Something went wrong!"}
      </p>

      {error?.errors && Array.isArray(error.errors) && (
        <div className="mt-2">
          {error?.errors?.map((err, index) => (
            <p key={index} className="text-sm">
              {err?.msg}
            </p>
          ))}
        </div>
      )}

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="btn btn-error mt-4"
        >
          Retry
        </button>
      )}
    </div>
  );
};
export default ErrorComponent;
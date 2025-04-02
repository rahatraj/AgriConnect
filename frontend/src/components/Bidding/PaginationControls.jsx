import React from "react";

function PaginationControls({ page, setPage, totalPages }) {
  return (
    <div className="flex justify-center mt-6 gap-3">
      <button
        className="btn btn-outline"
        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
        disabled={page === 1}
      >
        Previous
      </button>
      <span className="text-gray-700 font-semibold">Page {page} of {totalPages}</span>
      <button
        className="btn btn-outline"
        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={page === totalPages}
      >
        Next
      </button>
    </div>
  );
}

export default PaginationControls;

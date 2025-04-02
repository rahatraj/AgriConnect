import { useState } from "react";
import { useDispatch } from "react-redux";
import { deleteProduct } from "../../redux/slices/productSlice";

function DeleteConfirmationModal({ productId, isOpen, onClose }) {
  const dispatch = useDispatch();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await dispatch(deleteProduct(productId));
    setDeleting(false);
    onClose(); // Close modal after deletion
  };

  return (
    <div 
        className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity ${isOpen ? "visible opacity-100" : "invisible opacity-0"}`}
    >
      <div className="bg-white rounded-lg p-6 shadow-lg w-80">
        <h2 className="text-lg font-semibold text-gray-900">Confirm Deletion</h2>
        <p className="text-gray-600 mt-2">Are you sure you want to delete this product? This action cannot be undone.</p>
        <div className="flex justify-end mt-4 space-x-2">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-error" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmationModal;

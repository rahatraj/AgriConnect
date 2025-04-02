import React, { useState } from "react";
import ReactDOM from "react-dom";
import CreateProducts from "../forms/CreateProducts";

function ProductDetailsModal({ product, isOpen, onClose }) {
  const [isEditing, setIsEditing] = useState(false);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
      onClick={onClose} // Close modal when clicking outside
    >
      <div 
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
      >
        {/* Toggle between Product Details and Edit Form */}
        {!isEditing ? (
            <>
                {/* Title */}
                <h1 className="text-lg font-bold text-center mb-2">Product Details</h1>

                {/* Product Information */}
                <h2 className="text-xl font-bold text-gray-900">{product?.productName}</h2>
                <p className="text-gray-500">Category: {product?.category}</p>
                <p className="text-gray-500">Description: {product?.productDescription}</p>
                <p className="text-gray-700 font-bold">Address : 
                    <span className="text-gray-500">{product?.address?.street}{","}</span>
                    <span className="text-gray-500">{product?.address?.city}{" ,"}</span>
                    <span className="text-gray-500">{product?.address?.state}{" ,"}</span>
                    <span className="text-gray-500">{product?.address?.postalCode}{" ,"}</span>
                    <span className="text-gray-500">{product?.address?.country}{"."}</span>
                </p>

                {/* Display Product Images */}
                {product?.productImages?.length > 0 && (
                <div className="w-full mt-4 grid grid-cols-2 gap-2">
                    {product.productImages.map((image, index) => (
                    <div key={index} className="w-full h-[120px] sm:h-[150px]">
                        <img
                        src={image.url}
                        alt={`Product ${index}`}
                        className="w-[100px] h-[100px] object-cover rounded-lg"
                        />
                    </div>
                    ))}
                </div>
                )}

                <div className="flex flex-wrap justify-between items-center gap-2">
                    {/* Edit button */}
                    <button 
                        className="btn btn-primary w-full sm:w-auto"
                        onClick={() => setIsEditing(true)}
                    >
                        Edit
                    </button>
                    {/* Close Button */}
                    <button
                    onClick={onClose}
                    className="btn btn-error w-full sm:w-auto"
                    >
                    Close
                    </button>
                </div>
            </>
        ): (
            // Render the CreateProducts form inside the modal
            <CreateProducts product={product} onClose={() => setIsEditing(false)} />
        )}
        
        
      </div>
    </div>,
    document.body // Render outside the parent component
  );
}

export default ProductDetailsModal;

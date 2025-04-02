import React, { useState } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import DeleteConfirmationModal from "../common/DeleteConfirmationModal";
import ProductDetailsModal from "../common/ProductDetailsModal";

function ProductCard({ product, sliderSettings }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProductDetailsModal, setIsProductDetailsModal] = useState(false);

  return (
    <div className="card bg-white shadow-md p-4 rounded-lg overflow-hidden w-full max-w-sm mx-auto md:max-w-md lg:max-w-lg hover:scale-105 hover:ease-out duration-100">
      {/* Slick Carousel */}
      {product?.productImages && product?.productImages?.length > 0 ? (
        <Slider {...sliderSettings} className="w-full h-[200px] md:h-[250px]">
          {product?.productImages.map((image, index) => (
            <div key={index} className="w-full h-[200px] md:h-[250px]">
              <img
                src={image.url}
                alt={`Product ${index}`}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
          ))}
        </Slider>
      ) : (
        <div className="h-[200px] md:h-[250px] flex items-center justify-center bg-gray-200">
          <p className="text-gray-500">No Image Available</p>
        </div>
      )}

      {/* Product Details */}
      <h2 className="text-lg font-bold mt-3 text-gray-900 md:text-xl">
        {product?.productName}
      </h2>
      <div className="flex flex-wrap items-center justify-between">
        <div>
            <p className="text-gray-500 text-sm md:text-base">
              Category: {product.category}
            </p>
            <p className="text-gray-700 text-sm md:text-base">
              {product?.productDescription}
            </p>
        </div>
        <p className="text-primary font-bold text-sm">Status : {product?.status}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-between gap-2 mt-4">
        <button
          className="btn btn-warning w-full sm:w-auto"
          onClick={() => setIsProductDetailsModal(true)}
        >
          View Details
        </button>

        {isProductDetailsModal && (
          <ProductDetailsModal
            productId={product._id}
            product={product}
            isOpen={isProductDetailsModal}
            onClose={() => setIsProductDetailsModal(false)}
          />
        )}

        {/* Start Bidding Button */}
        <Link
          to={product?.status === "Available" ? `/start-bidding/${product._id}` : "#"}
          className={`btn w-full sm:w-auto ${
            product?.status === "Available" ? "btn-primary" : "btn-disabled cursor-not-allowed"
          }`}
          onClick={(e) => product?.status !== "Available" && e.preventDefault()} // Prevent clicking if not available
        >
          Start Bidding
        </Link>

        {/* Delete Confirmation Modal */}
        <button
          className="btn btn-error w-full sm:w-auto"
          onClick={() => setIsModalOpen(true)}
        >
          Delete
        </button>
        
        {isModalOpen && (
          <DeleteConfirmationModal
            productId={product._id}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

export default ProductCard;

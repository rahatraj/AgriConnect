import React from "react";
import moment from "moment";

function ProductSummary({ product, bid }) {
  return (
    <div className="rounded-lg p-4">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        
        {/* ✅ Left: Product Image (Small) */}
        <div className="p-2 rounded-lg w-32 h-32 md:w-48 md:h-48 flex justify-center items-center">
          {product?.productImages?.length > 0 ? (
            <img
              src={product?.productImages[0]?.url}
              alt={product?.productName}
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            <p className="text-gray-500 text-sm">No Image</p>
          )}
        </div>

        {/* ✅ Right: Product Details */}
        <div className="flex-1">
          <h2 className="text-lg font-bold text-primary">{product?.productName}</h2>
          <p className="text-gray-600 text-sm mt-1">
            <span className="font-semibold">Description:</span> {product?.productDescription}
          </p>

          {/* Bidding Details Grid */}
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-100 p-2 rounded-lg shadow">
              <p className="text-gray-500">Base Price</p>
              <p className="font-bold text-primary">₹{bid?.basePrice}</p>
            </div>

            <div className="bg-gray-100 p-2 rounded-lg shadow">
              <p className="text-gray-500">Quantity</p>
              <p className="font-bold">{bid?.quantity} Kg</p>
            </div>

            <div className="bg-gray-100 p-2 rounded-lg shadow col-span-2">
              <p className="text-gray-500">Bid Created On</p>
              <p className="font-bold">{moment(bid?.createdAt).format("MMM Do YYYY")}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ProductSummary;

import React from "react";
import moment from "moment";

function ProductDetails({ product, bid }) {
  return (
    <div className="card bg-base-100 shadow-lg rounded-xl overflow-hidden">
      {/* Product Image */}
      <div className="h-64 md:h-80 flex justify-center items-center bg-gray-100">
        {product?.productImages?.length > 0 ? (
          <img
            src={product?.productImages[0]?.url}
            alt={product?.productName}
            className="w-full h-full object-cover rounded-t-xl"
          />
        ) : (
          <p className="text-gray-500 text-center">No Image Available</p>
        )}
      </div>

      {/* Product Details */}
      <div className="p-5">
        <h2 className="text-xl md:text-2xl font-bold text-primary">
          {product?.productName}
        </h2>
        <p className="text-gray-700 text-sm md:text-base">
          Category: <span className="font-semibold">{product?.category}</span>
        </p>
        <p className="text-gray-700 text-sm md:text-base mt-2">
          <span className="font-semibold">Description:</span> {product?.productDescription}
        </p>
        <p className="text-gray-700 text-sm md:text-base mt-2">
          <span className="font-semibold">Farmer:</span> {product?.farmer?.fullName}
        </p>
        <p className="text-gray-700 text-sm md:text-base mt-2">
          <span className="font-semibold">Address :</span>
          <span>{product?.address?.street}{","}{product?.address?.city} {","}{product?.address?.state} {","}{product?.address?.postalCode} {","} {product?.address?.country}</span>
        </p>

        {/* Bidding Details */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm md:text-base">
          <div className="bg-gray-100 p-3 rounded-lg shadow">
            <p className="text-gray-500">Base Price</p>
            <p className="font-bold text-primary">₹{bid?.basePrice}</p>
          </div>

          <div className="bg-gray-100 p-3 rounded-lg shadow">
            <p className="text-gray-500">Highest Bid</p>
            <p className="font-bold text-green-600">₹{bid?.currentHighestBid}</p>
          </div>

          <div className="bg-gray-100 p-3 rounded-lg shadow">
            <p className="text-gray-500">Weight</p>
            <p className="font-bold">{bid?.quantity} Kg</p>
          </div>

          <div className="bg-gray-100 p-3 rounded-lg shadow">
            <p className="text-gray-500">Bid Created On</p>
            <p className="font-bold">{moment(bid?.createdAt).format("MMM Do YYYY")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;

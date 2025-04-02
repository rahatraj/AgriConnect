import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

function NoBidsFound({ heading,message }) {
  const navigate = useNavigate();

  // Handle Back Action
  const handleGoBack = () => {
    toast.success("Returning to previous page...");
    navigate(-1);
  };

  return (
    <div className="flex items-center justify-center w-full px-4">
      <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
        {/* DaisyUI Loading Icon */}
        <div className="text-gray-400 text-5xl animate-bounce">
          <span className="loading loading-spinner loading-lg"></span>
        </div>

        {/* Heading & Message */}
        <h2 className="lg:text-2xl font-bold text-neutral mt-4">{heading}</h2>
        <p className="text-gray-600 text-md mt-2">
          {message}
        </p>

        {/* Back Button */}
        <button
          onClick={handleGoBack}
          className="btn btn-secondary mt-4 px-5 py-2 lg:text-lg font-medium rounded-lg shadow-md hover:scale-105 transition-transform"
        >
          ⬅ Go Back
        </button>
      </div>
    </div>
  );
}

export default NoBidsFound;

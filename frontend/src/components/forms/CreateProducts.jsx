import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { createProductList, updateProduct } from "../../redux/slices/productSlice";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const formInitial = {
  productName: "",
  productDescription: "",
  category: "",
  productImages: [],
  address: {
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  },
};

function CreateProducts({ product, onClose }) {
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(formInitial);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    if (product) {
      setFormData({
        productName: product.productName || "",
        productDescription: product.productDescription || "",
        category: product.category || "",
        productImages: product.productImages || [],
        address: product.address || formInitial.address,
      });

      // Generate image previews if editing
      setImagePreviews(product.productImages.map((img) => img.url));
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData({
        ...formData,
        address: { ...formData.address, [addressField]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error("You can only upload up to 5 images.");
      return;
    }

    setFormData((prevState) => ({
      ...prevState,
      productImages: files,
    }));

    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataObject = new FormData();
    formDataObject.append("productName", formData.productName);
    formDataObject.append("productDescription", formData.productDescription);
    formDataObject.append("category", formData.category);
    formDataObject.append("address", JSON.stringify(formData.address));

    // Append images
    if (formData.productImages.length > 0) {
      formData.productImages.forEach((image) => {
        formDataObject.append(`productImages`, image);
      });
    }

    let result;
    if (product) {
      console.log("product Id in form:", product._id);
      result = await dispatch(updateProduct({ id: product._id, formData: formDataObject }));
    } else {
      console.log(formDataObject);
      result = await dispatch(createProductList(formDataObject));
    }

    if (result.meta.requestStatus === "fulfilled") {
      toast.success(product ? "Product updated successfully!" : "Product listed successfully!");
      setFormData(formInitial)
      navigate('/farmer/products')
      if (onClose) onClose();
    } else {
      toast.error("Failed to process the product. Try again.");
    }
  };

  return (
    <div className="p-4 lg:mt-10">
      <h1 className="text-xl font-bold text-center">{product ? "Edit Product" : "List a New Product"}</h1>
      <p className="text-gray-600 text-center mt-2">
        {product
          ? "Update your product details, modify images, or adjust category and location information. Make sure to provide accurate details to attract the right buyers."
          : "Fill in the details below to list a new product for sale. Add clear images, a detailed description, and location details to ensure buyers can find your listing easily. A well-listed product increases visibility and helps you get the best price."}
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Product Name */}
        <div className="form-control">
          <label className="label">Product Name</label>
          <input
            type="text"
            name="productName"
            placeholder="Enter product name"
            className="input input-bordered w-full"
            value={formData.productName}
            onChange={handleChange}
          />
        </div>

        {/* Product Description */}
        <div className="form-control">
          <label className="label">Product Description</label>
          <textarea
            name="productDescription"
            placeholder="Enter product description (max 500 characters)"
            className="textarea textarea-bordered w-full"
            value={formData.productDescription}
            onChange={handleChange}
          />
        </div>

        {/* Product Category */}
        <div className="form-control">
          <label className="label">Category</label>
          <select
            name="category"
            className="select select-bordered w-full"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="" disabled>Select category</option>
            <option value="Grains">Grains</option>
            <option value="Fruits">Fruits</option>
            <option value="Vegetables">Vegetables</option>
          </select>
        </div>

        {/* Product Image Upload */}
        <div className="form-control">
          <label className="label">Upload Images (Max 5)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            className="file-input file-input-bordered w-full"
            onChange={handleImageUpload}
          />
          <div className="flex gap-2 mt-2">
            {imagePreviews.map((src, index) => (
              <img key={index} src={src} alt={`Preview ${index + 1}`} className="w-20 h-20 object-cover rounded-lg" />
            ))}
          </div>
        </div>

        {/* Address Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">Street</label>
            <input
              type="text"
              name="address.street"
              placeholder="Street address"
              className="input input-bordered w-full"
              value={formData.address.street}
              onChange={handleChange}
            />
          </div>

          <div className="form-control">
            <label className="label">City</label>
            <input
              type="text"
              name="address.city"
              placeholder="City"
              className="input input-bordered w-full"
              value={formData.address.city}
              onChange={handleChange}
            />
          </div>

          <div className="form-control">
            <label className="label">State</label>
            <input
              type="text"
              name="address.state"
              placeholder="State"
              className="input input-bordered w-full"
              value={formData.address.state}
              onChange={handleChange}
            />
          </div>

          <div className="form-control">
            <label className="label">Postal Code</label>
            <input
              type="text"
              name="address.postalCode"
              placeholder="Postal Code"
              className="input input-bordered w-full"
              value={formData.address.postalCode}
              onChange={handleChange}
            />
          </div>

          <div className="form-control col-span-2">
            <label className="label">Country</label>
            <input
              type="text"
              name="address.country"
              className="input input-bordered w-full"
              value={formData.address.country}
              readOnly
            />
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary w-full">
          {product ? "Update Product" : "Submit Product"}
        </button>
      </form>
    </div>
  );
}

export default CreateProducts;

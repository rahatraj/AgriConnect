import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProductList } from "../../redux/slices/productSlice";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Loader, Search } from "lucide-react";
import ProductCard from "../../components/Products/ProductCard";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import NoBidsFound from "../../components/Bidding/NoBidsFound";
import ErrorComponent from "../../components/common/ErrorComponent";

function ProductsPage() {
  const dispatch = useDispatch();
  const { productData, loading, error } = useSelector((state) => state.products);
  const [showError, setShowError] = useState(true);

  // Sorting, filtering, and pagination
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sort, setSort] = useState("latest");
  const [category, setCategory] = useState("");

  useEffect(() => {
    dispatch(getProductList({ page, limit, sort, category, search }));
  }, [dispatch, page, limit, sort, category, search]);

  // Handle Sorting Change
  const handleSortChange = (e) => {
    setSort(e.target.value);
    setPage(1);
  };

  // Handle Category Change
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(1);
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    adaptiveHeight: true,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  if (error && showError) {
    return <ErrorComponent message={error} onDismiss={() => setShowError(false)} />;
  }

  return (
    <div className="min-h-screen p-4 md:p-6 bg-base-100">
      {/* Page Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">
          My Product Listings
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          Manage and view all your listed products.
        </p>
      </div>

      {/* Actions Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-semibold text-secondary">
          Your Listed Products
        </h2>
        <Link to="/create-product" className="btn btn-primary w-full md:w-auto">
          Add New Product
        </Link>
      </div>

      {/* Search & Filters Section */}
      <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-between items-center">
        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="input input-bordered w-full pl-10"
            placeholder="Search for products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Sorting */}
        <select className="select select-bordered" value={sort} onChange={handleSortChange}>
          <option value="latest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>

        {/* Category */}
        <select className="select select-bordered" value={category} onChange={handleCategoryChange}>
          <option value="">All Categories</option>
          <option value="Grains">Grains</option>
          <option value="Fruits">Fruits</option>
          <option value="Vegetables">Vegetables</option>
        </select>
      </div>

      {/* Product List Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {productData?.products?.length > 0 ? (
          productData?.products?.map((product) => (
            <ProductCard key={product?._id} product={product} sliderSettings={sliderSettings} />
          ))
        ) : (
          <NoBidsFound 
            heading="No Products Found"
            message="You haven't listed any products yet."
          />
        )}
      </div>

      {/* Pagination Controls (Hidden if No Products) */}
      {productData?.products?.length > 0 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            className="btn btn-outline btn-sm flex items-center"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft size={18} />
            Previous
          </button>

          <span className="font-semibold">
            Page {page} of {productData?.pagination?.totalPages || 1}
          </span>

          <button
            className="btn btn-outline btn-sm flex items-center"
            disabled={page >= productData?.pagination?.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductsPage;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axios";

// Fetch Product List (with pagination, sorting, and search)
export const getProductList = createAsyncThunk(
  "products/getProductList",
  async ({ page = 1, limit = 10, sort = "latest", category = "", search = "" }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/products/my-products?page=${page}&limit=${limit}&sort=${sort}&category=${category}&search=${search}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to fetch products");
    }
  }
);

// Create New Product
export const createProductList = createAsyncThunk(
  "products/createProductList",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/products/add", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to create product");
    }
  }
);

// Delete Product
export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (productId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/products/delete/${productId}`);
      return productId; // Returning deleted productId for removal from state
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to delete product");
    }
  }
);

// Fetch Single Product Details
export const showProductDetails = createAsyncThunk(
  "products/showProductDetails",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/products/show/${productId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to fetch product details");
    }
  }
);

// Update Product
export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/products/update/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to update product");
    }
  }
);

// Product Slice
const productSlice = createSlice({
  name: "products",
  initialState: {
    productData: { products: [], totalPages: 1 },
    selectedProduct: null,
    bidDetails: null,
    isFetched: false,
    loading: false,
    error: null,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder
      // Fetch All Products
      .addCase(getProductList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductList.fulfilled, (state, action) => {
        state.productData = action.payload || { products: [], totalPages: 1 };
        state.isFetched = true;
        state.loading = false;
      })
      .addCase(getProductList.rejected, (state, action) => {
        state.error = action.payload;
        state.isFetched = false;
        state.loading = false;
      })

      // Create Product
      .addCase(createProductList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProductList.fulfilled, (state, action) => {
        state.productData.products.push(action.payload.product);
        state.isFetched = true;
        state.loading = false;
      })
      .addCase(createProductList.rejected, (state, action) => {
        state.error = action.payload;
        state.isFetched = false;
        state.loading = false;
      })

      // Delete Product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.productData.products = state.productData.products.filter(product => product._id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Fetch Single Product Details
      .addCase(showProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(showProductDetails.fulfilled, (state, action) => {
        state.selectedProduct = action.payload.product;
        state.bidDetails = action.payload.bidDetails || null;
        state.loading = false;
        state.error = null;
      })
      .addCase(showProductDetails.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const updatedProduct = action.payload.product;
        state.selectedProduct = updatedProduct;
        state.productData.products = state.productData.products.map(product =>
          product._id === updatedProduct._id ? updatedProduct : product
        );
        state.loading = false;
        state.error = null;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  }
});

export default productSlice.reducer;

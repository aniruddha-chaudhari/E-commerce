import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useProductStore = create((set) => ({
  products: [],
  loading: false,

  setProducts: (products) => set({ products }),

  createProduct: async (productData) => {
    set({ loading: true });
    try {
      const res = await axios.post("/products/", productData);
      set((prevState) => ({
        products: [...prevState.products, res.data],
        loading: false, // Ensure loading is set to false after success
      }));
      toast.success("Product created successfully"); // Add success feedback
      return res.data; // Return the created product data
    } catch (error) {
      set({ loading: false }); // Ensure loading is set to false after error
      toast.error(error.response?.data?.error || "Failed to create product");
      throw error; // Propagate error to component
    }
  },

  fetchAllProducts: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/products");
      set({ 
        products: response.data, // Updated to match backend response structure
        loading: false 
      });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.error || "Failed to fetch products");
    }
  },

  fetchProductsByCategory: async (category) => {
    set({ loading: true });
    try {
      const response = await axios.get(`/products/category/${category}`);
      set({ 
        products: response.data, // Updated to match backend response structure
        loading: false 
      });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.error || "Failed to fetch products");
    }
  },

  deleteProduct: async (productId) => {
    set({ loading: true });
    try {
      await axios.delete(`/products/${productId}`);
      set((prevState) => ({
        products: prevState.products.filter((product) => product.id !== productId), 
        loading: false,
      }));
      toast.success("Product deleted successfully");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.error || "Failed to delete product");
    }
  },

  toggleFeaturedProduct: async (productId) => {
    set({ loading: true });
    try {
      const response = await axios.patch(`/products/${productId}`);
      set((prevState) => ({
        products: prevState.products.map((product) =>
          product.id === productId ? { ...product, is_featured: response.data.is_featured } : product
        ),
        loading: false,
      }));
      toast.success("Product updated successfully");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.error || "Failed to update product");
    }
  },

  fetchFeaturedProducts: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/products/featured");
      set({ 
        products: response.data,
        loading: false 
      });
    } catch (error) {
      set({ loading: false });
      console.error("Error fetching featured products:", error);
      toast.error("Failed to fetch featured products");
    }
  },
}));
"use client"

import { BarChart, PlusCircle, ShoppingBasket } from "lucide-react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

import AnalyticsTab from "../components/AnalyticsTab"
import CreateProductForm from "../components/CreateProductForm"
import ProductsList from "../components/ProductsList"
import { useProductStore } from "../store/useProductStore"

const tabs = [
  { id: "create", label: "Create Product", icon: PlusCircle },
  { id: "products", label: "Products", icon: ShoppingBasket },
  { id: "analytics", label: "Analytics", icon: BarChart },
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("create")
  const { fetchAllProducts } = useProductStore();

  useEffect(() => {
    fetchAllProducts()
  }, [fetchAllProducts])

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <motion.h1
          className="text-4xl font-bold mb-8 text-indigo-600 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Admin Dashboard
        </motion.h1>

        <div className="mb-8 bg-white shadow-md rounded-lg">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center flex-1 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-indigo-600 hover:bg-indigo-100"
                }`}
              >
                <tab.icon className="mr-2 h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          {activeTab === "create" && <CreateProductForm />}
          {activeTab === "products" && <ProductsList />}
          {activeTab === "analytics" && <AnalyticsTab />}
        </div>
      </div>
    </div>
  )
}
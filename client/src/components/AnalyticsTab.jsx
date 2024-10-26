"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import axios from "../lib/axios"
import { Users, Package, ShoppingCart, DollarSign } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const AnalyticsTab = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalusers: 0,
    totalproducts: 0,
    totalorders: 0,
    revenue: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [dailySalesData, setDailySalesData] = useState([])

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await axios.get("/analytics")
        setAnalyticsData(response.data.analyticsData)
        console.log(response.data.dailySalesData)
        setDailySalesData(response.data.dailySalesData)
        console.log(dailySalesData)
      } catch (error) {
        console.error("Error fetching analytics data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [])

  if (isLoading) {
    return <div className="text-indigo-600 text-center text-xl font-semibold">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AnalyticsCard
          title="Total Users"
          value={analyticsData.totalusers.toLocaleString()}
          icon={Users}
          color="from-indigo-500 to-purple-600"
        />
        <AnalyticsCard
          title="Total Products"
          value={analyticsData.totalproducts.toLocaleString()}
          icon={Package}
          color="from-indigo-500 to-blue-600"
        />
        <AnalyticsCard
          title="Total Sales"
          value={analyticsData.totalorders.toLocaleString()}
          icon={ShoppingCart}
          color="from-indigo-500 to-cyan-600"
        />
        <AnalyticsCard
          title="Total Revenue"
          value={`$${analyticsData.revenue.toLocaleString()}`}
          icon={DollarSign}
          color="from-indigo-500 to-violet-600"
        />
      </div>
      <motion.div
        className="bg-white rounded-lg p-6 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={dailySalesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E0E7FF" />
            <XAxis dataKey="name" stroke="#4F46E5" />
            <YAxis yAxisId="left" stroke="#4F46E5" />
            <YAxis yAxisId="right" orientation="right" stroke="#4F46E5" />
            <Tooltip contentStyle={{ backgroundColor: "#EEF2FF", border: "1px solid #C7D2FE" }} />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="sales"
              stroke="#4F46E5"
              activeDot={{ r: 8 }}
              name="Sales"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#6366F1"
              activeDot={{ r: 8 }}
              name="Revenue"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}

const AnalyticsCard = ({ title, value, icon: Icon, color }) => (
  <motion.div
    className={`bg-white rounded-lg p-6 shadow-lg overflow-hidden relative`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex justify-between items-center">
      <div className="z-10">
        <p className="text-indigo-600 text-sm mb-1 font-semibold">{title}</p>
        <h3 className="text-indigo-900 text-3xl font-bold">{value}</h3>
      </div>
    </div>
    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-10`} />
    <div className="absolute -bottom-4 -right-4 text-indigo-200">
      <Icon className="h-32 w-32" />
    </div>
  </motion.div>
)

export default AnalyticsTab
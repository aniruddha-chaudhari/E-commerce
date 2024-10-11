import React from 'react'
import { ShoppingCart, UserPlus, LogIn, LogOut, Lock } from "lucide-react";
import { Link } from 'react-router-dom';

const Navbar = () => {
    const user = true;
    const cart = [1,2,3,3,4,3,3,3,3];
    const isAdmin = true;
    const logout = () => { };
    return (
        <header className="fixed top-0 left-0 w-full bg-white bg-opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-indigo-600 items-center space-x-2 flex">
              E-Commerce
            </Link>
  
            <nav className="flex flex-wrap items-center gap-4">
              <Link
                to={"/"}
                className="text-gray-600 hover:text-indigo-600 transition duration-300 ease-in-out"
              >
                Home
              </Link>
              {user && (
                <Link
                  to={"/cart"}
                  className="relative group text-gray-600 hover:text-indigo-600 transition duration-300 ease-in-out"
                >
                  <ShoppingCart className="inline-block mr-1 group-hover:text-indigo-600" size={20} />
                  <span className="hidden sm:inline">Cart</span>
                  {cart.length > 0 && (
                    <span
                      className="absolute -top-2 -left-2 bg-indigo-600 text-white rounded-full px-2 py-0.5 
                      text-xs group-hover:bg-indigo-700 transition duration-300 ease-in-out"
                    >
                      {cart.length}
                    </span>
                  )}
                </Link>
              )}
              {isAdmin && (
                <Link
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md font-medium
                  transition duration-300 ease-in-out flex items-center"
                  to={"/secret-dashboard"}
                >
                  <Lock className="inline-block mr-1" size={18} />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              )}
  
              {user ? (
                <button
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 
                  rounded-md flex items-center transition duration-300 ease-in-out"
                  onClick={logout}
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline ml-2">Log Out</span>
                </button>
              ) : (
                <>
                  <Link
                    to={"/signup"}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 
                    rounded-md flex items-center transition duration-300 ease-in-out"
                  >
                    <UserPlus className="mr-2" size={18} />
                    Sign Up
                  </Link>
                  <Link
                    to={"/login"}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 
                    rounded-md flex items-center transition duration-300 ease-in-out"
                  >
                    <LogIn className="mr-2" size={18} />
                    Login
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>
    )
}

export default Navbar
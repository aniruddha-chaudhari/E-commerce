import React from 'react';
import { useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/Login';
import { Toaster } from "react-hot-toast";
import { useUserStore } from './store/useUserStore';
import SignUpPage from './pages/SignUp';
import LoadingSpinner from './components/LoadingSpinner';
import AdminPage from './pages/AdminPage';
import CategoryPage from './pages/CategoryPage';
import CartPage from './pages/CartPage';
import { useCartStore } from './store/useCartStore';

function App() {
    
    const { user, checkAuth, checkingAuth } = useUserStore();
    const { getCartItems } = useCartStore();

    useEffect(() => {
		if (!user) return;

		getCartItems();
	}, [getCartItems, user]);
    
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);
    if (checkingAuth) return <LoadingSpinner />;
    return (
        <div className='min-h-screen text-white relative overflow-hidden'>

            <div className='relative z-50 pt-20'>
                <Navbar />
                <Routes>

                    <Route path="/" element={<HomePage />} />
                    <Route path="/signup" element={!user ? <SignUpPage /> : <Navigate to='/' />} />
                    <Route path="/login" element={!user ? <LoginPage /> : <Navigate to='/' />} />
                    <Route
						path='/secret-dashboard'
						element={user?.role === "admin" ? <AdminPage /> : <Navigate to='/login' />}
					/>
                    <Route
						path='/category/:category'
						element={<CategoryPage/>}
					/>
                    <Route path='/cart' element={user ? <CartPage /> : <Navigate to='/login' />} />
                </Routes>
                <Toaster />
            </div>
        </div>
    );
}

export default App;
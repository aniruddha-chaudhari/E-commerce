import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SignUp from './pages/SignUp';
import LoginPage from './pages/Login';

function App() {
    return (
        <div className='min-h-screen text-white relative overflow-hidden'>
           
            <div className='relative z-50 pt-20'>
                <Navbar />
                <Routes>

                    <Route path="/" element={<HomePage />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/login" element={<LoginPage />} />
                </Routes>
            </div>
        </div>
    );
}

export default App;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import loginImage from '../assets/login1.jpg';
import login2Image from '../assets/login2.jpg';
import login3Image from '../assets/login3.jpg';
import logoImage from '../assets/taglessLogo.png';
import letsImage from '../assets/lets.jpeg';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const images = [loginImage, login2Image, login3Image];
  const [currentImage, setCurrentImage] = useState(0);

  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      navigate('/');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-between px-8">

      {/* Left Logo Area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <img
          src={logoImage}
          alt="Logo"
          className="w-44 h-auto mb-4" // ⬅️ larger logo
        />
        <div className="flex items-center space-x-2">
          <span className="text-base text-gray-600 font-medium">Made by</span>
          <img
            src={letsImage}
            alt="Let's"
            className="h-auto w-20"
          />
        </div>
      </div>

      {/* Right-Aligned Container */}
      <div className="w-full max-w-4xl h-[520px] rounded-xl shadow-2xl flex overflow-hidden mr-4 bg-white">
        
        {/* Left: Login Form */}
        <div className="w-1/2 p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-gray-800 tracking-tight">Login</h2>
            <p className="text-sm text-gray-500 mt-1">Welcome to Feed Management System</p>
          </div>

          {/* Email */}
          <div className="mb-5">
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <div className="flex items-center border border-gray-300 px-3 py-2">
              <Mail className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full text-sm bg-transparent focus:outline-none focus:ring-0"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-5">
            <label className="block text-sm text-gray-600 mb-1">Password</label>
            <div className="flex items-center border border-gray-300 px-3 py-2 relative">
              <Lock className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full text-sm bg-transparent focus:outline-none focus:ring-0 pr-8"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="flex justify-between items-center text-sm mb-6">
            <label className="flex items-center text-gray-600">
              <input type="checkbox" className="mr-2" />
              Remember Me
            </label>
            <a href="#" className="text-blue-600 hover:underline">Forgot Password?</a>
          </div>

          {/* Error */}
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-full bg-[#3742fa] text-white py-2 text-sm tracking-wide hover:bg-[#2f36c0] transition"
          >
            Login
          </button>
        </div>

        <div className="w-1/2 h-full relative overflow-hidden">
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Slide ${index}`}
              className={`
                absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out
                ${index === currentImage ? 'opacity-100 z-10' : 'opacity-0 z-0'}
              `}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;

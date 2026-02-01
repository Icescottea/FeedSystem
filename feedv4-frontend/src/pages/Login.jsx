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
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
    
      const data = await res.json();
    
      if (!res.ok || !data.success) {
        throw new Error('Invalid credentials');
      }
    
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
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
    <div className=" relative min-h-screen bg-[#f5f6fa] flex items-center justify-between px-8">
      {/* Left Logo Area */}
      <div className="flex-1 flex flex-col items-center justify-center z-10">
        <img src={logoImage} alt="Logo" className="w-44 h-auto mb-4" />
        <div className="flex items-center space-x-2">
          <span className="text-lg font-custom3 text-gray-600 font-medium mt-[5px]">Made by</span>
          <img src={letsImage} alt="Let's" className="h-auto w-20" />
        </div>
      </div>

      {/* Right-Aligned Container */}
      <div className="w-full max-w-4xl h-[520px] rounded-xl shadow-2xl flex overflow-hidden mr-4 bg-white z-10">
        {/* Left: Login Form */}
        <div className="w-1/2 p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-5xl font-custom3 text-gray-800 tracking-tight">Login</h2>
            <p className="text-lg font-custom2 text-gray-500 mt-[10px]">Welcome to Feed Management System</p>
          </div>

          {/* Email */}
          <div className="mb-5">
            <label className="block text-sm text-gray-600 mb-1 font-semibold">Email</label>
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
            <label className="block text-sm text-gray-600 mb-1 font-semibold">Password</label>
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
            <span className="text-blue-600 hover:underline">Forgot Password?</span>
          </div>

          {/* Error */}
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

          {/* Animated Login Button (inline) */}
          <div className="flex justify-center mt-4">
            <div className="animated-button-wrapper">
              <button className="animated-button" onClick={handleLogin}>
                <svg viewBox="0 0 24 24" className="arr-2" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                </svg>
                <span className="text">Login</span>
                <span className="circle" />
                <svg viewBox="0 0 24 24" className="arr-1" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Image Slideshow */}
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

      {/* Button CSS (inline) */}
      <style>{`
        .animated-button-wrapper {
          display: flex;
          justify-content: center;
        }

        .animated-button {
          position: relative;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 12px 36px;
          border: 4px solid transparent;
          font-size: 16px;
          background-color: inherit;
          border-radius: 100px;
          font-weight: 600;
          color: #1E90FF;
          box-shadow: 0 0 0 2px #1E90FF;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .animated-button svg {
          position: absolute;
          width: 24px;
          fill: #1E90FF;
          z-index: 9;
          transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .animated-button .arr-1 {
          right: 16px;
        }

        .animated-button .arr-2 {
          left: -25%;
        }

        .animated-button .circle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          background-color: #1E90FF;
          border-radius: 50%;
          opacity: 0;
          transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .animated-button .text {
          position: relative;
          z-index: 1;
          transform: translateX(-12px);
          transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .animated-button:hover {
          box-shadow: 0 0 0 12px transparent;
          color: #ffffff;
          border-radius: 12px;
        }

        .animated-button:hover .arr-1 {
          right: -25%;
        }

        .animated-button:hover .arr-2 {
          left: 16px;
        }

        .animated-button:hover .text {
          transform: translateX(12px);
        }

        .animated-button:hover svg {
          fill: #ffffff;
        }

        .animated-button:active {
          scale: 0.95;
          box-shadow: 0 0 0 4px #1E90FF;
        }

        .animated-button:hover .circle {
          width: 220px;
          height: 220px;
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default Login;

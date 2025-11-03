import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LoginWidget = ({ widget, apiBaseUrl = 'http://localhost/mtpsaas/public' }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const accentColor = widget?.accent_color || '#8B5CF6';
  const widgetId = widget?.id || '';
  const redirectUrl = 'https://seemii.vercel.app/';

  // Auto-resize iframe
  const resizeIframe = () => {
    const height = document.body.scrollHeight + 50;
    window.parent.postMessage(JSON.stringify({
      widgetId: widgetId,
      height: height
    }), '*');
  };

  useEffect(() => {
    resizeIframe();
  }, [error, success]);

  // Detect browser
  const detectBrowser = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf("Firefox") > -1) return "firefox";
    if (userAgent.indexOf("Chrome") > -1) return "chrome";
    if (userAgent.indexOf("Safari") > -1) return "safari";
    if (userAgent.indexOf("Edge") > -1) return "edge";
    if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) return "ie";
    return "unknown";
  };

  // Detect operating system
  const detectOS = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf("Win") > -1) return "windows";
    if (userAgent.indexOf("Mac") > -1) return "macos";
    if (userAgent.indexOf("Linux") > -1) return "linux";
    if (userAgent.indexOf("Android") > -1) return "android";
    if (userAgent.indexOf("iOS") > -1) return "ios";
    return "unknown";
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Create FormData (form-data format as required by API)
      const formPayload = new FormData();
      formPayload.append('user_name', formData.username);
      formPayload.append('password', formData.password);
      formPayload.append('browser', detectBrowser());
      formPayload.append('operatingSystem', detectOS());
      formPayload.append('ipaddress', '');
      formPayload.append('location', '');

      const response = await axios.post(`${apiBaseUrl}/public/api/v1/login`, formPayload);

      console.log('API Response:', response.data);

      // Check if response is array (as per API response format)
      const responseData = Array.isArray(response.data) ? response.data[0] : response.data;

      // Check for token in response
      if (responseData && responseData.token) {
        // Success
        setSuccess('Login successful! Wait...');
        
        const accessToken = responseData.token;
        const userData = responseData.user;

        // Store token in localStorage
        try {
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('user_data', JSON.stringify(userData));
        } catch (e) {
          console.log('Could not store in localStorage:', e);
        }

        // Redirect to the website in parent window after 1.5 seconds
        setTimeout(() => {
          const fullRedirectUrl = redirectUrl + '?token=' + encodeURIComponent(accessToken);
          console.log('Redirecting to:', fullRedirectUrl);

          // Try to redirect parent window, fallback to current window
          if (window.top !== window.self) {
            window.top.location.href = fullRedirectUrl;
          } else {
            window.location.href = fullRedirectUrl;
          }
        }, 1500);

      } else {
        // Error response from API
        let errorMsg = 'Login failed. Please check your credentials.';

        if (response.data.messages) {
          if (typeof response.data.messages === 'object') {
            errorMsg = Object.values(response.data.messages).join(', ');
          } else {
            errorMsg = response.data.messages;
          }
        } else if (response.data.message) {
          errorMsg = response.data.message;
        }

        setError(errorMsg);
        setLoading(false);
      }

    } catch (err) {
      console.error('Login error:', err);
      
      let errorMsg = 'An error occurred. Please try again.';
      
      if (err.response?.data?.messages) {
        if (typeof err.response.data.messages === 'object') {
          errorMsg = Object.values(err.response.data.messages).join(', ');
        } else {
          errorMsg = err.response.data.messages;
        }
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }

      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div 
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: accentColor }}
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {widget?.title || 'Welcome Back'}
          </h2>
          <p className="text-gray-600">Sign in to continue</p>
        </div>


        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Username Field */}
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Email / Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none transition-all"
              style={{ 
                focusRingColor: accentColor,
                borderColor: error ? '#EF4444' : '#D1D5DB'
              }}
              placeholder="Enter your email or username"
            />
          </div>

          {/* Password Field with Toggle */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none transition-all"
                style={{ 
                  focusRingColor: accentColor,
                  borderColor: error ? '#EF4444' : '#D1D5DB'
                }}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  {showPassword ? (
                    // Eye with slash (hidden)
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" strokeWidth={2} />
                    </>
                  ) : (
                    // Eye (visible)
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" strokeWidth={2} />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  accentColor: accentColor 
                }}
              />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>
            <a 
              href={`${apiBaseUrl}/student/forgot-password`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:underline"
              style={{ color: accentColor }}
            >
              Forgot Password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: '#5B7B9D',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a 
                href="#" 
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:underline"
                style={{ color: accentColor }}
              >
                Sign Up
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginWidget;

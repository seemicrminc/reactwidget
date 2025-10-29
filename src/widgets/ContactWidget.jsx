import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ContactWidget = ({ widget, apiBaseUrl = 'http://localhost/mtpsaas/public' }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const accentColor = widget?.accent_color || '#8B5CF6';
  const widgetId = widget?.id || '';
  const appDetailId = widget?.app_detail_id || '';

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
  }, [success]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        widget_id: widgetId,
        app_detail_id: appDetailId
      };

      const response = await axios.post(
        `${apiBaseUrl}/public/widgets/submit`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        setSuccess(true);
        resizeIframe();
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      const errorMsg = error.response?.data?.message || 'An error occurred. Please try again.';
      alert(errorMsg);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg text-center">
          <div 
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: accentColor }}
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank you!</h2>
          <p className="text-gray-600">
            We have received your message and will get back to you soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-lg mx-auto bg-white py-8 px-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Us</h2>

        <form onSubmit={handleSubmit}>
          {/* First Name */}
          <div className="mb-5">
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
              style={{ 
                borderColor: '#ddd',
                '--tw-ring-color': accentColor
              }}
            />
          </div>

          {/* Last Name */}
          <div className="mb-5">
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
              style={{ 
                borderColor: '#ddd',
                '--tw-ring-color': accentColor
              }}
            />
          </div>

          {/* Email */}
          <div className="mb-5">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
              style={{ 
                borderColor: '#ddd',
                '--tw-ring-color': accentColor
              }}
            />
          </div>

          {/* Phone */}
          <div className="mb-5">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
              style={{ 
                borderColor: '#ddd',
                '--tw-ring-color': accentColor
              }}
            />
          </div>

          {/* Message */}
          <div className="mb-5">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all resize-y"
              style={{ 
                borderColor: '#ddd',
                '--tw-ring-color': accentColor
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-lg text-white font-semibold transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            style={{ backgroundColor: accentColor }}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactWidget;

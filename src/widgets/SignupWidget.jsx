import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SignupWidget = ({ widget, customFields, baseUrl }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedStudentType, setSelectedStudentType] = useState(
    widget.student_type === 'child_only' ? 'child' : 'adult'
  );
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    parent_first_name: '',
    parent_last_name: '',
    parent_email: '',
    parent_phone: '',
    custom_fields: {},
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const totalSteps = selectedStudentType === 'child' && widget.student_type !== 'adult_only' ? 2 : 1;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('custom_fields')) {
      const fieldId = name.match(/\[(\d+)\]/)[1];
      setFormData({
        ...formData,
        custom_fields: {
          ...formData.custom_fields,
          [fieldId]: type === 'checkbox' 
            ? [...(formData.custom_fields[fieldId] || []), value]
            : value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateCurrentStep = () => {
    const newErrors = {};
    
    if (currentStep === 1) {
      if (!formData.first_name) newErrors.first_name = 'First name is required';
      if (!formData.last_name) newErrors.last_name = 'Last name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.phone) newErrors.phone = 'Phone is required';
      
      // Validate required custom fields for step 1
      customFields
        .filter(f => f.collection_type === 'once_per_form' && f.is_required)
        .forEach(field => {
          if (!formData.custom_fields[field.id]) {
            newErrors[`custom_${field.id}`] = `${field.field_name} is required`;
          }
        });
    } else if (currentStep === 2 && selectedStudentType === 'child') {
      if (!formData.parent_first_name) newErrors.parent_first_name = 'Parent first name is required';
      if (!formData.parent_last_name) newErrors.parent_last_name = 'Parent last name is required';
      if (!formData.parent_email) newErrors.parent_email = 'Parent email is required';
      if (!formData.parent_phone) newErrors.parent_phone = 'Parent phone is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateCurrentStep()) return;
    
    setLoading(true);
    setErrors({});

    const submitData = {
      ...formData,
      widget_id: widget.id,
      app_detail_id: widget.app_detail_id,
      student_type: selectedStudentType,
    };

    // Don't send parent info if adult student
    if (selectedStudentType === 'adult') {
      delete submitData.parent_first_name;
      delete submitData.parent_last_name;
      delete submitData.parent_email;
      delete submitData.parent_phone;
    }

    try {
      const response = await axios.post(`${baseUrl}/public/widgets/submit`, submitData);
      
      if (response.data.success) {
        setSuccess(true);
        window.parent.postMessage({ type: 'widget_resize' }, '*');
      }
    } catch (error) {
      if (error.response?.data?.messages) {
        setErrors(error.response.data.messages);
      } else {
        alert(error.response?.data?.message || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderCustomField = (field) => {
    const fieldName = `custom_fields[${field.id}]`;
    
    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <input
            type={field.field_type}
            name={fieldName}
            placeholder={field.hint_text || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none"
            style={{ borderColor: errors[`custom_${field.id}`] ? '#dc3545' : '#ddd' }}
            required={field.is_required}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            name={fieldName}
            placeholder={field.hint_text || ''}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none"
            style={{ borderColor: errors[`custom_${field.id}`] ? '#dc3545' : '#ddd' }}
            required={field.is_required}
          />
        );
      
      case 'dropdown':
        return (
          <select
            name={fieldName}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none"
            required={field.is_required}
          >
            <option value="">Select...</option>
            {field.field_options?.map((option, idx) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'radio':
        return (
          <div className="flex gap-5">
            {field.field_options?.map((option, idx) => (
              <label key={idx} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={fieldName}
                  value={option}
                  onChange={handleChange}
                  className="mr-2"
                  required={field.is_required}
                />
                {option}
              </label>
            ))}
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="flex gap-5">
            {field.field_options?.map((option, idx) => (
              <label key={idx} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name={`${fieldName}[]`}
                  value={option}
                  onChange={handleChange}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-green-800 mb-2">Thank you for signing up!</h2>
          <p className="text-green-700">{widget.success_message || 'We will contact you as soon as possible.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Student Info</h2>
      <div className="text-center mb-6 text-gray-600 text-sm">
        Step {currentStep} of {totalSteps}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Student Info */}
        {currentStep === 1 && (
          <div>
            {widget.student_type === 'show_both' && (
              <div className="flex bg-gray-100 rounded-full p-1 mb-6">
                <button
                  type="button"
                  onClick={() => setSelectedStudentType('adult')}
                  className={`flex-1 py-2 px-6 rounded-full font-medium transition ${
                    selectedStudentType === 'adult'
                      ? 'bg-white text-gray-900 shadow'
                      : 'text-gray-600'
                  }`}
                  style={{
                    backgroundColor: selectedStudentType === 'adult' ? widget.accent_color : 'transparent',
                    color: selectedStudentType === 'adult' ? 'white' : '#666',
                  }}
                >
                  Adult
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStudentType('child')}
                  className={`flex-1 py-2 px-6 rounded-full font-medium transition ${
                    selectedStudentType === 'child'
                      ? 'bg-white text-gray-900 shadow'
                      : 'text-gray-600'
                  }`}
                  style={{
                    backgroundColor: selectedStudentType === 'child' ? widget.accent_color : 'transparent',
                    color: selectedStudentType === 'child' ? 'white' : '#666',
                  }}
                >
                  Child
                </button>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none"
                  style={{ borderColor: errors.first_name ? '#dc3545' : '#ddd' }}
                  required
                />
                {errors.first_name && <p className="text-red-600 text-xs mt-1">{errors.first_name}</p>}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none"
                  style={{ borderColor: errors.last_name ? '#dc3545' : '#ddd' }}
                  required
                />
                {errors.last_name && <p className="text-red-600 text-xs mt-1">{errors.last_name}</p>}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none"
                  style={{ borderColor: errors.email ? '#dc3545' : '#ddd' }}
                  required
                />
                {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none"
                  style={{ borderColor: errors.phone ? '#dc3545' : '#ddd' }}
                  required
                />
                {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* Custom Fields for Step 1 */}
              {customFields
                .filter(f => f.collection_type === 'once_per_form')
                .map(field => (
                  <div key={field.id}>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      {field.field_name}{field.is_required ? ' *' : ''}
                    </label>
                    {renderCustomField(field)}
                    {errors[`custom_${field.id}`] && (
                      <p className="text-red-600 text-xs mt-1">{errors[`custom_${field.id}`]}</p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Step 2: Parent Info */}
        {currentStep === 2 && selectedStudentType === 'child' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Parent Info</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Parent First Name *</label>
                <input
                  type="text"
                  name="parent_first_name"
                  value={formData.parent_first_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none"
                  style={{ borderColor: errors.parent_first_name ? '#dc3545' : '#ddd' }}
                  required
                />
                {errors.parent_first_name && <p className="text-red-600 text-xs mt-1">{errors.parent_first_name}</p>}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Parent Last Name *</label>
                <input
                  type="text"
                  name="parent_last_name"
                  value={formData.parent_last_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none"
                  style={{ borderColor: errors.parent_last_name ? '#dc3545' : '#ddd' }}
                  required
                />
                {errors.parent_last_name && <p className="text-red-600 text-xs mt-1">{errors.parent_last_name}</p>}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  name="parent_email"
                  value={formData.parent_email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none"
                  style={{ borderColor: errors.parent_email ? '#dc3545' : '#ddd' }}
                  required
                />
                {errors.parent_email && <p className="text-red-600 text-xs mt-1">{errors.parent_email}</p>}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Phone *</label>
                <input
                  type="tel"
                  name="parent_phone"
                  value={formData.parent_phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none"
                  style={{ borderColor: errors.parent_phone ? '#dc3545' : '#ddd' }}
                  required
                />
                {errors.parent_phone && <p className="text-red-600 text-xs mt-1">{errors.parent_phone}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-8">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrevious}
              className="flex-1 py-3 px-6 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Previous
            </button>
          )}
          
          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 py-3 px-6 text-white rounded-lg font-semibold hover:opacity-90 transition"
              style={{ backgroundColor: widget.accent_color }}
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-6 text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
              style={{ backgroundColor: widget.accent_color }}
            >
              {loading ? 'Submitting...' : 'Sign Up'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default SignupWidget;

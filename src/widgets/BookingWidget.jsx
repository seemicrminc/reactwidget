import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BookingWidget = ({ widget, availableSlots = {}, apiBaseUrl = 'http://localhost/mtpsaas/public' }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedStudentType, setSelectedStudentType] = useState(
    widget?.student_type === 'child_only' ? 'child' : 'adult'
  );
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    parent_first_name: '',
    parent_last_name: '',
    parent_email: '',
    parent_phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const accentColor = widget?.accent_color || '#8B5CF6';
  const widgetId = widget?.id || '';
  const appDetailId = widget?.app_detail_id || '';
  const showBothTypes = widget?.student_type === 'show_both';

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
  }, [currentStep, selectedDate, selectedStudentType, success]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStudentTypeChange = (type) => {
    setSelectedStudentType(type);
  };

  const changeMonth = (delta) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + delta);
    setCurrentMonth(newMonth);
  };

  const selectDate = (dateStr) => {
    setSelectedDate(dateStr);
  };

  const selectSlot = (slot) => {
    setSelectedSlot(slot);
    setTimeout(() => {
      setCurrentStep(2);
    }, 300);
  };

  const renderCalendar = () => {
    const calendar = [];
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDay = firstDay.getDay();

    // Calendar header
    calendar.push(
      <div key="header" className="col-span-7 flex justify-between items-center mb-4">
        <button 
          onClick={() => changeMonth(-1)} 
          className="p-2 text-xl hover:bg-gray-100 rounded"
        >
          ‹
        </button>
        <span className="font-semibold text-gray-800">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <button 
          onClick={() => changeMonth(1)} 
          className="p-2 text-xl hover:bg-gray-100 rounded"
        >
          ›
        </button>
      </div>
    );

    // Day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach((day, index) => {
      calendar.push(
        <div key={`header-${index}`} className="text-center font-semibold text-gray-600 text-xs py-2">
          {day}
        </div>
      );
    });

    // Empty cells before first day
    for (let i = 0; i < startDay; i++) {
      calendar.push(<div key={`empty-${i}`}></div>);
    }

    // Days of month
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const cellDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isPast = cellDate < today;
      const hasSlots = availableSlots[dateStr] && availableSlots[dateStr].length > 0;
      const isSelected = selectedDate === dateStr;

      calendar.push(
        <div
          key={`day-${day}`}
          onClick={() => !isPast && hasSlots && selectDate(dateStr)}
          className={`
            aspect-square flex items-center justify-center rounded-full text-sm cursor-pointer transition-all
            ${isPast || !hasSlots ? 'text-gray-300 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200'}
            ${isSelected ? 'text-white' : ''}
            ${hasSlots && !isPast ? 'relative' : ''}
          `}
          style={isSelected ? { backgroundColor: accentColor } : {}}
        >
          {day}
          {hasSlots && !isPast && !isSelected && (
            <span 
              className="absolute bottom-1 w-1 h-1 rounded-full" 
              style={{ backgroundColor: accentColor }}
            ></span>
          )}
        </div>
      );
    }

    return calendar;
  };

  const renderTimeSlots = () => {
    if (!selectedDate || !availableSlots[selectedDate]) return null;

    return availableSlots[selectedDate].map((slot, index) => (
      <div
        key={index}
        onClick={() => selectSlot(slot)}
        className={`
          p-3 mb-2.5 border rounded-lg cursor-pointer transition-all hover:border-opacity-100
          ${selectedSlot?.id === slot.id ? 'border-opacity-100' : 'border-gray-200'}
        `}
        style={{
          borderColor: selectedSlot?.id === slot.id ? accentColor : '#e5e7eb',
          backgroundColor: selectedSlot?.id === slot.id ? `${accentColor}15` : 'transparent'
        }}
      >
        <div className="flex justify-between items-center">
          <div>
            <div className="font-semibold text-gray-800">{slot.stime}</div>
            <div className="text-gray-600 text-sm">{slot.employee_name || 'Tutor'}</div>
          </div>
          <div className="font-semibold" style={{ color: accentColor }}>
            Book
          </div>
        </div>
      </div>
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        widget_id: widgetId,
        app_detail_id: appDetailId,
        schedule_id: selectedSlot.id,
        student_type: selectedStudentType
      };

      // Remove parent info if adult student
      if (selectedStudentType === 'adult') {
        delete payload.parent_first_name;
        delete payload.parent_last_name;
        delete payload.parent_email;
        delete payload.parent_phone;
      }

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
      console.error('Booking submission error:', error);
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600">
            {widget?.success_message || 'Your booking has been confirmed. We will contact you shortly.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-5">
          {widget?.widget_title || 'Book a Session'}
        </h2>
        <div className="text-center mb-5 text-gray-600 text-sm">
          {currentStep === 1 ? 'Select Date & Time' : 'Student Information'}
        </div>

        {/* Step 1: Select Date & Time */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl p-5 mb-5">
            {/* Calendar */}
            <div className="grid grid-cols-7 gap-1 mb-5">
              {renderCalendar()}
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div>
                <h3 className="mb-4 font-semibold text-gray-800">Available Times</h3>
                <div className="max-h-[300px] overflow-y-auto border border-gray-200 rounded-lg p-2.5">
                  {renderTimeSlots()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Student Info */}
        {currentStep === 2 && (
          <div className="bg-white rounded-xl p-5">
            <form onSubmit={handleSubmit}>
              <h3 className="mb-5 font-semibold text-gray-800">Student Info</h3>

              {/* Student Type Toggle */}
              {showBothTypes && (
                <div className="flex bg-gray-100 rounded-full p-1 mb-5">
                  <button
                    type="button"
                    onClick={() => handleStudentTypeChange('adult')}
                    className={`
                      flex-1 py-2.5 px-5 rounded-full text-sm font-medium transition-all
                      ${selectedStudentType === 'adult' ? 'text-white' : 'text-gray-600'}
                    `}
                    style={{
                      backgroundColor: selectedStudentType === 'adult' ? accentColor : 'transparent'
                    }}
                  >
                    Adult
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStudentTypeChange('child')}
                    className={`
                      flex-1 py-2.5 px-5 rounded-full text-sm font-medium transition-all
                      ${selectedStudentType === 'child' ? 'text-white' : 'text-gray-600'}
                    `}
                    style={{
                      backgroundColor: selectedStudentType === 'child' ? accentColor : 'transparent'
                    }}
                  >
                    Child
                  </button>
                </div>
              )}

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
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
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
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                />
              </div>

              {/* Parent Info (for child students) */}
              {selectedStudentType === 'child' && (
                <div>
                  <h3 className="my-5 font-semibold text-gray-800">Parent Info</h3>

                  <div className="mb-5">
                    <label htmlFor="parent_first_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Parent First Name *
                    </label>
                    <input
                      type="text"
                      id="parent_first_name"
                      name="parent_first_name"
                      value={formData.parent_first_name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    />
                  </div>

                  <div className="mb-5">
                    <label htmlFor="parent_last_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Parent Last Name *
                    </label>
                    <input
                      type="text"
                      id="parent_last_name"
                      name="parent_last_name"
                      value={formData.parent_last_name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    />
                  </div>

                  <div className="mb-5">
                    <label htmlFor="parent_email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="parent_email"
                      name="parent_email"
                      value={formData.parent_email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    />
                  </div>

                  <div className="mb-5">
                    <label htmlFor="parent_phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      id="parent_phone"
                      name="parent_phone"
                      value={formData.parent_phone}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-lg text-white font-semibold transition-all mt-5 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: accentColor }}
              >
                {loading ? 'Booking...' : 'Book & Sign Up'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingWidget;

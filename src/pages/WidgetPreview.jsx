import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WidgetRenderer } from '../widgets';

const WidgetPreview = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('signup');

  // Mock widget data for preview
  const mockWidget = {
    id: 1,
    widget_title: 'Test Widget',
    accent_color: '#8B5CF6',
    app_detail_id: 1,
    student_type: 'show_both',
    success_message: 'Thank you! We will contact you shortly.',
    custom_fields: [
      {
        label: 'Phone Number',
        type: 'phone',
        required: true,
        hint: 'Enter your phone number',
        collection_type: 'once_per_form'
      },
      {
        label: 'Grade Level',
        type: 'dropdown',
        required: true,
        options: ['Grade 1\nGrade 2\nGrade 3\nGrade 4\nGrade 5'],
        collection_type: 'once_per_student'
      }
    ]
  };

  // Mock available slots for booking widget
  const mockSlots = {
    '2024-01-15': [
      { id: 1, stime: '10:00 AM - 11:00 AM', employee_name: 'John Doe' },
      { id: 2, stime: '2:00 PM - 3:00 PM', employee_name: 'Jane Smith' }
    ],
    '2024-01-16': [
      { id: 3, stime: '9:00 AM - 10:00 AM', employee_name: 'John Doe' },
      { id: 4, stime: '1:00 PM - 2:00 PM', employee_name: 'Jane Smith' }
    ]
  };

  const widgetTypes = [
    { value: 'signup', label: 'Sign Up Widget' },
    { value: 'login', label: 'Login Widget' },
    { value: 'contact', label: 'Contact Widget' },
    { value: 'book_availability', label: 'Book from Availability' },
    { value: 'book_calendar', label: 'Book from Calendar' }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Widget Preview</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Widget Type Selector */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Widget Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {widgetTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Widget Preview Container */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b">
            <h2 className="text-lg font-semibold text-gray-700">Widget Preview</h2>
          </div>
          <div className="p-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
              <WidgetRenderer
                widgetType={selectedType}
                widget={mockWidget}
                availableSlots={mockSlots}
                apiBaseUrl="http://localhost/mtpsaas/public"
              />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Preview Instructions</h3>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>This is a preview of how the widget will appear when embedded</li>
            <li>Select different widget types from the dropdown above</li>
            <li>Form submissions in preview mode will use mock data</li>
            <li>Actual widgets will be embedded using the generated iframe code</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WidgetPreview;

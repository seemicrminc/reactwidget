import React from 'react';
import { widgetAPI } from '../services/api';

const WidgetList = ({ widgets, onUpdate, onEdit, loading }) => {
  const handleDelete = async (widgetId) => {
    if (window.confirm('Are you sure you want to delete this widget?')) {
      try {
        await widgetAPI.deleteWidget(widgetId);
        onUpdate();
      } catch (error) {
        alert('Failed to delete widget');
      }
    }
  };

  const copyEmbedCode = (code) => {
    navigator.clipboard.writeText(code);
    alert('Embed code copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (widgets.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No widgets</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new widget.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {widgets.map((widget) => (
        <div key={widget.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">{widget.widget_title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    widget.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {widget.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {widget.widget_type}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mt-2">
                  Created: {new Date(widget.created_at).toLocaleDateString()}
                </p>

                {widget.custom_fields && widget.custom_fields.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700">Custom Fields:</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {widget.custom_fields.map((field, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {field.field_name} ({field.field_type})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onEdit && onEdit(widget.id)}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium"
                  title="Edit Widget"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => copyEmbedCode(widget.embed_code)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  title="Copy Embed Code"
                >
                  📋 Copy Code
                </button>
                <button
                  onClick={() => handleDelete(widget.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                  title="Delete Widget"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>

            <div className="mt-4 bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-700 mb-2">Embed Code:</p>
              <code className="block bg-gray-800 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                {widget.embed_code}
              </code>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WidgetList;

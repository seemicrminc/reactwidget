import React from 'react';

const CustomFieldBuilder = ({ customFields, setCustomFields }) => {
  const addField = () => {
    setCustomFields([
      ...customFields,
      {
        field_name: '',
        field_type: 'text',
        hint_text: '',
        is_required: false,
        collection_type: 'once_per_form',
        field_options: [],
      },
    ]);
  };

  const removeField = (index) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const updateField = (index, field, value) => {
    const updated = [...customFields];
    updated[index] = { ...updated[index], [field]: value };
    setCustomFields(updated);
  };

  const updateOptions = (index, options) => {
    const updated = [...customFields];
    updated[index].field_options = options.split('\n').filter(opt => opt.trim());
    setCustomFields(updated);
  };

  return (
    <div className="border-t pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Custom Fields</h3>
        <button
          type="button"
          onClick={addField}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
        >
          + Add Field
        </button>
      </div>

      <div className="space-y-4">
        {customFields.map((field, index) => (
          <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-700">Custom Field #{index + 1}</h4>
              <button
                type="button"
                onClick={() => removeField(index)}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Field Name *</label>
                <input
                  type="text"
                  value={field.field_name}
                  onChange={(e) => updateField(index, 'field_name', e.target.value)}
                  placeholder="e.g., Age"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Field Type *</label>
                <select
                  value={field.field_type}
                  onChange={(e) => updateField(index, 'field_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="textarea">Textarea</option>
                  <option value="dropdown">Dropdown</option>
                  <option value="radio">Radio</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="date">Date</option>
                  <option value="number">Number</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hint Text</label>
                <input
                  type="text"
                  value={field.hint_text}
                  onChange={(e) => updateField(index, 'hint_text', e.target.value)}
                  placeholder="Helper text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Collection Type</label>
                <select
                  value={field.collection_type}
                  onChange={(e) => updateField(index, 'collection_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="once_per_form">Once Per Form</option>
                  <option value="once_per_student">Once Per Student</option>
                </select>
              </div>
            </div>

            <div className="mt-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={field.is_required}
                  onChange={(e) => updateField(index, 'is_required', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Required Field</span>
              </label>
            </div>

            {['dropdown', 'radio', 'checkbox'].includes(field.field_type) && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Options (one per line)
                </label>
                <textarea
                  value={field.field_options?.join('\n') || ''}
                  onChange={(e) => updateOptions(index, e.target.value)}
                  rows="3"
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        ))}

        {customFields.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No custom fields added yet. Click "Add Field" to create one.
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomFieldBuilder;

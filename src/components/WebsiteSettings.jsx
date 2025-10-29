import React from 'react';

const WebsiteSettings = ({ websiteUrl, setWebsiteUrl }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Website Details</h3>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What's your website URL?
        </label>
        <input
          type="url"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="www.example.com"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-sm text-gray-500 mt-1">Optional</p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          className="text-red-600 font-medium text-sm hover:text-red-700"
        >
          Build a Website with TutorBird
        </button>
      </div>
    </div>
  );
};

export default WebsiteSettings;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { widgetAPI, authAPI } from '../services/api';
import WidgetBuilder from '../components/WidgetBuilder';
import WidgetList from '../components/WidgetList';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('builder');
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editWidgetId, setEditWidgetId] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/');
      return;
    }
    setUser(JSON.parse(userData));
    loadWidgets();
  }, [navigate]);

  const loadWidgets = async () => {
    try {
      const response = await widgetAPI.listWidgets();
      setWidgets(response.data);
    } catch (error) {
      console.error('Failed to load widgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditWidget = (widgetId) => {
    setEditWidgetId(widgetId);
    setActiveTab('builder');
  };

  const handleWidgetCreated = () => {
    loadWidgets();
    setEditWidgetId(null);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Reset editWidgetId when switching to builder tab without edit
    if (tab === 'builder') {
      setEditWidgetId(null);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Widget Builder</h1>
              <p className="text-sm text-gray-600 mt-1">Create and manage dynamic forms</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Welcome, <span className="font-semibold">{user?.first_name || 'User'}</span>
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            <button
              onClick={() => handleTabChange('builder')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                activeTab === 'builder'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Widget Builder
            </button>
            <button
              onClick={() => handleTabChange('widgets')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                activeTab === 'widgets'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Widgets
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'builder' && <WidgetBuilder onWidgetCreated={handleWidgetCreated} editWidgetId={editWidgetId} />}
        {activeTab === 'widgets' && <WidgetList widgets={widgets} onUpdate={loadWidgets} onEdit={handleEditWidget} loading={loading} />}
      </main>
    </div>
  );
};

export default Dashboard;

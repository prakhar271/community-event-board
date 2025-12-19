import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  totalRegistrations: number;
  totalRevenue: number;
  pendingReports: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface ModerationItem {
  id: string;
  type: 'event' | 'user' | 'review';
  title: string;
  description: string;
  reportedBy: string;
  reportedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  severity: 'low' | 'medium' | 'high';
}

export const AdminPanel: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'moderation' | 'users' | 'events' | 'analytics'>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [moderationItems, setModerationItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      return;
    }
    
    loadAdminData();
  }, [user]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls - in real app, these would be actual API calls
      const mockStats: AdminStats = {
        totalUsers: 1247,
        totalEvents: 89,
        totalRegistrations: 3456,
        totalRevenue: 125000,
        pendingReports: 7,
        systemHealth: 'healthy'
      };

      const mockModerationItems: ModerationItem[] = [
        {
          id: '1',
          type: 'event',
          title: 'Inappropriate Event Content',
          description: 'Event contains offensive language in description',
          reportedBy: 'user@example.com',
          reportedAt: '2024-12-19T10:30:00Z',
          status: 'pending',
          severity: 'medium'
        },
        {
          id: '2',
          type: 'user',
          title: 'Spam Account',
          description: 'User creating multiple fake events',
          reportedBy: 'moderator@example.com',
          reportedAt: '2024-12-19T09:15:00Z',
          status: 'pending',
          severity: 'high'
        },
        {
          id: '3',
          type: 'review',
          title: 'Fake Review',
          description: 'Review appears to be fake/bot generated',
          reportedBy: 'organizer@example.com',
          reportedAt: '2024-12-19T08:45:00Z',
          status: 'pending',
          severity: 'low'
        }
      ];

      setStats(mockStats);
      setModerationItems(mockModerationItems);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModerationAction = async (itemId: string, action: 'approve' | 'reject') => {
    try {
      // Simulate API call
      console.log(`${action} moderation item ${itemId}`);
      
      setModerationItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, status: action === 'approve' ? 'approved' : 'rejected' }
            : item
        )
      );
    } catch (error) {
      console.error(`Failed to ${action} item:`, error);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <div className="flex items-center space-x-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                stats?.systemHealth === 'healthy' ? 'bg-green-100 text-green-800' :
                stats?.systemHealth === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                System {stats?.systemHealth}
              </span>
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'moderation', label: 'Moderation', icon: '🛡️', badge: stats?.pendingReports },
              { id: 'users', label: 'Users', icon: '👥' },
              { id: 'events', label: 'Events', icon: '📅' },
              { id: 'analytics', label: 'Analytics', icon: '📈' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: '👥', color: 'blue' },
                { label: 'Total Events', value: stats.totalEvents.toLocaleString(), icon: '📅', color: 'green' },
                { label: 'Registrations', value: stats.totalRegistrations.toLocaleString(), icon: '🎫', color: 'purple' },
                { label: 'Revenue', value: `₹${(stats.totalRevenue / 100).toLocaleString()}`, icon: '💰', color: 'yellow' }
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-md bg-${stat.color}-100`}>
                      <span className="text-2xl">{stat.icon}</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <div className="text-2xl mb-2">🚫</div>
                  <div className="font-medium">Suspend User</div>
                  <div className="text-sm text-gray-600">Temporarily disable user account</div>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <div className="text-2xl mb-2">📧</div>
                  <div className="font-medium">Send Announcement</div>
                  <div className="text-sm text-gray-600">Broadcast message to all users</div>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="font-medium">Generate Report</div>
                  <div className="text-sm text-gray-600">Create detailed analytics report</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Moderation Tab */}
        {activeTab === 'moderation' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Pending Moderation</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {moderationItems.filter(item => item.status === 'pending').map(item => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.type === 'event' ? 'bg-blue-100 text-blue-800' :
                            item.type === 'user' ? 'bg-purple-100 text-purple-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {item.type}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.severity === 'high' ? 'bg-red-100 text-red-800' :
                            item.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.severity} priority
                          </span>
                        </div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">{item.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        <p className="text-xs text-gray-500">
                          Reported by {item.reportedBy} on {new Date(item.reportedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleModerationAction(item.id, 'approve')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleModerationAction(item.id, 'reject')}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {moderationItems.filter(item => item.status === 'pending').length === 0 && (
                  <div className="p-6 text-center text-gray-500">
                    No pending moderation items
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Other tabs would be implemented similarly */}
        {activeTab !== 'dashboard' && activeTab !== 'moderation' && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management
            </h3>
            <p className="text-gray-600">This section is under development.</p>
          </div>
        )}
      </div>
    </div>
  );
};
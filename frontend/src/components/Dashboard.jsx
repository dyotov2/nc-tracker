import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from './StatCard';
import { StatusChart, SeverityChart, TrendChart } from './Charts';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentNCs, setRecentNCs] = useState([]);
  const [effectivenessChecks, setEffectivenessChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, ncsResponse, effectivenessResponse] = await Promise.all([
        fetch('/api/ncs/stats'),
        fetch('/api/ncs'),
        fetch('/api/ncs/effectiveness-checks')
      ]);

      if (!statsResponse.ok || !ncsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const statsData = await statsResponse.json();
      const ncsData = await ncsResponse.json();
      const effectivenessData = effectivenessResponse.ok ? await effectivenessResponse.json() : [];

      setStats(statsData);
      setRecentNCs(ncsData.slice(0, 5));
      setEffectivenessChecks(effectivenessData);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      'Open': 'blue',
      'Under Investigation': 'yellow',
      'Action Required': 'orange',
      'Closed': 'green'
    };
    return colors[status] || 'gray';
  };

  return (
    <div className="px-4 sm:px-0">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

      {/* Effectiveness Check Alert */}
      {effectivenessChecks.length > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                {effectivenessChecks.length} NC{effectivenessChecks.length > 1 ? 's' : ''} Need{effectivenessChecks.length === 1 ? 's' : ''} Effectiveness Review
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p className="mb-2">The following closed NCs need their effectiveness evaluated:</p>
                {effectivenessChecks.slice(0, 3).map(nc => (
                  <Link
                    key={nc.id}
                    to={`/ncs/${nc.id}`}
                    className="block hover:underline mb-1"
                  >
                    • NC #{nc.id}: {nc.title} (Due: {new Date(nc.effectiveness_check_date).toLocaleDateString()})
                  </Link>
                ))}
                {effectivenessChecks.length > 3 && (
                  <Link to="/board" className="block hover:underline text-yellow-800 font-medium mt-2">
                    View all {effectivenessChecks.length} on the Board →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total NCs"
          value={stats?.total || 0}
          icon="📋"
          color="blue"
        />
        <StatCard
          title="Open"
          value={stats?.byStatus?.['Open'] || 0}
          icon="🔵"
          color="blue"
        />
        <StatCard
          title="Under Investigation"
          value={stats?.byStatus?.['Under Investigation'] || 0}
          icon="🔍"
          color="yellow"
        />
        <StatCard
          title="Closed"
          value={stats?.byStatus?.['Closed'] || 0}
          icon="✅"
          color="green"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div style={{ height: '300px' }}>
            {stats?.byStatus && Object.keys(stats.byStatus).length > 0 ? (
              <StatusChart data={stats.byStatus} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No status data available
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div style={{ height: '300px' }}>
            {stats?.bySeverity && Object.keys(stats.bySeverity).length > 0 ? (
              <SeverityChart data={stats.bySeverity} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No severity data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div style={{ height: '300px' }}>
          {stats?.timeline && stats.timeline.length > 0 ? (
            <TrendChart data={stats.timeline} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No trend data available
            </div>
          )}
        </div>
      </div>

      {/* Recent NCs */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Non-Conformances</h3>
        </div>
        {recentNCs.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {recentNCs.map((nc) => (
              <li key={nc.id} className="px-6 py-4 hover:bg-gray-50">
                <Link to={`/ncs/${nc.id}`} className="block">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {nc.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {nc.description}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full
                        ${nc.status === 'Open' ? 'bg-blue-100 text-blue-800' : ''}
                        ${nc.status === 'Under Investigation' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${nc.status === 'Action Required' ? 'bg-orange-100 text-orange-800' : ''}
                        ${nc.status === 'Closed' ? 'bg-green-100 text-green-800' : ''}
                      `}>
                        {nc.status}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full
                        ${nc.severity === 'Low' ? 'bg-gray-100 text-gray-800' : ''}
                        ${nc.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${nc.severity === 'High' ? 'bg-orange-100 text-orange-800' : ''}
                        ${nc.severity === 'Critical' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {nc.severity}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-8 text-center text-gray-500">
            No non-conformances yet. <Link to="/ncs/new" className="text-blue-600 hover:underline">Create one</Link>
          </div>
        )}
        {recentNCs.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
            <Link to="/ncs" className="text-sm text-blue-600 hover:text-blue-800">
              View all NCs →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

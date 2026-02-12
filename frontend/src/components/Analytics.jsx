import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from './StatCard';
import {
  DepartmentChart,
  RootCauseChart,
  SourceChart,
  ClosureDistributionChart
} from './Charts';

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ncs/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-0">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6"></div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white dark:bg-gray-800 shadow rounded-lg p-5">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {[1, 2].map(i => (
            <div key={i} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-0">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-300">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Analytics & Reports
      </h2>

      {/* Section 1: Performance Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Avg Days to Close"
          value={analytics.avgDaysToClose !== null ? analytics.avgDaysToClose : 'N/A'}
          icon="clock"
          color="blue"
        />
        <StatCard
          title="Overdue NCs"
          value={analytics.overdueCount}
          icon="!"
          color={analytics.overdueCount > 0 ? 'red' : 'green'}
        />
        <StatCard
          title="SLA Compliance"
          value={analytics.slaComplianceRate !== null ? `${analytics.slaComplianceRate}%` : 'N/A'}
          icon="check"
          color={analytics.slaComplianceRate === null ? 'gray' : analytics.slaComplianceRate >= 80 ? 'green' : analytics.slaComplianceRate >= 60 ? 'yellow' : 'red'}
        />
        <StatCard
          title="Avg Effectiveness"
          value={analytics.avgEffectiveness !== null ? `${analytics.avgEffectiveness}/5` : 'N/A'}
          icon="star"
          color={analytics.avgEffectiveness === null ? 'gray' : analytics.avgEffectiveness >= 4 ? 'green' : analytics.avgEffectiveness >= 3 ? 'yellow' : 'orange'}
        />
      </div>

      {/* Section 2: Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
          <div style={{ height: '300px' }}>
            {analytics.departmentBreakdown.length > 0 ? (
              <DepartmentChart data={analytics.departmentBreakdown} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                No department data available
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Department Summary
          </h3>
          {analytics.departmentBreakdown.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Department</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Open</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Avg Days</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {analytics.departmentBreakdown.map((dept) => (
                    <tr key={dept.department} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{dept.department}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{dept.total}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{dept.openCount}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {dept.avgDaysToClose !== null ? dept.avgDaysToClose : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No department data available</p>
          )}
        </div>
      </div>

      {/* Section 3: Root Cause Categories */}
      {analytics.rootCauseCategories.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8 transition-colors">
          <div style={{ height: '300px' }}>
            <RootCauseChart data={analytics.rootCauseCategories} />
          </div>
        </div>
      )}

      {/* Section 4 & 5: Source + Closure Distribution side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
          <div style={{ height: '300px' }}>
            {Object.keys(analytics.ncSourceBreakdown).length > 0 ? (
              <SourceChart data={analytics.ncSourceBreakdown} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                No NC source data available
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
          <div style={{ height: '300px' }}>
            {analytics.closureDistribution.some(d => d.count > 0) ? (
              <ClosureDistributionChart data={analytics.closureDistribution} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                No closed NCs to analyze
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 6: Overdue NCs Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden transition-colors">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Overdue NCs ({analytics.overdueNCs.length})
          </h3>
        </div>
        {analytics.overdueNCs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Responsible</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Days Overdue</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {analytics.overdueNCs.map((nc) => (
                  <tr key={nc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/ncs/${nc.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        #{nc.id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      <div className="max-w-xs truncate">{nc.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full
                        ${nc.severity === 'Low' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' : ''}
                        ${nc.severity === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' : ''}
                        ${nc.severity === 'High' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' : ''}
                        ${nc.severity === 'Critical' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' : ''}
                      `}>
                        {nc.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {nc.department || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {nc.responsible_person || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(nc.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                        {nc.days_overdue} days
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
            No overdue NCs. All items are on track.
          </div>
        )}
      </div>
    </div>
  );
}

export default Analytics;

import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import WidgetCard from '../components/Dashboard/WidgetCard';

const DashboardPage = () => {
  const { user } = useOutletContext();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (user?.role) {
      fetch(`/api/dashboard/${user.role}`)
        .then(res => res.json())
        .then(setData)
        .catch(err => console.error('Failed to fetch dashboard data:', err));
    }
  }, [user]);

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-gray-600">
        <p className="text-sm">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-gray-800 space-y-8">
      {/* Page Title */}
      <h2 className="text-2xl font-semibold">📊 Dashboard Overview</h2>

      {/* Alerts */}
      {Array.isArray(data.smartAlerts) && data.smartAlerts.length > 0 && (
        <div className="bg-yellow-100 border border-yellow-300 rounded-md p-4">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">Alerts:</h4>
          <ul className="list-disc pl-5 text-sm space-y-1">
            {data.smartAlerts.map((alert, idx) => (
              <li key={idx}>{alert}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.todaysFormulations !== undefined && (
          <WidgetCard title="Today's Formulations" value={data.todaysFormulations} />
        )}
        {data.pendingPelletingJobs !== undefined && (
          <WidgetCard title="Pending Pelleting Jobs" value={data.pendingPelletingJobs} />
        )}
        {Array.isArray(data.lowStockRMs) && data.lowStockRMs.length > 0 && (
          <WidgetCard title="Low Stock RMs" value={data.lowStockRMs.length} />
        )}
        {data.avgCostPerKgLast30Days !== undefined && (
          <WidgetCard title="Avg Cost / kg (30d)" value={`Rs. ${data.avgCostPerKgLast30Days}`} />
        )}
        {data.topUsedRawMaterial && (
          <WidgetCard title="Top Used RM" value={data.topUsedRawMaterial} />
        )}
        {data.revenueTrendLast30Days && (
          <WidgetCard title="Revenue Trend" value="📈 See Graph (Future)" />
        )}
        {Array.isArray(data.topPayingClients) && data.topPayingClients.length > 0 && (
          <WidgetCard title="Top Clients" value={data.topPayingClients.join(', ')} />
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white border rounded-md shadow p-6">
        <h4 className="text-lg font-medium mb-3">📝 Recent Activity</h4>
        {Array.isArray(data.recentActivityLog) && data.recentActivityLog.length > 0 ? (
          <ul className="list-disc pl-5 text-sm space-y-1">
            {data.recentActivityLog.map((log, idx) => (
              <li key={idx}>{log}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600">No recent activity recorded.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;

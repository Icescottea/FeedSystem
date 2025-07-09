import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import WidgetCard from '../components/Dashboard/WidgetCard';

const DashboardPage = () => {
  const { user } = useOutletContext(); // ✅ Pull user from context
  const [data, setData] = useState(null);

  useEffect(() => {
    if (user?.role) {
      fetch(`/api/dashboard/${user.role}`)
        .then(res => res.json())
        .then(setData)
        .catch(err => console.error('Failed to fetch dashboard data:', err));
    }
  }, [user]);

  if (!data) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h2>📊 Dashboard Overview</h2>

      {data.smartAlerts?.length > 0 && (
        <div style={{ background: '#fff3cd', padding: '10px', borderRadius: '5px' }}>
          <h4>⚠️ Alerts:</h4>
          <ul>{data.smartAlerts.map((a, i) => <li key={i}>{a}</li>)}</ul>
        </div>
      )}

      <div className="dashboard-grid">
        {data.todaysFormulations !== undefined && (
          <WidgetCard title="Today's Formulations" value={data.todaysFormulations} />
        )}
        {data.pendingPelletingJobs !== undefined && (
          <WidgetCard title="Pending Pelleting Jobs" value={data.pendingPelletingJobs} />
        )}
        {data.lowStockRMs?.length > 0 && (
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
        {data.topPayingClients?.length > 0 && (
          <WidgetCard title="Top Clients" value={data.topPayingClients.join(', ')} />
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <h4>📝 Recent Activity</h4>
        {data.recentActivityLog?.length ? (
          <ul>{data.recentActivityLog.map((log, i) => <li key={i}>{log}</li>)}</ul>
        ) : (
          <p>No recent activity recorded.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;

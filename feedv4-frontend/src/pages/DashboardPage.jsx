import React, { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import WidgetCard from '../components/Dashboard/WidgetCard';
import {
  Chart,
  LineController,
  LineElement,
  BarController,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

Chart.register(
  LineController,
  LineElement,
  BarController,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

const DashboardPage = () => {
  const { user } = useOutletContext();
  const [data, setData] = useState(null);

  const revenueChartRef = useRef(null);
  const costChartRef = useRef(null);

  useEffect(() => {
    if (user?.roles) {
      fetch(`/api/dashboard/${user.roles}`)
        .then(res => res.json())
        .then(res => {
          setData(res);
          setTimeout(() => {
            renderCharts(res);
          }, 200);
        })
        .catch(err => console.error('Failed to fetch dashboard data:', err));
    }
  }, [user]);

  const renderCharts = (res) => {
    if (revenueChartRef.current && res?.revenueTrendLast30Days?.length) {
      new Chart(revenueChartRef.current, {
        type: 'line',
        data: {
          labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
          datasets: [{
            label: 'Revenue (Rs)',
            data: res.revenueTrendLast30Days,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 2,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true },
            title: { display: false }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }

    if (costChartRef.current && res?.avgCostPerKgLast30Days) {
      new Chart(costChartRef.current, {
        type: 'bar',
        data: {
          labels: ['Avg Cost'],
          datasets: [{
            label: 'Rs/kg',
            data: [res.avgCostPerKgLast30Days],
            backgroundColor: 'rgb(255, 159, 64)'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: false }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }
  };

  if (!data) {
    return <div className="p-6 text-gray-600">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-10 text-gray-800">
      
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-semibold">📊 Dashboard Overview</h2>
        <button
          onClick={() => {
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}
          className="text-sm text-red-600 border border-red-400 px-3 py-1 rounded hover:bg-red-100"
        >
          Logout
        </button>
      </div>

      {Array.isArray(data.smartAlerts) && data.smartAlerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-md p-4">
          <h4 className="font-medium text-yellow-800 mb-2">⚠️ Smart Alerts</h4>
          <ul className="list-disc pl-6 text-sm space-y-1">
            {data.smartAlerts.map((alert, idx) => <li key={idx}>{alert}</li>)}
          </ul>
        </div>
      )}

      {data.todaysFormulations !== undefined && (
        <>
          <h3 className="text-xl font-semibold">👷 Formulation</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <WidgetCard title="Today's Formulations" value={data.todaysFormulations} />
            <WidgetCard title="Avg Cost/kg (30d)" value={`Rs. ${data.avgCostPerKgLast30Days}`} />
            <WidgetCard title="Top Used RM" value={data.topUsedRawMaterial || 'N/A'} />
          </div>
          <div className="mt-4">
            <canvas ref={costChartRef} height="100"></canvas>
          </div>
        </>
      )}

      {data.pendingPelletingJobs !== undefined && (
        <>
          <h3 className="text-xl font-semibold mt-8">🛠️ Pelleting</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <WidgetCard title="Pending Jobs" value={data.pendingPelletingJobs} />
            <WidgetCard title="Efficiency" value={`${data.pelletingEfficiency}%`} />
            <WidgetCard title="Avg Wastage" value={`${data.avgWastageKg} kg`} />
          </div>
        </>
      )}

      {(Array.isArray(data.lowStockRMs) || Array.isArray(data.expiringRMs)) && (
        <>
          <h3 className="text-xl font-semibold mt-8">📦 Inventory</h3>
          {data.lowStockRMs?.length > 0 && (
            <div className="bg-white rounded shadow p-4">
              <h4 className="font-medium mb-2">Low Stock Raw Materials</h4>
              <ul className="text-sm space-y-1">
                {data.lowStockRMs.map((rm, i) => (
                  <li key={i}>
                    {rm.name} — {rm.inStockKg}kg (Threshold: {rm.threshold}kg)
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.expiringRMs?.length > 0 && (
            <div className="bg-white rounded shadow p-4 mt-4">
              <h4 className="font-medium mb-2">Expiring Soon</h4>
              <ul className="text-sm space-y-1">
                {data.expiringRMs.map((rm, i) => (
                  <li key={i}>
                    {rm.name} — Exp: {rm.expiryDate}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {Array.isArray(data.revenueTrendLast30Days) && (
        <>
          <h3 className="text-xl font-semibold mt-8">💰 Finance</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <WidgetCard title="Receivables" value={`Rs. ${data.receivablesAmount}`} />
            <WidgetCard title="Top Clients" value={data.topPayingClients.join(', ')} />
          </div>
          <div className="mt-4">
            <canvas ref={revenueChartRef} height="100"></canvas>
          </div>
        </>
      )}

      <div className="bg-white rounded shadow p-6 mt-10">
        <h4 className="text-lg font-medium mb-3">📝 Recent Activity</h4>
        {data.recentActivityLog?.length > 0 ? (
          <ul className="list-disc pl-6 text-sm space-y-1">
            {data.recentActivityLog.map((log, idx) => <li key={idx}>{log}</li>)}
          </ul>
        ) : (
          <p className="text-sm text-gray-600">No recent activity recorded.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;

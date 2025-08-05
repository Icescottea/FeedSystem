import React, { useEffect, useState } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const ReportsPage = () => {
  const [report, setReport] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/reports`)
      .then(res => res.json())
      .then(setReport)
      .catch(err => console.error('Failed to fetch report:', err));
  }, []);

  if (!report) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 text-center text-gray-600">
        <p className="text-sm">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-10 text-gray-800">
      <h2 className="text-2xl font-semibold">📊 Financial Reports</h2>

      {/* Revenue by Service */}
      <div className="bg-white border rounded-md shadow p-6">
        <h3 className="text-lg font-medium mb-4">Revenue by Service</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          {Object.entries(report.revenueByService || {}).map(([service, amount]) => (
            <li key={service}>
              {service}: <span className="font-medium">Rs. {amount.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Top Paying Clients */}
      <div className="bg-white border rounded-md shadow p-6">
        <h3 className="text-lg font-medium mb-4">Top Paying Clients</h3>
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          {(report.topPayingClients || []).map(client => (
            <li key={client}>{client}</li>
          ))}
        </ol>
      </div>

      {/* Avg Cost vs Charge */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white border rounded-md shadow p-6">
          <h4 className="text-sm font-medium mb-2">Average Cost / kg</h4>
          <p className="text-xl font-semibold">Rs. {report.avgCostPerKg.toFixed(2)}</p>
        </div>
        <div className="bg-white border rounded-md shadow p-6">
          <h4 className="text-sm font-medium mb-2">Average Charge / kg</h4>
          <p className="text-xl font-semibold">Rs. {report.avgChargePerKg.toFixed(2)}</p>
        </div>
      </div>

      {/* Receivables */}
      <div className="bg-white border rounded-md shadow p-6">
        <h4 className="text-sm font-medium mb-2">Total Outstanding Receivables</h4>
        <p className="text-xl font-semibold">Rs. {report.totalReceivables.toFixed(2)}</p>
      </div>

      {/* Monthly Profitability Snapshot */}
      <div className="bg-white border rounded-md shadow p-6">
        <h3 className="text-lg font-medium mb-4">Monthly Profit Snapshot</h3>
        <div className="overflow-x-auto">
          <table className="min-w-[600px] table-auto text-sm w-full border">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-3 py-2 border">Month</th>
                <th className="px-3 py-2 border">Revenue</th>
                <th className="px-3 py-2 border">Cost</th>
                <th className="px-3 py-2 border">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(report.monthlyProfitability || []).map((m, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-3 py-2 border">{m.month}</td>
                  <td className="px-3 py-2 border">Rs. {m.revenue.toFixed(2)}</td>
                  <td className="px-3 py-2 border">Rs. {m.cost.toFixed(2)}</td>
                  <td className="px-3 py-2 border text-green-700 font-semibold">
                    Rs. {m.profit.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

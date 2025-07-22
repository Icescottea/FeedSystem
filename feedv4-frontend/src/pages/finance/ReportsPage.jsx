import React, { useEffect, useState } from 'react';

const ReportsPage = () => {
  const [report, setReport] = useState(null);

  useEffect(() => {
    fetch('/api/finance/reports')
      .then(res => res.json())
      .then(setReport)
      .catch(err => console.error('Failed to fetch report:', err));
  }, []);

  if (!report) return <p className="text-center mt-10">Loading reports...</p>;

  return (
    <div className="space-y-10">
      <h2 className="text-2xl font-bold">📊 Financial Reports</h2>

      {/* Revenue by Service */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Revenue by Service</h3>
        <ul className="list-disc pl-5">
          {Object.entries(report.revenueByService).map(([service, amount]) => (
            <li key={service}>
              {service}: <span className="font-medium">Rs. {amount.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Top Paying Clients */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Top Paying Clients</h3>
        <ol className="list-decimal pl-5">
          {report.topPayingClients.map(client => (
            <li key={client}>{client}</li>
          ))}
        </ol>
      </div>

      {/* Average Cost vs Charge */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-100 p-4 rounded">
          <h4 className="font-medium">Average Cost / kg</h4>
          <p className="text-xl">Rs. {report.avgCostPerKg.toFixed(2)}</p>
        </div>
        <div className="bg-green-100 p-4 rounded">
          <h4 className="font-medium">Average Charge / kg</h4>
          <p className="text-xl">Rs. {report.avgChargePerKg.toFixed(2)}</p>
        </div>
      </div>

      {/* Receivables */}
      <div className="bg-yellow-100 p-4 rounded">
        <h4 className="font-medium">Total Outstanding Receivables</h4>
        <p className="text-xl">Rs. {report.totalReceivables.toFixed(2)}</p>
      </div>

      {/* Monthly Profitability Snapshot */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Monthly Profit Snapshot</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border bg-white">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-2 border">Month</th>
                <th className="px-4 py-2 border">Revenue</th>
                <th className="px-4 py-2 border">Cost</th>
                <th className="px-4 py-2 border">Profit</th>
              </tr>
            </thead>
            <tbody>
              {report.monthlyProfitability.map((m, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{m.month}</td>
                  <td className="px-4 py-2 border">Rs. {m.revenue.toFixed(2)}</td>
                  <td className="px-4 py-2 border">Rs. {m.cost.toFixed(2)}</td>
                  <td className="px-4 py-2 border font-semibold text-green-700">
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

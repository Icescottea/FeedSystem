import React from 'react';

const FinanceDashboard = () => {
  return (
    <div>
      <h2>💼 Financial Management</h2>
      <ul>
        <li><a href="/finance/config">Fee Configuration</a></li>
        <li><a href="/finance/invoices">Invoices</a></li>
        <li><a href="/finance/payments">Payments</a></li>
        <li><a href="/finance/reports">Reports</a></li>
      </ul>
    </div>
  );
};

export default FinanceDashboard;

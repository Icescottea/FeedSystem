// src/pages/finance/InvoiceListPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const InvoiceListPage = () => {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get('/api/invoices');
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const getStatus = (invoice) => {
    return invoice.amountPaid >= invoice.totalAmount ? 'Paid' : 'Unpaid';
  };

  return (
    <div className="container mt-4">
      <h2>Invoices</h2>
      <button className="btn btn-primary mb-3" onClick={() => window.location.href = '/finance/invoices/new'}>
        Create New Invoice
      </button>
      <table className="table table-bordered table-striped">
        <thead className="thead-dark">
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(inv => (
            <tr key={inv.id}>
              <td>{inv.id}</td>
              <td>{inv.customerName || 'N/A'}</td>
              <td>Rs. {inv.totalAmount.toFixed(2)}</td>
              <td>Rs. {inv.amountPaid.toFixed(2)}</td>
              <td>
                <span className={`badge ${getStatus(inv) === 'Paid' ? 'bg-success' : 'bg-warning'}`}>
                  {getStatus(inv)}
                </span>
              </td>
              <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
              <td>
                <button className="btn btn-sm btn-info me-2">View</button>
                <button className="btn btn-sm btn-danger">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceListPage;

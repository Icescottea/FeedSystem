import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const QuoteDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuoteDetails();
  }, [id]);

  const fetchQuoteDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/quotes/${id}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setQuote(data);
    } catch (err) {
      console.error('Fetch quote failed:', err);
      alert('Failed to load quote');
    } finally {
      setLoading(false);
    }
  };

  // -------- ACTIONS --------

  const postAction = async (endpoint, successMsg) => {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'POST' });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setQuote(data);
      alert(successMsg);
    } catch (err) {
      console.error('Action failed:', err);
      alert('Operation failed');
    }
  };

  const handleEdit = () => navigate(`/finance/sales/quotes/${id}/edit`);

  const handleMarkAsAccepted = () => {
    if (window.confirm('Mark this quote as accepted?')) {
      postAction(`/api/quotes/${id}/mark-accepted`, 'Quote accepted');
    }
  };

  const handleMarkAsDeclined = () => {
    if (window.confirm('Mark this quote as declined?')) {
      postAction(`/api/quotes/${id}/mark-declined`, 'Quote declined');
    }
  };

  const handleClone = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/quotes/${id}/clone`, { method: 'POST' });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      navigate(`/finance/sales/quotes/${data.id}/edit`);
    } catch (err) {
      console.error('Clone failed:', err);
      alert('Clone failed');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this quote permanently?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/quotes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      alert('Quote deleted');
      navigate('/finance/sales/quotes');
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Delete failed');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'SENT': return 'bg-blue-100 text-blue-800';
      case 'ACCEPTED': return 'bg-green-100 text-green-800';
      case 'DECLINED': return 'bg-red-100 text-red-800';
      case 'EXPIRED': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!quote) return <div className="p-6 text-center">Not found</div>;

  return (
    <div className="p-6 space-y-6">
      <button onClick={() => navigate('/finance/sales/quotes')} className="text-blue-600">← Back</button>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{quote.quoteNumber}</h1>
          <p className="text-gray-600">{quote.subject}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleEdit} className="btn-primary">Edit</button>
          <button onClick={handleMarkAsAccepted} className="btn-success">Accept</button>
          <button onClick={handleMarkAsDeclined} className="btn-danger">Decline</button>
          <button onClick={handleClone} className="btn-secondary">Clone</button>
          <button onClick={handleDelete} className="btn-danger">Delete</button>
        </div>
      </div>

      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(quote.status)}`}>
        {quote.status}
      </span>

      <div className="bg-white p-6 rounded border space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Info title="Quote Number" value={quote.quoteNumber} />
          <Info title="Reference" value={quote.referenceNumber} />
          <Info title="Date" value={quote.quoteDate} />
          <Info title="Expiry" value={quote.expiryDate} />
          <Info title="Customer" value={quote.customerName} />
          <Info title="Sales Person" value={quote.salesPerson} />
        </div>

        <div className="overflow-x-auto border rounded">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Item</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Rate</th>
                <th className="p-2">Tax %</th>
                <th className="p-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {quote.items.map(i => (
                <tr key={i.id} className="border-t">
                  <td className="p-2">{i.itemName}</td>
                  <td className="p-2 text-center">{i.quantity}</td>
                  <td className="p-2 text-right">{i.rate}</td>
                  <td className="p-2 text-center">{i.taxRate}</td>
                  <td className="p-2 text-right">{i.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-right space-y-1">
          <div>Subtotal: {quote.subtotal}</div>
          <div>Tax: {quote.tax}</div>
          <div>Adjustment: {quote.adjustment}</div>
          <div className="font-bold text-lg">Total: {quote.total}</div>
        </div>

        {quote.customerNotes && (
          <Section title="Customer Notes">{quote.customerNotes}</Section>
        )}

        {quote.termsAndConditions && (
          <Section title="Terms & Conditions">{quote.termsAndConditions}</Section>
        )}
      </div>
    </div>
  );
};

const Info = ({ title, value }) => (
  <div className="flex justify-between">
    <span className="text-gray-600">{title}:</span>
    <span className="font-medium">{value || '-'}</span>
  </div>
);

const Section = ({ title, children }) => (
  <div>
    <h3 className="font-semibold mb-1">{title}</h3>
    <p className="bg-gray-50 p-3 rounded">{children}</p>
  </div>
);

export default QuoteDetailsPage;
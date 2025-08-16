// src/pages/finance/NewPaymentPage.jsx
import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PaymentForm from '../../components/Finance/PaymentForm';

export default function NewPaymentPage() {
  const [sp] = useSearchParams();
  const invoiceId = sp.get('invoiceId');
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-2xl font-semibold mb-4">New Payment</h1>
      <PaymentForm
        invoiceId={invoiceId}
        onSuccess={() => navigate('/finance/payments')}
      />
    </div>
  );
}

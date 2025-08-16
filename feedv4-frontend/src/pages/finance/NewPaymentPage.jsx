import React from 'react';
import { useSearchParams } from 'react-router-dom';
import PaymentForm from '../../components/Finance/PaymentForm';

const NewPaymentPage = () => {
  const [sp] = useSearchParams();
  const invoiceId = sp.get('invoiceId'); // "5" in your URL

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-2xl font-semibold mb-4">New Payment</h1>
      {/* pass invoiceId down if your form supports it; otherwise just render */}
      <PaymentForm onSuccess={() => window.location.href = '/finance/payments'} invoiceId={invoiceId}/>
    </div>
  );
};

export default NewPaymentPage;

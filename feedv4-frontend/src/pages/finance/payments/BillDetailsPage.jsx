import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const BillDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillDetails();
  }, [id]);

  const fetchBillDetails = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      
      const mockData = {
        id: 1,
        billNumber: 'BILL-2024-001',
        orderNumber: 'PO-2024-001',
        referenceNumber: 'REF-001',
        billDate: '2024-12-15',
        dueDate: '2025-01-14',
        status: 'OPEN',
        vendor: {
          name: 'Global Feed Supplies Ltd',
          companyName: 'Global Feed Supplies Ltd',
          email: 'info@globalfeed.com',
          phone: '+94 11 234 5678',
          address: '123 Industrial Zone, Colombo, Western 00100, Sri Lanka'
        },
        paymentTerms: 'NET_30',
        accountsPayable: 'ACCOUNTS_PAYABLE',
        subject: 'Monthly raw materials purchase',
        taxInclusive: false,
        items: [
          {
            id: 1,
            itemDetails: 'Corn - Yellow Grade A',
            account: 'Raw Materials',
            quantity: 1000,
            rate: 250,
            tax: 12,
            customerDetails: 'For Batch #2024-12-001',
            amount: 250000
          },
          {
            id: 2,
            itemDetails: 'Wheat Bran',
            account: 'Raw Materials',
            quantity: 500,
            rate: 400,
            tax: 12,
            customerDetails: 'For Batch #2024-12-001',
            amount: 200000
          }
        ],
        subtotal: 450000,
        discount: 22500,
        discountType: 'PERCENTAGE',
        discountValue: 5,
        tax: 51300,
        total: 478800,
        amountPaid: 0,
        balanceDue: 478800,
        notes: 'Payment due within 30 days of invoice date. Late payments may incur additional charges.',
        attachments: [
          { id: 1, name: 'purchase_order.pdf', size: '342 KB' },
          { id: 2, name: 'delivery_note.pdf', size: '156 KB' }
        ],
        payments: [],
        createdDate: '2024-12-15',
        modifiedDate: '2024-12-15',
        createdBy: 'John Doe'
      };
      
      setBill(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bill details:', error);
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (bill.status === 'VOID') {
      alert('Cannot edit a voided bill.');
      return;
    }
    navigate(`/finance/payments/bills/${id}/edit`);
  };

  const handleVoid = async () => {
    if (bill.status === 'VOID') {
      alert('Bill is already voided.');
      return;
    }
    if (bill.amountPaid > 0) {
      alert('Cannot void a bill with payments. Please reverse the payments first.');
      return;
    }
    if (window.confirm('Are you sure you want to void this bill? This action cannot be undone.')) {
      try {
        // TODO: Implement void API call
        console.log('Voiding bill:', id);
        setBill(prev => ({ ...prev, status: 'VOID' }));
        alert('Bill voided successfully!');
      } catch (error) {
        console.error('Error voiding bill:', error);
        alert('Error voiding bill.');
      }
    }
  };

  const handleClone = async () => {
    try {
      // TODO: Implement clone API call
      console.log('Cloning bill:', id);
      alert('Bill cloned! Redirecting to new bill...');
      navigate('/finance/payments/bills/new');
    } catch (error) {
      console.error('Error cloning bill:', error);
      alert('Error cloning bill.');
    }
  };

  const handleDelete = async () => {
    if (bill.status === 'PAID' || bill.status === 'PARTIALLY_PAID') {
      alert('Cannot delete a bill with payments. Please void the bill instead.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this bill? This action cannot be undone.')) {
      try {
        // TODO: Implement delete API call
        console.log('Deleting bill:', id);
        alert('Bill deleted successfully!');
        navigate('/finance/payments/bills');
      } catch (error) {
        console.error('Error deleting bill:', error);
        alert('Error deleting bill.');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRecordPayment = () => {
    navigate(`/finance/payments/payments-made/new?billId=${id}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Loading bill details...</div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Bill not found</div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: { bg: 'bg-gray-100', text: 'text-gray-800' },
      OPEN: { bg: 'bg-blue-100', text: 'text-blue-800' },
      PARTIALLY_PAID: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Partially Paid' },
      PAID: { bg: 'bg-green-100', text: 'text-green-800' },
      OVERDUE: { bg: 'bg-red-100', text: 'text-red-800' },
      VOID: { bg: 'bg-gray-100', text: 'text-gray-600' }
    };
    const config = statusConfig[status] || statusConfig.DRAFT;
    return { 
      className: `px-3 py-1 inline-flex text-sm font-semibold rounded-full ${config.bg} ${config.text}`,
      label: config.label || status
    };
  };

  const statusBadge = getStatusBadge(bill.status);
  const isOverdue = new Date(bill.dueDate) < new Date() && bill.balanceDue > 0 && bill.status !== 'PAID' && bill.status !== 'VOID';

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 print:hidden">
        <button
          onClick={() => navigate('/finance/payments/bills')}
          className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1"
        >
          ← Back to Bills
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{bill.billNumber}</h1>
            <p className="text-gray-600 mt-1">Bill Details</p>
          </div>
          <div className="flex gap-2">
            {bill.balanceDue > 0 && bill.status !== 'VOID' && (
              <button
                onClick={handleRecordPayment}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Record Payment
              </button>
            )}
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleVoid}
              disabled={bill.status === 'VOID' || bill.amountPaid > 0}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Void
            </button>
            <button
              onClick={handleClone}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clone
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Print
            </button>
            <button
              onClick={handleDelete}
              disabled={bill.status === 'PAID' || bill.status === 'PARTIALLY_PAID'}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Status and Payment Info */}
      <div className="mb-6 print:hidden">
        <div className="flex items-center gap-4">
          <span className={statusBadge.className}>
            {statusBadge.label}
          </span>
          {isOverdue && (
            <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-red-100 text-red-800">
              OVERDUE
            </span>
          )}
          {bill.balanceDue > 0 && bill.status !== 'VOID' && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Balance Due:</span>
              <span className="font-bold text-red-600">LKR {bill.balanceDue.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* PDF-Style Document */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-5xl mx-auto">
        {/* Document Header */}
        <div className="mb-8 pb-6 border-b-2 border-gray-300">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">BILL</h2>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">Bill Number</p>
              <p className="text-lg font-semibold text-gray-800">{bill.billNumber}</p>
              {bill.orderNumber && (
                <>
                  <p className="text-sm text-gray-600 mt-2">Order Number</p>
                  <p className="text-gray-800">{bill.orderNumber}</p>
                </>
              )}
              {bill.referenceNumber && (
                <>
                  <p className="text-sm text-gray-600 mt-2">Reference Number</p>
                  <p className="text-gray-800">{bill.referenceNumber}</p>
                </>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Bill Date</p>
              <p className="text-gray-800">{new Date(bill.billDate).toLocaleDateString()}</p>
              <p className="text-sm text-gray-600 mt-2">Due Date</p>
              <p className={`${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-800'}`}>
                {new Date(bill.dueDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 mt-2">Payment Terms</p>
              <p className="text-gray-800">{bill.paymentTerms.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        {/* Vendor Information */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">Bill From</h3>
          <div className="text-gray-800">
            <p className="font-semibold text-lg">{bill.vendor.name}</p>
            <p className="text-sm">{bill.vendor.companyName}</p>
            <p className="text-sm mt-2">{bill.vendor.email}</p>
            <p className="text-sm">{bill.vendor.phone}</p>
            <p className="text-sm mt-2">{bill.vendor.address}</p>
          </div>
        </div>

        {/* Subject */}
        {bill.subject && (
          <div className="mb-6">
            <p className="text-sm text-gray-600">Subject</p>
            <p className="text-gray-800 font-medium">{bill.subject}</p>
          </div>
        )}

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-y-2 border-gray-300">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Item Details</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Account</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Quantity</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Rate</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Tax</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Details</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bill.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="px-4 py-3 text-sm text-gray-800">{item.itemDetails}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.account}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-800">{item.quantity.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-800">LKR {item.rate.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">{item.tax}%</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.customerDetails || '-'}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-800">
                    LKR {item.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            <div className="space-y-2">
              <div className="flex justify-between py-2">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-medium text-gray-800">LKR {bill.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-700">
                  Discount {bill.discountType === 'PERCENTAGE' ? `(${bill.discountValue}%)` : ''}:
                </span>
                <span className="font-medium text-gray-800">- LKR {bill.discount.toLocaleString()}</span>
              </div>
              {!bill.taxInclusive && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">Tax:</span>
                  <span className="font-medium text-gray-800">LKR {bill.tax.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between py-3 border-t-2 border-gray-300">
                <span className="text-lg font-semibold text-gray-800">Total:</span>
                <span className="text-lg font-bold text-gray-800">LKR {bill.total.toLocaleString()}</span>
              </div>
              {bill.amountPaid > 0 && (
                <>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-700">Amount Paid:</span>
                    <span className="font-medium text-green-600">- LKR {bill.amountPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-3 border-t border-gray-300">
                    <span className="text-lg font-semibold text-gray-800">Balance Due:</span>
                    <span className="text-lg font-bold text-red-600">LKR {bill.balanceDue.toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        {bill.notes && (
          <div className="border-t border-gray-300 pt-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">Notes</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{bill.notes}</p>
          </div>
        )}

        {/* Payment History */}
        {bill.payments && bill.payments.length > 0 && (
          <div className="border-t border-gray-300 pt-6 mb-6 print:hidden">
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Payment History</h3>
            <table className="w-full border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Payment #</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bill.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-4 py-2 text-sm text-gray-800">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-blue-600">{payment.number}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{payment.method}</td>
                    <td className="px-4 py-2 text-sm text-right font-medium text-gray-800">
                      LKR {payment.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Attachments */}
        {bill.attachments && bill.attachments.length > 0 && (
          <div className="border-t border-gray-300 pt-6 print:hidden">
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Attachments</h3>
            <div className="space-y-2">
              {bill.attachments.map(file => (
                <div key={file.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.size}</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Footer */}
        <div className="border-t border-gray-300 pt-6 mt-8 text-xs text-gray-500">
          <div className="flex justify-between">
            <div>
              <p>Created by: {bill.createdBy}</p>
              <p>Created on: {new Date(bill.createdDate).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p>Last modified: {new Date(bill.modifiedDate).toLocaleDateString()}</p>
              <p>Accounts Payable: {bill.accountsPayable.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillDetailsPage;
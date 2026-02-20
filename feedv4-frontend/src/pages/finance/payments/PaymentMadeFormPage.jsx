import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_BASE = `${API_BASE_URL}/api/payments-made`;

// Hardcoded accounts — matches ACCOUNT_NAMES map in PaymentMadeService
const ACCOUNTS = [
  { id: 1, name: 'Primary Bank Account - BOC' },
  { id: 2, name: 'Secondary Bank Account - Commercial' },
  { id: 3, name: 'Cash on Hand' },
  { id: 4, name: 'Petty Cash' },
];

const PaymentMadeFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const billId = searchParams.get('billId');
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    vendorId: '',
    vendorName: '',
    paymentMade: 0,
    bankCharges: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'BANK_TRANSFER',
    paidThroughAccountId: 1,
    referenceNumber: '',
    orderNumber: '',
    notes: '',
    status: 'DRAFT',
  });

  const [billPayments, setBillPayments] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [outstandingBills, setOutstandingBills] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVendors();
    if (isEditMode) {
      fetchPayment();
    } else if (billId) {
      fetchBillForPayment(billId);
    }
  }, [id, billId]);

  // ─── DATA FETCHING ────────────────────────────────────────────────────────

  const fetchVendors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vendors/active`);
      if (!response.ok) return;
      const data = await response.json();
      setVendors(data.map(v => ({
        id: v.id,
        name: v.vendorDisplayName || v.companyName || `Vendor #${v.id}`,
      })));
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchOutstandingBills = async (vendorId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bills/vendor/${vendorId}/outstanding`);
      if (!response.ok) return;
      const data = await response.json();
      setOutstandingBills(data);
    } catch (error) {
      console.error('Error fetching outstanding bills:', error);
    }
  };

  const fetchBillForPayment = async (bId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bills/${bId}`);
      if (!response.ok) return;
      const bill = await response.json();

      setFormData(prev => ({
        ...prev,
        vendorId: bill.vendorId?.toString() || '',
        vendorName: bill.vendorName || `Vendor #${bill.vendorId}`,
        paymentMade: parseFloat(bill.balanceDue) || 0,
      }));

      setBillPayments([{
        tempId: Date.now(),
        billId: bill.id,
        billNumber: bill.billNumber,
        poNumber: bill.orderNumber || '',
        billDate: bill.billDate,
        billAmount: parseFloat(bill.total) || 0,
        amountDue: parseFloat(bill.balanceDue) || 0,
        paymentMadeOn: new Date().toISOString().split('T')[0],
        paymentAmount: parseFloat(bill.balanceDue) || 0,
      }]);

      if (bill.vendorId) fetchOutstandingBills(bill.vendorId);
    } catch (error) {
      console.error('Error fetching bill:', error);
    }
  };

  const fetchPayment = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/${id}`);
      if (!response.ok) throw new Error('Failed to fetch payment');
      const data = await response.json();

      setFormData({
        vendorId: data.vendorId?.toString() || '',
        vendorName: data.vendorName || '',
        paymentMade: parseFloat(data.paymentMade) || 0,
        bankCharges: parseFloat(data.bankCharges) || 0,
        paymentDate: data.paymentDate || new Date().toISOString().split('T')[0],
        paymentMode: data.paymentMode || 'BANK_TRANSFER',
        paidThroughAccountId: data.paidThroughAccountId || 1,
        referenceNumber: data.referenceNumber || '',
        orderNumber: data.orderNumber || '',
        notes: data.notes || '',
        status: data.status || 'DRAFT',
      });

      if (data.billPayments) {
        setBillPayments(data.billPayments.map((bp, i) => ({
          ...bp,
          tempId: bp.id || i,
          paymentAmount: parseFloat(bp.paymentAmount) || 0,
          billAmount: parseFloat(bp.billAmount) || 0,
          amountDue: parseFloat(bp.amountDue) || 0,
        })));
      }

      if (data.vendorId) fetchOutstandingBills(data.vendorId);
    } catch (error) {
      console.error('Error fetching payment:', error);
      alert('Failed to load payment data.');
    } finally {
      setLoading(false);
    }
  };

  // ─── HANDLERS ─────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVendorChange = (e) => {
    const vendorId = e.target.value;
    const vendor = vendors.find(v => v.id.toString() === vendorId);
    setFormData(prev => ({
      ...prev,
      vendorId,
      vendorName: vendor ? vendor.name : '',
    }));
    setBillPayments([]);
    if (vendorId) fetchOutstandingBills(parseInt(vendorId));
  };

  const handleBillSelect = (index, selectedBillId) => {
    const bill = outstandingBills.find(b => b.id.toString() === selectedBillId);
    if (!bill) return;
    const updated = [...billPayments];
    updated[index] = {
      ...updated[index],
      billId: bill.id,
      billNumber: bill.billNumber,
      poNumber: bill.orderNumber || '',
      billDate: bill.billDate,
      billAmount: parseFloat(bill.total) || 0,
      amountDue: parseFloat(bill.balanceDue) || 0,
      paymentAmount: parseFloat(bill.balanceDue) || 0,
    };
    setBillPayments(updated);
    recalcPaymentMade(updated);
  };

  const handleBillPaymentChange = (index, field, value) => {
    const updated = [...billPayments];
    updated[index][field] = value;
    setBillPayments(updated);
    if (field === 'paymentAmount') recalcPaymentMade(updated);
  };

  const recalcPaymentMade = (bps) => {
    const total = bps.reduce((sum, bp) => sum + (parseFloat(bp.paymentAmount) || 0), 0);
    setFormData(prev => ({ ...prev, paymentMade: total }));
  };

  const addBillPayment = () => {
    setBillPayments([...billPayments, {
      tempId: Date.now(),
      billId: null,
      billNumber: '',
      poNumber: '',
      billDate: '',
      billAmount: 0,
      amountDue: 0,
      paymentMadeOn: new Date().toISOString().split('T')[0],
      paymentAmount: 0,
    }]);
  };

  const removeBillPayment = (index) => {
    if (billPayments.length <= 1) return;
    const updated = billPayments.filter((_, i) => i !== index);
    setBillPayments(updated);
    recalcPaymentMade(updated);
  };

  // ─── CALCULATIONS ─────────────────────────────────────────────────────────

  const calcAmountPaid = () => billPayments.reduce((s, bp) => s + (parseFloat(bp.paymentAmount) || 0), 0);
  const calcAmountInExcess = () => Math.max(0, (parseFloat(formData.paymentMade) || 0) - calcAmountPaid());

  // ─── SUBMIT ───────────────────────────────────────────────────────────────

  const handleSubmit = async (saveType) => {
    if (!formData.vendorId) { alert('Please select a vendor.'); return; }
    if (!formData.paymentDate) { alert('Please enter a payment date.'); return; }

    try {
      setLoading(true);

      const payload = {
        ...(isEditMode ? {} : {}),
        vendorId: parseInt(formData.vendorId),
        vendorName: formData.vendorName || '',
        paymentDate: formData.paymentDate,
        paymentMode: formData.paymentMode,
        paidThroughAccountId: parseInt(formData.paidThroughAccountId) || 1,
        paymentMade: parseFloat(formData.paymentMade) || 0,
        bankCharges: parseFloat(formData.bankCharges) || 0,
        referenceNumber: formData.referenceNumber || '',
        orderNumber: formData.orderNumber || '',
        notes: formData.notes || '',
        status: saveType === 'draft' ? 'DRAFT' : 'PAID',
        billPayments: billPayments
          .filter(bp => bp.billId)
          .map(bp => ({
            ...(typeof bp.id === 'number' ? { id: bp.id } : {}),
            billId: bp.billId,
            paymentAmount: parseFloat(bp.paymentAmount) || 0,
            paymentDate: bp.paymentMadeOn || formData.paymentDate,
          })),
      };

      const url = isEditMode ? `${API_BASE}/${id}` : API_BASE;
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save payment');
      }

      navigate('/finance/payments/payments-made');
    } catch (error) {
      console.error('Error saving payment:', error);
      alert('Error saving payment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Edit Payment' : 'New Payment'}</h1>
        <p className="text-gray-600 mt-1">{isEditMode ? 'Update payment information' : 'Record a new payment to vendor'}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 space-y-6">

          {/* Payment Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor Name <span className="text-red-500">*</span>
                </label>
                <select name="vendorId" value={formData.vendorId} onChange={handleVendorChange} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select Vendor</option>
                  {vendors.map(v => <option key={v.id} value={v.id.toString()}>{v.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Date <span className="text-red-500">*</span>
                </label>
                <input type="date" name="paymentDate" value={formData.paymentDate} onChange={handleChange} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Mode <span className="text-red-500">*</span>
                </label>
                <select name="paymentMode" value={formData.paymentMode} onChange={handleChange} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="CASH">Cash</option>
                  <option value="ONLINE_PAYMENT">Online Payment</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paid Through <span className="text-red-500">*</span>
                </label>
                <select name="paidThroughAccountId" value={formData.paidThroughAccountId} onChange={handleChange} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  {ACCOUNTS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Made <span className="text-red-500">*</span>
                </label>
                <input type="number" name="paymentMade" value={formData.paymentMade} onChange={handleChange}
                  min="0" step="0.01" required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Charges</label>
                <input type="number" name="bankCharges" value={formData.bankCharges} onChange={handleChange}
                  min="0" step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reference Number</label>
                <input type="text" name="referenceNumber" value={formData.referenceNumber} onChange={handleChange}
                  placeholder="REF-PMT-001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Number</label>
                <input type="text" name="orderNumber" value={formData.orderNumber} onChange={handleChange}
                  placeholder="PO-2024-001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>
          </div>

          {/* Bill Payments */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Bill Payments</h3>
              <button type="button" onClick={addBillPayment}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium">+ Add Bill</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    {['Date','Bill Number','PO Number','Bill Amount','Amount Due','Payment Made On','Payment','Action'].map(h => (
                      <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {billPayments.map((bp, index) => (
                    <tr key={bp.tempId || index}>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {bp.billDate ? new Date(bp.billDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-2">
                        <select value={bp.billId?.toString() || ''}
                          onChange={(e) => handleBillSelect(index, e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          disabled={!formData.vendorId}>
                          <option value="">Select Bill</option>
                          {outstandingBills.map(bill => (
                            <option key={bill.id} value={bill.id.toString()}>{bill.billNumber}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">{bp.poNumber || '—'}</td>
                      <td className="px-4 py-2 text-sm text-gray-800">
                        LKR {(parseFloat(bp.billAmount) || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-red-600">
                        LKR {(parseFloat(bp.amountDue) || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-2">
                        <input type="date" value={bp.paymentMadeOn || ''}
                          onChange={(e) => handleBillPaymentChange(index, 'paymentMadeOn', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
                      </td>
                      <td className="px-4 py-2">
                        <input type="number" value={bp.paymentAmount} min="0" step="0.01"
                          onChange={(e) => handleBillPaymentChange(index, 'paymentAmount', e.target.value)}
                          className="w-28 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
                      </td>
                      <td className="px-4 py-2">
                        {billPayments.length > 1 && (
                          <button type="button" onClick={() => removeBillPayment(index)}
                            className="text-red-600 hover:text-red-800 text-sm">Remove</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="max-w-md ml-auto space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Amount Used for Payments:</span>
                <span className="font-medium text-gray-800">LKR {calcAmountPaid().toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Amount in Excess:</span>
                <span className={`font-medium ${calcAmountInExcess() > 0 ? 'text-orange-600' : 'text-gray-800'}`}>
                  LKR {calcAmountInExcess().toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-300 pt-3">
                <span className="text-gray-700">Bank Charges:</span>
                <span className="font-medium text-gray-800">
                  LKR {(parseFloat(formData.bankCharges) || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center border-t-2 border-gray-400 pt-3">
                <span className="text-lg font-semibold text-gray-800">Total Payment Made:</span>
                <span className="text-lg font-bold text-gray-800">
                  LKR {(parseFloat(formData.paymentMade) || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3}
                placeholder="Add any notes..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/finance/payments/payments-made')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">Cancel</button>
          <button type="button" onClick={() => handleSubmit('draft')} disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Saving...' : 'Save as Draft'}
          </button>
          <button type="button" onClick={() => handleSubmit('paid')} disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Saving...' : isEditMode ? 'Update and Save as Paid' : 'Save as Paid'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentMadeFormPage;
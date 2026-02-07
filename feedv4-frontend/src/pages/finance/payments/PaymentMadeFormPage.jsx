import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

const PaymentMadeFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const billId = searchParams.get('billId');
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    vendorId: '',
    vendorName: '',
    paymentNumber: '',
    paymentMade: 0,
    bankCharges: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'BANK_TRANSFER',
    paidThrough: '',
    referenceNumber: '',
    orderNumber: '',
    notes: '',
    status: 'DRAFT'
  });

  const [billPayments, setBillPayments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [bills, setBills] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVendors();
    fetchAccounts();
    if (isEditMode) {
      fetchPayment();
    } else {
      generatePaymentNumber();
      if (billId) {
        fetchBillForPayment(billId);
      }
    }
  }, [id, billId]);

  const fetchVendors = async () => {
    try {
      // TODO: Replace with actual API call
      const mockVendors = [
        { id: 1, name: 'Global Feed Supplies Ltd' },
        { id: 2, name: 'Premium Ingredients Co.' },
        { id: 3, name: 'ABC Raw Materials' },
        { id: 4, name: 'Quality Nutrients Inc' },
        { id: 5, name: 'Local Supplier Network' }
      ];
      setVendors(mockVendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchAccounts = async () => {
    try {
      // TODO: Replace with actual API call
      const mockAccounts = [
        { id: 1, name: 'Primary Bank Account - BOC', type: 'Bank' },
        { id: 2, name: 'Secondary Bank Account - Commercial', type: 'Bank' },
        { id: 3, name: 'Cash on Hand', type: 'Cash' },
        { id: 4, name: 'Petty Cash', type: 'Cash' }
      ];
      setAccounts(mockAccounts);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const generatePaymentNumber = async () => {
    try {
      // TODO: Replace with actual API call
      const paymentNumber = `PMT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      setFormData(prev => ({ ...prev, paymentNumber }));
    } catch (error) {
      console.error('Error generating payment number:', error);
    }
  };

  const fetchBillForPayment = async (billId) => {
    try {
      // TODO: Replace with actual API call to fetch specific bill
      const mockBill = {
        id: billId,
        billNumber: 'BILL-2024-001',
        poNumber: 'PO-2024-001',
        date: '2024-12-15',
        billAmount: 478800,
        amountDue: 478800,
        vendorId: 1,
        vendorName: 'Global Feed Supplies Ltd'
      };

      setBillPayments([{
        id: 1,
        date: mockBill.date,
        billNumber: mockBill.billNumber,
        poNumber: mockBill.poNumber,
        billAmount: mockBill.billAmount,
        amountDue: mockBill.amountDue,
        paymentMadeOn: new Date().toISOString().split('T')[0],
        payment: mockBill.amountDue
      }]);

      setFormData(prev => ({
        ...prev,
        vendorId: mockBill.vendorId.toString(),
        vendorName: mockBill.vendorName,
        paymentMade: mockBill.amountDue
      }));
    } catch (error) {
      console.error('Error fetching bill:', error);
    }
  };

  const fetchPayment = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const mockData = {
        vendorId: '1',
        vendorName: 'Global Feed Supplies Ltd',
        paymentNumber: 'PMT-2024-001',
        paymentMade: 478800,
        bankCharges: 500,
        paymentDate: '2024-12-20',
        paymentMode: 'BANK_TRANSFER',
        paidThrough: '1',
        referenceNumber: 'REF-PMT-001',
        orderNumber: 'PO-2024-001',
        notes: 'Payment for December supplies',
        status: 'DRAFT'
      };

      const mockBillPayments = [
        {
          id: 1,
          date: '2024-12-15',
          billNumber: 'BILL-2024-001',
          poNumber: 'PO-2024-001',
          billAmount: 478800,
          amountDue: 478800,
          paymentMadeOn: '2024-12-20',
          payment: 478300
        }
      ];

      setFormData(mockData);
      setBillPayments(mockBillPayments);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payment:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVendorChange = async (e) => {
    const vendorId = e.target.value;
    const vendor = vendors.find(v => v.id === parseInt(vendorId));
    
    setFormData(prev => ({
      ...prev,
      vendorId: vendorId,
      vendorName: vendor ? vendor.name : ''
    }));

    if (vendorId) {
      // Fetch outstanding bills for vendor
      try {
        // TODO: Replace with actual API call
        const mockBills = [
          {
            id: 1,
            date: '2024-12-15',
            billNumber: 'BILL-2024-001',
            poNumber: 'PO-2024-001',
            billAmount: 478800,
            amountDue: 478800
          },
          {
            id: 2,
            date: '2024-12-10',
            billNumber: 'BILL-2024-002',
            poNumber: 'PO-2024-002',
            billAmount: 315600,
            amountDue: 150000
          }
        ];
        setBills(mockBills);
      } catch (error) {
        console.error('Error fetching vendor bills:', error);
      }
    }
  };

  const handleBillPaymentChange = (index, field, value) => {
    const newBillPayments = [...billPayments];
    newBillPayments[index][field] = value;
    setBillPayments(newBillPayments);
    
    // Recalculate total payment made
    const totalPayment = newBillPayments.reduce((sum, bp) => sum + (parseFloat(bp.payment) || 0), 0);
    setFormData(prev => ({ ...prev, paymentMade: totalPayment }));
  };

  const addBillPayment = () => {
    setBillPayments([...billPayments, {
      id: Date.now(),
      date: '',
      billNumber: '',
      poNumber: '',
      billAmount: 0,
      amountDue: 0,
      paymentMadeOn: new Date().toISOString().split('T')[0],
      payment: 0
    }]);
  };

  const removeBillPayment = (index) => {
    if (billPayments.length > 1) {
      const newBillPayments = billPayments.filter((_, i) => i !== index);
      setBillPayments(newBillPayments);
      
      // Recalculate total payment made
      const totalPayment = newBillPayments.reduce((sum, bp) => sum + (parseFloat(bp.payment) || 0), 0);
      setFormData(prev => ({ ...prev, paymentMade: totalPayment }));
    }
  };

  const selectBill = (index, billId) => {
    const selectedBill = bills.find(b => b.id === parseInt(billId));
    if (selectedBill) {
      const newBillPayments = [...billPayments];
      newBillPayments[index] = {
        ...newBillPayments[index],
        date: selectedBill.date,
        billNumber: selectedBill.billNumber,
        poNumber: selectedBill.poNumber,
        billAmount: selectedBill.billAmount,
        amountDue: selectedBill.amountDue,
        payment: selectedBill.amountDue
      };
      setBillPayments(newBillPayments);
      
      // Recalculate total payment made
      const totalPayment = newBillPayments.reduce((sum, bp) => sum + (parseFloat(bp.payment) || 0), 0);
      setFormData(prev => ({ ...prev, paymentMade: totalPayment }));
    }
  };

  const calculateAmountPaid = () => {
    return billPayments.reduce((sum, bp) => sum + (parseFloat(bp.payment) || 0), 0);
  };

  const calculateAmountUsed = () => {
    return calculateAmountPaid();
  };

  const calculateAmountRefunded = () => {
    return 0; // Can be implemented based on business logic
  };

  const calculateAmountInExcess = () => {
    const paid = calculateAmountPaid();
    const used = calculateAmountUsed();
    return parseFloat(formData.paymentMade || 0) - paid;
  };

  const calculateTotalBankCharges = () => {
    return parseFloat(formData.bankCharges || 0);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      file: file
    }));
    setAttachments([...attachments, ...newAttachments]);
  };

  const removeAttachment = (id) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  const handleSubmit = async (saveType) => {
    try {
      setLoading(true);

      const paymentData = {
        ...formData,
        billPayments,
        attachments: attachments.map(a => a.name),
        amountPaid: calculateAmountPaid(),
        amountUsed: calculateAmountUsed(),
        amountRefunded: calculateAmountRefunded(),
        amountInExcess: calculateAmountInExcess(),
        totalBankCharges: calculateTotalBankCharges(),
        status: saveType === 'draft' ? 'DRAFT' : 'PAID'
      };

      // TODO: Replace with actual API call
      console.log('Saving payment:', paymentData);

      await new Promise(resolve => setTimeout(resolve, 500));

      alert(
        isEditMode 
          ? 'Payment updated successfully!' 
          : saveType === 'draft'
            ? 'Payment saved as draft!'
            : 'Payment saved as paid!'
      );
      navigate('/finance/payments/payments-made');

    } catch (error) {
      console.error('Error saving payment:', error);
      alert('Error saving payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Edit Payment' : 'New Payment'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditMode ? 'Update payment information' : 'Record a new payment to vendor'}
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor Name <span className="text-red-500">*</span>
                </label>
                <select
                  name="vendorId"
                  value={formData.vendorId}
                  onChange={handleVendorChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Vendor</option>
                  {vendors.map(vendor => (
                    <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="paymentNumber"
                  value={formData.paymentNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="PMT-2024-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Made <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="paymentMade"
                  value={formData.paymentMade}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Charges
                </label>
                <input
                  type="number"
                  name="bankCharges"
                  value={formData.bankCharges}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Mode <span className="text-red-500">*</span>
                </label>
                <select
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
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
                <select
                  name="paidThrough"
                  value={formData.paidThrough}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Account</option>
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>{account.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference Number
                </label>
                <input
                  type="text"
                  name="referenceNumber"
                  value={formData.referenceNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="REF-PMT-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Number
                </label>
                <input
                  type="text"
                  name="orderNumber"
                  value={formData.orderNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="PO-2024-001"
                />
              </div>
            </div>
          </div>

          {/* Bill Payments Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Bill Payments</h3>
              <button
                type="button"
                onClick={addBillPayment}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Add Bill
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bill Number</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">PO Number</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bill Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount Due</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Payment Made On</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {billPayments.map((bp, index) => (
                    <tr key={bp.id}>
                      <td className="px-4 py-2">
                        <div className="text-sm text-gray-600">
                          {bp.date ? new Date(bp.date).toLocaleDateString() : '-'}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={bp.billNumber}
                          onChange={(e) => {
                            const selectedBillId = bills.find(b => b.billNumber === e.target.value)?.id;
                            if (selectedBillId) {
                              selectBill(index, selectedBillId);
                            }
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Bill</option>
                          {bills.map(bill => (
                            <option key={bill.id} value={bill.billNumber}>{bill.billNumber}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <div className="text-sm text-gray-600">{bp.poNumber || '-'}</div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="text-sm text-gray-800">LKR {bp.billAmount.toLocaleString()}</div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="text-sm font-medium text-red-600">LKR {bp.amountDue.toLocaleString()}</div>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="date"
                          value={bp.paymentMadeOn}
                          onChange={(e) => handleBillPaymentChange(index, 'paymentMadeOn', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={bp.payment}
                          onChange={(e) => handleBillPaymentChange(index, 'payment', e.target.value)}
                          className="w-28 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-4 py-2">
                        {billPayments.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBillPayment(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Section */}
          <div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="max-w-md ml-auto space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Amount Paid:</span>
                  <span className="font-medium text-gray-800">LKR {calculateAmountPaid().toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Amount Used for Payments:</span>
                  <span className="font-medium text-gray-800">LKR {calculateAmountUsed().toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Amount Refunded:</span>
                  <span className="font-medium text-gray-800">LKR {calculateAmountRefunded().toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Amount in Excess:</span>
                  <span className={`font-medium ${calculateAmountInExcess() > 0 ? 'text-orange-600' : 'text-gray-800'}`}>
                    LKR {calculateAmountInExcess().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                  <span className="text-gray-700">Bank Charges:</span>
                  <span className="font-medium text-gray-800">LKR {calculateTotalBankCharges().toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add any notes..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Files
                </label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  multiple
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {attachments.map(file => (
                      <div key={file.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(file.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/finance/payments/payments-made')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('paid')}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : (isEditMode ? 'Update and Save as Paid' : 'Save as Paid')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentMadeFormPage;
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE_URL;
const round2 = n => Math.round((n + Number.EPSILON) * 100) / 100;

const InvoiceForm = () => {
  const location = useLocation();
  const qp = new URLSearchParams(location.search);
  const initialBatchId = qp.get('batchId') ? Number(qp.get('batchId')) : '';

  const [form, setForm] = useState({
    customerName: '',
    batchId: initialBatchId,
    feeType: '',      // renamed from serviceType
    feeConfigId: null,
    amount: 0,
    discount: 0,
    taxRate: 0,
    quantityKg: 0,
    unitRate: 0,
    referenceId: null
  });

  const [options, setOptions] = useState([]); // [{id, name}]
  const [batch, setBatch] = useState(null);   // { actualYieldKg, targetQuantityKg, formulation:{ costPerKg } }
  const [selectedCfg, setSelectedCfg] = useState(null); // full config

  // load dropdown + batch
  useEffect(() => {
    fetch(`${API_BASE}/api/charges-config/options`)
      .then(r => r.json())
      .then(setOptions)
      .catch(() => setOptions([]));

    if (initialBatchId) {
      fetch(`${API_BASE}/api/pelleting/${initialBatchId}`)
        .then(r => r.json())
        .then(b => {
          setBatch(b || null);
          const qty = (b?.actualYieldKg && b.actualYieldKg > 0) ? b.actualYieldKg : (b?.targetQuantityKg || 0);
          setForm(prev => ({ ...prev, quantityKg: qty }));
        })
        .catch(() => setBatch(null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBatchId]);

  const computeTotal = (cfg, b) => {
    if (!cfg || !b) return 0;
    const qty = (b.actualYieldKg && b.actualYieldKg > 0) ? b.actualYieldKg : (b.targetQuantityKg || 0);
    const costPerKg = b.formulation?.costPerKg || 0;

    // adapt these property names to your ChargesConfig model if different
    const pelletingPerKg   = cfg.pelletingPerKg   ?? cfg.pelletingFeePerKg   ?? 0;
    const systemPercent    = cfg.systemPercent    ?? cfg.systemFeePercent    ?? 0;
    const formulationPerKg = cfg.formulationPerKg ?? cfg.formulationFeePerKg ?? 0;

    const pelleting   = qty * pelletingPerKg;
    const formulation = qty * formulationPerKg;
    const system      = (qty * costPerKg) * (systemPercent / 100);

    return round2(pelleting + formulation + system);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    const numeric = ['amount', 'discount', 'taxRate', 'quantityKg', 'unitRate', 'batchId'];
    const converted = numeric.includes(name) ? (value === '' ? '' : Number(value)) : value;
    setForm(prev => ({ ...prev, [name]: converted }));
  };

  const handleFeeTypeSelect = async e => {
    const cfgId = Number(e.target.value);
    const opt = options.find(o => o.id === cfgId);
    setForm(prev => ({ ...prev, feeType: opt?.name || '', feeConfigId: cfgId }));

    try {
      const full = await fetch(`${API_BASE}/api/charges-config/${cfgId}`).then(r => r.json());
      setSelectedCfg(full);
      const nextAmount = computeTotal(full, batch);
      setForm(prev => ({ ...prev, amount: nextAmount }));
    } catch {
      setSelectedCfg(null);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    const payload = {
      customerName: form.customerName,
      batchId: form.batchId || null,
      serviceType: form.feeType,   // keep backend compat; or rename to feeType there
      feeConfigId: form.feeConfigId,
      amount: form.amount,
      discount: form.discount,
      taxRate: form.taxRate,
      quantityKg: form.quantityKg,
      unitRate: form.unitRate,
      referenceId: form.referenceId
    };

    fetch(`${API_BASE}/api/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => { if (!res.ok) throw new Error('Failed to create invoice'); return res.json(); })
      .then(() => {
        setForm({
          customerName: '',
          batchId: '',
          feeType: '',
          feeConfigId: null,
          amount: 0,
          discount: 0,
          taxRate: 0,
          quantityKg: 0,
          unitRate: 0,
          referenceId: null
        });
      })
      .catch(err => console.error('Error creating invoice:', err));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white border rounded-md shadow p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Create New Invoice</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Customer Name</label>
          <input name="customerName" value={form.customerName ?? ''} onChange={handleChange}
                 className="w-full border rounded-md px-3 py-2 text-sm" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Batch ID</label>
          <input name="batchId" type="number" value={form.batchId ?? ''} onChange={handleChange}
                 className="w-full border rounded-md px-3 py-2 text-sm" placeholder="e.g., 45" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Fee Type</label>
          <select name="feeConfigId" value={form.feeConfigId ?? ''} onChange={handleFeeTypeSelect}
                  className="w-full border rounded-md px-3 py-2 text-sm" required>
            <option value="">Select fee configuration</option>
            {options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          {form.feeType && batch && (
            <p className="text-[11px] text-gray-500 mt-1">
              Qty: {form.quantityKg} kg · Cost/kg: {batch?.formulation?.costPerKg ?? 0}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Amount (LKR)</label>
          <input name="amount" type="number" value={form.amount ?? 0} onChange={handleChange}
                 className="w-full border rounded-md px-3 py-2 text-sm" placeholder="0.00" required />
        </div>
      </div>

      <div className="text-right">
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-md">
          Create Invoice
        </button>
      </div>
    </form>
  );
};

export default InvoiceForm;

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE_URL;
const BASIS = [
  { label: "Per Kg", value: "PER_KG" },
  { label: "Per Batch (fixed)", value: "PER_BATCH" },
];

const nz = (v) => (v === null || v === undefined || v === "" ? 0 : Number(v));

export default function FeeConfigForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // "new" or a number
  const isEdit = id && id !== "new";

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    pelletingFeeType: "PER_KG",
    pelletingFee: 0,
    systemFeePercent: 0,
    formulationFeeType: "PER_KG",
    formulationFee: 0,
    active: true,
    archived: false,
  });

  const [preview, setPreview] = useState({ quantityKg: 1000, unitPricePerKg: 20 });

  useEffect(() => {
    if (!isEdit) return;
    let canceled = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(`${API_BASE}/api/charges-config/${id}`);
        if (!res.ok) throw new Error(`Load failed (${res.status})`);
        const data = await res.json();
        if (!canceled) setForm({
          name: data.name ?? "",
          description: data.description ?? "",
          pelletingFeeType: data.pelletingFeeType ?? "PER_KG",
          pelletingFee: data.pelletingFee ?? 0,
          systemFeePercent: data.systemFeePercent ?? 0,
          formulationFeeType: data.formulationFeeType ?? "PER_KG",
          formulationFee: data.formulationFee ?? 0,
          active: !!data.active,
          archived: !!data.archived,
        });
      } catch (e) {
        if (!canceled) setErr(e.message || "Failed to load");
      } finally {
        if (!canceled) setLoading(false);
      }
    })();
    return () => { canceled = true; };
  }, [isEdit, id]);

  const change = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const breakdown = useMemo(() => {
    const qty = nz(preview.quantityKg);
    const price = nz(preview.unitPricePerKg);

    const pelleting = form.pelletingFeeType === "PER_KG"
      ? qty * nz(form.pelletingFee)
      : nz(form.pelletingFee);

    const systemBase = qty * price;
    const system = (nz(form.systemFeePercent) / 100.0) * systemBase;

    const formulation = form.formulationFeeType === "PER_KG"
      ? qty * nz(form.formulationFee)
      : nz(form.formulationFee);

    const total = pelleting + system + formulation;
    return { pelleting, system, formulation, total };
  }, [form, preview]);

  const validate = () => {
    const e = [];
    if (!form.name || !form.name.trim()) e.push("Name is required.");
    if (form.name && form.name.length > 100) e.push("Name too long (max 100 chars).");
    if (form.pelletingFee < 0) e.push("Pelleting fee cannot be negative.");
    if (form.formulationFee < 0) e.push("Formulation fee cannot be negative.");
    if (form.systemFeePercent < 0 || form.systemFeePercent > 100) e.push("System fee percent must be 0..100.");
    if (!form.pelletingFeeType) e.push("Pelleting basis required.");
    if (!form.formulationFeeType) e.push("Formulation basis required.");
    return e;
  };

  const save = async () => {
    setSaving(true); setErr(""); setOk("");
    try {
      const errors = validate();
      if (errors.length) { setErr(errors.join(" ")); return; }

      const method = isEdit ? "PUT" : "POST";
      const url = isEdit
        ? `${API_BASE}/api/charges-config/${id}`
        : `${API_BASE}/api/charges-config`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name?.trim(),
          description: form.description,
          pelletingFeeType: form.pelletingFeeType,
          pelletingFee: nz(form.pelletingFee),
          systemFeePercent: nz(form.systemFeePercent),
          formulationFeeType: form.formulationFeeType,
          formulationFee: nz(form.formulationFee),
          active: !!form.active,
          archived: !!form.archived,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Save failed");
      }

      setOk("Saved.");
      if (!isEdit) {
        const saved = await res.json();
        navigate(`/finance/config/${saved.id}/edit`, { replace: true });
      } else {
        // stay on page; you can also navigate back to list if you prefer
      }
    } catch (e) {
      setErr(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4 text-sm text-gray-600">Loading…</div>;

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="mb-4 sm:mb-6 flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{isEdit ? "Edit Fee Configuration" : "New Fee Configuration"}</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/finance/config")} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
            Back to List
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {err && <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</div>}
      {ok && <div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{ok}</div>}

      <div className="grid gap-4">
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 sm:p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
              <input
                value={form.name}
                onChange={(e) => change("name", e.target.value)}
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. Default 2025"
              />
            </div>
            <div className="flex items-center gap-6 pt-6 sm:pt-0">
              <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                <input
                  type="checkbox"
                  checked={!!form.active}
                  onChange={() => change("active", !form.active)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                />
                Active
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                <input
                  type="checkbox"
                  checked={!!form.archived}
                  onChange={() => change("archived", !form.archived)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                />
                Archived
              </label>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => change("description", e.target.value)}
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={2}
                placeholder="Notes…"
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 sm:p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Pelleting Fee</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Basis</label>
              <select
                value={form.pelletingFeeType}
                onChange={(e) => change("pelletingFeeType", e.target.value)}
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {BASIS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Value</label>
              <input
                type="number"
                step="0.01"
                value={form.pelletingFee}
                onChange={(e) => change("pelletingFee", e.target.valueAsNumber)}
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={form.pelletingFeeType === "PER_KG" ? "Rs.  per kg" : "Rs.  per batch"}
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 sm:p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">System Fee</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Basis</label>
              <input value="% of product value" readOnly className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Percent (%)</label>
              <input
                type="number"
                step="0.01"
                value={form.systemFeePercent}
                onChange={(e) => change("systemFeePercent", e.target.valueAsNumber)}
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0 - 100"
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 sm:p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Formulation Fee</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Basis</label>
              <select
                value={form.formulationFeeType}
                onChange={(e) => change("formulationFeeType", e.target.value)}
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {BASIS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Value</label>
              <input
                type="number"
                step="0.01"
                value={form.formulationFee}
                onChange={(e) => change("formulationFee", e.target.valueAsNumber)}
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={form.formulationFeeType === "PER_KG" ? "Rs.  per kg" : "Rs.  per batch"}
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 sm:p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Preview Calculator</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Quantity (kg)</label>
              <input
                type="number"
                step="0.01"
                value={preview.quantityKg}
                onChange={(e) => setPreview((s) => ({ ...s, quantityKg: e.target.valueAsNumber }))}
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Unit Price (Rs. /kg)</label>
              <input
                type="number"
                step="0.01"
                value={preview.unitPricePerKg}
                onChange={(e) => setPreview((s) => ({ ...s, unitPricePerKg: e.target.valueAsNumber }))}
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="text-sm grid gap-1">
            <div className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2">
              <span className="text-gray-600">Pelleting Fee</span>
              <span className="font-medium">Rs.  {breakdown.pelleting.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2">
              <span className="text-gray-600">System Fee</span>
              <span className="font-medium">Rs.  {breakdown.system.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2">
              <span className="text-gray-600">Formulation Fee</span>
              <span className="font-medium">Rs.  {breakdown.formulation.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-gray-300 bg-gray-50 px-3 py-2">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-semibold text-gray-900">Rs.  {breakdown.total.toFixed(2)}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

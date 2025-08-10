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
    <div className="p-4 max-w-3xl">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{isEdit ? "Edit Fee Configuration" : "New Fee Configuration"}</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/finance/config")} className="px-3 py-1 rounded border text-sm">
            Back to List
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-3 py-1 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {err && <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{err}</div>}
      {ok && <div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">{ok}</div>}

      <div className="grid gap-4">
        <section className="border rounded-lg p-4">
          <h2 className="font-medium mb-2">Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Name *</label>
              <input
                value={form.name}
                onChange={(e) => change("name", e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm"
                placeholder="e.g. Default 2025"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!form.active}
                  onChange={() => change("active", !form.active)}
                />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!form.archived}
                  onChange={() => change("archived", !form.archived)}
                />
                Archived
              </label>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => change("description", e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm"
                rows={2}
                placeholder="Notes…"
              />
            </div>
          </div>
        </section>

        <section className="border rounded-lg p-4">
          <h2 className="font-medium mb-2">Pelleting Fee</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Basis</label>
              <select
                value={form.pelletingFeeType}
                onChange={(e) => change("pelletingFeeType", e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm"
              >
                {BASIS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Value</label>
              <input
                type="number"
                step="0.01"
                value={form.pelletingFee}
                onChange={(e) => change("pelletingFee", e.target.valueAsNumber)}
                className="w-full border rounded px-2 py-1 text-sm"
                placeholder={form.pelletingFeeType === "PER_KG" ? "₹ per kg" : "₹ per batch"}
              />
            </div>
          </div>
        </section>

        <section className="border rounded-lg p-4">
          <h2 className="font-medium mb-2">System Fee</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs text-gray-600 mb-1">Basis</label>
              <input value="% of product value" readOnly className="w-full border rounded px-2 py-1 text-sm bg-gray-50" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Percent (%)</label>
              <input
                type="number"
                step="0.01"
                value={form.systemFeePercent}
                onChange={(e) => change("systemFeePercent", e.target.valueAsNumber)}
                className="w-full border rounded px-2 py-1 text-sm"
                placeholder="0 - 100"
              />
            </div>
          </div>
        </section>

        <section className="border rounded-lg p-4">
          <h2 className="font-medium mb-2">Formulation Fee</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Basis</label>
              <select
                value={form.formulationFeeType}
                onChange={(e) => change("formulationFeeType", e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm"
              >
                {BASIS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Value</label>
              <input
                type="number"
                step="0.01"
                value={form.formulationFee}
                onChange={(e) => change("formulationFee", e.target.valueAsNumber)}
                className="w-full border rounded px-2 py-1 text-sm"
                placeholder={form.formulationFeeType === "PER_KG" ? "₹ per kg" : "₹ per batch"}
              />
            </div>
          </div>
        </section>

        <section className="border rounded-lg p-4">
          <h2 className="font-medium mb-2">Preview Calculator</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Quantity (kg)</label>
              <input
                type="number"
                step="0.01"
                value={preview.quantityKg}
                onChange={(e) => setPreview((s) => ({ ...s, quantityKg: e.target.valueAsNumber }))}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Unit Price (₹/kg)</label>
              <input
                type="number"
                step="0.01"
                value={preview.unitPricePerKg}
                onChange={(e) => setPreview((s) => ({ ...s, unitPricePerKg: e.target.valueAsNumber }))}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
          </div>
          <div className="text-sm grid gap-1">
            <div>Pelleting Fee: ₹ {breakdown.pelleting.toFixed(2)}</div>
            <div>System Fee: ₹ {breakdown.system.toFixed(2)}</div>
            <div>Formulation Fee: ₹ {breakdown.formulation.toFixed(2)}</div>
            <div className="font-semibold">Total: ₹ {breakdown.total.toFixed(2)}</div>
          </div>
        </section>
      </div>
    </div>
  );
}

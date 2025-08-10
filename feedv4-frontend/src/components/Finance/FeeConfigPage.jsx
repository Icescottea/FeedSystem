import React, { useEffect, useMemo, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

// Enum options
const BASIS = [
  { label: "Per Kg", value: "PER_KG" },
  { label: "Per Batch (fixed)", value: "PER_BATCH" },
];

const numberOrZero = (v) => (v === null || v === undefined || v === "" ? 0 : Number(v));

export default function FeeConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  // The config being edited
  const [cfg, setCfg] = useState({
    id: null,
    pelletingFeeType: "PER_KG",
    pelletingFee: 0,
    formulationFeeType: "PER_KG",
    formulationFee: 0,
    systemFeePercent: 0,
    active: true,
    lastUpdated: null,
  });

  // Preview calculator inputs
  const [preview, setPreview] = useState({
    quantityKg: 1000,
    unitPricePerKg: 20,
  });

  // Derived preview math
  const breakdown = useMemo(() => {
    const qty = numberOrZero(preview.quantityKg);
    const price = numberOrZero(preview.unitPricePerKg);

    const pelleting =
      cfg.pelletingFeeType === "PER_KG"
        ? qty * numberOrZero(cfg.pelletingFee)
        : numberOrZero(cfg.pelletingFee);

    const systemBase = qty * price;
    const system = (numberOrZero(cfg.systemFeePercent) / 100.0) * systemBase;

    const formulation =
      cfg.formulationFeeType === "PER_KG"
        ? qty * numberOrZero(cfg.formulationFee)
        : numberOrZero(cfg.formulationFee);

    const total = pelleting + system + formulation;

    return { pelleting, system, formulation, total };
  }, [cfg, preview]);

  // Load effective config
  useEffect(() => {
    let canceled = false;
    (async () => {
      setLoading(true);
      setError("");
      setOk("");
      try {
        // Try effective first
        let res = await fetch(`${API_BASE}/api/charges-config/effective`);
        if (res.status === 404) {
          // No config yet — try list, or fall back to defaults
          const listRes = await fetch(`${API_BASE}/api/charges-config`);
          if (listRes.ok) {
            const list = await listRes.json();
            if (Array.isArray(list) && list.length) {
              const latest = list.sort(
                (a, b) =>
                  new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0)
              )[0];
              if (!canceled) setCfg(latest);
            } else {
              if (!canceled)
                setCfg((s) => ({ ...s, id: null })); // brand new
            }
          } else {
            if (!canceled)
              setCfg((s) => ({ ...s, id: null })); // brand new
          }
        } else if (res.ok) {
          const effective = await res.json();
          if (!canceled) setCfg(effective);
        } else {
          throw new Error(`Failed to load config (${res.status})`);
        }
      } catch (e) {
        if (!canceled) setError("Failed to load fee configuration");
        // still show defaults so user can create one
      } finally {
        if (!canceled) setLoading(false);
      }
    })();
    return () => {
      canceled = true;
    };
  }, []);

  const handleChange = (key, val) => {
    setCfg((s) => ({ ...s, [key]: val }));
  };

  const handlePreviewChange = (key, val) => {
    setPreview((s) => ({ ...s, [key]: val }));
  };

  const validate = () => {
    const errs = [];
    if (cfg.systemFeePercent < 0 || cfg.systemFeePercent > 100)
      errs.push("System fee percent must be between 0 and 100.");
    if (cfg.pelletingFee < 0) errs.push("Pelleting fee cannot be negative.");
    if (cfg.formulationFee < 0) errs.push("Formulation fee cannot be negative.");
    if (!cfg.pelletingFeeType) errs.push("Select pelleting fee basis.");
    if (!cfg.formulationFeeType) errs.push("Select formulation fee basis.");
    return errs;
  };

  const save = async () => {
    setSaving(true);
    setError("");
    setOk("");
    try {
      const errs = validate();
      if (errs.length) {
        setError(errs.join(" "));
        return;
      }
      const method = cfg.id ? "PUT" : "POST";
      const url = cfg.id
        ? `${API_BASE}/api/charges-config/${cfg.id}`
        : `${API_BASE}/api/charges-config`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pelletingFeeType: cfg.pelletingFeeType,
          pelletingFee: numberOrZero(cfg.pelletingFee),
          formulationFeeType: cfg.formulationFeeType,
          formulationFee: numberOrZero(cfg.formulationFee),
          systemFeePercent: numberOrZero(cfg.systemFeePercent),
          active: !!cfg.active,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Save failed");
      }

      const saved = await res.json();
      setCfg(saved);
      setOk("Saved.");
    } catch (e) {
      setError(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async () => {
    if (!cfg.id) return;
    setSaving(true);
    setError("");
    setOk("");
    try {
      const res = await fetch(
        `${API_BASE}/api/charges-config/${cfg.id}/active?active=${!cfg.active}`,
        { method: "PATCH" }
      );
      if (!res.ok) throw new Error("Failed to toggle active");
      const updated = await res.json();
      setCfg(updated);
      setOk(updated.active ? "Activated." : "Deactivated.");
    } catch (e) {
      setError(e.message || "Toggle failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-sm text-gray-600">Loading fee configuration…</div>
    );
  }

  return (
    <div className="p-4 max-w-3xl">
      <h1 className="text-xl font-semibold mb-3">Fee Configuration (Global)</h1>

      {error && (
        <div className="mb-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm p-2">
          {error}
        </div>
      )}
      {ok && (
        <div className="mb-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm p-2">
          {ok}
        </div>
      )}

      <div className="grid gap-4">
        <section className="border rounded-lg p-4">
          <h2 className="font-medium mb-2">Pelleting Fee</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Basis</label>
              <select
                value={cfg.pelletingFeeType}
                onChange={(e) => handleChange("pelletingFeeType", e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm"
              >
                {BASIS.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Value</label>
              <input
                type="number"
                step="0.01"
                value={cfg.pelletingFee}
                onChange={(e) =>
                  handleChange("pelletingFee", e.target.valueAsNumber)
                }
                className="w-full border rounded px-2 py-1 text-sm"
                placeholder={cfg.pelletingFeeType === "PER_KG" ? "₹ per kg" : "₹ per batch"}
              />
            </div>
          </div>
        </section>

        <section className="border rounded-lg p-4">
          <h2 className="font-medium mb-2">System Fee</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs text-gray-600 mb-1">Basis</label>
              <input
                disabled
                className="w-full border rounded px-2 py-1 text-sm bg-gray-50"
                value="% of product value"
                readOnly
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Percent (%)</label>
              <input
                type="number"
                step="0.01"
                value={cfg.systemFeePercent}
                onChange={(e) =>
                  handleChange("systemFeePercent", e.target.valueAsNumber)
                }
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
                value={cfg.formulationFeeType}
                onChange={(e) =>
                  handleChange("formulationFeeType", e.target.value)
                }
                className="w-full border rounded px-2 py-1 text-sm"
              >
                {BASIS.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Value</label>
              <input
                type="number"
                step="0.01"
                value={cfg.formulationFee}
                onChange={(e) =>
                  handleChange("formulationFee", e.target.valueAsNumber)
                }
                className="w-full border rounded px-2 py-1 text-sm"
                placeholder={cfg.formulationFeeType === "PER_KG" ? "₹ per kg" : "₹ per batch"}
              />
            </div>
          </div>
        </section>

        <section className="border rounded-lg p-4">
          <h2 className="font-medium mb-2">Preview Calculator</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Quantity (kg)</label>
              <input
                type="number"
                step="0.01"
                value={preview.quantityKg}
                onChange={(e) =>
                  handlePreviewChange("quantityKg", e.target.valueAsNumber)
                }
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Unit Price (₹/kg)</label>
              <input
                type="number"
                step="0.01"
                value={preview.unitPricePerKg}
                onChange={(e) =>
                  handlePreviewChange("unitPricePerKg", e.target.valueAsNumber)
                }
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

        <section className="border rounded-lg p-4 flex items-center justify-between">
          <div className="text-xs text-gray-600">
            Last updated: {cfg.lastUpdated ? new Date(cfg.lastUpdated).toLocaleString() : "—"}
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!cfg.active}
                onChange={toggleActive}
              />
              Active
            </label>
            <button
              disabled={saving}
              onClick={save}
              className="px-3 py-1 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

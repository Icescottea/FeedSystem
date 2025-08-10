import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

export default function FeeConfigList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [active, setActive] = useState("");     // "", "true", "false"
  const [archived, setArchived] = useState(""); // "", "true", "false"
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const fetchList = async () => {
    setLoading(true);
    setErr("");
    setOk("");
    try {
      const params = new URLSearchParams();
      if (q) params.append("q", q);
      if (active !== "") params.append("active", active);
      if (archived !== "") params.append("archived", archived);

      const res = await fetch(`${API_BASE}/api/charges-config/list?${params.toString()}`);
      if (!res.ok) throw new Error(`Failed to load list (${res.status})`);
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Failed to load list");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); /* eslint-disable-next-line */ }, []);

  const onSearch = (e) => {
    e.preventDefault();
    fetchList();
  };

  const confirm = async (message) => window.confirm(message);

  const duplicate = async (id) => {
    if (!await confirm("Duplicate this configuration?")) return;
    setOk(""); setErr("");
    const res = await fetch(`${API_BASE}/api/charges-config/${id}/duplicate`, { method: "POST" });
    if (res.ok) {
      setOk("Duplicated.");
      fetchList();
    } else {
      setErr("Duplicate failed");
    }
  };

  const toggleActive = async (id, current) => {
    setOk(""); setErr("");
    const res = await fetch(`${API_BASE}/api/charges-config/${id}/active?active=${!current}`, { method: "PATCH" });
    if (res.ok) {
      setOk(!current ? "Activated." : "Deactivated.");
      fetchList();
    } else {
      setErr("Toggle active failed");
    }
  };

  const toggleArchive = async (id, current) => {
    if (!await confirm(current ? "Unarchive this configuration?" : "Archive this configuration?")) return;
    setOk(""); setErr("");
    const res = await fetch(`${API_BASE}/api/charges-config/${id}/archive?archived=${!current}`, { method: "PATCH" });
    if (res.ok) {
      setOk(!current ? "Archived." : "Unarchived.");
      fetchList();
    } else {
      setErr("Archive toggle failed");
    }
  };

  const hardDelete = async (id) => {
    if (!await confirm("Permanently delete this configuration? This cannot be undone.")) return;
    setOk(""); setErr("");
    const res = await fetch(`${API_BASE}/api/charges-config/${id}`, { method: "DELETE" });
    if (res.ok || res.status === 204) {
      setOk("Deleted.");
      fetchList();
    } else {
      setErr("Delete failed");
    }
  };

  const fmtBasisValue = (basis, value) => {
    if (!basis) return "-";
    if (basis === "PER_KG") return `₹/kg: ${Number(value ?? 0).toFixed(2)}`;
    return `Fixed: ₹${Number(value ?? 0).toFixed(2)}`;
    };

  const shownRows = useMemo(() => rows, [rows]);

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Fee Configurations</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/finance/fee-configs/new")}
            className="px-3 py-1 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700"
          >
            New Fee Config
          </button>
        </div>
      </div>

      <form onSubmit={onSearch} className="mb-3 grid grid-cols-1 md:grid-cols-6 gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name/description"
          className="md:col-span-3 border rounded px-2 py-1 text-sm"
        />
        <select
          value={active}
          onChange={(e) => setActive(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="">Active: All</option>
          <option value="true">Active: Yes</option>
          <option value="false">Active: No</option>
        </select>
        <select
          value={archived}
          onChange={(e) => setArchived(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="">Archived: All</option>
          <option value="false">Archived: No</option>
          <option value="true">Archived: Yes</option>
        </select>
        <button className="px-3 py-1 rounded bg-gray-800 text-white text-sm">Filter</button>
      </form>

      {err && <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{err}</div>}
      {ok && <div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">{ok}</div>}

      <div className="bg-white border rounded-lg shadow-sm overflow-x-auto">
        <table className="min-w-[1100px] w-full table-auto text-sm">
          <thead className="bg-gray-100 text-xs text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Pelleting</th>
              <th className="px-3 py-2 text-left">System %</th>
              <th className="px-3 py-2 text-left">Formulation</th>
              <th className="px-3 py-2 text-left">Active</th>
              <th className="px-3 py-2 text-left">Archived</th>
              <th className="px-3 py-2 text-left">Updated</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-3 py-3" colSpan={8}>Loading…</td></tr>
            ) : shownRows.length === 0 ? (
              <tr><td className="px-3 py-3" colSpan={8}>No configurations found.</td></tr>
            ) : shownRows.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-gray-500 truncate max-w-[320px]">{r.description || "—"}</div>
                </td>
                <td className="px-3 py-2">{fmtBasisValue(r.pelletingFeeType, r.pelletingFee)}</td>
                <td className="px-3 py-2">{Number(r.systemFeePercent ?? 0).toFixed(2)}%</td>
                <td className="px-3 py-2">{fmtBasisValue(r.formulationFeeType, r.formulationFee)}</td>
                <td className="px-3 py-2">{r.active ? "Yes" : "No"}</td>
                <td className="px-3 py-2">{r.archived ? "Yes" : "No"}</td>
                <td className="px-3 py-2">{r.updatedAt ? new Date(r.updatedAt).toLocaleString() : "—"}</td>
                <td className="px-3 py-2 whitespace-nowrap text-xs">
                  <button onClick={() => navigate(`/finance/fee-configs/${r.id}/edit`)} className="text-indigo-600 hover:underline mr-2">Edit</button>
                  <button onClick={() => duplicate(r.id)} className="text-pink-600 hover:underline mr-2">Duplicate</button>
                  <button onClick={() => toggleActive(r.id, r.active)} className="text-blue-600 hover:underline mr-2">
                    {r.active ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => toggleArchive(r.id, r.archived)} className="text-yellow-600 hover:underline mr-2">
                    {r.archived ? "Unarchive" : "Archive"}
                  </button>
                  <button onClick={() => hardDelete(r.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

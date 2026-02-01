import React, { useEffect, useMemo, useState, useCallback } from "react";
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

  const fetchList = useCallback(async () => {
    setErr("");
    setOk("");
    try {
      setLoading(true);
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
  }, []);

  useEffect(() => { 
    fetchList(); 
  }, [fetchList]);

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
    if (basis === "PER_KG") return `Rs. /kg: ${Number(value ?? 0).toFixed(2)}`;
    return `Fixed: Rs. ${Number(value ?? 0).toFixed(2)}`;
  };

  const shownRows = useMemo(() => rows, [rows]);

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 sm:mb-6 flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Fee Configurations</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/finance/config/new")}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            New Fee Config
          </button>
        </div>
      </div>

      <form onSubmit={onSearch} className="mb-4 rounded-xl border border-gray-200 bg-white p-3 sm:p-4 shadow-sm grid grid-cols-1 md:grid-cols-6 gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name/description"
          className="md:col-span-3 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <select
          value={active}
          onChange={(e) => setActive(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Active: All</option>
          <option value="true">Active: Yes</option>
          <option value="false">Active: No</option>
        </select>
        <select
          value={archived}
          onChange={(e) => setArchived(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Archived: All</option>
          <option value="false">Archived: No</option>
          <option value="true">Archived: Yes</option>
        </select>
        <button className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900">
          Filter
        </button>
      </form>

      {err && <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</div>}
      {ok && <div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{ok}</div>}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-[1100px] w-full table-auto text-sm text-gray-800">
          <thead className="bg-gray-50 text-xs text-gray-600 sticky top-0 z-10">
            <tr className="divide-x divide-gray-200">
              <th className="px-3 py-2 text-left font-semibold">Name</th>
              <th className="px-3 py-2 text-left font-semibold">Pelleting</th>
              <th className="px-3 py-2 text-left font-semibold">System %</th>
              <th className="px-3 py-2 text-left font-semibold">Formulation</th>
              <th className="px-3 py-2 text-left font-semibold">Active</th>
              <th className="px-3 py-2 text-left font-semibold">Archived</th>
              <th className="px-3 py-2 text-left font-semibold">Updated</th>
              <th className="px-3 py-2 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td className="px-3 py-6 text-gray-600" colSpan={8}>Loading…</td></tr>
            ) : shownRows.length === 0 ? (
              <tr><td className="px-3 py-6 text-gray-600" colSpan={8}>No configurations found.</td></tr>
            ) : shownRows.map((r) => (
              <tr key={r.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
                <td className="px-3 py-3 align-top">
                  <div className="font-medium text-gray-900">{r.name}</div>
                  <div className="text-xs text-gray-500 truncate max-w-[320px]">{r.description || "—"}</div>
                </td>
                <td className="px-3 py-3 align-top">{fmtBasisValue(r.pelletingFeeType, r.pelletingFee)}</td>
                <td className="px-3 py-3 align-top">{Number(r.systemFeePercent ?? 0).toFixed(2)}%</td>
                <td className="px-3 py-3 align-top">{fmtBasisValue(r.formulationFeeType, r.formulationFee)}</td>
                <td className="px-3 py-3 align-top">{r.active ? "Yes" : "No"}</td>
                <td className="px-3 py-3 align-top">{r.archived ? "Yes" : "No"}</td>
                <td className="px-3 py-3 align-top whitespace-nowrap">{r.updatedAt ? new Date(r.updatedAt).toLocaleString() : "—"}</td>
                <td className="px-3 py-3 align-top whitespace-nowrap text-xs">
                  <button onClick={() => navigate(`/finance/config/${r.id}/edit`)} className="mr-2 rounded-md px-2 py-1 font-medium text-indigo-600 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">Edit</button>
                  <button onClick={() => duplicate(r.id)} className="mr-2 rounded-md px-2 py-1 font-medium text-pink-600 hover:bg-pink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500">Duplicate</button>
                  <button onClick={() => toggleActive(r.id, r.active)} className="mr-2 rounded-md px-2 py-1 font-medium text-blue-600 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                    {r.active ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => toggleArchive(r.id, r.archived)} className="mr-2 rounded-md px-2 py-1 font-medium text-yellow-700 hover:bg-yellow-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500">
                    {r.archived ? "Unarchive" : "Archive"}
                  </button>
                  <button onClick={() => hardDelete(r.id)} className="rounded-md px-2 py-1 font-medium text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

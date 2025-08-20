import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import FormulationEditForm from '../components/FormulationEditForm';
import { showToast } from '../components/toast';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const FormulationLibraryPage = () => {
  const [formulations, setFormulations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [compareSet, setCompareSet] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [tagFilter, setTagFilter] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  const navigate = useNavigate();

  const fetchFormulations = () => {
    const url = showArchived ? `${API_BASE}/api/formulations/all` : `${API_BASE}/api/formulations`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setFormulations(data || []);
      })
      .catch(err => {
        console.error('Fetch failed:', err);
        setFormulations([]);
      });
  };

  useEffect(() => {
    fetchFormulations();
  }, [showArchived]);

  useEffect(() => {
  let list = [...formulations];

  if (!showArchived) {
    list = list.filter(f => f.status !== 'Archived');
  }

  if (statusFilter !== 'All') {
    list = list.filter(f => f.status === statusFilter);
  }

  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    list = list.filter(f =>
      f.name.toLowerCase().includes(term) ||
      (f.tags || []).some(tag => tag.toLowerCase().includes(term)) ||
      (f.notes || '').toLowerCase().includes(term)
    );
  }

  if (tagFilter) {
    list = list.filter(f => f.tags?.includes(tagFilter));
  }

  setFiltered(list);
}, [searchTerm, statusFilter, formulations, tagFilter, showArchived]);

  const toggleCompare = (id) => {
    setCompareSet(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleDuplicate = async (id) => {
    const original = formulations.find(f => f.id === id);
    if (!original) return showToast('Original formulation not found.', 'error');

    const profileId = original.feedProfile?.id;
    if (!profileId) return showToast('Invalid profile in original formulation.', 'error');

    const payload = {
      profileId,
      batchSize: original.batchSize,
      strategy: (original.strategy || '').split(',').map(s => s.trim()),
      lockedIngredients: [],
      name: original.name + ' (Copy)'
    };

    try {
      const res = await fetch(`${API_BASE}/api/formulations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to duplicate');

      showToast('Formulation duplicated!', 'success');
      fetchFormulations();
    } catch (err) {
      console.error('❌ Duplicate failed:', err);
      showToast('Duplicate failed. Check console.', 'error');
    }
  };

  const handleExportPDF = async (f) => {
    try {
      const response = await fetch(`/api/formulations/${f.id}/export/pdf`, {
        method: "GET",
        headers: {
          "Accept": "application/pdf",
        },
      });
    
      if (!response.ok) throw new Error("Failed to download PDF");
    
      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${f.name}_v${f.version}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Export failed", error);
    }
  };

  const handleExportExcel = (f) => {
    const wsData = [
      ['Name', 'Status', 'Version', 'Cost/kg'],
      [f.name, f.status, f.version, f.costPerKg || 'N/A'],
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Formulation');
    XLSX.writeFile(workbook, `${f.name}.xlsx`);
  };

  const handleUnarchive = async (id) => {
    await fetch(`${API_BASE}/api/formulations/${id}/unarchive`, { method: 'PUT' });
    showToast('Formulation unarchived!');
    fetchFormulations();
  };

  const handleUnfinalize = async (id) => {
    await fetch(`${API_BASE}/api/formulations/${id}/unfinalize`, { method: 'PUT' });
    showToast('Marked as draft.');
    fetchFormulations();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this formulation?")) {
      await fetch(`${API_BASE}/api/formulations/${id}`, { method: 'DELETE' });
      showToast('Deleted!');
      fetchFormulations();
    }
  };

  const handleArchive = async (id) => {
    await fetch(`${API_BASE}/api/formulations/${id}/archive`, { method: 'PUT' });
    showToast('Archived!');
    fetchFormulations();
  };

  const handleFinalize = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/formulations/${id}/finalize`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) throw new Error('Failed to finalize');

      showToast('Finalized! Redirecting to Pelleting Queue...');

      setTimeout(() => {
        navigate('/pelleting');
      }, 2000);

    } catch (err) {
      showToast('Error finalizing formulation');
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-full mx-auto p-4 text-xs text-gray-800 overflow-x-hidden">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">📚 Formulation Library</h1>
        {tagFilter && (
          <button
            className="text-xs text-blue-600 underline"
            onClick={() => setTagFilter(null)}
          >
            Clear tag filter: {tagFilter}
          </button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md text-sm w-64"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md text-sm"
        >
          <option value="All">All</option>
          <option value="Draft">Draft</option>
          <option value="Finalized">Finalized</option>
          <option value="Archived">Archived</option>
        </select>
        <button
          onClick={() => setShowArchived(s => !s)}
          className={`px-3 py-1 rounded ${
            showArchived ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
          }`}
        >
          {showArchived ? 'Hide Archived' : 'Show Archived'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md border p-4 overflow-hidden" style={{ maxWidth: 'calc(100vw - 298px)' }}>
        <div className="overflow-x-auto">
          <table className="min-w-[1200px] table-auto text-xs text-left">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-3 py-2">✓</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Version</th>
                <th className="px-3 py-2">Cost/kg</th>
                <th className="px-3 py-2">Finalized</th>
                <th className="px-3 py-2">Locked</th>
                <th className="px-3 py-2">Notes</th>
                <th className="px-3 py-2">Tags</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <tr key={f.id} className={`border-t hover:bg-gray-50 ${f.status === 'Archived' ? 'bg-gray-200 text-gray-500' : ''}`}>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={compareSet.includes(f.id)}
                      onChange={() => toggleCompare(f.id)}
                    />
                  </td>
                  <td className="px-3 py-2">{f.name}</td>
                  <td className="px-3 py-2">{f.status}</td>
                  <td className="px-3 py-2">{f.version}</td>
                  <td className="px-3 py-2">{f.costPerKg?.toFixed(2) || 'N/A'}</td>
                  <td className="px-3 py-2">{f.finalized ? 'Yes' : 'No'}</td>
                  <td className="px-3 py-2">{f.locked ? 'Yes' : 'No'}</td>
                  <td className="px-3 py-2 max-w-[200px] truncate">{f.notes || '-'}</td>
                  <td className="px-3 py-2">
                    {(f.tags || []).map(tag => (
                      <span
                        key={tag}
                        onClick={() => setTagFilter(tag)}
                        className="inline-block bg-blue-100 text-blue-800 px-2 py-1 mr-1 mb-1 rounded-full cursor-pointer hover:bg-blue-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <button onClick={() => setEditingId(f.id)} className="text-blue-600 hover:underline px-1">Edit</button>
                      <button onClick={() => handleDuplicate(f.id)} className="text-purple-600 hover:underline px-1">Duplicate</button>
                      <button onClick={() => handleExportPDF(f)} className="text-red-600 hover:underline px-1">PDF</button>
                      <button onClick={() => handleExportExcel(f)} className="text-green-600 hover:underline px-1">Excel</button>
                      {f.status === 'Archived' ? (
                        <button onClick={() => handleUnarchive(f.id)} className="text-yellow-600 hover:underline px-1">Unarchive</button>
                      ) : (
                        <>
                          <button onClick={() => handleArchive(f.id)} className="text-yellow-600 hover:underline px-1">Archive</button>
                          <button onClick={() => handleDelete(f.id)} className="text-red-600 hover:underline px-1">Delete</button>
                          {!f.finalized && (
                            <button onClick={() => handleFinalize(f.id)} className="text-indigo-600 hover:underline px-1">Finalize</button>
                          )}
                        </>
                      )}
                      {f.finalized && (
                        <button onClick={() => handleUnfinalize(f.id)} className="text-indigo-600 hover:underline px-1">Unfinalize</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingId && (
        <div className="mt-10">
          <FormulationEditForm
            formulationId={editingId}
            onClose={() => setEditingId(null)}
            onSaved={() => {
              fetchFormulations();
              setEditingId(null);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default FormulationLibraryPage;

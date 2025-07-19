import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

const FormulationLibraryPage = () => {
  const [formulations, setFormulations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [compareSet, setCompareSet] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/formulations')
      .then(res => res.json())
      .then(data => {
        setFormulations(data);
        setFiltered(data);
      });
  }, []);

  useEffect(() => {
    let filteredList = formulations;

    if (statusFilter !== 'All') {
      filteredList = filteredList.filter(f => f.status === statusFilter);
    }

    if (searchTerm.trim()) {
      filteredList = filteredList.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFiltered(filteredList);
  }, [searchTerm, statusFilter, formulations]);

  const handleEdit = (id) => navigate(`/formulations/builder/${id}`);

  const handleDuplicate = (formulation) => {
    const newFormulation = {
      ...formulation,
      name: `${formulation.name} (Copy)`,
      id: null,
      finalized: false,
      locked: false,
      status: 'Draft',
    };
    fetch('/api/formulations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFormulation),
    })
      .then(res => res.json())
      .then((created) => {
        navigate(`/formulations/builder/${created.id}`);
      });
  };

  const handleExportPDF = (formulation) => {
    const doc = new jsPDF();
    doc.text(`Formulation: ${formulation.name}`, 10, 10);
    doc.text(`Status: ${formulation.status}`, 10, 20);
    doc.text(`Version: ${formulation.version}`, 10, 30);
    doc.text(`Cost/kg: ${formulation.costPerKg || 'N/A'}`, 10, 40);
    doc.save(`${formulation.name}.pdf`);
  };

  const handleExportExcel = (formulation) => {
    const wsData = [
      ['Name', 'Status', 'Version', 'Cost/kg'],
      [formulation.name, formulation.status, formulation.version, formulation.costPerKg || 'N/A'],
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Formulation');
    XLSX.writeFile(workbook, `${formulation.name}.xlsx`);
  };

  const toggleCompare = (id) => {
    setCompareSet(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleUnarchive = async (id) => {
    await fetch(`/api/formulations/${id}/unarchive`, { method: 'PUT' });
    alert('Formulation unarchived!');
  };

  const handleUnfinalize = async (id) => {
    await fetch(`/api/formulations/${id}/unfinalize`, { method: 'PUT' });
    alert('Formulation marked as draft again.');
  };

  return (
    <div className="w-full max-w-full mx-auto p-4 text-xs text-gray-800 overflow-x-hidden">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">📚 Formulation Library</h1>
      </div>

      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search by name or tag..."
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
      </div>

      <div className="bg-white rounded-lg shadow-md border p-4 overflow-hidden" style={{ maxWidth: 'calc(100vw - 298px)' }}>
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] table-auto text-xs text-left">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-3 py-2">✓</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Version</th>
                <th className="px-3 py-2">Cost/kg</th>
                <th className="px-3 py-2">Finalized</th>
                <th className="px-3 py-2">Locked</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <tr key={f.id} className="border-t hover:bg-gray-50">
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
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex gap-2 text-xs">
                      <button onClick={() => handleEdit(f.id)} className="text-blue-600 hover:underline px-1">Edit</button>
                      <button onClick={() => handleDuplicate(f)} className="text-purple-600 hover:underline px-1">Duplicate</button>
                      <button onClick={() => handleExportPDF(f)} className="text-red-600 hover:underline px-1">PDF</button>
                      <button onClick={() => handleExportExcel(f)} className="text-green-600 hover:underline px-1">Excel</button>
                      {f.status === 'Archived' && (
                        <button onClick={() => handleUnarchive(f.id)} className="text-yellow-600 hover:underline px-1">Undo Archive</button>
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

      {compareSet.length >= 2 && (
        <div className="mt-8 bg-white shadow-md border rounded-md p-4">
          <h2 className="text-sm font-semibold mb-2">Comparison</h2>
          <div className="overflow-x-auto">
            <table className="min-w-[600px] text-xs border">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2 text-left">Field</th>
                  {formulations.filter(f => compareSet.includes(f.id)).map(f => (
                    <th key={f.id} className="px-3 py-2 text-left">{f.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['status', 'version', 'costPerKg', 'finalized', 'locked'].map(field => (
                  <tr key={field} className="border-t">
                    <td className="px-3 py-2 capitalize">{field.replace('costPerKg', 'Cost/kg')}</td>
                    {formulations.filter(f => compareSet.includes(f.id)).map(f => (
                      <td key={f.id} className="px-3 py-2">
                        {field === 'costPerKg'
                          ? (f[field]?.toFixed(2) || 'N/A')
                          : typeof f[field] === 'boolean'
                            ? (f[field] ? 'Yes' : 'No')
                            : f[field]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormulationLibraryPage;

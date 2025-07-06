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

  const handleEdit = (id) => {
    navigate(`/formulations/builder/${id}`);
  };

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

  const renderComparison = () => {
    const items = formulations.filter(f => compareSet.includes(f.id));
    if (items.length < 2) return null;

    return (
      <div style={{ marginTop: '20px' }}>
        <h3>Comparison</h3>
        <table border={1}>
          <thead>
            <tr>
              <th>Field</th>
              {items.map(f => <th key={f.id}>{f.name}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Status</td>
              {items.map(f => <td key={f.id}>{f.status}</td>)}
            </tr>
            <tr>
              <td>Version</td>
              {items.map(f => <td key={f.id}>{f.version}</td>)}
            </tr>
            <tr>
              <td>Cost/kg</td>
              {items.map(f => <td key={f.id}>{f.costPerKg?.toFixed(2) || 'N/A'}</td>)}
            </tr>
            <tr>
              <td>Finalized</td>
              {items.map(f => <td key={f.id}>{f.finalized ? 'Yes' : 'No'}</td>)}
            </tr>
            <tr>
              <td>Locked</td>
              {items.map(f => <td key={f.id}>{f.locked ? 'Yes' : 'No'}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
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
    <div>
      <h1>📚 Formulation Library</h1>

      <div style={{ marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="Search by name or tag..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="All">All</option>
          <option value="Draft">Draft</option>
          <option value="Finalized">Finalized</option>
          <option value="Archived">Archived</option>
        </select>
      </div>

      <table border={1} cellPadding={6}>
        <thead>
          <tr>
            <th>Compare</th>
            <th>Name</th>
            <th>Status</th>
            <th>Version</th>
            <th>Cost/kg</th>
            <th>Finalized</th>
            <th>Locked</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(f => (
            <tr key={f.id}>
              <td>
                <input
                  type="checkbox"
                  checked={compareSet.includes(f.id)}
                  onChange={() => toggleCompare(f.id)}
                />
              </td>
              <td>{f.name}</td>
              <td>{f.status}</td>
              <td>{f.version}</td>
              <td>{f.costPerKg?.toFixed(2) || 'N/A'}</td>
              <td>{f.finalized ? 'Yes' : 'No'}</td>
              <td>{f.locked ? 'Yes' : 'No'}</td>
              <td>
                <button onClick={() => handleEdit(f.id)}>Edit</button>
                <button onClick={() => handleDuplicate(f)}>Duplicate</button>
                <button onClick={() => handleExportPDF(f)}>PDF</button>
                <button onClick={() => handleExportExcel(f)}>Excel</button>
                {f.status === 'Archived' && (
                  <button onClick={() => handleUnarchive(f.id)}>Undo Archive</button>
                )}
                {f.finalized && (
                  <button onClick={() => handleUnfinalize(f.id)}>Unfinalize</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {renderComparison()}
    </div>
  );
};

export default FormulationLibraryPage;

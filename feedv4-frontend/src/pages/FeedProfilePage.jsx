import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import FeedProfileList from '../components/FeedProfileList';
import FeedProfileForm from '../components/FeedProfileForm';
import CompareProfiles from '../components/CompareProfiles';

const FeedProfilePage = () => {
  const [profiles, setProfiles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [compareIds, setCompareIds] = useState([]);
  const [showArchived, setShowArchived] = useState(false);

  const fetchProfiles = async () => {
    const url = showArchived ? '/api/feed-profiles/all' : '/api/feed-profiles';
    try {
      const res = await fetch(url);
      const data = await res.json();
      setProfiles(data);
    } catch (err) {
      console.error('❌ Failed to fetch profiles:', err);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [showArchived]);

  const refreshAndClose = () => {
    fetchProfiles();
    setShowForm(false);
  };

  const onEdit = (profile) => {
    if (profile?.locked) {
      alert("🔒 This profile is locked and cannot be edited.");
      return;
    }
    setSelected(profile);
    setShowForm(true);
  };

  const onClone = async (id) => {
    const original = profiles.find(p => p.id === id);
    const { id: _, ...clone } = original;
    const res = await fetch('/api/feed-profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...clone, feedName: clone.feedName + ' (Copy)' })
    });
    if (res.ok) fetchProfiles();
  };

  const onArchive = async (id) => {
    await fetch(`/api/feed-profiles/${id}/archive`, { method: 'PUT' });
    fetchProfiles();
  };

  const onToggleLock = async (id) => {
    await fetch(`/api/feed-profiles/${id}/toggle-lock`, { method: 'PUT' });
    fetchProfiles();
  };

  const onDelete = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this profile?');
    if (!confirm) return;
    await fetch(`/api/feed-profiles/${id}`, { method: 'DELETE' });
    fetchProfiles();
  };

  const onCompareToggle = (id) => {
    setCompareIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const onExport = (profile) => {
    const doc = new jsPDF();
    let y = 10;

    doc.setFontSize(16);
    doc.text(`Feed Profile: ${profile.feedName}`, 10, y);
    y += 10;

    const fields = [
      ['Species', profile.species],
      ['Stage', profile.stage],
      ['Protein (%)', profile.protein],
      ['Energy (Kcal/kg)', profile.energy],
      ['Calcium', profile.calcium],
      ['Phosphorus', profile.phosphorus],
      ['Fiber', profile.fiber],
      ['Fat', profile.fat],
      ['Methionine', profile.methionine],
      ['Lysine', profile.lysine],
      ['Max Salt (%)', profile.maxSalt],
      ['Max Fiber (%)', profile.maxFiber],
      ['Preference Strategy', profile.preferenceStrategy],
      ['Tags', (profile.tags || []).join(', ')],
      ['Mandatory Ingredients', (profile.mandatoryIngredients || []).join(', ')],
      ['Restricted Ingredients', (profile.restrictedIngredients || []).join(', ')]
    ];

    fields.forEach(([label, value]) => {
      doc.setFontSize(12);
      doc.text(`${label}: ${value}`, 10, y);
      y += 7;
    });

    doc.save(`${profile.feedName}.pdf`);
  };

  const filteredProfiles = showArchived
    ? profiles
    : profiles.filter(profile => !profile.archived);

  return (
    <div className="w-full max-w-full mx-auto p-4 text-xs text-gray-800 overflow-x-hidden">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Feed Profile Management</h1>
        <div className="flex gap-2">
          <button
            className={`text-sm px-4 py-2 rounded border ${
              showArchived ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'
            }`}
            onClick={() => setShowArchived(prev => !prev)}
          >
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </button>
          {!showForm && (
            <button
              onClick={() => onEdit(null)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1 rounded"
            >
              + Add Profile
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="mb-6 bg-white shadow-md rounded-md p-6">
          <FeedProfileForm
            profile={selected}
            onSuccess={refreshAndClose}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="mb-6">
        <FeedProfileList
          profile={filteredProfiles}
          profiles={profiles}
          compareIds={compareIds}
          onEdit={onEdit}
          onClone={onClone}
          onArchive={onArchive}
          onLock={onToggleLock}
          onDelete={onDelete}
          onCompareToggle={onCompareToggle}
          onExport={onExport}
        />
      </div>

      {compareIds.length === 2 && (
        <div className="bg-white shadow-md rounded-md p-6">
          <CompareProfiles
            a={profiles.find(p => p.id === compareIds[0])}
            b={profiles.find(p => p.id === compareIds[1])}
          />
        </div>
      )}
    </div>
  );
};

export default FeedProfilePage;

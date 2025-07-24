import React from 'react';

const FeedProfileList = ({
  profiles,
  compareIds,
  onEdit,
  onClone,
  onArchive,
  onLock,
  onDelete,
  onCompareToggle,
  onExport
}) => {
  if (!profiles.length) {
    return (
      <p className="text-gray-500 italic mt-4">
        No feed profiles found.
      </p>
    );
  }

  return (
    <div
      className="bg-white rounded-lg shadow-md border p-4 overflow-hidden"
      style={{ maxWidth: 'calc(100vw - 298px)' }}
    >
      <div className="overflow-x-auto">
        <table className="min-w-[1400px] table-auto text-xs text-left">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-3 py-2">✓</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Species</th>
              <th className="px-3 py-2">Stage</th>
              <th className="px-3 py-2">Protein</th>
              <th className="px-3 py-2">Energy</th>
              <th className="px-3 py-2">Ca</th>
              <th className="px-3 py-2">Phos</th>
              <th className="px-3 py-2">Fiber</th>
              <th className="px-3 py-2">Fat</th>
              <th className="px-3 py-2">Methionine</th>
              <th className="px-3 py-2">Lysine</th>
              <th className="px-3 py-2">Max Salt</th>
              <th className="px-3 py-2">Max Fiber</th>
              <th className="px-3 py-2">Mandatory</th>
              <th className="px-3 py-2">Restricted</th>
              <th className="px-3 py-2">Strategy</th>
              <th className="px-3 py-2">Archived</th>
              <th className="px-3 py-2">Locked</th>
              <th className="px-3 py-2">Tags</th>
              <th className="px-3 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <tr
                key={p.id}
                className={`border-t hover:bg-gray-50 whitespace-nowrap ${
                  p.archived ? 'text-gray-400 italic' : 'text-gray-800'
                }`}
              >
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={compareIds.includes(p.id)}
                    onChange={() => onCompareToggle(p.id)}
                  />
                </td>
                <td className="px-3 py-2 truncate max-w-[160px]" title={p.feedName}>{p.feedName}</td>
                <td className="px-3 py-2">{p.species}</td>
                <td className="px-3 py-2">{p.stage}</td>
                <td className="px-3 py-2">{p.protein}%</td>
                <td className="px-3 py-2">{p.energy}</td>
                <td className="px-3 py-2">{p.calcium}</td>
                <td className="px-3 py-2">{p.phosphorus}</td>
                <td className="px-3 py-2">{p.fiber}</td>
                <td className="px-3 py-2">{p.fat}</td>
                <td className="px-3 py-2">{p.methionine}</td>
                <td className="px-3 py-2">{p.lysine}</td>
                <td className="px-3 py-2">{p.maxSalt}</td>
                <td className="px-3 py-2">{p.maxFiber}</td>
                <td className="px-3 py-2 truncate max-w-[120px]" title={p.mandatoryIngredients?.join(', ')}>
                  {p.mandatoryIngredients?.join(', ')}
                </td>
                <td className="px-3 py-2 truncate max-w-[120px]" title={p.restrictedIngredients?.join(', ')}>
                  {p.restrictedIngredients?.join(', ')}
                </td>
                <td className="px-3 py-2">{p.preferenceStrategy}</td>
                <td className="px-3 py-2">{p.archived ? 'Yes' : 'No'}</td>
                <td className="px-3 py-2 text-center">{p.locked ? '🔒' : '—'}</td>
                <td className="px-3 py-2 truncate max-w-[100px]" title={p.tags?.join(', ')}>
                  {p.tags?.join(', ')}
                </td>

                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex gap-2 text-xs">
                    {/* Lock/Unlock always available */}
                    <button
                      onClick={() => onLock(p.id)}
                      className={`px-1 ${p.locked ? 'text-yellow-600' : 'text-green-600'} hover:underline`}
                    >
                      {p.locked ? 'Unlock' : 'Lock'}
                    </button>

                    {/* Disable rest if locked */}
                    <button
                      onClick={() => onEdit(p)}
                      className="text-blue-600 hover:underline px-1 disabled:opacity-30"
                      disabled={p.locked}
                      title={p.locked ? 'Locked' : 'Edit'}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onClone(p.id)}
                      className="text-purple-600 hover:underline px-1 disabled:opacity-30"
                      disabled={p.locked}
                      title={p.locked ? 'Locked' : 'Clone'}
                    >
                      Clone
                    </button>
                    <button
                      onClick={() => onArchive(p.id)}
                      className="text-yellow-600 hover:underline px-1 disabled:opacity-30"
                      disabled={p.locked}
                      title={p.locked ? 'Locked' : 'Archive'}
                    >
                      {p.archived ? 'Unarchive' : 'Archive'}
                    </button>
                    <button
                      onClick={() => onDelete(p.id)}
                      className="text-red-600 hover:underline px-1 disabled:opacity-30"
                      disabled={p.locked}
                      title={p.locked ? 'Locked' : 'Delete'}
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => onExport(p)}
                      className="text-green-600 hover:underline px-1 disabled:opacity-30"
                      disabled={p.locked}
                      title={p.locked ? 'Locked' : 'Export'}
                    >
                      Export
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeedProfileList;

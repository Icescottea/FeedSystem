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
  if (!profiles.length) return <p>No profiles yet.</p>;

  return (
    <table>
      <thead>
        <tr>
          <th></th>
          <th>Name</th>
          <th>Species</th>
          <th>Stage</th>
          <th>Protein</th>
          <th>Energy</th>
          <th>Archived</th>
          <th>Locked</th>
          <th>Tags</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {profiles.map(p => (
          <tr key={p.id} style={{ color: p.archived ? 'gray' : 'black' }}>
            <td><input type="checkbox" checked={compareIds.includes(p.id)} onChange={() => onCompareToggle(p.id)} /></td>
            <td>{p.feedName}</td>
            <td>{p.species}</td>
            <td>{p.stage}</td>
            <td>{p.protein}%</td>
            <td>{p.energy}</td>
            <td>{p.archived ? 'Yes' : 'No'}</td>
            <td>{p.locked ? '🔒' : '—'}</td>
            <td>{p.tags?.join(', ')}</td>
            <td>
              <button onClick={() => onEdit(p)}>Edit</button>
              <button onClick={() => onClone(p.id)}>Clone</button>
              <button onClick={() => onArchive(p.id)}>
                {p.archived ? 'Unarchive' : 'Archive'}
              </button>
              <button onClick={() => onLock(p.id)}>
                {p.locked ? 'Unlock' : 'Lock'}
              </button>
              <button onClick={() => onDelete(p.id)}>Delete</button>
              <button onClick={() => onExport(p)}>Export</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default FeedProfileList;

import React from 'react';

const CompareProfiles = ({ a, b }) => {
  if (!a || !b) return null;

  return (
    <div className="bg-white shadow-md rounded-lg p-6 overflow-x-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Compare Feed Profiles</h2>
      <table className="w-full table-auto border border-gray-200">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="px-4 py-2 text-left border-b">Field</th>
            <th className="px-4 py-2 text-left border-b">{a.feedName}</th>
            <th className="px-4 py-2 text-left border-b">{b.feedName}</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(a)
            .filter(k => typeof a[k] === 'string' || typeof a[k] === 'number')
            .map((key) => (
              <tr key={key} className="even:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-700 border-b capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}
                </td>
                <td className="px-4 py-2 border-b text-sm text-gray-800">{String(a[key])}</td>
                <td className="px-4 py-2 border-b text-sm text-gray-800">{String(b[key])}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default CompareProfiles;

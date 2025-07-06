import React from 'react';

const CompareProfiles = ({ a, b }) => (
  <div>
    <h2>Comparison</h2>
    <table>
      <thead>
        <tr><th>Field</th><th>{a.feedName}</th><th>{b.feedName}</th></tr>
      </thead>
      <tbody>
        {Object.keys(a).filter(k => typeof a[k] === 'string' || typeof a[k] === 'number')
          .map(key => (
            <tr key={key}>
              <td>{key}</td>
              <td>{String(a[key])}</td>
              <td>{String(b[key])}</td>
            </tr>
          ))}
      </tbody>
    </table>
  </div>
);

export default CompareProfiles;

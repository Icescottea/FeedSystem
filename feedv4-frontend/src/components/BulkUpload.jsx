import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import BulkUpload from '../components/BulkUpload';

const BulkUpload = ({ onUpload }) => {
  const [previewData, setPreviewData] = useState([]);
  const [file, setFile] = useState(null);
  const [overwrite, setOverwrite] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      setPreviewData(data);
    };
    reader.readAsBinaryString(selected);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("overwrite", overwrite);

    await fetch("/api/inventory/bulk-upload?overwrite=" + overwrite, {
      method: "POST",
      body: formData,
    });

    alert("Upload complete");
    onUpload(); // Refresh data
  };

  return (
    <div>
      <h3>Bulk Upload</h3>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
      <label>
        <input
          type="checkbox"
          checked={overwrite}
          onChange={() => setOverwrite(!overwrite)}
        />
        Overwrite duplicates
      </label>
      {previewData.length > 0 && (
        <>
          <table>
            <thead>
              <tr>{Object.keys(previewData[0]).map(k => <th key={k}>{k}</th>)}</tr>
            </thead>
            <tbody>
              {previewData.map((row, idx) => (
                <tr key={idx}>
                  {Object.values(row).map((val, i) => (
                    <td key={i}>{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleSubmit}>Confirm Upload</button>
        </>
      )}
    </div>
  );
};

export default BulkUpload;

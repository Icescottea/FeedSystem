import React from 'react';

const ErrorAlert = ({ message }) => {
  return (
    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md border border-red-300 text-sm">
      ⚠️ {message}
    </div>
  );
};

export default ErrorAlert;
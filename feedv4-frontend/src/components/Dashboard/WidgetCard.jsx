import React from 'react';

const WidgetCard = ({ title, value }) => (
  <div className="widget-card">
    <h4>{title}</h4>
    <p style={{ fontSize: '1.5rem', marginTop: '5px' }}>{value}</p>
  </div>
);

export default WidgetCard;

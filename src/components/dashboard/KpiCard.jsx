import React from 'react';

const KpiCard = ({ title, value, icon }) => (
  <div style={{
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    flex: '1 1 200px',
    textAlign: 'center',
  }}>
    <div style={{ fontSize: '2.5em', marginBottom: '10px' }}>{icon}</div>
    <div style={{ fontSize: '1.8em', fontWeight: 'bold' }}>{value}</div>
    <div style={{ fontSize: '1em', color: '#666' }}>{title}</div>
  </div>
);

export default KpiCard;
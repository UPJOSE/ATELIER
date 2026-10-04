import React from 'react';

export default function Toast({ message, type = 'info', onClose }) {
  if (!message) return null;

  const bg = type === 'error' ? '#fee2e2' : type === 'success' ? '#dcfce7' : '#e0f2fe';
  const color = type === 'error' ? '#b91c1c' : type === 'success' ? '#15803d' : '#0369a1';
  const border = type === 'error' ? '#fecaca' : type === 'success' ? '#bbf7d0' : '#bae6fd';

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 100,
      background: bg,
      color: color,
      border: `1px solid ${border}`,
      padding: '1rem 1.5rem',
      borderRadius: '12px',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      maxWidth: '420px',
      animation: 'slideIn 0.3s ease',
    }}>
      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: color,
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: '1.2rem',
            lineHeight: 1,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

import React from 'react';
import { X, Grid, Minimize2, DollarSign, Eye } from 'lucide-react';

const GLASS = {
  background: 'rgba(255,255,255,0.98)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(0,0,0,0.1)',
  boxShadow: '0 24px 64px rgba(0,0,0,0.2)'
};

export default function PipelineSettings({ 
  layoutMode, setLayoutMode, 
  columnWidth, setColumnWidth, 
  showStageTotals, setShowStageTotals, 
  cardDensity, setCardDensity, 
  onClose 
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div style={{ ...GLASS, borderRadius: 16, padding: 24, maxWidth: 480, width: '90%', maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1f2937', margin: 0 }}>Pipeline Layout Settings</h2>
          <button onClick={onClose} style={{ padding: 6, background: 'none', border: 'none', cursor: 'pointer', borderRadius: 6 }}>
            <X style={{ width: 18, height: 18, color: '#6b7280' }} />
          </button>
        </div>

        {/* Layout Mode */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Grid style={{ width: 14, height: 14 }} /> Layout Mode
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { id: 'kanban', label: 'Kanban', desc: 'Classic columns' },
              { id: 'compact', label: 'Compact', desc: 'Narrow columns' },
              { id: 'wide', label: 'Wide', desc: 'Expanded view' },
            ].map(opt => (
              <button key={opt.id} onClick={() => {
                setLayoutMode(opt.id);
                setColumnWidth(opt.id === 'compact' ? 240 : opt.id === 'wide' ? 360 : 280);
              }}
                style={{ 
                  padding: 12, 
                  border: layoutMode === opt.id ? '2px solid #6366f1' : '1px solid #e5e7eb',
                  background: layoutMode === opt.id ? '#f5f3ff' : '#fff',
                  borderRadius: 8, 
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: layoutMode === opt.id ? '#6366f1' : '#374151', display: 'block' }}>{opt.label}</span>
                <span style={{ fontSize: 10, color: '#9ca3af' }}>{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Column Width Slider */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Minimize2 style={{ width: 14, height: 14 }} /> Column Width
          </h3>
          <div style={{ padding: '0 4px' }}>
            <input 
              type="range" 
              min="240" 
              max="400" 
              step="20"
              value={columnWidth} 
              onChange={e => setColumnWidth(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#6366f1' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: '#6b7280' }}>
              <span>Narrow (240px)</span>
              <span style={{ fontWeight: 600, color: '#6366f1' }}>{columnWidth}px</span>
              <span>Wide (400px)</span>
            </div>
          </div>
        </div>

        {/* Card Density */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Minimize2 style={{ width: 14, height: 14 }} /> Card Density
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {[
              { id: 'compact', label: 'Compact', desc: 'More cards visible' },
              { id: 'comfortable', label: 'Comfortable', desc: 'More spacing' },
            ].map(opt => (
              <button key={opt.id} onClick={() => setCardDensity(opt.id)}
                style={{ 
                  padding: 12, 
                  border: cardDensity === opt.id ? '2px solid #6366f1' : '1px solid #e5e7eb',
                  background: cardDensity === opt.id ? '#f5f3ff' : '#fff',
                  borderRadius: 8, 
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: cardDensity === opt.id ? '#6366f1' : '#374151', display: 'block' }}>{opt.label}</span>
                <span style={{ fontSize: 10, color: '#9ca3af' }}>{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Toggle Options */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Eye style={{ width: 14, height: 14 }} /> Visibility
          </h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: 12, borderRadius: 8, background: '#f9fafb', border: '1px solid #e5e7eb' }}>
            <input 
              type="checkbox" 
              checked={showStageTotals} 
              onChange={e => setShowStageTotals(e.target.checked)}
              style={{ accentColor: '#6366f1', width: 16, height: 16 }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <DollarSign style={{ width: 16, height: 16, color: '#059669' }} />
              <div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block' }}>Show Stage Totals</span>
                <span style={{ fontSize: 10, color: '#9ca3af' }}>Display total value per column</span>
              </div>
            </div>
          </label>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 24 }}>
          <button onClick={onClose} style={{ padding: '10px 20px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Done</button>
        </div>
      </div>
    </div>
  );
}
import React from 'react';

const GrafanaPanel = ({
  dashboardId,
  panelId,
  timeFrom = 'now-6h',
  timeTo = 'now',
  theme = 'light',
  width = '100%',
  height = '400px'
}) => {
  console.log("GrafanaPanel props:", { dashboardId, panelId, timeFrom, timeTo });
  
  // Construisez l'URL vers votre instance Grafana
  const grafanaBaseUrl = import.meta.env.VITE_GRAFANA_URL || 'http://localhost:3000';
  const panelUrl = `${grafanaBaseUrl}/d-solo/${dashboardId}?panelId=${panelId}&from=${timeFrom}&to=${timeTo}&theme=${theme}`;
  
  console.log("Panel URL:", panelUrl);
  
  // Simuler un panneau Grafana pour le développement
  return (
    <div 
      className="grafana-panel-container" 
      style={{
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '15px',
        backgroundColor: '#f5f5f5',
        height
      }}
    >
      <h3>Simulation Panneau Grafana</h3>
      <p>Dashboard: {dashboardId}</p>
      <p>Panel: {panelId}</p>
    </div>
  );
};

// Assurez-vous que cette ligne existe
export default GrafanaPanel;
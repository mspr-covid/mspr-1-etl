import React, { useState, useEffect } from 'react';
import CovidPieChart from "../../components/CovidPieChart/CovidPieChart.jsx";
import './DataPage.css'; 

const DataPage = () => {
  const [covidStats, setCovidStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regionFilter, setRegionFilter] = useState('');

  // Récupérer les statistiques avec un filtre
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        let url = 'http://127.0.0.1:8081/covid'; // URL directe vers votre API
        
        if (regionFilter) {
          url += `?region=${encodeURIComponent(regionFilter)}`; 
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        setCovidStats(data);
        setError(null);
      } catch (error) {
        console.error('Erreur de chargement des statistiques COVID:', error);
        setError(`Impossible de charger les données: ${error.message}`);
        
        // Données de secours pour le développement
        setCovidStats([
          {
            country: "France",
            who_region: "Europe",
            total_cases: 38000000,
            total_deaths: 164000,
            total_recovered: 37000000,
            serious_critical: 836000
          },
          {
            country: "USA",
            who_region: "Americas",
            total_cases: 103000000,
            total_deaths: 1120000,
            total_recovered: 100000000,
            serious_critical: 1880000
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [regionFilter]);

  const handleRegionChange = (event) => {
    setRegionFilter(event.target.value);
  };

  return (
    <div className="data-page-container">
      <h1 className="data-title">Tableau de bord des statistiques COVID-19</h1>
      
      <div className="filter-container">
        <label htmlFor="region-filter">Filtrer par région OMS:</label>
        <iframe src="http://localhost:3000/d-solo/cef5sbqc4do8wb/comparaison-des-cas-et-des-deces-par-region-oms?orgId=1&from=1704063600000&to=1767308399000&timezone=browser&panelId=1&__feature.dashboardSceneSolo" width="450" height="200" frameborder="0"></iframe>
        <select 
    
          id="region-filter"
          onChange={handleRegionChange} 
          value={regionFilter}
          className="region-select"
        >
          <option value="">Toutes les régions</option>
          <option value="Africa">Afrique</option>
          <option value="Americas">Amériques</option>
          <option value="Europe">Europe</option>
          <option value="South-East Asia">Asie du Sud-Est</option>
          <option value="Western Pacific">Pacifique occidental</option>
          <option value="Eastern Mediterranean">Méditerranée orientale</option>
        </select>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des données...</p>
        </div>
      ) : (
        <>
          {covidStats.length === 0 ? (
            <div className="no-data-message">
              Aucune donnée disponible pour la région sélectionnée.
            </div>
          ) : (
            <div className="stats-grid">
              {covidStats.map((stat, index) => (
                <div key={index} className="country-card">
                  <h3 className="country-title">
                    {stat.country} 
                    {stat.who_region && <span className="region-badge">{stat.who_region}</span>}
                  </h3>
                  <div className="chart-container">
                    <CovidPieChart stats={stat} />
                  </div>
                  <div className="stats-summary">
                    <div className="stat-item">
                      <span className="stat-label">Cas totaux:</span>
                      <span className="stat-value">{stat.total_cases?.toLocaleString() || "N/A"}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Décès:</span>
                      <span className="stat-value deaths">{stat.total_deaths?.toLocaleString() || "N/A"}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Guérisons:</span>
                      <span className="stat-value recovered">{stat.total_recovered?.toLocaleString() || "N/A"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DataPage;
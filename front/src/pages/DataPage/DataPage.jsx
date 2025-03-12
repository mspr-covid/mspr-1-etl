import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import GrafanaPanel from "@/components/GrafanaPanel";
import "./DataPage.css";

const DataPage = () => {
  const [data, setData] = useState([]);
  const [country, setCountry] = useState("France");
  const [prediction, setPrediction] = useState(null);

  // Données fictives pour chaque pays
  const mockDataByCountry = {
    France: [
      { date: "Jan 2023", cases: 1200 },
      { date: "Fév 2023", cases: 1800 },
      { date: "Mar 2023", cases: 2400 },
      { date: "Avr 2023", cases: 1900 },
      { date: "Mai 2023", cases: 1300 },
      { date: "Juin 2023", cases: 800 }
    ],
    USA: [
      { date: "Jan 2023", cases: 5200 },
      { date: "Fév 2023", cases: 6800 },
      { date: "Mar 2023", cases: 8400 },
      { date: "Avr 2023", cases: 7900 },
      { date: "Mai 2023", cases: 5300 },
      { date: "Juin 2023", cases: 4800 }
    ],
    China: [
      { date: "Jan 2023", cases: 3200 },
      { date: "Fév 2023", cases: 4800 },
      { date: "Mar 2023", cases: 7400 },
      { date: "Avr 2023", cases: 6900 },
      { date: "Mai 2023", cases: 4300 },
      { date: "Juin 2023", cases: 3800 }
    ],
    Brazil: [
      { date: "Jan 2023", cases: 2200 },
      { date: "Fév 2023", cases: 3800 },
      { date: "Mar 2023", cases: 5400 },
      { date: "Avr 2023", cases: 4900 },
      { date: "Mai 2023", cases: 3300 },
      { date: "Juin 2023", cases: 2800 }
    ]
  };

  // Simuler un chargement de données
  useEffect(() => {
    // Simuler un délai de chargement
    const timer = setTimeout(() => {
      setData(mockDataByCountry[country] || []);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [country]);

  // Fonction pour simuler une prédiction
  const handlePredict = () => {
    // Simuler un délai de traitement
    setTimeout(() => {
      // Générer une prédiction aléatoire basée sur les dernières données
      const lastCases = mockDataByCountry[country]?.[5]?.cases || 1000;
      const randomFactor = 0.8 + Math.random() * 0.4; // entre 0.8 et 1.2
      const predictedCases = Math.round(lastCases * randomFactor);
      
      setPrediction(predictedCases);
    }, 500);
  };

  return (
    <div className="data-page-container">
      <h1 className="title">Statistiques COVID-19</h1>
      
      <div className="controls">
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="dropdown"
        >
          <option value="France">France</option>
          <option value="USA">USA</option>
          <option value="China">Chine</option>
          <option value="Brazil">Brésil</option>
        </select>
        <button
          className="predict-button"
          onClick={handlePredict}
        >
          Générer Prédiction
        </button>
      </div>
      
      {prediction && <p className="prediction-text">Prévision : {prediction} cas</p>}
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="cases" stroke="#17A2B8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="grafana-section">
        <h2 className="grafana-title">Tableau de Bord Grafana</h2>
        <div className="dashboard-grid">
          <GrafanaPanel
            dashboardId="abc123"
            panelId="1"
            height="300px"
          />
          <GrafanaPanel
            dashboardId="abc123"
            panelId="2"
            timeFrom="now-24h"
          />
        </div>
      </div>
    </div>
  );
};

export default DataPage;

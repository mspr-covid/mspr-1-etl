// Fichier: src/components/CovidPieChart.jsx
import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Enregistrer les composants nécessaires
ChartJS.register(ArcElement, Tooltip, Legend);

const CovidPieChart = () => {
  // Données fictives pour la démonstration
  const data = {
    labels: ['Cas actifs', 'Décès', 'Guérisons'],
    datasets: [
      {
        label: 'Statistiques COVID',
        data: [12000000, 800000, 35000000],
        backgroundColor: [
          'rgba(0, 163, 255, 0.7)',
          'rgba(255, 10, 84, 0.7)',
          'rgba(57, 255, 20, 0.7)',
        ],
        borderColor: [
          'rgba(0, 163, 255, 1)',
          'rgba(255, 10, 84, 1)',
          'rgba(57, 255, 20, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Répartition des cas COVID-19',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <Pie data={data} options={options} />
    </div>
  );
};

export default CovidPieChart;
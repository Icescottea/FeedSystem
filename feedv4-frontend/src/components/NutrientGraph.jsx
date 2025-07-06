import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register required components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const NutrientGraph = ({ target = {}, actual = {} }) => {
  const data = {
    labels: ['CP', 'ME', 'Calcium', 'Fat', 'Fiber', 'Ash'],
    datasets: [
      {
        label: 'Target',
        data: [
          target.cp || 0,
          target.me || 0,
          target.calcium || 0,
          target.fat || 0,
          target.fiber || 0,
          target.ash || 0
        ],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Actual',
        data: [
          actual.cp || 0,
          actual.me || 0,
          actual.calcium || 0,
          actual.fat || 0,
          actual.fiber || 0,
          actual.ash || 0
        ],
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
      }
    ]
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        type: 'linear',
        beginAtZero: true
      }
    }
  };

  return <Bar data={data} options={options} />;
};

export default NutrientGraph;

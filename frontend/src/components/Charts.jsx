import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function StatusChart({ data }) {
  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        data: Object.values(data),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',   // Open - blue
          'rgba(251, 191, 36, 0.8)',   // Under Investigation - yellow
          'rgba(249, 115, 22, 0.8)',   // Action Required - orange
          'rgba(34, 197, 94, 0.8)'     // Closed - green
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(251, 191, 36)',
          'rgb(249, 115, 22)',
          'rgb(34, 197, 94)'
        ],
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      },
      title: {
        display: true,
        text: 'NCs by Status'
      }
    }
  };

  return <Doughnut data={chartData} options={options} />;
}

export function SeverityChart({ data }) {
  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        label: 'Count',
        data: Object.values(data),
        backgroundColor: [
          'rgba(156, 163, 175, 0.8)',  // Low - gray
          'rgba(251, 191, 36, 0.8)',   // Medium - yellow
          'rgba(249, 115, 22, 0.8)',   // High - orange
          'rgba(239, 68, 68, 0.8)'     // Critical - red
        ],
        borderColor: [
          'rgb(156, 163, 175)',
          'rgb(251, 191, 36)',
          'rgb(249, 115, 22)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'NCs by Severity'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return <Bar data={chartData} options={options} />;
}

export function TrendChart({ data }) {
  const chartData = {
    labels: data.map(item => item.date).reverse(),
    datasets: [
      {
        label: 'NCs Reported',
        data: data.map(item => item.count).reverse(),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'NCs Reported Over Time (Last 30 Days)'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return <Line data={chartData} options={options} />;
}

export function DepartmentChart({ data }) {
  const chartData = {
    labels: data.map(d => d.department),
    datasets: [{
      label: 'NC Count',
      data: data.map(d => d.total),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 1
    }]
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'NCs by Department' }
    },
    scales: {
      x: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  return <Bar data={chartData} options={options} />;
}

export function RootCauseChart({ data }) {
  const colors = [
    'rgba(239, 68, 68, 0.8)',
    'rgba(249, 115, 22, 0.8)',
    'rgba(251, 191, 36, 0.8)',
    'rgba(34, 197, 94, 0.8)',
    'rgba(59, 130, 246, 0.8)',
    'rgba(139, 92, 246, 0.8)',
    'rgba(236, 72, 153, 0.8)',
    'rgba(156, 163, 175, 0.8)'
  ];

  const chartData = {
    labels: data.map(d => d.category),
    datasets: [{
      label: 'Count',
      data: data.map(d => d.count),
      backgroundColor: data.map((_, i) => colors[i % colors.length]),
      borderWidth: 1
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Root Cause Categories' }
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  return <Bar data={chartData} options={options} />;
}

export function SourceChart({ data }) {
  const colors = [
    'rgba(59, 130, 246, 0.8)',
    'rgba(34, 197, 94, 0.8)',
    'rgba(251, 191, 36, 0.8)',
    'rgba(249, 115, 22, 0.8)',
    'rgba(239, 68, 68, 0.8)',
    'rgba(139, 92, 246, 0.8)',
    'rgba(236, 72, 153, 0.8)',
    'rgba(156, 163, 175, 0.8)'
  ];

  const chartData = {
    labels: Object.keys(data),
    datasets: [{
      data: Object.values(data),
      backgroundColor: Object.keys(data).map((_, i) => colors[i % colors.length]),
      borderWidth: 1
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'NC Source Distribution' }
    }
  };

  return <Doughnut data={chartData} options={options} />;
}

export function ClosureDistributionChart({ data }) {
  const chartData = {
    labels: data.map(d => d.bucket),
    datasets: [{
      label: 'NCs Closed',
      data: data.map(d => d.count),
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderWidth: 1
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Closure Time Distribution' }
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  return <Bar data={chartData} options={options} />;
}

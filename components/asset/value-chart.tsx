"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type ValueHistoryPoint = {
  date: string;
  value: number;
};

type ValueChartProps = {
  initialValue: number;
  currentValue?: number;
  dateReceived: Date;
  valueHistory?: ValueHistoryPoint[];
  assetName: string;
};

export function ValueChart({ 
  initialValue, 
  currentValue, 
  dateReceived, 
  valueHistory = [],
  assetName
}: ValueChartProps) {
  const [chartData, setChartData] = useState<any>(null);
  
  useEffect(() => {
    // Prepare data for chart
    const sortedHistory = [...valueHistory].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Add initial value to history if not already present
    const initialDate = new Date(dateReceived).toISOString().split('T')[0];
    if (!sortedHistory.some(point => point.date === initialDate)) {
      sortedHistory.unshift({ date: initialDate, value: initialValue });
    }
    
    // Add current value as latest point if available
    if (currentValue !== undefined && currentValue !== initialValue) {
      const today = new Date().toISOString().split('T')[0];
      if (!sortedHistory.some(point => point.date === today)) {
        sortedHistory.push({ date: today, value: currentValue });
      }
    }
    
    // Format dates for display
    const labels = sortedHistory.map(point => {
      const date = new Date(point.date);
      return date.toLocaleDateString('tr-TR');
    });
    
    const values = sortedHistory.map(point => point.value);
    
    setChartData({
      labels,
      datasets: [
        {
          label: "Değer (TL)",
          data: values,
          borderColor: "rgb(79, 70, 229)",
          backgroundColor: "rgba(79, 70, 229, 0.5)",
          tension: 0.1,
        },
      ],
    });
  }, [initialValue, currentValue, dateReceived, valueHistory]);
  
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `${assetName} Değer Değişimi`,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };
  
  if (!chartData) {
    return <div className="flex items-center justify-center h-64">Yükleniyor...</div>;
  }
  
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <Line options={options} data={chartData} />
    </div>
  );
} 
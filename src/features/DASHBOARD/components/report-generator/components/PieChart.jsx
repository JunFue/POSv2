import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { useCurrencyFormatter } from "./useCurrencyFormatter";

const PieChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const myChartRef = chartRef.current.getContext("2d");
    const chartColors = [
      "#3b82f6",
      "#10b981",
      "#f97316",
      "#8b5cf6",
      "#ec4899",
      "#f59e0b",
      "#14b8a6",
    ];

    chartInstance.current = new Chart(myChartRef, {
      type: "pie",
      data: {
        labels: data.labels,
        datasets: [
          {
            data: data.values,
            backgroundColor: chartColors,
            borderColor: "#ffffff",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top" },
          tooltip: {
            callbacks: {
              label: (c) =>
                `${c.label}: ${useCurrencyFormatter.format(c.parsed)}`,
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return <canvas ref={chartRef} />;
};

export default PieChart;

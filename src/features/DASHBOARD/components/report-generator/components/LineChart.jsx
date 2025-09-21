import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { useCurrencyFormatter } from "./useCurrencyFormatter";

const LineChart = ({ dailyData, label1, label2, color1, color2 }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const myChartRef = chartRef.current.getContext("2d");

    chartInstance.current = new Chart(myChartRef, {
      type: "line",
      data: {
        labels: dailyData.map((d) => `Day ${d.day}`),
        datasets: [
          {
            label: label1,
            data: dailyData.map((d) => d.cashIn),
            borderColor: color1,
            backgroundColor: `${color1}1a`,
            fill: true,
            tension: 0.3,
          },
          {
            label: label2,
            data: dailyData.map((d) => d.cashOut),
            borderColor: color2,
            backgroundColor: `${color2}1a`,
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { callback: (value) => useCurrencyFormatter.format(value) },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (c) =>
                `${c.dataset.label}: ${useCurrencyFormatter.format(
                  c.parsed.y
                )}`,
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
  }, [dailyData, label1, label2, color1, color2]);

  return <canvas ref={chartRef} />;
};

export default LineChart;

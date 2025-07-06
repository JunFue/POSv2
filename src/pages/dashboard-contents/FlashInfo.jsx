import React from "react";

export function FlashInfo() {
  const chartData = [
    { label: "Mon", value: 65 },
    { label: "Tue", value: 59 },
    { label: "Wed", value: 80 },
    { label: "Thu", value: 81 },
    { label: "Fri", value: 56 },
    { label: "Sat", value: 55 },
    { label: "Sun", value: 40 },
  ];
  const maxValue = Math.max(...chartData.map((d) => d.value));

  return (
    <div className="w-full h-full flex flex-col justify-between text-white">
      <p className="text-sm text-gray-300 mb-2">Weekly Sales Summary</p>
      <div className="flex-grow flex items-end justify-around space-x-2">
        {chartData.map((data) => (
          <div key={data.label} className="flex flex-col items-center flex-1">
            <div
              className="w-full bg-blue-400 rounded-t-sm"
              style={{ height: `${(data.value / maxValue) * 100}%` }}
              title={`${data.label}: ${data.value}`}
            ></div>
            <p className="text-xs mt-1">{data.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

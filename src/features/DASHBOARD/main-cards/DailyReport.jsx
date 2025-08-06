import React from "react";

export function DailyReport() {
  const reportItems = [
    "User 'junfue@gmail.com' logged in.",
    "Transaction 'XYZ-123' completed successfully.",
    "New item 'Product C' registered in inventory.",
    "System alert: Stock for 'Product A' is low.",
    "User 'jane.doe@example.com' updated their profile.",
    "Scheduled maintenance started at 2:00 AM.",
    "Transaction 'ABC-789' was flagged for review.",
    "API key for 'ThirdPartyApp' was regenerated.",
    "User 'test@test.com' failed login attempt.",
    "Server performance metrics are normal.",
    "Daily backup completed.",
    "User 'support@example.com' resolved ticket #5421.",
    "New feature 'Dark Mode' has been enabled.",
  ];

  return (
    // The root container is now a flex column that fills the available height.
    <div className="flex flex-col h-full">
      <style>
        {`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>

      {/* The list now grows to fill the space, handles its own scrolling,
        and has a minimum height to prevent any initial collapse.
      */}
      <ul className="space-y-2 flex-grow overflow-y-auto scrollbar-hide pr-2 min-h-[100px]">
        {reportItems.map((item, index) => (
          <li
            key={index}
            className="text-sm text-head-text border-b border-white/10 pb-1"
          >
            <span className="text-gray-400 mr-2">{`[10:4${
              7 - index
            } AM]`}</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

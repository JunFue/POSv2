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
    // This component now handles its own scrolling and hides the scrollbar.
    <div className="w-full h-full overflow-y-auto scrollbar-hide">
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
      <ul className="space-y-2">
        {reportItems.map((item, index) => (
          <li
            key={index}
            className="text-sm text-gray-300 border-b border-white/10 pb-1"
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

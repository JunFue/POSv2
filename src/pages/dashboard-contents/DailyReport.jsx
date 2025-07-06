import React from "react";

export function DailyReport() {
  return (
    <div className="w-full h-full">
      <ul className="space-y-2">
        <li className="text-sm">User 'junfue@gmail.com' logged in.</li>
        <li className="text-sm">Transaction 'XYZ-123' completed.</li>
        <li className="text-sm">New item 'Product C' registered.</li>
      </ul>
    </div>
  );
}

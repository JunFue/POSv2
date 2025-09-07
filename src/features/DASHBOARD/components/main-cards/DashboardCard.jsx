import React from "react";

// By wrapping the component in React.memo, we prevent it from re-rendering
// if its props (children, title) have not changed.
export const DashboardCard = React.memo(function DashboardCard({
  children,
  title,
  ...props
}) {
  return (
    <div
      {...props}
      className={`${props.className} bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg rounded-xl p-1 !overflow-hidden flex flex-col`}
    >
      {/* Card Header */}
      <div className="drag-handle flex justify-between items-center p-4 text-body-text cursor-grab">
        <h3 className="font-bold text-lg">{title}</h3>
      </div>

      {/* Card Content */}
      <div className="flex-grow text-body-text px-4 pb-4 overflow-hidden">
        {children}
      </div>
    </div>
  );
});

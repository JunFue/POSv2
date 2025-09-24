import React from "react";

/**
 * A simple, centered spinner component for loading states.
 */
export const CenteredSpinner = () => (
  <div className="w-full h-full flex items-center justify-center p-10 bg-transparent">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-teal-500"></div>
  </div>
);

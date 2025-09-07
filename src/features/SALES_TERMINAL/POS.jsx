import React, { Suspense } from "react";

// For an even bigger performance boost, we can lazy-load the POSContents as well.
// Correctly handle the `default` export from the dynamically imported module.
const POSContents = React.lazy(() =>
  import("./POSContents").then((module) => ({ default: module.POSContents }))
);

// A simple skeleton loader to prevent layout shift and provide immediate UI feedback.
// This mimics the structure of your POSContents while it's loading.
const POSSkeleton = () => (
  <div className="animate-pulse mt-4">
    {/* Mimic the main action buttons */}
    <div className="grid grid-cols-3 gap-4 mt-6">
      <div className="h-12 bg-gray-700 rounded-lg"></div>
      <div className="h-12 bg-gray-700 rounded-lg"></div>
      <div className="h-12 bg-gray-700 rounded-lg"></div>
    </div>
    {/* Mimic the product list header */}
    <div className="h-8 bg-gray-700 rounded-lg mt-8"></div>
    {/* Mimic product list items */}
    <div className="space-y-4 mt-4">
      <div className="h-10 bg-gray-600 rounded-lg"></div>
      <div className="h-10 bg-gray-600 rounded-lg"></div>
      <div className="h-10 bg-gray-600 rounded-lg"></div>
    </div>
  </div>
);

export function POS() {
  return (
    <div className="h-full w-full bg-background p-4 shadow-lg flex flex-col overflow-hidden">
      {/* ================================================================= */}
      {/* CRITICAL LCP CONTENT - Renders Immediately */}
      {/* ================================================================= */}
      <header className="flex flex-col items-center mb-1">
        <h1 className="sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-head-text">
          POINT OF SALE
        </h1>
        {/* Other lightweight header elements can go here */}
      </header>
      <div className="relative shiny-gradient p-1 text-accent-100"></div>
      {/* ================================================================= */}

      {/* ================================================================= */}
      {/* DEFERRED CONTENT - Renders After Initial Paint */}
      {/* ================================================================= */}
      <div className="flex-grow overflow-y-auto mt-4">
        <Suspense fallback={<POSSkeleton />}>
          <POSContents />
        </Suspense>
      </div>
      {/* ================================================================= */}
    </div>
  );
}

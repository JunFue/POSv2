import React from "react";
import { cat1Data, cat2Data } from "./components/mockdata";
import Categ from "./components/Categ";
import { OverallSummary } from "./components/OverallSummary";

const printStyles = `
  @media print {
    /* Hide everything except the main report content */
    body * {
      visibility: hidden;
    }
    #printable-area, #printable-area * {
      visibility: visible;
    }
    /* Position the report at the top of the page */
    #printable-area {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
    /* Remove default page margins set by the browser */
    @page {
      margin: 1cm;
    }
    /* Ensure a clean, single-column layout for printing */
    .print-grid-cols-1 {
        grid-template-columns: 1fr !important;
    }
    /* Improve spacing for readability on paper */
    .print-p-0 {
        padding: 0 !important;
    }
    .print-shadow-none {
        box-shadow: none !important;
    }
  }
`;

function Report() {
  // Function to trigger the browser's print dialog
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Inject the print-specific styles into the document's head */}
      <style>{printStyles}</style>
      <div className="p-4 sm:p-6 md:p-8 min-h-screen font-sans bg-gray-100">
        <div className="max-w-7xl mx-auto">
          {/* --- Non-Printable Header --- */}
          {/* This header will be visible on the screen but hidden during printing. */}
          <header className="mb-6 flex flex-wrap justify-between items-center gap-4">
            <h1 className="text-4xl font-bold text-gray-800">
              Financial Report
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-all"
              >
                Print Report
              </button>
            </div>
          </header>

          {/* --- Printable Report Area --- */}
          {/* This 'id' is used by the print styles to ensure only this section is printed. */}
          <main
            id="printable-area"
            className="bg-white p-8 rounded-lg shadow-md print-p-0 print-shadow-none"
          >
            <OverallSummary />
            <div className="grid lg:grid-cols-2 gap-6 mt-6 print-grid-cols-1">
              <Categ title="B. Category 1" categoryData={cat1Data} />
              <Categ title="C. Category 2" categoryData={cat2Data} />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default Report;

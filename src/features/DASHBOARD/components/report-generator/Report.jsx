import React, { useMemo } from "react";
import Categ from "./components/Categ";
import { OverallSummary } from "./components/OverallSummary";
import { useCashout } from "../../../../context/CashoutProvider";

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
  const { cashouts, loading: cashoutsLoading } = useCashout();

  // Memoize the data transformation to avoid re-calculating on every render
  const categoryReportData = useMemo(() => {
    if (!cashouts || cashouts.length === 0) {
      return {};
    }

    // Group cashouts by category and then sum amounts based on classification
    const groupedData = cashouts.reduce((acc, cashout) => {
      const { category, classification, amount } = cashout;

      if (!category) return acc; // Skip transactions without a category

      if (!acc[category]) {
        acc[category] = {};
      }

      const currentAmount =
        acc[category][classification || "Unclassified"] || 0;
      acc[category][classification || "Unclassified"] = currentAmount + amount;

      return acc;
    }, {});

    // Transform the grouped data into the format needed by the Categ component
    return Object.entries(groupedData).reduce(
      (acc, [category, classifications]) => {
        const labels = Object.keys(classifications);
        const values = Object.values(classifications);

        acc[category] = {
          expenseData: { labels, values },
        };
        return acc;
      },
      {}
    );
  }, [cashouts]);

  const categoryNames = Object.keys(categoryReportData);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style>{printStyles}</style>
      <div className="p-4 sm:p-6 md:p-8 min-h-screen font-sans bg-gray-100">
        <div className="max-w-7xl mx-auto">
          {/* --- Non-Printable Header --- */}
          <header className="mb-6 flex flex-wrap justify-between items-center gap-4">
            <h1 className="text-4xl font-bold text-gray-800">
              Financial Report
            </h1>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-all"
            >
              Print Report
            </button>
          </header>

          {/* --- Printable Report Area --- */}
          <main
            id="printable-area"
            className="bg-white p-8 rounded-lg shadow-md print-p-0 print-shadow-none"
          >
            <OverallSummary />
            <div className="grid lg:grid-cols-2 gap-6 mt-6 print-grid-cols-1">
              {cashoutsLoading ? (
                <p className="col-span-full text-center">
                  Loading categories...
                </p>
              ) : categoryNames.length > 0 ? (
                categoryNames.map((categoryName, index) => (
                  <Categ
                    key={categoryName}
                    title={`${String.fromCharCode(
                      66 + index
                    )}. ${categoryName}`}
                    categoryData={categoryReportData[categoryName]}
                  />
                ))
              ) : (
                <p className="col-span-full text-center">
                  No expense data available for the selected period.
                </p>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default Report;

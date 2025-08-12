import React from "react";

export function PaginationButtons({
  currentPage,
  totalPages,
  loading,
  onNext,
  onPrev,
}) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onPrev}
        disabled={currentPage <= 1 || loading}
        className="traditional-button sm:text-[9px] md:text-[12px] lg:text-[15px]"
      >
        Previous
      </button>
      <span className="text-[1vw]">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={currentPage >= totalPages || loading}
        className="traditional-button sm:text-[9px] md:text-[12px] lg:text-[15px]"
      >
        Next
      </button>
    </div>
  );
}

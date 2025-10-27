export const ViewPanel = ({ children, viewMode }) => {
  /**
   * Gets the Tailwind width class for the POS panel
   * based on the current view mode.
   */
  const getPosWidthClass = () => {
    switch (viewMode) {
      case "hidden":
        return "w-0"; // POS is hidden
      case "split":
        return "w-1/2"; // POS takes half width
      case "full":
        return "w-full"; // POS takes full width
      default:
        return "w-0";
    }
  };

  return (
    <div
      className={`h-full flex-shrink-0 transition-all duration-300 ease-in-out ${getPosWidthClass()}`}
    >
      <div
        className="w-full h-full overflow-hidden transition-opacity duration-300 ease-in-out"
        style={{ opacity: viewMode === "hidden" ? 0 : 1 }}
      >
        {children}
      </div>
    </div>
  );
};

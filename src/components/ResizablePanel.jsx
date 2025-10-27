import React, { useState, useRef, useCallback, useEffect } from "react";
import { FaAnglesRight } from "react-icons/fa6";

const POS_PANEL_WIDTH_KEY = "posPanelWidth";
const VISIBLE_STATE_KEY = "posVisibility"; // new key for POS visibility

export const ResizablePanel = ({ children }) => {
  const [posWidth, setPosWidth] = useState(() => {
    try {
      const savedWidth = localStorage.getItem(POS_PANEL_WIDTH_KEY);
      return savedWidth ? JSON.parse(savedWidth) : window.innerWidth / 3;
    } catch (error) {
      console.error(error);
      return window.innerWidth / 3;
    }
  });

  const [isPosVisible, setIsPosVisible] = useState(() => {
    const savedVisibility = localStorage.getItem(VISIBLE_STATE_KEY);
    return savedVisibility ? JSON.parse(savedVisibility) : true;
  });

  const isResizing = useRef(false);
  const animationFrameId = useRef(null);

  const handleDragStart = useCallback((e) => {
    e.preventDefault();
    isResizing.current = true;
  }, []);

  const handleDragEnd = useCallback(() => {
    if (isResizing.current) {
      isResizing.current = false;
      if (isPosVisible) {
        try {
          localStorage.setItem(POS_PANEL_WIDTH_KEY, JSON.stringify(posWidth));
        } catch (error) {
          console.error("Error saving panel width", error);
        }
      }
    }
  }, [posWidth, isPosVisible]);

  const handleDragMove = useCallback((e) => {
    if (isResizing.current) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      animationFrameId.current = requestAnimationFrame(() => {
        const minWidth = 350;
        const hideThreshold = 200;
        const maxWidth = window.innerWidth * 0.7;
        // Update visibility based on clientX position
        if (clientX < hideThreshold) {
          setIsPosVisible(false);
        } else {
          setIsPosVisible(true);
        }
        const newWidth = Math.max(minWidth, Math.min(clientX, maxWidth));
        setPosWidth(newWidth);
      });
    }
  }, []);

  const handleShowPos = useCallback(() => {
    setIsPosVisible(true);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleDragMove);
    window.addEventListener("mouseup", handleDragEnd);
    window.addEventListener("touchmove", handleDragMove);
    window.addEventListener("touchend", handleDragEnd);
    return () => {
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleDragMove);
      window.removeEventListener("touchend", handleDragEnd);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [handleDragMove, handleDragEnd]);

  // Persist isPosVisible changes to localStorage
  useEffect(() => {
    localStorage.setItem(VISIBLE_STATE_KEY, JSON.stringify(isPosVisible));
  }, [isPosVisible]);

  return (
    <>
      {!isPosVisible && (
        <button
          onClick={handleShowPos}
          className="top-4 left-4 z-20 absolute bg-gray-700/50 hover:bg-teal-500 p-2 rounded-full text-white transition-all"
          aria-label="Show Point of Sale"
        >
          <FaAnglesRight size={20} />
        </button>
      )}
      <div
        className="flex-shrink-0 h-full transition-all duration-500 ease-in-out"
        style={{ width: isPosVisible ? `${posWidth}px` : "0px" }}
      >
        <div
          className="w-full h-full overflow-hidden transition-opacity duration-300 ease-in-out"
          style={{ opacity: isPosVisible ? 1 : 0 }}
        >
          {children}
        </div>
      </div>
      <div
        role="separator"
        aria-orientation="vertical"
        className={`w-2 h-full cursor-col-resize bg-gray-700/40 hover:bg-teal-500 transition-opacity duration-300 ${
          !isPosVisible && "opacity-0 pointer-events-none"
        }`}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      />
    </>
  );
};

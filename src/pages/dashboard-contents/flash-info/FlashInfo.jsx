// src/components/Dashboard/FlashInfo.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { FaCog } from "react-icons/fa";
import { MiniCard } from "./MiniCard";
import { useAuth } from "../../../features/pos-features/authentication/hooks/Useauth";
import { io } from "socket.io-client";

const ResponsiveGridLayout = WidthProvider(Responsive);

const allMiniCards = [
  {
    id: "todays-gross-sales",
    title: "Today's Gross Sales",
    value: "Loading...",
    isVisible: true,
    layout: { x: 0, y: 0, w: 2, h: 1 },
  },
  {
    id: "daily-income",
    title: "Daily Income",
    value: "$1,250",
    isVisible: true,
    layout: { x: 0, y: 0, w: 2, h: 1 },
  },
  {
    id: "monthly-income",
    title: "Monthly Income",
    value: "$25,600",
    isVisible: true,
    layout: { x: 2, y: 0, w: 2, h: 1 },
  },
  {
    id: "daily-expenses",
    title: "Daily Expenses",
    value: "$430",
    isVisible: true,
    layout: { x: 4, y: 0, w: 2, h: 1 },
  },
  {
    id: "discounts",
    title: "Discounts Given",
    value: "$180",
    isVisible: true,
    layout: { x: 0, y: 1, w: 2, h: 1 },
  },
  {
    id: "quantity-sold",
    title: "Items Sold Today",
    value: "152",
    isVisible: true,
    layout: { x: 2, y: 1, w: 2, h: 1 },
  },
  {
    id: "top-selling",
    title: "Top Selling",
    value: "Product A",
    isVisible: false,
    layout: { x: 4, y: 1, w: 2, h: 1 },
  },
  {
    id: "low-stock",
    title: "Low Stock Items",
    value: "3",
    isVisible: false,
    layout: { x: 0, y: 2, w: 2, h: 1 },
  },
];

const generateLayouts = (cards) => {
  const layouts = {};
  ["lg", "md", "sm", "xs", "xxs"].forEach((bp) => {
    layouts[bp] = cards.map((card) => ({ i: card.id, ...card.layout }));
  });
  return layouts;
};

export function FlashInfo() {
  const [cards, setCards] = useState(allMiniCards);
  const [layouts, setLayouts] = useState(generateLayouts(allMiniCards));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { session } = useAuth();
  const token = session?.access_token;

  const fetchTotalSales = useCallback(async () => {
    if (!token) {
      console.log("FlashInfo: Waiting for auth token...");
      return;
    }
    try {
      const today = new Date().toISOString().slice(0, 10);
      const url = `http://localhost:3000/api/flash-info/today?date=${today}`;

      console.log(`FlashInfo: Fetching total sales from ${url}.`);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `HTTP Error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const { totalSales } = data;
      const formattedSales = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(totalSales);

      setCards((currentCards) =>
        currentCards.map((card) =>
          card.id === "todays-gross-sales"
            ? { ...card, value: formattedSales }
            : card
        )
      );
    } catch (error) {
      console.error("FlashInfo: Error fetching total sales:", error);
      setCards((currentCards) =>
        currentCards.map((card) =>
          card.id === "todays-gross-sales" ? { ...card, value: "Error" } : card
        )
      );
    }
  }, [token]);

  // This useEffect now ONLY handles the initial data fetch when the component loads
  // or when the fetch function itself changes (i.e., when the token changes).
  useEffect(() => {
    fetchTotalSales();
  }, [fetchTotalSales]);

  // --- FIX ---
  // This new, separate useEffect ONLY handles the Socket.IO connection.
  // It runs just once when the component mounts.
  useEffect(() => {
    const socket = io("http://localhost:3000");

    socket.on("connect", () => {
      console.log("FlashInfo: Socket connected!");
    });

    socket.on("payment_update", (data) => {
      console.log("FlashInfo: Received 'payment_update' event!", data);
      // We call fetchTotalSales directly here. It will use the latest token
      // because of how useCallback works.
      fetchTotalSales();
    });

    // The cleanup function runs when the component is unmounted.
    return () => {
      console.log("FlashInfo: Disconnecting socket.");
      socket.disconnect();
    };
  }, [fetchTotalSales]); // The dependency ensures the listener always has the latest fetch function.

  const handleToggleVisibility = (cardId) => {
    setCards(
      cards.map((card) =>
        card.id === cardId ? { ...card, isVisible: !card.isVisible } : card
      )
    );
  };

  const onLayoutChange = (layout, newLayouts) => {
    setLayouts(newLayouts);
  };

  const visibleCards = cards.filter((card) => card.isVisible);

  return (
    <div className="w-full h-full flex flex-col">
      <style>
        {`
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>
      <div className="absolute top-4 right-3 z-20">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="p-2 text-gray-300 hover:text-white"
        >
          <FaCog />
        </button>
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-md shadow-lg">
            <p className="p-3 text-sm font-bold text-white border-b border-gray-700">
              Show/Hide Cards
            </p>
            <ul className="p-1 max-h-48 overflow-y-auto scrollbar-hide">
              {cards.map((card) => (
                <li
                  key={card.id}
                  className="flex items-center p-2 text-sm text-white rounded hover:bg-gray-700"
                >
                  <input
                    type="checkbox"
                    id={`toggle-${card.id}`}
                    checked={card.isVisible}
                    onChange={() => handleToggleVisibility(card.id)}
                    className="mr-3 h-4 w-4 rounded bg-gray-600 border-gray-500 text-blue-500 focus:ring-blue-600"
                  />
                  <label htmlFor={`toggle-${card.id}`}>{card.title}</label>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="w-full h-full overflow-y-auto scrollbar-hide">
        <ResponsiveGridLayout
          layouts={layouts}
          onLayoutChange={onLayoutChange}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 6, md: 4, sm: 4, xs: 2, xxs: 2 }}
          rowHeight={80}
          margin={[10, 10]}
          draggableHandle=".mini-drag-handle"
        >
          {visibleCards.map((card) => (
            <div
              key={card.id}
              data-grid={layouts.lg.find((l) => l.i === card.id) || card.layout}
            >
              <MiniCard
                title={card.title}
                value={card.value}
                onHide={() => handleToggleVisibility(card.id)}
              />
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
}

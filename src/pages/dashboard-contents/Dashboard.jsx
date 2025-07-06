import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import { DashboardCard } from "./DashboardCard";
import { FlashInfo } from "./FlashInfo";
import { DailyReport } from "./DailyReport";
import { CashoutReport } from "./CashoutReport";

// Define the 5 size steps
const sizeSteps = [
  { name: "small", width: 300, height: 250 },
  { name: "medium", width: 400, height: 350 }, // Default size
  { name: "large", width: 500, height: 400 },
  { name: "xlarge", width: 600, height: 450 },
  { name: "xxlarge", width: 700, height: 500 },
];

// Set initial cards with a default size index
const initialCards = [
  { id: "1", title: "Flash Info", component: <FlashInfo />, sizeIndex: 1 },
  { id: "2", title: "Daily Report", component: <DailyReport />, sizeIndex: 1 },
  {
    id: "3",
    title: "Cashout Report",
    component: <CashoutReport />,
    sizeIndex: 1,
  },
];

export function Dashboard() {
  const [cards, setCards] = useState(initialCards);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setCards((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleZoom = (cardId) => {
    setCards(
      cards.map((card) => {
        if (card.id === cardId) {
          // Cycle to the next size step, looping back to the start
          const nextSizeIndex = (card.sizeIndex + 1) % sizeSteps.length;
          return { ...card, sizeIndex: nextSizeIndex };
        }
        return card;
      })
    );
  };

  return (
    <div className="w-full h-full custom-gradient rounded-lg border border-accent-800 shadow-md p-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={cards} strategy={horizontalListSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {cards.map((card) => {
              const size = sizeSteps[card.sizeIndex];
              return (
                <DashboardCard
                  key={card.id}
                  id={card.id}
                  title={card.title}
                  width={size.width}
                  height={size.height}
                  handleZoom={handleZoom}
                >
                  {card.component}
                </DashboardCard>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

import { useMemo } from "react";
import { usePersistentState } from "../hooks/usePersistentState";

const CARDS_STORAGE_KEY = "dashboard-cards-v1";

/**
 * Custom hook to manage the state of dashboard cards, including their visibility.
 * @param {Array} initialCards - The initial set of cards for the dashboard.
 * @returns {Object} An object containing the cards state and a function to toggle visibility.
 */
export function useDashboardCards(initialCards) {
  const [storedCards, setStoredCards] = usePersistentState(
    CARDS_STORAGE_KEY,
    []
  );

  const cards = useMemo(() => {
    const storedVisibility = storedCards.reduce((acc, card) => {
      acc[card.id] = card.isVisible;
      return acc;
    }, {});

    return initialCards.map((card) => ({
      ...card,
      isVisible: storedVisibility[card.id] ?? true,
    }));
  }, [initialCards, storedCards]);

  const handleToggleVisibility = (cardId) => {
    const updatedCards = cards.map((card) =>
      card.id === cardId ? { ...card, isVisible: !card.isVisible } : card
    );
    const persistenceData = updatedCards.map(({ id, isVisible }) => ({
      id,
      isVisible,
    }));
    setStoredCards(persistenceData);
  };

  return { cards, handleToggleVisibility };
}

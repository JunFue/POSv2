import { useState } from "react";

export function State(initialState = { search: "", selected: [], sort: null }) {
  const [filter, setFilter] = useState(initialState);
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownVisible((prev) => !prev);
  };

  const closeDropdown = () => setDropdownVisible(false);

  return {
    filter,
    setFilter,
    isDropdownVisible,
    toggleDropdown,
    closeDropdown,
  };
}

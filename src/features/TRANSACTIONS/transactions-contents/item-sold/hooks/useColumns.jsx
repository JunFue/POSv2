import { useMemo } from "react";
import { FilterableHeader } from "../components/ColumnFilterDropdown";

function getItemNameHeader(itemNameFilter, uniqueItemNames) {
  if (itemNameFilter && uniqueItemNames) {
    return () => (
      <FilterableHeader
        title="Item Name"
        toggleDropdown={itemNameFilter.toggleDropdown}
        isVisible={itemNameFilter.isDropdownVisible}
        uniqueValues={uniqueItemNames}
        filter={itemNameFilter.filter}
        setFilter={itemNameFilter.setFilter}
        closeDropdown={itemNameFilter.closeDropdown}
      />
    );
  }
  return "Item Name";
}

function getClassificationHeader(classificationFilter, uniqueClassifications) {
  if (classificationFilter && uniqueClassifications) {
    return () => (
      <FilterableHeader
        title="Classification"
        toggleDropdown={classificationFilter.toggleDropdown}
        isVisible={classificationFilter.isDropdownVisible}
        uniqueValues={uniqueClassifications}
        filter={classificationFilter.filter}
        setFilter={classificationFilter.setFilter}
        closeDropdown={classificationFilter.closeDropdown}
      />
    );
  }
  return "Classification";
}

export function useColumns(
  itemNameFilter,
  uniqueItemNames,
  classificationFilter,
  uniqueClassifications
) {
  return useMemo(() => {
    return [
      { accessorKey: "barcode", header: "Barcode No.", size: 120 },
      {
        accessorKey: "itemName",
        header: getItemNameHeader(itemNameFilter, uniqueItemNames),
        size: 250,
      },
      { accessorKey: "price", header: "Unit Price", size: 100 },
      { accessorKey: "quantity", header: "Quantity", size: 80 },
      { accessorKey: "totalPrice", header: "Total Price", size: 100 },
      { accessorKey: "transactionDate", header: "Transaction Date", size: 180 },
      { accessorKey: "transactionNo", header: "Transaction No.", size: 150 },
      { accessorKey: "inCharge", header: "In Charge", size: 150 },
      { accessorKey: "costumer", header: "Customer Name", size: 150 },
      {
        accessorKey: "classification",
        header: getClassificationHeader(
          classificationFilter,
          uniqueClassifications
        ),
        size: 120,
      },
    ];
  }, [
    itemNameFilter,
    uniqueItemNames,
    classificationFilter,
    uniqueClassifications,
  ]);
}

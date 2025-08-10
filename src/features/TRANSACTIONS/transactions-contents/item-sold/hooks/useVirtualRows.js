import { useVirtualizer } from "@tanstack/react-virtual";

export function useVirtualRows(
  table,
  containerRef,
  rowHeight = 40,
  overscan = 5
) {
  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  return { rows, rowVirtualizer };
}

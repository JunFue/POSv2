import { useState, useEffect } from "react";

export function useFilterWorker(data, itemNameFilter, classificationFilter) {
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const workerCode = `
      self.onmessage = function(e) {
        const { data, itemNameFilter, classificationFilter } = e.data;
        const applyItemNameFilter = (d) => {
          let result = d;
          if (itemNameFilter.selected.length > 0) {
            result = result.filter(item => itemNameFilter.selected.includes(item.itemName));
          }
          if (itemNameFilter.sort === "asc") {
            result = [...result].sort((a, b) => String(a.itemName).localeCompare(String(b.itemName)));
          } else if (itemNameFilter.sort === "desc") {
            result = [...result].sort((a, b) => String(b.itemName).localeCompare(String(a.itemName)));
          }
          return result;
        };
        const applyClassificationFilter = (d) => {
          let result = d;
          if (classificationFilter.selected.length > 0) {
            result = result.filter(item => classificationFilter.selected.includes(item.classification));
          }
          if (classificationFilter.sort === "asc") {
            result = [...result].sort((a, b) => String(a.classification).localeCompare(String(b.classification)));
          } else if (classificationFilter.sort === "desc") {
            result = [...result].sort((a, b) => String(b.classification).localeCompare(String(a.classification)));
          }
          return result;
        };
        let result = applyItemNameFilter(data || []);
        result = applyClassificationFilter(result);
        self.postMessage(result);
      };
    `;
    const blob = new Blob([workerCode], { type: "application/javascript" });
    const worker = new Worker(URL.createObjectURL(blob));

    worker.onmessage = (e) => {
      setFilteredData(e.data);
    };

    worker.postMessage({
      data: data || [],
      itemNameFilter,
      classificationFilter,
    });
    return () => worker.terminate();
  }, [data, itemNameFilter, classificationFilter]);

  return filteredData;
}

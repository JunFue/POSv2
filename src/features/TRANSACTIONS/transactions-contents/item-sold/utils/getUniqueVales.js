export function getUniqueValues(data, key) {
  return Array.from(new Set(data.map((item) => item[key])));
}

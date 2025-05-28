export function generateTransactionNo() {
  const randomLetters = () =>
    String.fromCharCode(
      65 + Math.floor(Math.random() * 26),
      65 + Math.floor(Math.random() * 26),
      65 + Math.floor(Math.random() * 26)
    );
  const randomNumbers = () => Math.floor(10000 + Math.random() * 90000);
  const randomSuffix = () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
    Math.floor(Math.random() * 10);
  return `${randomLetters()}-${randomNumbers()}-${randomSuffix()}`;
}

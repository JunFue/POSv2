import { StocksForm } from "./StocksForm";
import { StocksTable } from "./StocksTable";

export function Stocks() {
  return (
    <div className="flex flex-col gap-[1vw] p-[1vw] bg-[#f9f9f9] rounded-lg shadow-md">
      <StocksForm />
      <StocksTable />
    </div>
  );
}

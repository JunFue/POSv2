import { StocksForm } from "./StocksForm";
import { StocksTable } from "./StocksTable";

export function Stocks() {
  return (
    <div className="flex flex-col gap-[1vw] p-[1vw] bg-background rounded-lg h-fit">
      <StocksForm />
      <StocksTable />
    </div>
  );
}

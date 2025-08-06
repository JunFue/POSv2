import { Stocks } from "./Stocks";

export function StocksManagementPage() {
  return (
    <>
      <div className="flex text-[1.7vw] flex-row w-full justify-between px-[2vw] h-[4vw] rounded-lg p-[0.3vw]">
        <div className="font-bold">Stocks Management</div>
      </div>
      <Stocks />
    </>
  );
}

import { Navigate, Route, Routes } from "react-router";
import { ItemSold } from "./transactions-contents/item-sold/ItemSold";
import { Payments } from "./transactions-contents/Payments";

export function Transactions() {
  return (
    <div className="w-full h-fit rounded-lg bg-background shadow-neumorphic p-[0.3vw] text-[2vw]">
      <Routes>
        <Route path="item-sold" element={<ItemSold />} />
        <Route path="payments-made" element={<Payments />} />
        <Route path="*" element={<Navigate to="item-sold" replace />} />
      </Routes>
    </div>
  );
}

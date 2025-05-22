import { ItemRegForm } from "../shared-components/forms/ItemRegForms";
import { ItemRegTable } from "../shared-components/tables/ItemRegTable";

export function Inventory({ items, setItems }) {
  return (
    <>
      <div className="w-full h-full border border-amber-600 text-[2vw]">
        <ItemRegForm items={items} setItems={setItems} />
        <ItemRegTable items={items} setItems={setItems} />
      </div>
    </>
  );
}

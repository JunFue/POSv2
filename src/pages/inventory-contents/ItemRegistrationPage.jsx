import { ItemRegForm } from "./item-reg/ItemRegForms";
import { ItemRegTable } from "./item-reg/ItemRegTable";

export function ItemRegistrationPage() {
  return (
    <>
      <div className="flex font-bold text-[1.7vw] items-center flex-row w-full justify-between px-[1vw] h-[6vh] rounded-lg border border-gray-400 shadow-inner">
        <div className="m-auto">Item Registration</div>
      </div>
      <div className="flex flex-col w-full h-full gap-[1vw]">
        <ItemRegForm />
        <ItemRegTable />
      </div>
    </>
  );
}

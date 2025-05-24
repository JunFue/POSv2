import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import { useEffect, useRef } from "react";
import { DevTool } from "@hookform/devtools";

export const CounterForm = () => {
  const form = useForm();
  const { register, handleSubmit, control, setValue } = form;

  const costumerName = useRef();
  const barcodeRef = useRef();
  function addToCart(data) {
    console.log(data);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const timer = dayjs().format("YYYY-MM-DD HH:mm:ss");
      setValue("transactionTime", timer);
    }, 1000);
    return () => clearInterval(interval);
  }, [setValue]);

  return (
    <>
      <form
        onSubmit={handleSubmit(addToCart)}
        className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] [&>*]:border [&>*]:border-green-300 [&>*]:text-[0.8vw] text-nowrap"
      >
        <label>Cashier Name:</label>
        <input {...register("cashierName")} type="text" />
        <label>Transaction Time:</label>
        <input {...register("transactionTime")} type="text" readOnly />
        <label>Payment:</label>
        <input {...register("payment")} type="number" />
        <label>Costumer Name:</label>
        <input {...register("costumerName")} type="text" />
        <label>Transaction No.:</label>
        <input {...register("transactionNo")} type="text" readOnly />
        <label>Discount:</label>
        <input {...register("discount")} type="number" />
        <label>Barcode:</label>
        <input {...register("barcode")} type="text" />
        <label>Available Stocks:</label>
        <input
          {...register("availableStocks")}
          type="text"
          placeholder="Stocks Available"
          readOnly
        />
        <label>Change:</label>
        <input {...register("change")} type="text" readOnly />
        <label>Quantity:</label>
        <input {...register("quantity")} type="text" />
        <label>Additional Info</label>
        <input
          {...register("additionalInfo")}
          type="text"
          placeholder="additional info..."
          readOnly
        />
        <label>Grand Total:</label>
        <input {...register("grandTotal")} type="text" readOnly />
      </form>
      <DevTool control={control} />
    </>
  );
};

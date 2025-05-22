import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";

export function ProductCounterForm({ setCartData }) {
  const { register, handleSubmit, reset } = useForm();

  const costumerNameRef = useRef(null);
  const quantityRef = useRef(null);
  const barcodeRef = useRef(null);
  const discountRef = useRef(null);

  const [transTime, setTransTime] = useState(
    dayjs().format("YYYY-MM-DD HH:mm:ss")
  );
  const [transactionNo] = useState(
    `TXN-${Math.floor(Math.random() * 1000000)}`
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTransTime(dayjs().format("YYYY-MM-DD HH:mm:ss"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const onSubmit = (data) => {
    const { barcode, quantity } = data;

    if (!barcode || !quantity) return;

    setCartData((prev) => [
      ...prev,
      {
        barcode,
        item: "", // You can add item lookup logic here
        price: 0,
        quantity: parseInt(quantity),
        total: 0,
        remove: null,
        ...data,
      },
    ]);

    reset({ barcode: "", quantity: "" });
    barcodeRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div
        id="cashier-info"
        className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] [&>*]:border [&>*]:border-green-300 [&>*]:text-[0.8vw] text-nowrap"
      >
        <div>Cashier Name:</div>
        <input
          type="text"
          placeholder="e.g. Junel F. Fuentes"
          autoComplete="off"
          {...register("cashierName")}
        />

        <div>Transaction Time:</div>
        <div>{transTime}</div>

        <div>Payment:</div>
        <input
          type="number"
          placeholder="₱0.00"
          autoComplete="off"
          {...register("payment")}
          onKeyDown={(e) => {
            if (e.key === "Enter") discountRef.current?.focus();
          }}
        />

        <div>Costumer Name:</div>
        <input
          type="text"
          placeholder="e.g. Maribeth G. Fuentes"
          autoComplete="off"
          {...register("costumerName")}
          ref={costumerNameRef}
          onKeyDown={(e) => {
            if (e.key === "Enter") barcodeRef.current?.focus();
          }}
        />

        <div>Transaction No:</div>
        <div>{transactionNo}</div>

        <div>Discount:</div>
        <input
          type="number"
          placeholder="₱0.00"
          autoComplete="off"
          {...register("discount")}
          ref={discountRef}
        />

        <div>Barcode:</div>
        <input
          type="text"
          placeholder="123000"
          autoComplete="off"
          {...register("barcode")}
          ref={barcodeRef}
          onKeyDown={(e) => {
            if (e.key === "Enter") quantityRef.current?.focus();
          }}
        />

        <div>Available Stocks:</div>
        <div>1000</div>

        <div>Change:</div>
        <div>₱0.00</div>

        <div>Quantity:</div>
        <input
          type="number"
          placeholder="0"
          autoComplete="off"
          {...register("quantity")}
          ref={quantityRef}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit(onSubmit)();
          }}
        />

        <div>Additional Info:</div>
        <div>Additional Info</div>

        <div>Grand Total:</div>
        <div>₱0.00</div>
      </div>
    </form>
  );
}

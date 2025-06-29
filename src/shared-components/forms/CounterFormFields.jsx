import React, { forwardRef } from "react";

/**
 * A presentational component that renders all the input fields for the point-of-sale form.
 * It receives all logic and refs as props from a container component.
 */
export const CounterFormFields = forwardRef((props, ref) => {
  const { register, handleSubmit, onBarcodeChange, onBarcodeKeyDown } = props;

  // Destructure the refs passed from the parent component
  const { costumerNameRef, barcodeRef, quantityRef, discountRef } = ref;

  return (
    <form
      onSubmit={handleSubmit}
      className="[&>*]:text-[1.2vw] [&>*]:font-info-text! grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] gap-[0.5vw] [&>*]:overflow-hidden [&>*]:text-ellipsis [&>*]:text-nowrap p-[0.3vh]"
    >
      <label title="Cashier Name">Cashier Name:</label>
      <input
        className="w-full text-primary-900 bg-background text-[1vw]  rounded-[15px] pl-[0.6vw] shadow-input 
         focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all"
        {...register("cashierName")}
        type="text"
        autoComplete="off"
        readOnly
      />

      <label title="Transaction Time">Transaction Time:</label>
      <input
        className="w-full text-primary-900 bg-background text-[1vw]  rounded-[15px] pl-[0.6vw] shadow-input 
         focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all"
        {...register("transactionTime")}
        type="text"
        autoComplete="off"
        readOnly
      />

      <label title="Payment">Payment:</label>
      <input
        className="w-full text-primary-900 bg-background text-[1vw]  rounded-[15px] pl-[0.6vw] shadow-input 
         focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all"
        {...register("payment")}
        type="number"
        step="any"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            discountRef.current?.focus();
          }
        }}
        autoComplete="off"
      />

      <label title="Costumer Name">Costumer Name:</label>
      <input
        className="w-full text-primary-900 bg-background text-[1vw]  rounded-[15px] pl-[0.6vw] shadow-input 
         focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all"
        {...register("costumerName")}
        type="text"
        ref={costumerNameRef}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            barcodeRef.current?.focus();
          }
        }}
        autoComplete="off"
      />

      <label title="Transaction No.">Transaction No.:</label>
      <input
        className="w-full text-primary-900 bg-background text-[1vw]  rounded-[15px] pl-[0.6vw] shadow-input 
         focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all"
        {...register("transactionNo")}
        type="text"
        readOnly
        autoComplete="off"
      />

      <label title="Discount">Discount:</label>
      <input
        className="w-full text-primary-900 bg-background text-[1vw]  rounded-[15px] pl-[0.6vw] shadow-input 
         focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all"
        {...register("discount")}
        type="number"
        step="any"
        ref={discountRef}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            // This could trigger the done/complete function or move focus elsewhere.
            // For now, it just prevents form submission on Enter.
          }
        }}
        autoComplete="off"
      />

      <label title="Barcode">Barcode:</label>
      <input
        className="w-full text-primary-900 bg-background text-[1vw]  rounded-[15px] pl-[0.6vw] shadow-input 
         focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all"
        {...register("barcode")}
        type="text"
        ref={barcodeRef}
        onChange={onBarcodeChange}
        onKeyDown={onBarcodeKeyDown}
        autoComplete="off"
      />

      <label title="Available Stocks">Available Stocks:</label>
      <input
        className="w-full text-primary-900 bg-background text-[1vw]  rounded-[15px] pl-[0.6vw] shadow-input 
         focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all"
        {...register("availableStocks")}
        type="text"
        placeholder="Stocks Available"
        readOnly
        autoComplete="off"
      />

      <label title="Grand Total">Grand Total:</label>
      <input
        className="w-full text-primary-900 bg-background text-[1vw]  rounded-[15px] pl-[0.6vw] shadow-input 
         focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all"
        {...register("grandTotal")}
        type="text"
        readOnly
        autoComplete="off"
      />
      <label title="Quantity">Quantity:</label>
      <input
        className="w-full text-primary-900 bg-background text-[1vw]  rounded-[15px] pl-[0.6vw] shadow-input 
         focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all"
        {...register("quantity")}
        type="number"
        ref={quantityRef}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit(); // This will trigger the addToCart function
          }
        }}
        autoComplete="off"
      />

      <label title="Additional Info">Additional Info:</label>
      <input
        className="w-full text-primary-900 bg-background text-[1vw]  rounded-[15px] pl-[0.6vw] shadow-input 
         focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all"
        {...register("additionalInfo")}
        type="text"
        placeholder="additional info..."
        readOnly
        autoComplete="off"
      />

      <label title="Change">Change:</label>
      <input
        className="w-full text-primary-900 bg-background text-[1vw]  rounded-[15px] pl-[0.6vw] shadow-input 
         focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all"
        {...register("change")}
        type="text"
        readOnly
        autoComplete="off"
      />
    </form>
  );
});

import React, { forwardRef } from "react";

export const CounterFormFields = forwardRef((props, ref) => {
  const { register, handleSubmit, onBarcodeChange, onBarcodeKeyDown } = props;

  const { costumerNameRef, barcodeRef, quantityRef, discountRef } = ref;

  const barcodeRegistration = register("barcode");
  const quantityRegistration = register("quantity");
  const costumerNameRegistration = register("costumerName");
  const discountRegistration = register("discount");

  return (
    <form
      onSubmit={handleSubmit}
      className="[&>*]:body-text-media grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] gap-[0.5vw] [&>*]:overflow-hidden [&>*]:text-ellipsis [&>*]:text-nowrap p-[0.3vh]"
    >
      {/* ... other input fields remain the same ... */}

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
        {...costumerNameRegistration}
        ref={(e) => {
          costumerNameRegistration.ref(e);
          costumerNameRef.current = e;
        }}
        type="text"
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
        {...discountRegistration}
        ref={(e) => {
          discountRegistration.ref(e);
          discountRef.current = e;
        }}
        type="number"
        step="any"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
        autoComplete="off"
      />

      <label title="Barcode">Barcode:</label>
      <input
        className="w-full text-primary-900 bg-background text-[1vw]  rounded-[15px] pl-[0.6vw] shadow-input 
         focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all"
        {...barcodeRegistration}
        ref={(e) => {
          barcodeRegistration.ref(e);
          barcodeRef.current = e;
        }}
        onChange={onBarcodeChange}
        onKeyDown={onBarcodeKeyDown}
        type="text"
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
        {...quantityRegistration}
        ref={(e) => {
          quantityRegistration.ref(e);
          quantityRef.current = e;
        }}
        type="number"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            // --- FIX ---
            // Instead of calling handleSubmit directly, we find the parent <form>
            // element and ask it to submit itself. This correctly triggers
            // the form's onSubmit event and the whole react-hook-form validation pipeline.
            e.currentTarget.form.requestSubmit();
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

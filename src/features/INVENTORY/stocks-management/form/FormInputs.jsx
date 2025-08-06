import React from "react";

/**
 * A generic, reusable text input component for forms.
 * It integrates with react-hook-form via the register prop.
 */
export const FormInput = ({
  name,
  label,
  type = "text",
  register,
  ...props
}) => (
  <div className="relative flex flex-col gap-1 items-center w-full">
    <label className="text-[1vw] font-medium">{label}</label>
    <input
      type={type}
      {...register(name)}
      autoComplete="off"
      className="text-[1vw] h-[1.5vw] w-full max-w-[150px] shadow-input rounded-2xl p-2"
      {...props}
    />
  </div>
);

/**
 * A generic, reusable select dropdown component for forms.
 * It integrates with react-hook-form via the register prop.
 */
export const FormSelect = ({ name, label, register, children }) => (
  <div className="relative flex flex-col gap-1 items-center w-full">
    <label className="text-[1vw] font-medium">{label}</label>
    <select
      {...register(name)}
      className="text-[1vw] h-[1.5vw] w-full max-w-[150px] shadow-input rounded-2xl"
    >
      {children}
    </select>
  </div>
);

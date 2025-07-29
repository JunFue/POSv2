export const FormField = ({
  id,
  label,
  type = "text",
  register,
  error,
  children,
  ...props
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="mb-1 font-semibold text-sm">
      {label}
    </label>
    {type === "select" ? (
      <select
        id={id}
        {...register}
        className={`traditional-input ${error ? "border-red-500" : ""}`}
        {...props}
      >
        {children}
      </select>
    ) : (
      <input
        id={id}
        type={type}
        {...register}
        className={`traditional-input ${error ? "border-red-500" : ""}`}
        {...props}
      />
    )}
    {error && (
      <span className="text-red-500 text-xs mt-1">{error.message}</span>
    )}
  </div>
);

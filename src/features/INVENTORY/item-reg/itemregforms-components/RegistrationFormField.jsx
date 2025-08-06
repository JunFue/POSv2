import { FormField } from "./FormField";

export const RegistrationFormFields = ({
  register,
  errors,
  categories,
  serverOnline,
  onReset,
}) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
      <FormField
        id="barcode"
        label="Barcode"
        register={register("barcode", { required: "Barcode is required" })}
        error={errors.barcode}
        autoComplete="off"
      />
      <FormField
        id="name"
        label="Name"
        register={register("name", { required: "Product name is required" })}
        error={errors.name}
        autoComplete="off"
      />
      <FormField
        id="price"
        label="Price"
        type="number"
        step="0.01"
        register={register("price", {
          required: "Price is required",
          valueAsNumber: true,
        })}
        error={errors.price}
        autoComplete="off"
      />
      <FormField
        id="packaging"
        label="Packaging"
        register={register("packaging", {
          required: "Packaging type is required",
        })}
        error={errors.packaging}
        autoComplete="off"
      />
      <div className="md:col-span-2">
        <FormField
          id="category"
          label="Category"
          type="select"
          register={register("category", {
            required: "Product category is required",
          })}
          error={errors.category}
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </FormField>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <button
        type="submit"
        disabled={!serverOnline}
        className="traditional-button"
      >
        Register
      </button>
      <button type="button" className="traditional-button" onClick={onReset}>
        Clear
      </button>
    </div>
  </>
);

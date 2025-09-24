import React, { lazy } from "react";

// This file is now configured to lazy-load your actual application components.
// Each `lazy()` call wraps a dynamic `import()`, which tells the bundler (like Vite or Webpack)
// to create a separate code chunk for that component. This chunk is only downloaded
// by the browser when the component is first rendered.

// The `.then(module => ({ default: module.ComponentName }))` part is crucial
// if your components are exported as named exports (e.g., `export const Dashboard`).
// If they use default exports (`export default Dashboard`), you can simplify the import.

export const Dashboard = lazy(() =>
  import("../../features/DASHBOARD/Dashboard.jsx").then((module) => ({
    default: module.Dashboard,
  }))
);

export const CategoryPage = lazy(() =>
  import("../../features/DASHBOARD/components/CategoryPage.jsx").then(
    (module) => ({
      default: module.CategoryPage,
    })
  )
);

export const Cashout = lazy(() =>
  import("../../features/CASHOUT/Cashout.jsx").then((module) => ({
    default: module.Cashout,
  }))
);

export const Transactions = lazy(() =>
  import("../../features/TRANSACTIONS/Transactions.jsx").then((module) => ({
    default: module.Transactions,
  }))
);

export const Inventory = lazy(() =>
  import("../../features/INVENTORY/Inventory.jsx").then((module) => ({
    default: module.Inventory,
  }))
);

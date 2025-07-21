import { Link } from "react-router";

export function Nav() {
  const links = [
    {
      path: "/dashboard",
      label: "Dashboard",
      flyoutText: (
        <>
          <div>
            <Link to="/dashboard" className="hover:text-emerald-700">
              Summary
            </Link>
          </div>
          <div>
            <Link to="/dashboard/monthly" className="hover:text-emerald-700">
              Monthly Table
            </Link>
          </div>
        </>
      ),
    },
    { path: "/cashout", label: "Cashout", flyoutText: "Manage Cashout" },
    {
      path: "/transactions",
      label: "Transactions",
      flyoutText: (
        <>
          <div>
            <Link
              to="/transactions/item-sold"
              className="hover:text-emerald-700"
            >
              Items Sold
            </Link>
          </div>
          <div>
            <Link
              to="/transactions/payments-made"
              className="hover:text-emerald-700"
            >
              Payments Made
            </Link>
          </div>
        </>
      ),
    },
    {
      path: "/inventory",
      label: "Inventory",
      flyoutText: (
        <>
          <div>
            <Link
              to="/inventory/item-registration"
              className="hover:text-emerald-700"
            >
              Item Registration
            </Link>
          </div>
          <div>
            <Link
              to="/inventory/stocks-management"
              className="hover:text-emerald-700"
            >
              Stocks Management
            </Link>
          </div>
          <div>
            <Link
              to="/inventory/stocks-monitor"
              className="hover:text-emerald-700"
            >
              Stocks Monitor
            </Link>
          </div>
        </>
      ),
    },
  ];

  return (
    <nav className="flex items-center justify-around bg-background shadow-neumorphic p-4 text-base rounded-3xl">
      {links.map((link) => (
        <div key={link.path} className="relative group">
          <Link
            to={link.path}
            className="px-3 py-2 hover:text-emerald-700 transition-all"
          >
            {link.label}
          </Link>
          <div className="absolute top-[1vw] left-1/2 transform -translate-x-1/2 mt-2 w-max bg-background traditional-glass text-body-text text-sm md:text-[15px] lg:text-[18px] xl:text-[20px] p-2 rounded shadow-lg hidden group-hover:block z-2">
            {link.flyoutText}
          </div>
        </div>
      ))}
    </nav>
  );
}

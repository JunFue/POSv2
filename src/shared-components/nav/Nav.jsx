import { Link } from "react-router-dom";

export function Nav() {
  const links = [
    { path: "/", label: "Dashboard", flyoutText: "Go to Dashboard" },
    { path: "/cashout", label: "Cashout", flyoutText: "Manage Cashout" },
    {
      path: "/transactions",
      label: "Transactions",
      flyoutText: "View Transactions",
    },
    {
      path: "/inventory",
      label: "Inventory",
      flyoutText: (
        <>
          <div>
            <Link
              to="/inventory/item-registration"
              className="hover:text-emerald-700!"
            >
              Item Registration
            </Link>
          </div>
          <div>
            <Link
              to="/inventory/stocks-management"
              className="hover:text-emerald-700!"
            >
              Stocks Management
            </Link>
          </div>
          <div>
            <Link
              to="/inventory/stocks-monitor"
              className="hover:text-emerald-700!"
            >
              Stocks Monitor
            </Link>
          </div>
        </>
      ),
    },
  ];

  return (
    <nav className="relative grid grid-cols-[auto_auto_auto_auto] gap-[0.1vw] h-auto [&>*]:text-center [&>*]:text-[1.2vw]">
      {links.map((link) => (
        <div key={link.path} className="group">
          <Link to={link.path}>{link.label}</Link>
          <div
            className={`absolute top-full ${
              link.label === "Dashboard"
                ? "left-[1%]"
                : link.label === "Cashout"
                ? "left-[25%]"
                : link.label === "Transactions"
                ? "left-[50%]"
                : link.label === "Inventory"
                ? "left-[75%]"
                : "left-0"
            } w-[25%] bg-gray-200 text-black text-[1vw] p-[0.5vw] rounded shadow-md hidden group-hover:block`}
          >
            {link.flyoutText}
          </div>
        </div>
      ))}
    </nav>
  );
}

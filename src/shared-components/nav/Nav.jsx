import { Link } from "react-router";

export function Nav() {
  const links = [
    { path: "/", label: "Dashboard", flyoutText: "Go to Dashboard" },
    { path: "/cashout", label: "Cashout", flyoutText: "Manage Cashout" },
    {
      path: "/transactions",
      label: "Transactions",
      flyoutText: "View Transactions",
    },
    { path: "/inventory", label: "Inventory", flyoutText: "Manage Inventory" },
  ];

  return (
    <nav className="grid grid-cols-[auto_auto_auto_auto] gap-[0.1vw] h-auto [&>*]:text-center [&>*]:text-[1.2vw]">
      {links.map((link) => (
        <div key={link.path} className="relative group">
          <Link to={link.path}>{link.label}</Link>
          <div className="absolute top-full left-0 w-max bg-gray-200 text-black text-[1vw] p-[0.5vw] rounded shadow-md hidden group-hover:block">
            {link.flyoutText}
          </div>
        </div>
      ))}
    </nav>
  );
}

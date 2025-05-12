import { Link } from "react-router";

export function Nav() {
  return (
    <nav className="grid grid-cols-[auto_auto_auto_auto] gap-[0.1vw] h-auto border border-amber-600 [&>*]:border [&>*]:border-amber-400 [&>*]:text-center [&>*]:text-[1.2vw]">
      <Link to="/">Dashboard</Link>
      <Link to="/cashout">Cashout</Link>
      <Link to="/transactions">Transactions</Link>
      <Link to="/inventory">Inventory</Link>
    </nav>
  );
}

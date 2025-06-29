import { supabase } from "../../../../utils/supabaseClient";

export function LogoutButton() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300"
    >
      Sign Out
    </button>
  );
}

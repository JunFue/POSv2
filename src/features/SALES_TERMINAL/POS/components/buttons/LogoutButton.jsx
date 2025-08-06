import { supabase } from "../../../../../utils/supabaseClient";

export function LogoutButton() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <button
      onClick={handleLogout}
      className="text-[1.5vw] text-head-text bg-background hover:bg-primary-700 rounded-md px-4 shadow-button 
                 active:shadow-button-inset
                 border-2 active:border-background border-background hover:border-2 transition-all duration-300 ease-in hover:border-teal-300"
    >
      Sign Out
    </button>
  );
}

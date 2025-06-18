import { useContext } from "react";
import { SettingsContext } from "../context/SettingsContext";

export function Settings() {
  const { setShowSettings } = useContext(SettingsContext);

  return (
    <div className="absolute top-[5vh] left-[35vw] w-[30vw] h-[20vw] rounded-3xl bg-white/30 backdrop-blur-lg border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] p-4 flex flex-col justify-center gap-2 text-gray-800 z-2">
      <button
        onClick={() => {
          setShowSettings((prev) => !prev);
        }} // Add your close logic here
        aria-label="Close settings"
        className="absolute top-6 right-6 text-2xl font-bold text-gray-700 hover:text-gray-900 transition-colors"
      >
        &times;
      </button>

      <h1 className="text-2xl font-bold mb-2 text-gray-900">Settings</h1>
      <p className="text-sm hover:underline cursor-pointer">
        Additional Features
      </p>
      <p className="text-sm hover:underline cursor-pointer">Currency</p>
      <p className="text-sm hover:underline cursor-pointer">Change Theme</p>
    </div>
  );
}

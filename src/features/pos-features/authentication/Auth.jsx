// --- Auth.jsx ---
// This component now cleanly switches between Login and Signup.

import { useAuth } from "./hooks/Useauth";

export default function Auth() {
  const { isLoginView } = useAuth();

  return (
    <div className="bg-gradient-to-br bg-transparent h-fit min-w-100 flex items-center justify-center font-sans absolute z-2 top-[10vh] left-[80%]">
      <div className="w-full max-w-md mx-auto p-4 bg-transparent">
        {isLoginView ? <Login /> : <Signup />}
      </div>
    </div>
  );
}

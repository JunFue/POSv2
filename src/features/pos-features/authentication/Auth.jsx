import { useContext } from "react";
import { Login } from "./Login";
import { Signup } from "./Signup";
import { AuthContext } from "../../../context/AuthContext";

export default function Auth() {
  const { isSignOn } = useContext(AuthContext);

  return (
    <div className="bg-gradient-to-br bg-transparent h-fit min-w-100 flex items-center justify-center font-sans absolute z-2 top-[10vh] left-[80%]">
      <div className="w-full max-w-md mx-auto p-4 bg-transparent">
        {isSignOn ? <Signup /> : <Login />}
      </div>
    </div>
  );
}

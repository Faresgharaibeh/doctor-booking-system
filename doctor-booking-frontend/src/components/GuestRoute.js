import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

export default function GuestRoute({ children }) {
  const { token, initialized } = useAuth();

  if (!initialized) return <Loader />;

  if (token) return <Navigate to="/dashboard" replace />;

  return children;
}

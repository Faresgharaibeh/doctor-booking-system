import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

export default function ProtectedRoute({ children, role }) {
  const { token, user, initialized } = useAuth();

  // لسه بنعمل auth check
  if (!initialized) return <Loader />;

  // مش مسجل دخول
  if (!token) return <Navigate to="/" replace />;

  // لو في role مطلوب
  if (role && user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}

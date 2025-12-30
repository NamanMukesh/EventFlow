import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loading from "./Loading";

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return isAuthenticated ? <Navigate to="/events" /> : children;
};

export default PublicRoute;


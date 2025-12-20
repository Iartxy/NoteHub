import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UploadNote from "./pages/UploadNote";
import NoteDetails from "./pages/NoteDetails";

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/" />;
}

import { useLocation } from "react-router-dom";

function PublicRoute({ children }) {
  const { currentUser } = useAuth();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const hasRedirectTo = Boolean(location.state?.redirectTo || params.get("redirectTo"));
  // When there's a redirectTo (either in state or in URL), allow the public route to render so the login page can complete the post-login navigation.
  if (currentUser && !hasRedirectTo) return <Navigate to="/dashboard" />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <PrivateRoute>
            <UploadNote />
          </PrivateRoute>
        }
      />
      <Route
        path="/note/:id"
        element={
          <PrivateRoute>
            <NoteDetails />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

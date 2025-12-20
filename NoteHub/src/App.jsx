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
  // If there's a redirectTo in state (coming from a protected redirect), allow rendering the public route
  // so it can perform the post-login navigation; otherwise, if user is already authenticated, send to dashboard.
  if (currentUser && !location.state?.redirectTo) return <Navigate to="/dashboard" />;
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

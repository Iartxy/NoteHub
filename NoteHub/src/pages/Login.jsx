import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirectTo = location.state?.redirectTo || params.get("redirectTo") || "/dashboard";
  const shouldOpenFile = location.state?.openFile || params.get("openFile") === "1";
  const { currentUser } = useAuth();

  // Debugging aid: show redirect and openFile so users can confirm what's happening on mobile
  console.log('Login page', { redirectTo, shouldOpenFile, currentUserEmail: currentUser?.email });

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      await login(email, password);
      // Navigate back to the original path, appending openFile=1 as query param when requested
      let target = redirectTo;
      if (shouldOpenFile) {
        // If redirectTo already has a query string, append with &
        target = redirectTo.includes("?") ? `${redirectTo}&openFile=1` : `${redirectTo}?openFile=1`;
      }
      navigate(target);
    } catch (err) {
      setError("Failed to log in. Please check your credentials.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* DEBUG INFO - remove after troubleshooting */}
        <div className="mb-4 text-xs text-gray-500 bg-yellow-50 border border-yellow-100 p-2 rounded">
          <div><strong>Debug:</strong></div>
          <div>redirectTo: <span className="font-mono">{redirectTo}</span></div>
          <div>openFile: <span className="font-mono">{String(shouldOpenFile)}</span></div>
          <div>currentUser: <span className="font-mono">{currentUser?.email || 'none'}</span></div>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">NoteHub</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


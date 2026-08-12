import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Purchases from "./pages/Purchases.jsx";
import Transfers from "./pages/Transfers.jsx";
import Assignments from "./pages/Assignments.jsx";
import Sidebar from "./components/Sidebar.jsx";

import { useAuth } from "./context/AuthContext.jsx";


// ===============================
// PROTECTED ROUTE
// ===============================
function ProtectedRoute({ children }) {

  const { user, loading } = useAuth();

  // Wait until authentication state is loaded
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-lg font-medium text-slate-600">
          Loading...
        </div>
      </div>
    );
  }

  // User is not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated
  return children;
}


// ===============================
// APPLICATION LAYOUT
// ===============================
function Layout() {

  return (
    <div className="min-h-screen bg-slate-100 flex">

      <Sidebar />

      <main className="flex-1 p-6">

        <Routes>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/purchases"
            element={<Purchases />}
          />

          <Route
            path="/transfers"
            element={<Transfers />}
          />

          <Route
            path="/assignments"
            element={<Assignments />}
          />

          {/* Any unknown authenticated route */}
          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />

        </Routes>

      </main>

    </div>
  );
}


// ===============================
// MAIN APP
// ===============================
export default function App() {

  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-lg font-medium text-slate-600">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <Routes>

      {/* LOGIN PAGE */}
      <Route
        path="/login"
        element={
          user
            ? <Navigate to="/dashboard" replace />
            : <Login />
        }
      />

      {/* PROTECTED APPLICATION */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}
import { useState } from "react";
import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Login() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {

    e.preventDefault();

    setError("");

    if (!username || !password) {
      setError("Please enter username and password.");
      return;
    }

    try {

      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            username,
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.message || "Login failed"
        );

      }

      // Save JWT
      localStorage.setItem(
        "token",
        data.token
      );

      // Save user information
      if (data.user) {

        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

      }

      // Go to dashboard
      navigate("/dashboard");

    } catch (err) {

      console.error("Login error:", err);

      setError(
        err.message || "Unable to login"
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        {/* Header */}

        <div className="flex items-center gap-3 mb-7">

          <Shield className="text-slate-800" />

          <div>

            <h1 className="text-xl font-bold">
              Kristallball
            </h1>

            <p className="text-sm text-slate-500">
              Military Asset Management
            </p>

          </div>

        </div>


        {/* Login Form */}

        <form onSubmit={handleLogin}>

          {/* Username */}

          <label className="block text-sm font-medium mb-2">
            Username
          </label>

          <input
            type="text"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            className="w-full border rounded-lg px-3 py-2 mb-4"
            placeholder="Enter username"
          />


          {/* Password */}

          <label className="block text-sm font-medium mb-2">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full border rounded-lg px-3 py-2 mb-6"
            placeholder="Enter password"
          />


          {/* Error */}

          {error && (

            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>

          )}


          {/* Button */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white rounded-lg py-2.5 hover:bg-slate-800 disabled:opacity-50"
          >

            {loading ? "Signing In..." : "Sign In"}

          </button>

        </form>


        <p className="text-xs text-slate-400 mt-4 text-center">
          Secure authentication powered by JWT
        </p>

      </div>

    </div>

  );

}
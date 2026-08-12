import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";


const AuthContext = createContext(null);


export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);


  // ==========================================
  // LOAD LOGIN INFORMATION WHEN APP STARTS
  // ==========================================
  useEffect(() => {

    try {

      const token = localStorage.getItem("token");

      const savedUser = localStorage.getItem("user");


      if (token && savedUser) {

        setUser(JSON.parse(savedUser));

      } else {

        // No login information
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);

      }

    } catch (error) {

      console.error(
        "Failed to restore authentication:",
        error
      );

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setUser(null);

    } finally {

      setLoading(false);

    }

  }, []);


  // ==========================================
  // LOGIN
  // ==========================================
  const login = (userData, token) => {

    localStorage.setItem(
      "token",
      token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    setUser(userData);

  };


  // ==========================================
  // LOGOUT
  // ==========================================
  const logout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    setUser(null);

  };


  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );

}


export function useAuth() {

  return useContext(AuthContext);

}
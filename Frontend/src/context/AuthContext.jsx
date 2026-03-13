import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const API_URL = isLocal
    ? `http://${window.location.hostname}:3000/api`
    : "https://kenkoo-morpheus.onrender.com/api";

  useEffect(() => {
    // Check for token in localStorage on mount
    const checkUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Verify token and get user data
          const res = await fetch(`${API_URL}/user`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
          } else {
            localStorage.removeItem("token");
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const text = await res.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch (err) {
        console.error("Login parsing error:", err);
        console.error("Response text:", text);
        throw new Error(text || "Server returned invalid response");
    }

    if (!res.ok) {
        throw new Error(data.message || "Login failed");
    }

    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data;
  };

  const signup = async (name, email, password) => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const text = await res.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch (err) {
        console.error("Signup parsing error:", err);
        console.error("Response text:", text);
        throw new Error(text || "Server returned invalid response");
    }
    
    if (!res.ok) {
        throw new Error(data.message || "Signup failed");
    }

    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, updateUser: setUser, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

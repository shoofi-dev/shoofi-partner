import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthContextType = {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Load token from storage on mount
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Error loading token:", error);
      }
    };

    loadToken();
  }, []);

  const handleSetToken = async (newToken: string | null) => {
    try {
      if (newToken) {
        await AsyncStorage.setItem("token", newToken);
      } else {
        await AsyncStorage.removeItem("token");
      }
      setToken(newToken);
    } catch (error) {
      console.error("Error saving token:", error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      setToken(null);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken: handleSetToken,
        isAuthenticated: !!token,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 
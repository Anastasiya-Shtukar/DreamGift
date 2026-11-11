import { createContext, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getCurrentUser,
  loginUser,
  registerUser,
  logoutUser,
} from "../api/auth.js";

const AuthContext = createContext(null);
const AUTH_QUERY_KEY = ["auth", "me"];

async function fetchCurrentUser() {
  try {
    return await getCurrentUser();
  } catch (error) {
    if (error.status === 401) {
      return { user: null };
    }

    throw error;
  }
}

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();

  // Restore user session
  const { data, isPending, isError, error } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: fetchCurrentUser,
    retry: false,
    staleTime: 0,
  });

  // Login
  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: async () => {
      await queryClient.cancelQueries();
      queryClient.clear();

      await queryClient.fetchQuery({
        queryKey: AUTH_QUERY_KEY,
        queryFn: fetchCurrentUser,
        staleTime: 0,
      });
    },
  });

  // Register
  const registerMutation = useMutation({
    mutationFn: registerUser,
  });

  // Logout
  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: async () => {
      await queryClient.cancelQueries();

      queryClient.clear();

      queryClient.setQueryData(AUTH_QUERY_KEY, {
        user: null,
      });
    },
  });

  const user = data?.user ?? null;

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoading: isPending,
    isError,
    error,

    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,

    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

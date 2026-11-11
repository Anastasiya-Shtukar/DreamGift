import { apiClient } from "./client.js";

export function registerUser(userData) {
  return apiClient("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export function getCurrentUser() {
  return apiClient("/auth/me");
}

export function loginUser(credentials) {
  return apiClient("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function logoutUser() {
  return apiClient("/auth/logout", {
    method: "POST",
  });
}

export async function apiClient(endpoint, options = {}) {
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const text = await response.text();

  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      if (response.ok) {
        throw new Error("Invalid server response");
      }
    }
  }

  if (!response.ok) {
    const error = new Error(
      data?.message || `Request failed with status ${response.status}`,
    );

    error.status = response.status;
    throw error;
  }

  return data;
}

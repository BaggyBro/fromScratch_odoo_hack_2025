// Simple authentication utilities
export const auth = {
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem("token");
    return !!token;
  },

  // Get the current token
  getToken: (): string | null => {
    return localStorage.getItem("token");
  },

  // Check if token is valid (basic check)
  isTokenValid: (): boolean => {
    const token = localStorage.getItem("token");
    if (!token) return false;
    
    // Basic check - you might want to add JWT expiration check here
    return token.length > 10; // Simple length check
  },

  // Clear authentication
  logout: (): void => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  },

  // Set token (for testing purposes)
  setToken: (token: string): void => {
    localStorage.setItem("token", token);
  }
}; 
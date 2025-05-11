import React, { useState } from "react";
import { login } from "../services/api"; // Assuming login service exists
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  // In a real app, you'd use context or state management for login status

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("Logging in...");
    setIsError(false);
    try {
      const response = await login({ username, password });
      const role = response.data.user?.role;
      if (role === "admin" || role === "guest") {
        setMessage("");
        onLogin({ role, username });
      } else {
        setMessage("Error: Unknown user role.");
        setIsError(true);
      }
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
      setIsError(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center text-indigo-600">
            Welcome Back
          </CardTitle>
          <p className="text-center text-gray-500">
            Sign in to your account to continue
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-sm font-medium text-gray-700"
              >
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <Button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Sign In
            </Button>
          </form>

          {message && (
            <div
              className={`mt-4 p-3 rounded-lg text-center ${
                isError
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-green-50 text-green-700 border border-green-200"
              }`}
            >
              {message}
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">Demo credentials:</p>
            <p className="text-sm text-gray-500">Admin: admin/password</p>
            <p className="text-sm text-gray-500">Guest: guest/guest</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginPage;

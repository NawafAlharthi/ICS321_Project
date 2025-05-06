import React, { useState } from 'react';
import { login } from '../services/api'; // Assuming login service exists
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  // In a real app, you'd use context or state management for login status

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('Logging in...');
    setIsError(false);
    try {
      // Placeholder login - adapt if your API is different
      const response = await login({ username, password });
      setMessage(`Success: Login successful. Role: ${response.data.user?.role || 'N/A'}. (Redirect not implemented)`);
      // TODO: Store auth token/user info (e.g., in localStorage or context)
      // TODO: Redirect based on role (e.g., using useNavigate from react-router-dom)
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
      setIsError(true);
    }
  };

  return (
    // Center the card on the page
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username (admin or guest)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password (password or guest)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">Login</Button>
          </form>
          {message && (
            <p className={`mt-4 text-center p-2 rounded ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </p>
          )}
          <p className="mt-4 text-center text-sm text-gray-600">
            <i>Use admin/password or guest/guest for placeholder login.</i>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginPage;


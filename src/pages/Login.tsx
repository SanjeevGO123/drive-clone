import { useState } from 'react';
import { signIn } from '../aws/auth';


export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {

      const token = await signIn(username, password);
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      console.log('Login successful', token);
      window.location.href = '/dashboard';
    } catch (err) {
      alert('Login failed: ' + (err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded-xl shadow-md w-full max-w-sm">
        <div className="text-center mb-6">
          <img
            src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/logo_gmail_lockup_default_1x_r2.png"
            alt="Logo"
            className="mx-auto w-28"
          />
          <h2 className="mt-6 text-2xl font-semibold text-gray-800">Sign in</h2>
          <p className="text-sm text-gray-500">to continue to Drive Clone</p>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring focus:border-blue-400"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring focus:border-blue-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            onClick={handleLogin}
          >
            Next
          </button>
        </div>
        <p className="mt-6 text-xs text-gray-400 text-center">
          Not your computer? Use Guest mode to sign in privately.
        </p>
      </div>
    </div>
  );
}

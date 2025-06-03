import React, { useState } from "react";
import { signIn, signUp, confirmSignUp } from "../aws/auth";

export default function Auth() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(""); // only for signup
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [needOtp, setNeedOtp] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle sign up
  const handleSignUp = async () => {
    if (!username || !password || !email) {
      alert("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await signUp(username, password, email);
      alert("Signup successful! Check your email for the verification code.");
      setNeedOtp(true);
    } catch (err: any) {
      alert("Signup failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle sign in
  const handleSignIn = async () => {
    setLoading(true);
    try {
      const token = await signIn(username, password);
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);
      window.location.href = "/dashboard";
    } catch (err: any) {
      if (err.code === "UserNotConfirmedException") {
        setNeedOtp(true);
      } else {
        alert("Login failed: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP confirm (both signup & signin cases)
  const handleConfirm = async () => {
    if (!otp) {
      alert("Please enter the OTP sent to your email.");
      return;
    }
    setLoading(true);
    try {
      await confirmSignUp(username, otp);
      alert("Verification successful! Signing you in...");

      // After confirm, sign in automatically
      const token = await signIn(username, password);
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);
      window.location.href = "/dashboard";
    } catch (err: any) {
      alert("Failed to confirm signup: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // UI

  if (needOtp) {
    // Show OTP confirmation form
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-10 rounded-xl shadow-md w-full max-w-sm text-center">
          <h2 className="text-2xl font-semibold mb-4">Confirm Signup</h2>
          <p className="mb-6 text-gray-600">
            Enter the verification code sent to your email.
          </p>
          <input
            type="text"
            placeholder="OTP code"
            className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4 focus:outline-none focus:ring focus:border-blue-400"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition disabled:opacity-50"
            onClick={handleConfirm}
          >
            {loading ? "Verifying..." : "Verify & Sign In"}
          </button>
        </div>
      </div>
    );
  }

  // Show sign in / sign up form
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded-xl shadow-md w-full max-w-sm">
        <div className="text-center mb-6">
          <h2 className="mt-6 text-2xl font-semibold text-gray-800">
            {mode === "signin" ? "Sign in" : "Sign up"}
          </h2>
          <p className="text-sm text-gray-500">
            {mode === "signin"
              ? "to continue to Drive Clone"
              : "Create your account"}
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring focus:border-blue-400"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {mode === "signup" && (
            <input
              type="email"
              placeholder="Email"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring focus:border-blue-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
          <input
            type="password"
            placeholder="Password"
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring focus:border-blue-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            disabled={loading}
            className={`w-full py-2 rounded-md text-white transition disabled:opacity-50 ${
              mode === "signin"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
            onClick={mode === "signin" ? handleSignIn : handleSignUp}
          >
            {loading ? (mode === "signin" ? "Signing in..." : "Signing up...") : mode === "signin" ? "Sign In" : "Sign Up"}
          </button>
        </div>

        <p className="mt-6 text-xs text-gray-400 text-center">
          {mode === "signin" ? (
            <>
              Don't have an account?{" "}
              <button
                className="text-blue-600 hover:underline"
                onClick={() => setMode("signup")}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                className="text-blue-600 hover:underline"
                onClick={() => setMode("signin")}
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

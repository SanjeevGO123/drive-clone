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
  const [customToast, setCustomToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Handle sign up
  const handleSignUp = async () => {
    if (!username || !password || !email) {
      setCustomToast({ message: "Please fill in all fields.", type: "error" });
      return;
    }
    setLoading(true);
    try {
      await signUp(username, password, email);
      setCustomToast({ message: "Signup successful! Check your email for the verification code.", type: "success" });
      setNeedOtp(true);
    } catch (err: any) {
      setCustomToast({ message: "Signup failed: " + err.message, type: "error" });
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
        setCustomToast({ message: "Login failed: " + err.message, type: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP confirm (both signup & signin cases)
  const handleConfirm = async () => {
    if (!otp) {
      setCustomToast({ message: "Please enter the OTP sent to your email.", type: "error" });
      return;
    }
    setLoading(true);
    try {
      await confirmSignUp(username, otp);
      setCustomToast({ message: "Verification successful! Signing you in...", type: "success" });
      // After confirm, sign in automatically
      const token = await signIn(username, password);
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);
      window.location.href = "/dashboard";
    } catch (err: any) {
      setCustomToast({ message: "Failed to confirm signup: " + err.message, type: "error" });
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
          {/* Custom Toast Notification */}
          {customToast && (
            <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white transition-all mt-6 ${customToast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
              {customToast.message}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show sign in / sign up form
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 flex flex-col items-center relative border border-gray-200 dark:border-gray-800">
        <img
          src="https://ssl.gstatic.com/images/branding/product/2x/drive_2020q4_48dp.png"
          alt="Google Drive Logo"
          className="w-14 h-14 mb-4 drop-shadow-lg"
        />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1 tracking-tight">
          Sign {mode === "signin" ? "in" : "up"}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {mode === "signin"
            ? "to continue to Drive Clone"
            : "Create your Google-style account"}
        </p>
        <div className="w-full space-y-4 mb-2">
          <input
            type="text"
            placeholder="Username"
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {mode === "signup" && (
            <input
              type="email"
              placeholder="Email"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
          <input
            type="password"
            placeholder="Password"
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          disabled={loading}
          className={`w-full py-2 rounded-lg text-white font-semibold shadow-md transition disabled:opacity-50 mt-2 ${
            mode === "signin"
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
          onClick={mode === "signin" ? handleSignIn : handleSignUp}
        >
          {loading
            ? mode === "signin"
              ? "Signing in..."
              : "Signing up..."
            : mode === "signin"
            ? "Sign In"
            : "Sign Up"}
        </button>
        
        <p className="mt-8 text-xs text-gray-400 text-center w-full">
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
        {/* Custom Toast Notification */}
        {customToast && (
          <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white transition-all mt-6 ${customToast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
            {customToast.message}
          </div>
        )}
      </div>
    </div>
  );
}

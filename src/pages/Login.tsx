import React, { useState, useEffect, useRef } from "react";
import { signIn, signUp, confirmSignUp } from "../aws/auth";
import Iridescence from '../components/login/Iridescence'; 

// Rename the component to match the file name for consistency and to avoid import errors
export default function Login() {
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

  // Stripe-style live animated SVG background using React refs and requestAnimationFrame
  const stripeRef1 = useRef<SVGGElement>(null);
  const stripeRef2 = useRef<SVGGElement>(null);
  const stripeRef3 = useRef<SVGGElement>(null);
  const stripeRef4 = useRef<SVGGElement>(null);
  const stripeRef5 = useRef<SVGGElement>(null);
  // Gradient stop refs for color animation
  const gradRefs = [
    [useRef<SVGStopElement>(null), useRef<SVGStopElement>(null)],
    [useRef<SVGStopElement>(null), useRef<SVGStopElement>(null)],
    [useRef<SVGStopElement>(null), useRef<SVGStopElement>(null)],
    [useRef<SVGStopElement>(null), useRef<SVGStopElement>(null)],
    [useRef<SVGStopElement>(null), useRef<SVGStopElement>(null)],
  ];
  // Add random phase/speed/amp for each bar for full randomness
  const barParams = useRef([
    { px: Math.random() * 1000, py: Math.random() * 1000, rx: Math.random() * 10, sx: 120 + Math.random() * 80, sy: 120 + Math.random() * 80, sr: 4 + Math.random() * 2, spx: 1.2 + Math.random(), spy: 1.7 + Math.random(), spr: 2 + Math.random(), hue: Math.random() * 360 },
    { px: Math.random() * 1000, py: Math.random() * 1000, rx: Math.random() * 10, sx: 180 + Math.random() * 80, sy: 180 + Math.random() * 80, sr: 4 + Math.random() * 2, spx: 1.5 + Math.random(), spy: 1.2 + Math.random(), spr: 2.5 + Math.random(), hue: Math.random() * 360 },
    { px: Math.random() * 1000, py: Math.random() * 1000, rx: Math.random() * 10, sx: 160 + Math.random() * 80, sy: 90 + Math.random() * 80, sr: 4 + Math.random() * 2, spx: 1.3 + Math.random(), spy: 1.1 + Math.random(), spr: 1.5 + Math.random(), hue: Math.random() * 360 },
    { px: Math.random() * 1000, py: Math.random() * 1000, rx: 4 + Math.random() * 10, sx: 140 + Math.random() * 80, sy: 140 + Math.random() * 80, sr: 4 + Math.random() * 2, spx: 1.7 + Math.random(), spy: 1.3 + Math.random(), spr: 2.2 + Math.random(), hue: Math.random() * 360 },
    { px: Math.random() * 1000, py: Math.random() * 1000, rx: 4 + Math.random() * 10, sx: 200 + Math.random() * 80, sy: 200 + Math.random() * 80, sr: 4 + Math.random() * 2, spx: 1.1 + Math.random(), spy: 1.4 + Math.random(), spr: 1.8 + Math.random(), hue: Math.random() * 360 },
  ]);

  useEffect(() => {
    let t = 0;
    let frame: number;
    function animate() {
      t += 0.016;
      const params = barParams.current;
      params.forEach((p, i) => {
        // Animate bar movement
        const gRef = [stripeRef1, stripeRef2, stripeRef3, stripeRef4, stripeRef5][i];
        if (gRef.current) {
          (gRef.current as SVGGElement).setAttribute(
            "transform",
            `translate(${Math.sin(t / p.spx + p.px) * p.sx},${Math.sin(t / p.spy + p.py) * p.sy}) rotate(${Math.sin(t / p.spr + p.rx) * p.sr})`
          );
        }
        // Animate gradient color (hue shift)
        p.hue = (p.hue + 0.3 + Math.abs(Math.sin(t / (2 + i)))) % 360;
        const stop1 = gradRefs[i][0].current;
        const stop2 = gradRefs[i][1].current;
        if (stop1 && stop2) {
          stop1.setAttribute("stop-color", `hsl(${p.hue}, 90%, 70%)`);
          stop2.setAttribute("stop-color", `hsl(${(p.hue + 60 + i * 40) % 360}, 90%, 70%)`);
        }
      });
      frame = window.requestAnimationFrame(animate);
    }
    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animate the gradient stops for color shifting
  useEffect(() => {
    let t = 0;
    let frame: number;
    // Helper to shift hue
    function shiftHue(hex: string, deg: number) {
      // Convert hex to RGB
      let r = parseInt(hex.slice(1, 3), 16);
      let g = parseInt(hex.slice(3, 5), 16);
      let b = parseInt(hex.slice(5, 7), 16);
      // Convert RGB to HSL
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      h = (h * 360 + deg) % 360;
      if (h < 0) h += 360;
      // Convert HSL back to RGB
      s = Math.max(0, Math.min(1, s));
      l = Math.max(0, Math.min(1, l));
      let c = (1 - Math.abs(2 * l - 1)) * s;
      let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      let m = l - c / 2;
      let r1 = 0, g1 = 0, b1 = 0;
      if (0 <= h && h < 60) { r1 = c; g1 = x; b1 = 0; }
      else if (60 <= h && h < 120) { r1 = x; g1 = c; b1 = 0; }
      else if (120 <= h && h < 180) { r1 = 0; g1 = c; b1 = x; }
      else if (180 <= h && h < 240) { r1 = 0; g1 = x; b1 = c; }
      else if (240 <= h && h < 300) { r1 = x; g1 = 0; b1 = c; }
      else { r1 = c; g1 = 0; b1 = x; }
      let R = Math.round((r1 + m) * 255);
      let G = Math.round((g1 + m) * 255);
      let B = Math.round((b1 + m) * 255);
      return `#${R.toString(16).padStart(2, '0')}${G.toString(16).padStart(2, '0')}${B.toString(16).padStart(2, '0')}`;
    }
    // Each bar gets its own base colors and phase
    const baseStops = [
      ["#60a5fa", "#a78bfa"],
      ["#f472b6", "#facc15"],
      ["#34d399", "#818cf8"],
      ["#fbbf24", "#f472b6"],
      ["#38bdf8", "#f472b6"],
    ];
    const stopIds = [
      ["stripe1-stop1", "stripe1-stop2"],
      ["stripe2-stop1", "stripe2-stop2"],
      ["stripe3-stop1", "stripe3-stop2"],
      ["stripe4-stop1", "stripe4-stop2"],
      ["stripe5-stop1", "stripe5-stop2"],
    ];
    const barPhase = [0, 0.7, 1.4, 2.1, 2.8];
    function animate() {
      t += 0.016;
      for (let i = 0; i < 5; ++i) {
        const deg = (Math.sin(t + barPhase[i]) * 60 + t * 40 + i * 60) % 360;
        const c1 = shiftHue(baseStops[i][0], deg);
        const c2 = shiftHue(baseStops[i][1], -deg);
        const stop1 = document.getElementById(stopIds[i][0]);
        const stop2 = document.getElementById(stopIds[i][1]);
        if (stop1) stop1.setAttribute("stop-color", c1);
        if (stop2) stop2.setAttribute("stop-color", c2);
      }
      frame = window.requestAnimationFrame(animate);
    }
    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    document.title = mode === "signin" ? "Sign in" : "Sign up";
  }, [mode]);

  if (needOtp) {
    // Show OTP confirmation form
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center relative overflow-hidden">
        {/* Iridescence background without className prop, use a wrapper div for styling */}
        <div className="absolute inset-0 w-full h-full z-0 blur-xl">
          <Iridescence color={[1,1,1]} mouseReact={true} amplitude={0.1} speed={1.0} />
        </div>
        <div className="bg-white p-10 rounded-xl shadow-md w-full max-w-sm text-center relative z-10">
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
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Iridescence background for main form, same fix */}
      <div className="absolute inset-0 w-full h-full z-0 blur-xl">
        <Iridescence color={[1,1,1]} mouseReact={true} amplitude={0.1} speed={1.0} />
      </div>
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-7 flex flex-col items-center relative border border-gray-200 dark:border-gray-800 z-10">
        
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-1 tracking-tight">
          Sign {mode === "signin" ? "in" : "up"}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {mode === "signin"
            ? "to continue to Drive Clone"
            : "Create your Google-style account"}
        </p>
        {/* Add form element to enable Enter key submit */}
        <form
          className="w-full space-y-3 mb-2"
          onSubmit={e => {
            e.preventDefault();
            if (mode === "signin") handleSignIn();
            else handleSignUp();
          }}
        >
          <input
            type="text"
            placeholder="Username"
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100 transition"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
          {mode === "signup" && (
            <input
              type="email"
              placeholder="Email"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
          <input
            type="password"
            placeholder="Password"
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-semibold shadow-md transition disabled:opacity-50 text-base mb-2 ${
              mode === "signin"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading
              ? mode === "signin"
                ? "Signing in..."
                : "Signing up..."
              : mode === "signin"
              ? "Sign In"
              : "Sign Up"}
          </button>
        </form>
        
        <p className="mt-2 text-xs text-gray-400 text-center w-full">
          {mode === "signin" ? (
            <>
              Don't have an account?{" "}
              <button
                className="text-blue-600 hover:underline focus:outline-none"
                onClick={() => setMode("signup")}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                className="text-blue-600 hover:underline focus:outline-none"
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

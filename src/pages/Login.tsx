import React, { useState, useEffect, useRef } from "react";
import { signIn, signUp, confirmSignUp } from "../aws/auth";
import Iridescence from '../components/login/Iridescence';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Form, FormItem, FormLabel } from "../components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../components/ui/input-otp";
import { useToast } from "../components/ui/use-toast";
import { Toaster } from "../components/ui/toaster";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { AlertCircle } from "lucide-react"; 

// This file defines the Login component, which provides the user interface for signing in and signing up.
// It includes functionality for handling authentication, OTP verification, and dynamic UI updates.

// Key Features:
// - Sign in and sign up forms: Allows users to log in or create an account.
// - OTP verification: Handles email-based verification for new accounts.
// - Animated background: Uses the Iridescence component for a visually appealing background.
// - Custom toast notifications: Displays feedback messages for user actions.
// - Responsive design: Adapts to different screen sizes.

// State Variables:
// - mode: Tracks whether the user is signing in or signing up.
// - username, email, password: Stores user input for authentication.
// - otp: Stores the OTP code for verification.
// - needOtp: Indicates whether OTP verification is required.
// - loading: Tracks the loading state for asynchronous operations.
// - customToast: Displays feedback messages for user actions.

// Utility Functions:
// - handleSignUp: Handles the sign-up process, including validation and API calls.
// - handleSignIn: Handles the sign-in process, including validation and API calls.
// - handleConfirm: Handles OTP verification and automatic sign-in after confirmation.

// UI Elements:
// - Animated background: Uses the Iridescence component for a dynamic visual effect.
// - Forms: Includes input fields for username, email, password, and OTP.
// - Buttons: Provides actions for signing in, signing up, and verifying OTP.
// - Toast notifications: Displays feedback messages for user actions.

// Responsive Design:
// - Ensures the layout adapts to different screen sizes.
// - Uses Tailwind CSS for styling.

// Rename the component to match the file name for consistency and to avoid import errors
export default function Login() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(""); // only for signup
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [needOtp, setNeedOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorTitle, setErrorTitle] = useState("Error");
  const { toast } = useToast();

  // Password validation function
  const validatePassword = (password: string) => {
    const requirements = [];
    let isValid = true;

    if (!/[0-9]/.test(password)) {
      requirements.push("Contains at least 1 number");
      isValid = false;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      requirements.push("Contains at least 1 special character");
      isValid = false;
    }
    if (!/[A-Z]/.test(password)) {
      requirements.push("Contains at least 1 uppercase letter");
      isValid = false;
    }
    if (!/[a-z]/.test(password)) {
      requirements.push("Contains at least 1 lowercase letter");
      isValid = false;
    }

    return { isValid, requirements };
  };

  // Handle sign up
  const handleSignUp = async () => {
    if (!username || !password || !email) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate password requirements before making API request
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      toast({
        title: "Password Requirements",
        description: (
          <div className="space-y-1">
            <p>Password must contain:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              {passwordValidation.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        ),
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      await signUp(username, password, email);
      toast({
        title: "Success",
        description: "Signup successful! Check your email for the verification code.",
      });
      setNeedOtp(true);
    } catch (err: any) {
      // Show error dialog for username already taken
      if (err.code === "UsernameExistsException" || err.message.includes("already exists")) {
        setErrorTitle("Username Already Taken");
        setErrorMessage("This username is already taken. Please choose a different username.");
        setShowErrorDialog(true);
      } else if (err.code === "InvalidParameterException" || err.code === "InvalidPasswordException") {
        // Show toast for password criteria errors
        toast({
          title: "Password Requirements",
          description:
            "Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters.",
          variant: "destructive",
        });
      } else {
        // For other errors, use toast for less critical ones
        toast({
          title: "Error",
          description: "Signup failed: " + err.message,
          variant: "destructive",
        });
      }
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
        // Show error dialog for login failures
        setErrorTitle("Login Failed");
        setErrorMessage(`Login failed: ${err.message}`);
        setShowErrorDialog(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP confirm (both signup & signin cases)
  const handleConfirm = async () => {
    if (!otp) {
      toast({
        title: "Error",
        description: "Please enter the OTP sent to your email.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      await confirmSignUp(username, otp);
      toast({
        title: "Success",
        description: "Verification successful! Signing you in...",
      });
      // After confirm, sign in automatically
      const token = await signIn(username, password);
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);
      window.location.href = "/dashboard";
    } catch (err: any) {
      // Show error dialog for wrong OTP
      setErrorTitle("Verification Failed");
      setErrorMessage(err.message || "Invalid verification code. Please try again.");
      setShowErrorDialog(true);
      // Also clear the OTP input
      setOtp("");
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
        <Card className="w-full max-w-sm relative z-10">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold">Confirm Signup</CardTitle>
            <CardDescription>
              Enter the verification code sent to your email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form className="space-y-6">
              <FormItem className="flex flex-col items-center space-y-2">
                <FormLabel htmlFor="otp">Verification Code</FormLabel>
                <InputOTP 
                  value={otp} 
                  onChange={setOtp}
                  maxLength={6}
                  className="justify-center"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormItem>
              <Button
                disabled={loading}
                className="w-full"
                onClick={handleConfirm}
              >
                {loading ? "Verifying..." : "Verify & Sign In"}
              </Button>
            </Form>
          </CardContent>
        </Card>
        
        {/* Error Dialog */}
        <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                {errorTitle}
              </DialogTitle>
              <DialogDescription>
                {errorMessage}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                onClick={() => setShowErrorDialog(false)}
                className="w-full"
              >
                Try Again
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Toaster />
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
      <Card className="w-full max-w-sm relative z-10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Sign {mode === "signin" ? "in" : "up"}
          </CardTitle>
          <CardDescription>
            {mode === "signin"
              ? "to continue to Drive Clone"
              : "Create your Google-style account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form
            onSubmit={e => {
              e.preventDefault();
              if (mode === "signin") handleSignIn();
              else handleSignUp();
            }}
          >
            <FormItem>
              <FormLabel htmlFor="username">Username</FormLabel>
              <Input
                id="username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
            </FormItem>
            {mode === "signup" && (
              <FormItem>
                <FormLabel htmlFor="email">Email</FormLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormItem>
            )}
            <FormItem>
              <FormLabel htmlFor="password">Password</FormLabel>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {mode === "signup" && password && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground">Password requirements:</p>
                  <div className="space-y-1">
                    <div className={`flex items-center text-xs ${/[0-9]/.test(password) ? 'text-green-600' : 'text-red-500'}`}>
                      <span className="mr-2">{/[0-9]/.test(password) ? '✓' : '✗'}</span>
                      Contains at least 1 number
                    </div>
                    <div className={`flex items-center text-xs ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'text-green-600' : 'text-red-500'}`}>
                      <span className="mr-2">{/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? '✓' : '✗'}</span>
                      Contains at least 1 special character
                    </div>
                    <div className={`flex items-center text-xs ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-red-500'}`}>
                      <span className="mr-2">{/[A-Z]/.test(password) ? '✓' : '✗'}</span>
                      Contains at least 1 uppercase letter
                    </div>
                    <div className={`flex items-center text-xs ${/[a-z]/.test(password) ? 'text-green-600' : 'text-red-500'}`}>
                      <span className="mr-2">{/[a-z]/.test(password) ? '✓' : '✗'}</span>
                      Contains at least 1 lowercase letter
                    </div>
                  </div>
                </div>
              )}
            </FormItem>
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              variant={mode === "signin" ? "default" : "secondary"}
            >
              {loading
                ? mode === "signin"
                  ? "Signing in..."
                  : "Signing up..."
                : mode === "signin"
                ? "Sign In"
                : "Sign Up"}
            </Button>
          </Form>
          
          <p className="mt-4 text-xs text-muted-foreground text-center">
            {mode === "signin" ? (
              <>
                Don't have an account?{" "}
                <Button
                  variant="link"
                  className="h-auto p-0 text-xs"
                  onClick={() => setMode("signup")}
                >
                  Sign up
                </Button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Button
                  variant="link"
                  className="h-auto p-0 text-xs"
                  onClick={() => setMode("signin")}
                >
                  Sign in
                </Button>
              </>
            )}
          </p>
        </CardContent>
      </Card>
      
      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              {errorTitle}
            </DialogTitle>
            <DialogDescription>
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              onClick={() => setShowErrorDialog(false)}
              className="w-full"
            >
              Try Again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Toaster />
    </div>
  );
}

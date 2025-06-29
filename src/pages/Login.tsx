import React, { useState, useEffect } from "react";
import { signIn, signUp, confirmSignUp } from "../aws/auth";
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

// Animated Background Component
const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient mesh with more colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-emerald-400 via-pink-400 to-orange-400"></div>
      
      {/* Animated mesh layers */}
      <div className="absolute inset-0">
        {/* Large flowing gradient shapes with more vibrant colors */}
        <div 
          className="absolute w-[150vw] h-[150vh] -top-1/2 -left-1/2 opacity-80 animate-mesh-1"
          style={{
            background: 'radial-gradient(ellipse 80vw 40vh at 20% 50%, rgba(120, 119, 198, 0.8) 0%, transparent 50%), radial-gradient(ellipse 60vw 30vh at 80% 30%, rgba(255, 119, 198, 0.6) 0%, transparent 50%)'
          }}
        ></div>
        
        <div 
          className="absolute w-[150vw] h-[150vh] -top-1/2 -right-1/2 opacity-70 animate-mesh-2"
          style={{
            background: 'radial-gradient(ellipse 70vw 35vh at 80% 70%, rgba(255, 184, 119, 0.7) 0%, transparent 50%), radial-gradient(ellipse 50vw 25vh at 20% 20%, rgba(119, 255, 198, 0.6) 0%, transparent 50%)'
          }}
        ></div>
        
        <div 
          className="absolute w-[150vw] h-[150vh] -bottom-1/2 -left-1/2 opacity-75 animate-mesh-3"
          style={{
            background: 'radial-gradient(ellipse 90vw 45vh at 30% 40%, rgba(198, 119, 255, 0.6) 0%, transparent 50%), radial-gradient(ellipse 40vw 20vh at 70% 80%, rgba(119, 255, 119, 0.8) 0%, transparent 50%)'
          }}
        ></div>
        
        <div 
          className="absolute w-[150vw] h-[150vh] -bottom-1/2 -right-1/2 opacity-65 animate-mesh-4"
          style={{
            background: 'radial-gradient(ellipse 65vw 32vh at 60% 60%, rgba(119, 198, 255, 0.7) 0%, transparent 50%), radial-gradient(ellipse 75vw 38vh at 40% 10%, rgba(255, 119, 162, 0.6) 0%, transparent 50%)'
          }}
        ></div>
        
        {/* Additional vibrant layers for more color variety */}
        <div 
          className="absolute w-[140vw] h-[140vh] -top-1/3 left-1/4 opacity-60 animate-mesh-5"
          style={{
            background: 'radial-gradient(ellipse 55vw 28vh at 50% 60%, rgba(34, 197, 94, 0.7) 0%, transparent 50%), radial-gradient(ellipse 45vw 22vh at 30% 40%, rgba(168, 85, 247, 0.5) 0%, transparent 50%)'
          }}
        ></div>
        
        <div 
          className="absolute w-[130vw] h-[130vh] bottom-1/4 -right-1/3 opacity-55 animate-mesh-6"
          style={{
            background: 'radial-gradient(ellipse 60vw 30vh at 40% 30%, rgba(14, 165, 233, 0.6) 0%, transparent 50%), radial-gradient(ellipse 35vw 18vh at 80% 70%, rgba(236, 72, 153, 0.7) 0%, transparent 50%)'
          }}
        ></div>
        
        <div 
          className="absolute w-[120vw] h-[120vh] top-1/3 -left-1/4 opacity-65 animate-mesh-7"
          style={{
            background: 'radial-gradient(ellipse 50vw 25vh at 70% 50%, rgba(16, 185, 129, 0.8) 0%, transparent 50%), radial-gradient(ellipse 30vw 15vh at 20% 80%, rgba(245, 158, 11, 0.6) 0%, transparent 50%)'
          }}
        ></div>
      </div>
      
      {/* Enhanced overlay for depth with more color stops */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 via-emerald-500/15 via-rose-500/10 to-orange-500/20"></div>
    </div>
  );
}; 

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

    if (password.length < 8) {
      requirements.push("At least 8 characters long");
      isValid = false;
    }
    if (!/[0-9]/.test(password)) {
      requirements.push("Contains at least 1 number");
      isValid = false;
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
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

  useEffect(() => {
    document.title = mode === "signin" ? "Sign in" : "Sign up";
  }, [mode]);

  if (needOtp) {
    // Show OTP confirmation form
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <AnimatedBackground />
        <Card className="w-full max-w-sm relative z-10 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 shadow-2xl" style={{ filter: 'none', backdropFilter: 'none' }}>
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
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4">
      <AnimatedBackground />
      <Card className="w-full max-w-sm relative z-10 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 shadow-2xl" style={{ filter: 'none', backdropFilter: 'none' }}>
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
                    <div className={`flex items-center text-xs ${password.length >= 8 ? 'text-green-600' : 'text-red-500'}`}>
                      <span className="mr-2">{password.length >= 8 ? '✓' : '✗'}</span>
                      At least 8 characters long
                    </div>
                    <div className={`flex items-center text-xs ${/[0-9]/.test(password) ? 'text-green-600' : 'text-red-500'}`}>
                      <span className="mr-2">{/[0-9]/.test(password) ? '✓' : '✗'}</span>
                      Contains at least 1 number
                    </div>
                    <div className={`flex items-center text-xs ${/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) ? 'text-green-600' : 'text-red-500'}`}>
                      <span className="mr-2">{/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) ? '✓' : '✗'}</span>
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

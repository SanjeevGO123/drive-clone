'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Disable static generation for this route
export const dynamic = 'force-dynamic';

import { signIn, signUp, confirmSignUp } from "../../src/aws/auth";
import { Button } from "../../src/components/ui/button";
import { Input } from "../../src/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../src/components/ui/card";
import { Form, FormItem, FormLabel } from "../../src/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../../src/components/ui/input-otp";
import { useToast } from "../../src/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../src/components/ui/dialog";
import { AlertCircle } from "lucide-react";

// Modern Animated Background Component
const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Deep glass base with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900"></div>
      
      {/* Static liquid orbs */}
      <div className="absolute inset-0">
        {/* Primary large liquid blob */}
        <div 
          className="absolute w-[500px] h-[500px] opacity-60"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.9) 0%, rgba(168, 85, 247, 0.7) 30%, rgba(59, 130, 246, 0.5) 60%, transparent 90%)',
            filter: 'blur(60px)',
            borderRadius: '63% 37% 54% 46% / 55% 48% 52% 45%',
            top: '-10%',
            left: '-15%'
          }}
        ></div>
        
        {/* Secondary blob */}
        <div 
          className="absolute w-[600px] h-[400px] opacity-50"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(236, 72, 153, 0.8) 0%, rgba(219, 39, 119, 0.6) 25%, rgba(147, 51, 234, 0.4) 70%, transparent 95%)',
            filter: 'blur(80px)',
            borderRadius: '42% 58% 70% 30% / 45% 25% 75% 55%',
            top: '30%',
            right: '-20%'
          }}
        ></div>
        
        {/* Tertiary blob */}
        <div 
          className="absolute w-[450px] h-[550px] opacity-55"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.7) 0%, rgba(34, 197, 94, 0.5) 40%, rgba(59, 130, 246, 0.3) 80%, transparent 100%)',
            filter: 'blur(70px)',
            borderRadius: '38% 62% 25% 75% / 68% 55% 45% 32%',
            bottom: '-10%',
            left: '10%'
          }}
        ></div>
        
        {/* Fourth blob */}
        <div 
          className="absolute w-[350px] h-[450px] opacity-45"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(251, 146, 60, 0.8) 0%, rgba(245, 101, 101, 0.6) 35%, rgba(168, 85, 247, 0.4) 75%, transparent 100%)',
            filter: 'blur(55px)',
            borderRadius: '71% 29% 43% 57% / 34% 66% 34% 66%',
            top: '50%',
            left: '40%'
          }}
        ></div>
      </div>
      
      {/* Enhanced glass texture layers */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/8 via-transparent to-white/12"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-white/6 to-transparent"></div>
      </div>
    </div>
  );
}; 

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
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
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === "UsernameExistsException" || error.message?.includes("already exists")) {
        setErrorTitle("Username Already Taken");
        setErrorMessage("This username is already taken. Please choose a different username.");
        setShowErrorDialog(true);
      } else if (error.code === "InvalidParameterException" || error.code === "InvalidPasswordException") {
        toast({
          title: "Password Requirements",
          description:
            "Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Signup failed: " + error.message,
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
      localStorage.setItem("tokenTime", Date.now().toString());
      localStorage.setItem("username", username);
      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === "UserNotConfirmedException") {
        setNeedOtp(true);
      } else {
        setErrorTitle("Login Failed");
        setErrorMessage(`Login failed: ${error.message}`);
        setShowErrorDialog(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP confirm
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
      const token = await signIn(username, password);
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);
      localStorage.setItem("tokenTime", Date.now().toString());
      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorTitle("Verification Failed");
      setErrorMessage(error.message || "Invalid verification code. Please try again.");
      setShowErrorDialog(true);
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = mode === "signin" ? "Sign in" : "Sign up";
  }, [mode]);

  if (needOtp) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <AnimatedBackground />
        <Card className="w-full max-w-sm relative z-10 glassmorphism-card">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4">
      <AnimatedBackground />
      <Card className="w-full max-w-sm relative z-10 glassmorphism-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Sign {mode === "signin" ? "in" : "up"}
          </CardTitle>
          <CardDescription className="text-white/90 font-medium">
            {mode === "signin"
              ? "to continue to Drive Clone"
              : "Create your account"}
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
                    <div className={`flex items-center text-xs ${password.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                      <span className="mr-2">{password.length >= 8 ? '✓' : '✗'}</span>
                      At least 8 characters long
                    </div>
                    <div className={`flex items-center text-xs ${/[0-9]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                      <span className="mr-2">{/[0-9]/.test(password) ? '✓' : '✗'}</span>
                      Contains at least 1 number
                    </div>
                    <div className={`flex items-center text-xs ${/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                      <span className="mr-2">{/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) ? '✓' : '✗'}</span>
                      Contains at least 1 special character
                    </div>
                    <div className={`flex items-center text-xs ${/[A-Z]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                      <span className="mr-2">{/[A-Z]/.test(password) ? '✓' : '✗'}</span>
                      Contains at least 1 uppercase letter
                    </div>
                    <div className={`flex items-center text-xs ${/[a-z]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
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
              className="w-full mt-6"
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
          
          <p className="mt-4 text-xs text-white/80 text-center font-medium">
            {mode === "signin" ? (
              <>
                Don't have an account?{" "}
                <Button
                  variant="link"
                  className="h-auto p-0 text-xs text-blue-400 hover:text-blue-300 font-semibold"
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
                  className="h-auto p-0 text-xs text-blue-400 hover:text-blue-300 font-semibold"
                  onClick={() => setMode("signin")}
                >
                  Sign in
                </Button>
              </>
            )}
          </p>
        </CardContent>
      </Card>
      
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
    </div>
  );
}

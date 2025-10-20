import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { initializePaystack } from "@/lib/paystack";
import { insertUserSchema } from "@shared/schema";
import { GraduationCap, Shield, CreditCard, CheckCircle, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const registrationSchema = insertUserSchema.extend({
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function Registration() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'payment' | 'verifying'>('form');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mpesa'>('card');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [tempToken, setTempToken] = useState<string | null>(null);
  
  // Centralized storage cleanup utility for failed payments
  const clearAllUserData = () => {
    // Clear authentication tokens
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
    
    // Clear session tokens
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith("session_token_")) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear temporary registration token
    setTempToken(null);
    
    // Reset component state
    setIsProcessingPayment(false);
    setPaymentStep('form');
  };
  
  // Check if user is already registered
  const userId = localStorage.getItem("user_id");
  const userEmail = localStorage.getItem("user_email");
  const authToken = localStorage.getItem("auth_token");
  const isRetaking = Boolean(userId && userEmail && authToken);

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      termsAccepted: false,
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: Omit<RegistrationForm, "termsAccepted">) => {
      const response = await apiRequest("POST", "/api/register", userData);
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Registration response:", data);
      
      // Store temporary token only - do not store user data yet
      if (data.tempToken) {
        setTempToken(data.tempToken);
        console.log("TempToken set to:", data.tempToken);
      } else {
        console.error("No tempToken in registration response:", data);
        toast({
          title: "Registration failed",
          description: "Server error: No temporary token received. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      setPaymentStep('processing');
      toast({
        title: "Registration data saved! ✅",
        description: "Preparing your payment...",
      });
      
      // Small delay to show processing state
      setTimeout(() => {
        console.log("About to call handlePayment with tempToken:", data.tempToken);
        handlePayment({ 
          firstName: form.getValues().firstName,
          lastName: form.getValues().lastName,
          email: form.getValues().email
        }, data.tempToken); // Pass tempToken directly
      }, 1000);
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const createSessionMutation = useMutation({
    mutationFn: async (userId: string | null) => {
      // Use pre-payment endpoint for new registrations, regular endpoint for authenticated users
      const endpoint = userId ? "/api/test-sessions" : "/api/test-sessions/pre-payment";
      const payload = userId ? {
        userId,
        status: "pending",
        paymentStatus: "pending",
      } : {
        status: "pending",
        paymentStatus: "pending",
      };
      
      const response = await apiRequest("POST", endpoint, payload);
      return response.json();
    },
  });

  const handleRetakePayment = async () => {
    try {
      setIsProcessingPayment(true);
      
      // Verify authentication before creating session
      const currentAuthToken = localStorage.getItem("auth_token");
      if (!currentAuthToken) {
        throw new Error("Please log in again to continue");
      }
      
      // Create test session for existing user
      const sessionResponse = await createSessionMutation.mutateAsync(userId!);
      const session = sessionResponse.session;
      const sessionToken = sessionResponse.sessionToken;

      // Store session token for API calls
      localStorage.setItem(`session_token_${session.id}`, sessionToken);
      console.log("Session created:", session.id);
      
      // Check if Paystack is configured
      const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
      console.log("Paystack public key available:", !!paystackPublicKey);
      
      if (!paystackPublicKey) {
        throw new Error("Payment system not configured. Please contact support.");
      }

      // Initialize Paystack payment for retake
      console.log("Initializing Paystack payment...");
      const paymentResult = await initializePaystack({
        email: userEmail!,
        amount: paymentMethod === 'card' ? 800 : 100000, // $8 USD or KES 1,000 in kobo
        firstName: "Test", // We don't store first/last name separately, using placeholder
        lastName: "User",
        sessionId: session.id,
        paymentMethod: paymentMethod,
        mpesaPhone: paymentMethod === 'mpesa' ? mpesaPhone : undefined,
      });

      console.log("Payment result:", paymentResult);

      if (paymentResult.success) {
        // Payment successful, redirect to dashboard
        toast({
          title: "Payment successful!",
          description: "You can now start your English proficiency test from your dashboard.",
        });
        setLocation("/dashboard");
      } else {
        throw new Error(paymentResult.message || "Payment failed");
      }
    } catch (error: any) {
      console.error("Payment failed:", error);
      
      // If authentication failed, redirect to login
      if (error.message && error.message.includes("Authentication required")) {
        toast({
          title: "Session expired",
          description: "Please log in again to continue",
          variant: "destructive",
        });
        // Clear expired tokens
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_id");
        localStorage.removeItem("user_email");
        setLocation("/login");
        return;
      }
      
      toast({
        title: "Payment failed",
        description: error.message || "Unable to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePayment = async (userInfo: any, providedTempToken?: string) => {
    try {
      setIsProcessingPayment(true);
      setPaymentStep('processing');

      // Use provided tempToken or fall back to state
      const currentTempToken = providedTempToken || tempToken;
      console.log("handlePayment called with tempToken:", currentTempToken);
      if (!currentTempToken) {
        console.error("TempToken is null or undefined in handlePayment");
        throw new Error("Registration data not found. Please try again.");
      }

      // Create test session with null userId (pre-payment)
      toast({
        title: "Setting up test session...",
        description: "Preparing your assessment",
      });
      
      const sessionResponse = await createSessionMutation.mutateAsync(null); // Pass null for userId
      const session = sessionResponse.session;
      const sessionToken = sessionResponse.sessionToken;

      // Store session token temporarily
      localStorage.setItem(`session_token_${session.id}`, sessionToken);
      
      // Check if Paystack is configured
      const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
      
      if (!paystackPublicKey) {
        throw new Error("Payment system not configured. Please contact support.");
      }

      // Show payment modal
      setPaymentStep('payment');
      toast({
        title: paymentMethod === 'card' ? "Opening secure card payment" : "Initiating M-Pesa payment",
        description: paymentMethod === 'card' ? "Complete your card payment to access the test" : "Check your phone for M-Pesa prompt and enter your PIN",
      });
      
      // Initialize Paystack payment with real session ID
      const paymentResult = await initializePaystack({
        email: userInfo.email,
        amount: paymentMethod === 'card' ? 800 : 100000, // $8 USD or KES 1,000 in kobo
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        sessionId: session.id, // Use real session ID
        paymentMethod: paymentMethod,
        mpesaPhone: paymentMethod === 'mpesa' ? mpesaPhone : undefined,
        tempToken: currentTempToken,
      });

      if (paymentResult.success) {
        setPaymentStep('verifying');
        
        // PAYMENT SUCCESSFUL - Store user data (session already exists and linked by backend)
        if (paymentResult.user && paymentResult.authToken) {
          localStorage.setItem("auth_token", paymentResult.authToken);
          localStorage.setItem("user_id", paymentResult.user.id);
          localStorage.setItem("user_email", paymentResult.user.email);
          
          toast({
            title: "Payment successful! 🎉",
            description: "Account created and test session ready!",
          });
          
          // Small delay to show verification step
          setTimeout(() => {
            toast({
              title: "All set! Welcome aboard! ✨",
              description: "Redirecting to your dashboard...",
            });
            setLocation("/dashboard");
          }, 1500);
        } else {
          throw new Error("Payment verified but account creation failed. Please contact support.");
        }
      } else {
        // Payment failed - check if we need to logout
        if (paymentResult.message && paymentResult.message.includes('requireLogout')) {
          clearAllUserData();
          toast({
            title: "Session expired",
            description: "Please register again to continue.",
            variant: "destructive",
          });
          setTimeout(() => setLocation("/"), 2000);
        } else {
          throw new Error(paymentResult.message || "Payment failed");
        }
      }
    } catch (error) {
      // Payment failed - clear all user data and logout
      clearAllUserData();
      
      const errorMessage = (error as Error).message || "Please try again or contact support.";
      
      if (errorMessage.includes("expired") || errorMessage.includes("invalid")) {
        toast({
          title: "Session expired",
          description: "Please register again to continue.",
          variant: "destructive",
        });
        setTimeout(() => setLocation("/"), 2000);
      } else {
        toast({
          title: "Payment failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setTimeout(() => {
        setIsProcessingPayment(false);
      }, 2000);
    }
  };

  const onSubmit = (data: RegistrationForm) => {
    const { termsAccepted, ...userData } = data;
    registerMutation.mutate(userData);
  };

  // If user is retaking, show simplified flow
  if (isRetaking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <GraduationCap className="w-12 h-12 mx-auto text-slate-600 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Retake English Test
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Welcome back, {userEmail}! Ready to retake your English proficiency test?
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Test Information</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• 4 sections: Reading, Listening, Writing, Speaking</li>
                <li>• Approximately 2-3 hours to complete</li>
                <li>• CEFR-based scoring (A1-C2)</li>
                <li>• Official certificate upon completion</li>
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900 dark:text-white">Test Fee:</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">$8 USD</span>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleRetakePayment}
                disabled={isProcessingPayment}
                className="w-full"
                size="lg"
                data-testid="button-retake-payment"
              >
                {isProcessingPayment ? "Processing Payment..." : "Pay & Start Test"}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setLocation("/dashboard")}
                className="w-full"
                data-testid="button-back-dashboard"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-primary mr-3" />
              <span className="text-xl font-bold text-foreground">EnglishPro Test</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Complete Required Assessment Registration</h2>
                <p className="text-muted-foreground">Your employer has requested you complete this English proficiency assessment. Please register to begin.</p>
              </div>

              {/* Important Name Notice */}
              <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950 border-l-4 border-amber-400 rounded-r-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                      Important: Use Your Legal Name
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      Please enter your full legal name exactly as it appears on your passport or official ID. Your certificate will be printed with these exact names for verification purposes.
                    </p>
                  </div>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name (Legal/Passport Name)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your legal first name" {...field} data-testid="input-first-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name (Legal/Passport Name)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your legal last name" {...field} data-testid="input-last-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+1 (555) 123-4567" {...field} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Enter a secure password (min 6 characters)" 
                            {...field} 
                            data-testid="input-password" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />


                  <div className="border-t border-border pt-6">
                    <div className="flex items-center gap-2 mb-6">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold">Choose Payment Method</h3>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Secure & Encrypted
                      </Badge>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      {/* Card Payment Option */}
                      <div 
                        className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          paymentMethod === 'card' 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => setPaymentMethod('card')}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="card"
                            checked={paymentMethod === 'card'}
                            onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'mpesa')}
                            className="w-4 h-4 text-blue-600"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CreditCard className="h-5 w-5 text-blue-600" />
                              <span className="font-semibold text-gray-900 dark:text-white">
                                Credit/Debit Card
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Visa, Mastercard, and other major cards
                            </p>
                            <div className="text-lg font-bold text-blue-600 mt-2">$8.00 USD</div>
                          </div>
                        </div>
                      </div>

                      {/* M-Pesa Payment Option */}
                      <div 
                        className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          paymentMethod === 'mpesa' 
                            ? 'border-green-500 bg-green-50 dark:bg-green-950' 
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                        onClick={() => setPaymentMethod('mpesa')}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="mpesa"
                            checked={paymentMethod === 'mpesa'}
                            onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'mpesa')}
                            className="w-4 h-4 text-green-600"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                              </svg>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                M-Pesa Mobile Money
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Pay with your M-Pesa account (Kenya)
                            </p>
                            <div className="text-lg font-bold text-green-600 mt-2">KES 1,000</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* M-Pesa Phone Number Input */}
                    {paymentMethod === 'mpesa' && (
                      <div className="mb-6 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                        <label className="block text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                          M-Pesa Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="e.g., +254722000000"
                          value={mpesaPhone}
                          onChange={(e) => setMpesaPhone(e.target.value)}
                          className="w-full px-3 py-2 border border-green-300 dark:border-green-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          data-testid="input-mpesa-phone"
                        />
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          Include country code (+254). You'll receive an STK push to authorize payment.
                        </p>
                      </div>
                    )}
                    
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 p-4 sm:p-6 rounded-lg mb-6 border border-slate-200 dark:border-slate-700">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                        <div className="text-center sm:text-left">
                          <h4 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">English Proficiency Assessment</h4>
                          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">International Employment Certification</p>
                        </div>
                        <div className="text-center sm:text-right">
                          <div className="text-3xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {paymentMethod === 'card' ? '$8.00 USD' : 'KES 1,000'}
                          </div>
                          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">One-time fee</p>
                        </div>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-sm sm:text-base">
                        <div className="flex items-center justify-center sm:justify-start gap-2 py-2 sm:py-0">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="font-medium">CEFR Certification</span>
                        </div>
                        <div className="flex items-center justify-center sm:justify-start gap-2 py-2 sm:py-0">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="font-medium">60-minute Test</span>
                        </div>
                        <div className="flex items-center justify-center sm:justify-start gap-2 py-2 sm:py-0 sm:col-span-2 md:col-span-1">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="font-medium">Instant Results</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                      {paymentMethod === 'card' ? (
                        <>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-6 w-6 text-blue-600" />
                            <span className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">Secure Card Processing</span>
                          </div>
                          <Separator orientation="vertical" className="hidden sm:block h-6" />
                          <div className="flex items-center gap-2 text-center">
                            <span className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300">Visa • Mastercard • Debit Cards</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                            <span className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">M-Pesa Mobile Money</span>
                          </div>
                          <Separator orientation="vertical" className="hidden sm:block h-6" />
                          <div className="flex items-center gap-2 text-center">
                            <span className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300">Safaricom • Airtel Money • Equity Bank</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Payment Progress Steps */}
                    {(paymentStep !== 'form' || isProcessingPayment) && (
                      <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-5 rounded-lg mb-6 border">
                        <div className="text-center mb-4">
                          <span className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">Payment Progress</span>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-2">
                          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${paymentStep === 'processing' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : paymentStep === 'payment' || paymentStep === 'verifying' ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-muted-foreground bg-slate-100 dark:bg-slate-800'}`}>
                            {paymentStep === 'processing' ? <Clock className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                            <span className="text-sm sm:text-base font-medium">Processing</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90 sm:rotate-0" />
                          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${paymentStep === 'payment' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : paymentStep === 'verifying' ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-muted-foreground bg-slate-100 dark:bg-slate-800'}`}>
                            {paymentStep === 'payment' ? 
                              (paymentMethod === 'card' ? <CreditCard className="h-4 w-4" /> : 
                               <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                 <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                               </svg>
                              ) : 
                              paymentStep === 'verifying' ? <CheckCircle className="h-4 w-4" /> : 
                              (paymentMethod === 'card' ? <CreditCard className="h-4 w-4" /> : 
                               <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                 <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                               </svg>
                              )
                            }
                            <span className="text-sm sm:text-base font-medium">
                              {paymentMethod === 'card' ? 'Card Payment' : 'M-Pesa Payment'}
                            </span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90 sm:rotate-0" />
                          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${paymentStep === 'verifying' ? 'text-blue-600 animate-pulse bg-blue-50 dark:bg-blue-900/20' : 'text-muted-foreground bg-slate-100 dark:bg-slate-800'}`}>
                            {paymentStep === 'verifying' ? <Clock className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                            <span className="text-sm sm:text-base font-medium">Verification</span>
                          </div>
                        </div>
                        
                        {/* M-Pesa specific instructions during payment */}
                        {paymentMethod === 'mpesa' && (paymentStep === 'payment' || paymentStep === 'verifying') && (
                          <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-start gap-3">
                              <svg className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                              </svg>
                              <div className="flex-1">
                                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                                  M-Pesa Payment Instructions
                                </h4>
                                <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                                  <p>1. Check your phone for an M-Pesa STK push notification</p>
                                  <p>2. Enter your M-Pesa PIN to authorize the payment</p>
                                  <p>3. You'll receive an SMS confirmation from M-Pesa</p>
                                  <p className="font-medium mt-2">⏱️ This may take up to 5 minutes - please be patient!</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="termsAccepted"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-terms"
                            className="h-3 w-3 mt-0.5"
                          />
                        </FormControl>
                        <div className="space-y-2 leading-none">
                          <FormLabel>
                            I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and{" "}
                            <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                          </FormLabel>
                          <p className="text-xs text-muted-foreground mt-1">
                            By proceeding with payment, I understand that all test fees are <strong>non-refundable</strong> once payment is processed. This includes cases where the test is not completed or abandoned.
                          </p>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className={`w-full py-6 text-base sm:text-lg font-semibold relative overflow-hidden text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 ${
                      paymentMethod === 'card' 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                        : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                    }`}
                    disabled={registerMutation.isPending || isProcessingPayment || (paymentMethod === 'mpesa' && !mpesaPhone.trim())}
                    data-testid="button-pay-and-start"
                  >
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-2">
                        {(registerMutation.isPending || isProcessingPayment) && (
                          <Clock className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                        )}
                        {!registerMutation.isPending && !isProcessingPayment && (
                          paymentMethod === 'card' ? 
                          <CreditCard className="h-5 w-5 sm:h-6 sm:w-6" /> :
                          <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        )}
                        <span className="text-center leading-tight">
                          {isProcessingPayment 
                            ? paymentStep === 'processing' 
                              ? paymentMethod === 'card' ? "Setting up card payment..." : "Setting up M-Pesa payment..."
                              : paymentStep === 'payment'
                              ? paymentMethod === 'card' ? "Complete card payment in popup" : "Check your phone for M-Pesa prompt - this may take a few minutes"
                              : paymentStep === 'verifying'
                              ? paymentMethod === 'card' ? "Verifying card payment..." : "Waiting for M-Pesa confirmation - please be patient..."
                              : paymentMethod === 'card' ? "Processing Card Payment..." : "Processing M-Pesa Payment..."
                            : registerMutation.isPending 
                            ? "Creating account..." 
                            : paymentMethod === 'card' 
                              ? <><span className="block sm:inline">Pay $8 with Card</span><span className="hidden sm:inline"> & </span><span className="block sm:inline">Begin Assessment</span></>
                              : <><span className="block sm:inline">Pay KES 1,000 with M-Pesa</span><span className="hidden sm:inline"> & </span><span className="block sm:inline">Begin Assessment</span></>
                          }
                        </span>
                      </div>
                    </div>
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

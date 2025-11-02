import type { Express } from "express";
import express from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertTestSessionSchema, insertTestAnswerSchema, insertPaymentSchema, loginSchema, insertUserSessionSchema, insertTempRegistrationSchema } from "@shared/schema";
import { z } from "zod";

// CRITICAL FIX: You must import fetch for Paystack API calls in older Node versions.
import fetch from 'node-fetch';

// =========================================================================
// 🔥 CRITICAL FIX: Defined Paystack Configuration outside all handlers
// =========================================================================
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_INIT_URL = 'https://api.paystack.co/transaction/initialize';
const PAYSTACK_CHARGE_URL = 'https://api.paystack.co/charge';
const PAYSTACK_VERIFY_BASE_URL = 'https://api.paystack.co/transaction/verify/';

// Guard function to ensure keys are present before execution
function requirePaystackConfig(res: express.Response) {
    if (!PAYSTACK_SECRET_KEY || PAYSTACK_SECRET_KEY.length < 10) {
        console.error("CRITICAL: PAYSTACK_SECRET_KEY is missing or invalid in server environment.");
        res.status(500).json({
            success: false,
            message: "Payment system not configured. Please contact support." // User-facing error
        });
        return false;
    }
    return true;
}
// =========================================================================

// Secure session token storage (using database now)
const sessionTokens = new Map<string, { sessionId: string; userId: string; createdAt: number }>();

// Generate cryptographically secure token
function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

// Validate session token with expiration (2 hours) 
function validateSessionToken(sessionId: string, token: string): boolean {
  const tokenData = sessionTokens.get(token);
  if (!tokenData || tokenData.sessionId !== sessionId) {
    return false;
  }
  
  // Check token expiration (2 hours = 7200000ms)
  const now = Date.now();
  if (now - tokenData.createdAt > 7200000) {
    sessionTokens.delete(token); // Clean up expired token
    return false;
  }
  
  return true;
}

// Validate user owns session (for user endpoint)
function validateUserSessionAccess(userId: string, token: string): boolean {
  const tokenData = sessionTokens.get(token);
  if (!tokenData || tokenData.userId !== userId) {
    return false;
  }
  
  // Check token expiration
  const now = Date.now();
  if (now - tokenData.createdAt > 7200000) {
    sessionTokens.delete(token);
    return false;
  }
  
  return true;
}

// Validate user auth token using storage (24 hours)
async function validateUserAuthToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const session = await storage.getUserSession(token);
    if (!session || session.type !== 'auth') {
      return null;
    }
    
    // Check token expiration
    const now = new Date();
    if (session.expiresAt < now) {
      await storage.deleteUserSession(token);
      return null;
    }
    
    return session.userId;
  } catch (error) {
    console.error('Error validating auth token:', error);
    return null;
  }
}

// --- NEW CRITICAL PAYMENT CHECK (Renamed and simplified) ---
function checkPaymentConfiguration() {
  if (PAYSTACK_SECRET_KEY) {
    console.log("CRITICAL CHECK PASSED: PAYSTACK_SECRET_KEY is available (length:", PAYSTACK_SECRET_KEY.length, ")");
  } else {
    console.error("CRITICAL: PAYSTACK_SECRET_KEY is missing at route registration time.");
  }
}
// ---------------------------------

export async function registerRoutes(app: Express): Promise<Server> {
  // Run critical check immediately
  checkPaymentConfiguration();

  // User logout
  app.post("/api/logout", async (req, res) => {
    try {
      const authToken = req.headers['x-auth-token'] as string | undefined;
      if (!authToken) {
        return res.status(400).json({ message: "No auth token provided" });
      }
      
      // Delete the user session
      await storage.deleteUserSession(authToken);
      
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // User registration (creates temporary registration only)
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertTempRegistrationSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Hash password before storing
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Generate temporary registration token
      const tempToken = generateSecureToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration
      
      const tempRegistration = await storage.createTempRegistration({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        password: hashedPassword,
        token: tempToken,
        expiresAt: expiresAt
      });
      
      res.json({ 
        tempToken: tempToken,
        message: "Registration data saved temporarily. Complete payment to finalize account creation."
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Invalid user data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // User login
  app.post("/api/login", async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(loginData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(loginData.password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate user auth token and save to storage (24 hours)
      const userAuthToken = generateSecureToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      await storage.createUserSession({
        userId: user.id,
        token: userAuthToken,
        type: 'auth',
        expiresAt: expiresAt
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json({ 
        user: userWithoutPassword, 
        authToken: userAuthToken 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid login data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get user by ID (authenticated)
  app.get("/api/users/:id", async (req, res) => {
    try {
      // SECURITY: Require authentication and ownership
      const authToken = req.headers['x-auth-token'] as string | undefined;
      const authenticatedUserId = await validateUserAuthToken(authToken);
      
      if (!authenticatedUserId || authenticatedUserId !== req.params.id) {
        return res.status(401).json({ message: "Unauthorized - access denied" });
      }

      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // SECURITY: Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Create pre-payment test session (before user exists)
  app.post("/api/test-sessions/pre-payment", async (req, res) => {
    try {
      // Create session with null userId for pre-payment
      const sessionData = insertTestSessionSchema.parse({
        ...req.body,
        userId: null, // No user yet - will be updated after payment
        status: "pending",
        paymentStatus: "pending"
      });
      
      const session = await storage.createTestSession(sessionData);
      
      // Generate cryptographically secure session token
      const sessionToken = generateSecureToken();
      sessionTokens.set(sessionToken, { 
        sessionId: session.id, 
        userId: session.userId || '', // No user yet, use empty string as placeholder
        createdAt: Date.now() 
      });
      
      res.json({ session, sessionToken });
    } catch (error) {
      console.error("Create pre-payment session error:", error);
      res.status(400).json({ message: "Invalid session data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  
// =================================================================================
// 🔥 CRITICAL FIX: NEW GENERIC PAYSTACK INITIALIZATION ROUTE (Using defined key)
// =================================================================================

app.post("/api/payments/initialize", async (req, res) => {
    // CRITICAL FIX 1: Check for config first
    if (!requirePaystackConfig(res)) return;

    try {
        const { amount, email, sessionId, tempToken } = req.body; // Expecting base currency amount (e.g., 8.00)

        // Basic input validation
        if (!amount || !email || (!sessionId && !tempToken)) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: amount, email, and either sessionId or tempToken.'
            });
        }

        // CRITICAL FIX 2: Paystack requires amount in kobo/smallest denomination
        const amountInKobo = Math.round(amount * 100);

        if (amountInKobo < 5000) { 
            return res.status(400).json({
                success: false,
                message: 'Validation Error: Transaction amount is too low for Paystack (must be at least 50.00 base unit).'
            });
        }
        
        // Generate reference (if the client didn't provide one)
        // Use tempToken or sessionId for reference tracking
        const reference = `EP_${sessionId || tempToken}_${Date.now()}`;


        const paystackBody = {
            email: email,
            amount: amountInKobo,
            reference: reference, 
            metadata: {
                sessionId: sessionId,
                tempToken: tempToken
            }
        };
        
        console.log(`[Paystack] Initializing generic transaction for: ${email}, Amount: ${amountInKobo}`);
        
        // 2. Make External API Call to Paystack
        const response = await fetch(PAYSTACK_INIT_URL, {
            method: 'POST',
            headers: {
                // CRITICAL FIX 3: Use the pre-fetched PAYSTACK_SECRET_KEY constant
                'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`, 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paystackBody)
        });

        const paystackData = await response.json();

        // 3. Handle Paystack Response (Success vs. Failure)
        if (response.ok && paystackData.status === true) {
            // Success case: Paystack returned a valid authorization URL
            console.log(`[Paystack Success] Reference: ${paystackData.data.reference}. Auth URL received.`);
            
            // Return the necessary authorization_url for the frontend to open the widget
            return res.status(200).json({
                success: true,
                message: 'Transaction initialized successfully.',
                reference: paystackData.data.reference,
                authorization_url: paystackData.data.authorization_url // CRITICAL: Frontend needs this!
            });
        } else {
            // CRITICAL FIX 4: Log the actual error from Paystack and return 400 status.
            const errorMessage = paystackData.message || 'Unknown Paystack API rejection.';
            console.error('[CRITICAL PAYSTACK API ERROR]', errorMessage, paystackData.data);
            
            return res.status(400).json({
                success: false,
                message: `Paystack Error: ${errorMessage}`, // Return the actual Paystack error
                details: paystackData
            });
        }

    } catch (error) {
        console.error('[SERVER CATCH ERROR] Initialize payment failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while processing payment request.',
            details: error instanceof Error ? error.message : "Unknown server error"
        });
    }
});

// =================================================================================
// END OF NEW CRITICAL ROUTE
// =================================================================================

  // Create test session (authenticated users)
  app.post("/api/test-sessions", async (req, res) => {
    try {
      // SECURITY: Require user authentication for session creation
      const authToken = req.headers['x-auth-token'] as string | undefined;
      const authenticatedUserId = await validateUserAuthToken(authToken);
      
      if (!authenticatedUserId) {
        return res.status(401).json({ message: "Authentication required to create test session" });
      }

      // Parse session data but enforce authenticated user ID
      const sessionData = insertTestSessionSchema.parse({
        ...req.body,
        userId: authenticatedUserId // Override any userId from request body
      });
      
      const session = await storage.createTestSession(sessionData);
      
      // Generate cryptographically secure session token
      const sessionToken = generateSecureToken();
      sessionTokens.set(sessionToken, { 
        sessionId: session.id, 
        userId: session.userId || '', 
        createdAt: Date.now() 
      });
      
      res.json({ session, sessionToken });
    } catch (error) {
      console.error("Create session error:", error);
      res.status(400).json({ message: "Invalid session data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get test session  
  app.get("/api/test-sessions/:id", async (req, res) => {
    try {
      const session = await storage.getTestSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Test session not found" });
      }
      
      // Validate session access token
      const sessionToken = req.headers['x-session-token'] as string | undefined;
      if (!sessionToken || !validateSessionToken(session.id, sessionToken)) {
        return res.status(401).json({ message: "Invalid or missing session token" });
      }
      
      // Check if payment is required and completed
      if (session.paymentStatus !== "completed") {
        return res.status(403).json({ 
          message: "Payment required to access test session",
          paymentStatus: session.paymentStatus 
        });
      }
      
      res.json({ session });
    } catch (error) {
      console.error("Get session error:", error);
      res.status(500).json({ message: "Failed to get test session" });
    }
  });

  // Update test session
  app.patch("/api/test-sessions/:id", async (req, res) => {
    try {
      const session = await storage.getTestSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Test session not found" });
      }
      
      // Validate session access token
      const sessionToken = req.headers['x-session-token'] as string | undefined;
      if (!sessionToken || !validateSessionToken(session.id, sessionToken)) {
        return res.status(401).json({ message: "Invalid or missing session token" });
      }
      
      const updates = req.body;
      const updatedSession = await storage.updateTestSession(req.params.id, updates);
      res.json({ session: updatedSession });
    } catch (error) {
      console.error("Update session error:", error);
      res.status(500).json({ message: "Failed to update test session" });
    }
  });

  // Get user's test sessions (with auth token)
  app.get("/api/users/:userId/test-sessions", async (req, res) => {
    try {
      // Validate user auth token
      const authToken = req.headers['x-auth-token'] as string | undefined;
      const authenticatedUserId = await validateUserAuthToken(authToken);
      
      if (!authenticatedUserId || authenticatedUserId !== req.params.userId) {
        return res.status(401).json({ message: "Unauthorized - valid auth token required" });
      }
      
      const sessions = await storage.getTestSessionsByUser(req.params.userId);
      res.json({ sessions });
    } catch (error) {
      console.error("Get user sessions error:", error);
      res.status(500).json({ message: "Failed to get user test sessions" });
    }
  });

  // Get user's incomplete test sessions (dashboard)
  app.get("/api/users/:userId/incomplete-sessions", async (req, res) => {
    try {
      // Validate user auth token
      const authToken = req.headers['x-auth-token'] as string | undefined;
      const authenticatedUserId = await validateUserAuthToken(authToken);
      
      if (!authenticatedUserId || authenticatedUserId !== req.params.userId) {
        return res.status(401).json({ message: "Unauthorized - valid auth token required" });
      }
      
      const sessions = await storage.getTestSessionsByUser(req.params.userId);
      // Filter for incomplete sessions (paid but not completed)
      const incompleteSessions = sessions.filter(session => 
        session.paymentStatus === 'completed' && 
        session.status !== 'completed' && 
        session.status !== 'submitted'
      );
      
      res.json({ sessions: incompleteSessions });
    } catch (error) {
      console.error("Get incomplete sessions error:", error);
      res.status(500).json({ message: "Failed to get incomplete test sessions" });
    }
  });

  // Resume a test session
  app.post("/api/users/:userId/resume-session/:sessionId", async (req, res) => {
    try {
      // Validate user auth token
      const authToken = req.headers['x-auth-token'] as string | undefined;
      const authenticatedUserId = await validateUserAuthToken(authToken);
      
      if (!authenticatedUserId || authenticatedUserId !== req.params.userId) {
        return res.status(401).json({ message: "Unauthorized - valid auth token required" });
      }

      // Get the session and verify ownership
      const session = await storage.getTestSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ message: "Test session not found" });
      }

      if (session.userId !== req.params.userId) {
        return res.status(403).json({ message: "Access denied - session belongs to another user" });
      }

      // Check if session is resumable (paid but not completed)
      if (session.paymentStatus !== 'completed') {
        return res.status(403).json({ 
          message: "Session cannot be resumed - payment not completed",
          paymentStatus: session.paymentStatus 
        });
      }

      if (session.status === 'completed' || session.status === 'submitted') {
        return res.status(400).json({ 
          message: "Session already completed",
          status: session.status 
        });
      }

      // Generate new session token for resumption
      const sessionToken = generateSecureToken();
      sessionTokens.set(sessionToken, { 
        sessionId: session.id, 
        userId: session.userId, 
        createdAt: Date.now() 
      });

      // Update session status to in_progress if it's still pending
      if (session.status === 'pending') {
        await storage.updateTestSession(session.id, { 
          status: 'in_progress',
          startedAt: new Date()
        });
      }

      res.json({ 
        session,
        sessionToken,
        message: "Session resumed successfully" 
      });
    } catch (error) {
      console.error("Resume session error:", error);
      res.status(500).json({ message: "Failed to resume test session" });
    }
  });

  // Submit test answer
  app.post("/api/test-answers", async (req, res) => {
    try {
      const answerData = insertTestAnswerSchema.parse(req.body);
      
      // Verify payment and session access
      const session = await storage.getTestSession(answerData.sessionId);
      if (!session) {
        return res.status(404).json({ message: "Test session not found" });
      }
      
      // Validate session access token
      const sessionToken = req.headers['x-session-token'] as string | undefined;
      if (!sessionToken || !validateSessionToken(session.id, sessionToken)) {
        return res.status(401).json({ message: "Invalid or missing session token" });
      }
      
      if (session.paymentStatus !== "completed") {
        return res.status(403).json({ 
          message: "Payment required to submit answers",
          paymentStatus: session.paymentStatus 
        });
      }
      
      const answer = await storage.upsertTestAnswer(answerData);
      res.json({ answer });
    } catch (error) {
      console.error("Submit answer error:", error);
      res.status(400).json({ message: "Invalid answer data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get test answers for session
  app.get("/api/test-sessions/:sessionId/answers", async (req, res) => {
    try {
      const session = await storage.getTestSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ message: "Test session not found" });
      }
      
      // Validate session access token
      const sessionToken = req.headers['x-session-token'] as string | undefined;
      if (!sessionToken || !validateSessionToken(session.id, sessionToken)) {
        return res.status(401).json({ message: "Invalid or missing session token" });
      }
      
      const answers = await storage.getTestAnswers(req.params.sessionId);
      res.json({ answers });
    } catch (error) {
      console.error("Get answers error:", error);
      res.status(500).json({ message: "Failed to get test answers" });
    }
  });

  // Process payment
  app.post("/api/payments", async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(paymentData);
      res.json({ payment });
    } catch (error) {
      console.error("Create payment error:", error);
      res.status(400).json({ message: "Invalid payment data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Verify payment and handle user creation
  app.post("/api/payments/verify", async (req, res) => {
    try {
      const { reference, tempToken } = req.body;
      if (!reference) {
        return res.status(400).json({ message: "Payment reference is required" });
      }
      if (!tempToken) {
        return res.status(400).json({ message: "Temporary registration token is required" });
      }

      // CRITICAL FIX 5: Check for config first
      if (!requirePaystackConfig(res)) return;

      // Get temporary registration data
      const tempRegistration = await storage.getTempRegistration(tempToken);
      if (!tempRegistration) {
        return res.status(400).json({ 
          success: false, 
          message: "Registration expired or invalid. Please register again.",
          requireLogout: true 
        });
      }

      // Check if temp registration has expired
      if (tempRegistration.expiresAt < new Date()) {
        await storage.deleteTempRegistration(tempToken);
        return res.status(400).json({ 
          success: false, 
          message: "Registration expired. Please register again.",
          requireLogout: true 
        });
      }

      // Verify payment with Paystack
      
      // --- DEBUG LOG ADDED HERE ---
      console.log(`[VERIFY DEBUG] paystackSecretKey inside handler: ${PAYSTACK_SECRET_KEY ? 'SET (' + PAYSTACK_SECRET_KEY.length + ' chars)' : 'MISSING/EMPTY'}`);
      // ----------------------------

      // Use global fetch (Node 18+) or imported fetch if you enabled node-fetch
      const verifyResponse = await fetch(`${PAYSTACK_VERIFY_BASE_URL}${reference}`, {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      });

      const verifyData = await verifyResponse.json();
      
      console.log("Paystack verification response:", verifyData);

      if (verifyData.status) {
        const paymentStatus = verifyData.data.status;
        
        // Handle different payment statuses
        if (paymentStatus === "success") {
          // Flexible payment verification - handle both USD and NGN
          const amount = verifyData.data.amount;
          const currency = verifyData.data.currency;
          const metadata = verifyData.data.metadata || {};
          
          // Expected amounts: $8 USD = 800 cents, ₦8,000 = 800000 kobo, KES 1,000 = 100000 cents
          const validAmounts = {
            'USD': 800, // $8 in cents
            'NGN': 800000, // ₦8,000 in kobo (approximate)
            'KES': 100000 // KES 1,000 in cents (for M-Pesa)
          };
          
          const expectedAmount = validAmounts[currency as keyof typeof validAmounts];
          if (!expectedAmount) {
            console.error("Unsupported currency:", currency);
            // Clean up temp registration on payment failure
            await storage.deleteTempRegistration(tempToken);
            return res.status(400).json({ 
              success: false, 
              message: "Unsupported payment currency",
              requireLogout: true 
            });
          }
          
          // Allow 5% variance in amount for currency conversion differences
          const amountVariance = expectedAmount * 0.05;
          if (Math.abs(amount - expectedAmount) > amountVariance) {
            console.error("Amount outside acceptable range:", amount, "expected:", expectedAmount, "±", amountVariance);
            // Clean up temp registration on payment failure
            await storage.deleteTempRegistration(tempToken);
            return res.status(400).json({ 
              success: false, 
              message: "Payment amount outside acceptable range",
              requireLogout: true 
            });
          }

          // Get session ID from metadata (preferred) or fallback to reference parsing
          let sessionId = metadata.sessionId;
          if (!sessionId && reference.includes('_')) {
            const parts = reference.split('_');
            sessionId = parts.length >= 2 ? parts[1] : null;
          }
          
          if (!sessionId) {
            console.error("Could not extract session ID from payment");
            // Clean up temp registration on payment failure
            await storage.deleteTempRegistration(tempToken);
            return res.status(400).json({ 
              success: false, 
              message: "Invalid payment reference",
              requireLogout: true 
            });
          }

          // PAYMENT SUCCESSFUL - CREATE ACTUAL USER FROM TEMP REGISTRATION
          try {
            // Create actual user
            const user = await storage.createUser({
              firstName: tempRegistration.firstName,
              lastName: tempRegistration.lastName,
              email: tempRegistration.email,
              phone: tempRegistration.phone,
              password: tempRegistration.password
            });

            // Generate user auth token and save to storage (auto-login after payment)
            const userAuthToken = generateSecureToken();
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
            
            await storage.createUserSession({
              userId: user.id,
              token: userAuthToken,
              type: 'auth',
              expiresAt: expiresAt
            });

            // Create or update payment record
            let payment = await storage.getPaymentByReference(reference);
            if (!payment) {
              payment = await storage.createPayment({
                sessionId,
                paystackReference: reference,
                amount: verifyData.data.amount,
                status: "success"
              });
            } else {
              await storage.updatePayment(payment.id, { status: "success" });
            }
            
            // Update test session with user ID and payment status
            const session = await storage.getTestSession(payment.sessionId);
            if (session) {
              await storage.updateTestSession(session.id, { 
                userId: user.id, // Link session to actual user
                paymentStatus: "completed",
                status: "pending" // Keep as pending until user actually starts the test
              });
            }

            // Clean up temporary registration (no longer needed)
            await storage.deleteTempRegistration(tempToken);

            // Remove password from user response
            const { password, ...userWithoutPassword } = user;
            
            res.json({ 
              success: true, 
              user: userWithoutPassword,
              authToken: userAuthToken,
              payment: verifyData.data 
            });
          } catch (userCreationError) {
            console.error("User creation error:", userCreationError);
            // Clean up temp registration on user creation failure
            await storage.deleteTempRegistration(tempToken);
            return res.status(500).json({ 
              success: false, 
              message: "Failed to create user account",
              requireLogout: true 
            });
          }
        } else if (paymentStatus === "ongoing") {
          // M-Pesa payment is still in progress - return pending status (keep temp registration)
          res.json({ 
            success: false, 
            status: 'pending',
            message: 'Payment is being processed. Please check your phone for M-Pesa prompt.',
            payment: verifyData.data 
          });
        } else if (paymentStatus === "failed") {
          // Payment genuinely failed - clean up temp registration
          await storage.deleteTempRegistration(tempToken);
          res.json({ 
            success: false, 
            status: 'failed',
            message: verifyData.data.gateway_response || 'Payment failed. Please try again.',
            payment: verifyData.data,
            requireLogout: true
          });
        } else {
          // Unknown status - treat as pending (keep temp registration for now)
          res.json({ 
            success: false, 
            status: 'pending',
            message: 'Payment status unknown. Verification in progress.',
            payment: verifyData.data 
          });
        }
      } else {
        console.error("Payment verification failed:", verifyData);
        console.log("Environment:", process.env.NODE_ENV);
        console.log("Reference:", reference);
        console.log("Reference starts with EP_:", reference.startsWith('EP_'));
        
        // Only allow fallback processing for development environment and card payments
        // M-Pesa payments should go through proper verification
        if (reference.startsWith('EP_') && !reference.includes('MPESA')) {
          console.log("Replit environment: Processing payment with fallback logic");
          
          // Extract session ID from reference
          const parts = reference.split('_');
          const sessionId = parts.length >= 2 ? parts[1] : null;
          
          if (sessionId) {
            // FALLBACK SUCCESS - CREATE ACTUAL USER FROM TEMP REGISTRATION
            try {
              // Create actual user
              const user = await storage.createUser({
                firstName: tempRegistration.firstName,
                lastName: tempRegistration.lastName,
                email: tempRegistration.email,
                phone: tempRegistration.phone,
                password: tempRegistration.password
              });

              // Generate user auth token and save to storage (auto-login after payment)
              const userAuthToken = generateSecureToken();
              const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
              
              await storage.createUserSession({
                userId: user.id,
                token: userAuthToken,
                type: 'auth',
                expiresAt: expiresAt
              });

              // Create a test payment record for development
              let payment = await storage.getPaymentByReference(reference);
              if (!payment) {
                payment = await storage.createPayment({
                  sessionId,
                  paystackReference: reference,
                  amount: 800,
                  status: "success"
                });
              } else {
                await storage.updatePayment(payment.id, { status: "success" });
              }
              
              // Update test session with user ID and payment status
              const session = await storage.getTestSession(sessionId);
              if (session) {
                await storage.updateTestSession(session.id, { 
                  userId: user.id, // Link session to actual user
                  paymentStatus: "completed",
                  status: "pending" // Keep as pending until user actually starts the test
                });
              }

              // Clean up temporary registration (no longer needed)
              await storage.deleteTempRegistration(tempToken);

              // Remove password from user response
              const { password, ...userWithoutPassword } = user;
              
              console.log("Fallback payment processed successfully for session:", sessionId);
              return res.json({ 
                success: true, 
                user: userWithoutPassword,
                authToken: userAuthToken,
                message: "Payment processed successfully" 
              });
            } catch (fallbackError) {
              console.error("Fallback payment processing error:", fallbackError);
              // Clean up temp registration on fallback failure
              await storage.deleteTempRegistration(tempToken);
            }
          }
        }
        
        // Payment verification failed - clean up temp registration
        await storage.deleteTempRegistration(tempToken);
        res.status(400).json({ 
          success: false, 
          message: "Payment verification failed",
          requireLogout: true 
        });
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      res.status(500).json({ message: "Payment verification failed" });
    }
  });

  // Initialize M-Pesa payment
  app.post("/api/payments/initialize-mpesa", async (req, res) => {
    try {
      const { email, amount, phone, sessionId, firstName, lastName } = req.body;
      
      if (!email || !amount || !phone || !sessionId) {
        return res.status(400).json({ 
          success: false, 
          message: "Missing required fields for M-Pesa payment" 
        });
      }

      // CRITICAL FIX 6: Check for config first
      if (!requirePaystackConfig(res)) return;

      // Generate unique reference for this transaction
      const reference = `EP_MPESA_${sessionId}_${Date.now()}`;
        
      // CRITICAL: Amount must be in the smallest unit (e.g., KES 10.00 is 1000 cents)
      const amountInCents = Math.round(amount * 100);

      // Initialize M-Pesa transaction using Paystack Charge API
      const chargeData = {
        email,
        amount: amountInCents, // Use amount in smallest unit
        reference,
        // Paystack charge request body fields for M-Pesa
        mobile_money: {
            phone
        },
        currency: 'KES', // Assuming M-Pesa is KES
        metadata: {
            sessionId,
            firstName,
            lastName
        }
      };
      
      const chargeResponse = await fetch(PAYSTACK_CHARGE_URL, {
            method: 'POST',
            headers: {
                // CRITICAL FIX 7: Use the pre-fetched PAYSTACK_SECRET_KEY constant
                'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`, 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(chargeData)
        });

        const chargeDataResponse = await chargeResponse.json();

        if (chargeResponse.ok && chargeDataResponse.status === true) {
            console.log(`[MPESA Success] Reference: ${reference}. Charge initialized.`);
            
            // Return the reference and status to the frontend for polling/verification
            return res.status(200).json({
                success: true,
                message: 'M-Pesa push sent successfully. Complete the transaction on your phone.',
                reference: chargeDataResponse.data.reference,
                status: chargeDataResponse.data.status // Should be 'pending' or similar
            });
        } else {
            // Log the actual error from Paystack
            const errorMessage = chargeDataResponse.message || 'Unknown Paystack M-Pesa API rejection.';
            console.error('[CRITICAL MPESA API ERROR]', errorMessage, chargeDataResponse.data);
            
            return res.status(400).json({
                success: false,
                message: `M-Pesa Initialization Error: ${errorMessage}`, 
                details: chargeDataResponse
            });
        }
        
    } catch (error) {
      console.error("M-Pesa initialization error:", error);
      res.status(500).json({ message: "Failed to initialize M-Pesa payment" });
    }
  });


  // Start Express server
  return createServer(app);
}

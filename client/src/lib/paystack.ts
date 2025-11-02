interface PaystackConfig {
  email: string;
  amount: number;
  firstName: string;
  lastName: string;
  sessionId: string;
  paymentMethod: 'card' | 'mpesa';
  mpesaPhone?: string;
  tempToken?: string;
}

interface PaystackResponse {
  success: boolean;
  reference?: string;
  message?: string;
  user?: any;
  authToken?: string;
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: any) => {
        openIframe: () => void;
      };
    };
  }
}

/**
 * 🔥 THE FINAL FIX FOR FRONTEND PUBLIC KEY ACCESS
 * This function checks for both VITE_ and non-VITE_ prefixed keys,
 * ensuring the payment widget initializes regardless of the build environment.
 */
function getPaystackPublicKey(): string | false {
  // Vite replaces this variable at BUILD time (if passed via Dockerfile)
  const viteKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  
  // Dokploy might inject this variable at RUN time
  const plainKey = (import.meta.env as any).PAYSTACK_PUBLIC_KEY; 

  // Use whichever one is available and starts with 'pk_'
  const key = viteKey || plainKey;

  if (typeof key === 'string' && key.startsWith('pk_')) {
    return key;
  }

  // If the key is missing, log a critical error that explicitly targets the frontend key
  console.error("CRITICAL FRONTEND ERROR: Paystack Public Key is missing.");
  console.error("VITE_PAYSTACK_PUBLIC_KEY (build-time check):", viteKey);
  console.error("PAYSTACK_PUBLIC_KEY (run-time check):", plainKey);
  return false;
}


export async function initializePaystack(config: PaystackConfig): Promise<PaystackResponse> {
  return new Promise((resolve) => {
    // For M-Pesa payments, we need to use a different approach
    if (config.paymentMethod === 'mpesa') {
      initMpesaPayment();
    } else {
      initCardPayment();
    }

    async function initMpesaPayment() {
      // 🔥 APPLYING FIX HERE (Using the resilient checker)
      const paystackPublicKey = getPaystackPublicKey();
      
      if (!paystackPublicKey) {
        resolve({
          success: false,
          message: "Payment system not configured. Please contact support.", 
        });
        return;
      }

      if (!config.mpesaPhone) {
        resolve({
          success: false,
          message: "Phone number is required for M-Pesa payments",
        });
        return;
      }

      try {
        // Initialize M-Pesa transaction through our backend
        const response = await fetch('/api/payments/initialize-mpesa', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: config.email,
            amount: config.amount,
            phone: config.mpesaPhone,
            sessionId: config.sessionId,
            firstName: config.firstName,
            lastName: config.lastName,
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Start polling for payment status
          pollPaymentStatus(data.reference, config.tempToken, resolve);
        } else {
          resolve({
            success: false,
            message: data.message || 'Failed to initialize M-Pesa payment',
          });
        }
      } catch (error) {
        resolve({
          success: false,
          message: 'Network error initializing M-Pesa payment',
        });
      }
    }

    function initCardPayment() {
      // 🔥 APPLYING FIX HERE (Using the resilient checker)
      const paystackPublicKey = getPaystackPublicKey();
      
      if (!paystackPublicKey) {
        resolve({
          success: false,
          message: "Payment system not configured. Please contact support.", 
        });
        return;
      }
      
      const handler = window.PaystackPop.setup({
        key: paystackPublicKey,
        email: config.email,
        amount: config.amount, // Amount in kobo (cents)
        currency: 'USD',
        ref: `EP_${config.sessionId}_${Date.now()}`,
        firstname: config.firstName,
        lastname: config.lastName,
        metadata: {
          sessionId: config.sessionId,
          testType: 'english_proficiency',
          paymentMethod: 'card',
        },
        callback: function(response: any) {
          // Payment successful
          verifyPayment(response.reference, config.tempToken)
            .then((result) => {
              resolve({
                success: true,
                reference: response.reference,
                ...result, // Include user data and auth token from verification
              });
            })
            .catch((error) => {
              resolve({
                success: false,
                message: error.message,
              });
            });
        },
        onClose: function() {
          // Payment cancelled
          resolve({
            success: false,
            message: "Payment was cancelled",
          });
        },
      });

      handler.openIframe();
    }

    // Load Paystack script if not already loaded (only for card payments)
    if (config.paymentMethod === 'card') {
      if (!window.PaystackPop) {
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.onload = () => {
          initCardPayment();
        };
        document.head.appendChild(script);
      } else {
        initCardPayment();
      }
    }
  });
}

// Poll payment status for M-Pesa payments
function pollPaymentStatus(reference: string, tempToken: string | undefined, resolve: (result: PaystackResponse) => void) {
  let attempts = 0;
  const maxAttempts = 180; // 15 minutes (5 seconds * 180) - M-Pesa can take longer
  
  const poll = () => {
    attempts++;
    console.log(`M-Pesa payment verification attempt ${attempts}/${maxAttempts} for reference: ${reference}`);
    
    fetch('/api/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reference, tempToken }),
    })
      .then(response => response.json())
      .then(data => {
        console.log(`M-Pesa verification response:`, data);
        
        if (data.success) {
          resolve({
            success: true,
            reference: reference,
            user: data.user, // Include user data from verification
            authToken: data.authToken, // Include auth token from verification
          });
        } else if (data.status === 'pending' && attempts < maxAttempts) {
          // Show progress to user every 30 seconds
          if (attempts % 6 === 0) {
            console.log(`Still waiting for M-Pesa payment confirmation... (${Math.floor(attempts/12)} minutes elapsed)`);
          }
          // Continue polling with exponential backoff after initial attempts
          const delay = attempts < 12 ? 5000 : Math.min(10000, 5000 + (attempts - 12) * 1000);
          setTimeout(poll, delay);
        } else if (data.status === 'failed') {
          resolve({
            success: false,
            message: data.message || 'M-Pesa payment failed',
          });
        } else {
          // Final attempt or unknown status - fail
          resolve({
            success: false,
            message: data.message || 'Payment verification timeout after 15 minutes',
          });
        }
      })
      .catch((error) => {
        console.error(`M-Pesa verification error on attempt ${attempts}:`, error);
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000);
        } else {
          resolve({
            success: false,
            message: 'Payment verification failed due to network issues',
          });
        }
      });
  };
  
  // Start polling after a short delay
  setTimeout(poll, 3000);
}

async function verifyPayment(reference: string, tempToken: string | undefined): Promise<any> {
  const response = await fetch('/api/payments/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reference, tempToken }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || 'Payment verification failed');
  }

  return {
    user: data.user,
    authToken: data.authToken
  };
}


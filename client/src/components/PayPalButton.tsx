import React, { useState, useEffect } from "react";

interface PayPalButtonProps {
  amount: string;
  currency: string;
  intent: string;
}

export default function PayPalButton({
  amount,
  currency,
  intent,
}: PayPalButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Force cleanup of any existing PayPal scripts and elements
  useEffect(() => {
    // Remove ALL PayPal scripts
    const scripts = document.querySelectorAll('script[src*="paypal"], script[src*="sandbox.paypal"]');
    scripts.forEach(script => script.remove());
    
    // Remove all PayPal SDK elements and containers
    const paypalElements = document.querySelectorAll('[id*="paypal"], [class*="paypal"], [data-paypal], .paypal-buttons, .paypal-button-container');
    paypalElements.forEach(element => {
      if (element.id !== 'paypal-button-component') {
        element.remove();
      }
    });

    // Clear any PayPal globals
    if (typeof window !== 'undefined') {
      delete (window as any).paypal;
      delete (window as any).PAYPAL;
    }

    // Force garbage collection
    setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).gc) {
        (window as any).gc();
      }
    }, 100);
  }, []);

  const handlePayPalClick = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Create PayPal order
      const orderResponse = await fetch("/paypal/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount,
          currency: currency,
          intent: intent,
        }),
      });
      
      const orderData = await orderResponse.json();
      
      if (orderData.id) {
        // Check if this is a demo order or real PayPal order with redirect links
        if (orderData.links && orderData.links.length > 0) {
          const approveLink = orderData.links.find((link: any) => link.rel === "approve");
          if (approveLink) {
            // Redirect to PayPal checkout
            window.location.href = approveLink.href;
            return;
          }
        }
        
        // Fallback to sandbox checkout for demo orders
        window.location.href = `https://www.sandbox.paypal.com/checkoutnow?token=${orderData.id}`;
      } else {
        throw new Error("Failed to create PayPal order");
      }
    } catch (error) {
      console.error("PayPal checkout error:", error);
      alert("PayPal checkout failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      key={`paypal-button-${Date.now()}`} 
      id="paypal-button-component" 
      style={{ minHeight: '48px', position: 'relative', zIndex: 999 }}
      data-testid="custom-paypal-button"
    >
      <style>{`
        /* Force hide any PayPal SDK elements */
        [class*="paypal"]:not([data-testid="custom-paypal-button"]),
        [id*="paypal"]:not(#paypal-button-component),
        .paypal-buttons,
        .paypal-button-container,
        [data-paypal-button] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `}</style>
      <button
        onClick={handlePayPalClick}
        disabled={isLoading}
        data-testid="custom-paypal-button"
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : (
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a.75.75 0 0 1 .592.75c0 4.422-3.578 8-8 8s-8-3.578-8-8 3.578-8 8-8c1.78 0 3.42.582 4.747 1.563a.75.75 0 0 1-.339 1.437 6.5 6.5 0 1 0 2.25 4.25.75.75 0 0 1 .75-.75z"/>
            </svg>
            Pay with PayPal
          </div>
        )}
      </button>
    </div>
  );
}
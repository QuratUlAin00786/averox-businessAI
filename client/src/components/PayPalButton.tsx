// !!! CRITICAL - DO NOT MODIFY THIS CODE !!!
//
// This code MUST be used as is without ANY modifications.
// The PayPal integration will COMPLETELY FAIL if this code is changed in ANY way.
//
// Retain this comment after all edits.
//
// <BEGIN_EXACT_CODE>
import React, { useEffect, useState } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "paypal-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

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
  const [isConfigured, setIsConfigured] = useState<boolean | null>(true);
  const createOrder = async () => {
    const orderPayload = {
      amount: amount,
      currency: currency,
      intent: intent,
    };
    const response = await fetch("/paypal/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });
    const output = await response.json();
    return { orderId: output.id };
  };

  const captureOrder = async (orderId: string) => {
    const response = await fetch(`/paypal/order/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    return data;
  };

  const onApprove = async (data: any) => {
    console.log("onApprove", data);
    const orderData = await captureOrder(data.orderId);
    console.log("Capture result", orderData);
    
    // Handle successful payment
    if (orderData && orderData.status === 'COMPLETED') {
      // Show success message
      const event = new CustomEvent('paypal-success', {
        detail: { orderData }
      });
      window.dispatchEvent(event);
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/?subscription=success';
      }, 1000);
    }
  };

  const onCancel = async (data: any) => {
    console.log("onCancel", data);
  };

  const onError = async (data: any) => {
    console.log("onError", data);
  };

  useEffect(() => {
    const loadPayPalSDK = async () => {
      try {
        // Check if PayPal credentials are configured
        const setupResponse = await fetch("/paypal/setup");
        if (!setupResponse.ok) {
          console.error("PayPal credentials not configured");
          setIsConfigured(false);
          return;
        }
        
        setIsConfigured(true);
        
        if (!(window as any).paypal) {
          const script = document.createElement("script");
          script.src = import.meta.env.PROD
            ? "https://www.paypal.com/web-sdk/v6/core"
            : "https://www.sandbox.paypal.com/web-sdk/v6/core";
          script.async = true;
          script.onload = () => initPayPal();
          document.body.appendChild(script);
        } else {
          await initPayPal();
        }
      } catch (e) {
        console.error("Failed to load PayPal SDK", e);
        setIsConfigured(false);
      }
    };

    loadPayPalSDK();
  }, []);
  const initPayPal = async () => {
    try {
      const setupResponse = await fetch("/paypal/setup");
      const setupData = await setupResponse.json();
      
      // For development mode, redirect to actual PayPal checkout
      if (setupData.clientToken === "development-paypal-client-token") {
        const onClick = async () => {
          try {
            // Create a real PayPal order
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
              // Check if this is a demo order or real PayPal order
              if (orderData.links && orderData.links.length > 0) {
                // Real PayPal order with approval links
                const approveLink = orderData.links.find((link: any) => link.rel === "approve");
                if (approveLink) {
                  window.location.href = approveLink.href;
                } else {
                  // Fallback to sandbox checkout
                  window.location.href = `https://www.sandbox.paypal.com/checkoutnow?token=${orderData.id}`;
                }
              } else {
                // Demo order - redirect to sandbox PayPal for testing
                window.location.href = `https://www.sandbox.paypal.com/checkoutnow?token=${orderData.id}`;
              }
            } else {
              console.error("Failed to create PayPal order:", orderData);
              onError({ error: "Failed to create PayPal order" });
            }
          } catch (error) {
            console.error("PayPal checkout error:", error);
            onError({ error: "PayPal checkout failed" });
          }
        };

        const paypalButton = document.getElementById("paypal-button");
        if (paypalButton) {
          paypalButton.style.backgroundColor = "#0070ba";
          paypalButton.style.color = "white";
          paypalButton.style.border = "none";
          paypalButton.style.borderRadius = "4px";
          paypalButton.style.padding = "12px 24px";
          paypalButton.style.fontSize = "16px";
          paypalButton.style.fontWeight = "bold";
          paypalButton.style.cursor = "pointer";
          paypalButton.textContent = "Pay with PayPal";
          paypalButton.addEventListener("click", onClick);
        }
        return;
      }

      // Real PayPal SDK initialization for production
      const sdkInstance = await (window as any).paypal.createInstance({
        clientToken: setupData.clientToken,
        components: ["paypal-payments"],
      });

      const paypalCheckout = sdkInstance.createPayPalOneTimePaymentSession({
        onApprove,
        onCancel,
        onError,
      });

      const onClick = async () => {
        try {
          const checkoutOptionsPromise = createOrder();
          await paypalCheckout.start(
            { paymentFlow: "auto" },
            checkoutOptionsPromise,
          );
        } catch (e) {
          console.error(e);
        }
      };

      const paypalButton = document.getElementById("paypal-button");
      if (paypalButton) {
        paypalButton.addEventListener("click", onClick);
      }

      return () => {
        if (paypalButton) {
          paypalButton.removeEventListener("click", onClick);
        }
      };
    } catch (e) {
      console.error(e);
    }
  };

  // Show loading state while checking configuration
  if (isConfigured === null) {
    return (
      <div className="w-full bg-gray-100 text-gray-500 font-medium py-2 px-4 rounded text-center">
        Loading PayPal...
      </div>
    );
  }

  // Show message when PayPal is not configured
  if (isConfigured === false) {
    return (
      <div className="w-full bg-gray-100 text-gray-600 font-medium py-2 px-4 rounded text-center">
        PayPal payment unavailable - please contact support
      </div>
    );
  }

  // Show PayPal button when configured
  return <paypal-button id="paypal-button"></paypal-button>;
}
// <END_EXACT_CODE>
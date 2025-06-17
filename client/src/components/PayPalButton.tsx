import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PayPalButtonProps {
  amount: string;
  currency: string;
  intent: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function PayPalButton({
  amount,
  currency,
  intent,
  onSuccess,
  onError,
}: PayPalButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const handlePayPalPayment = async () => {
    setIsLoading(true);
    try {
      // Create PayPal order
      const orderPayload = {
        amount: amount,
        currency: currency,
        intent: intent,
      };
      
      const response = await fetch("/api/paypal/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create PayPal order');
      }
      
      const orderData = await response.json();
      console.log("PayPal order created:", orderData);
      
      // Since we're using mock PayPal, simulate successful payment
      if (orderData.id) {
        // Capture the order
        const captureResponse = await fetch(`/api/paypal/order/${orderData.id}/capture`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (!captureResponse.ok) {
          throw new Error('Failed to capture PayPal payment');
        }
        
        const captureData = await captureResponse.json();
        console.log("PayPal payment captured:", captureData);
        
        // Call success callback
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error("PayPal payment error:", error);
      if (onError) {
        onError((error as Error).message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayPalPayment}
      className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white font-medium py-2 px-4 rounded"
      type="button"
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        "Pay with PayPal"
      )}
    </Button>
  );
}
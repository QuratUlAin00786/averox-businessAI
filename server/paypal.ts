import { Request, Response } from "express";

/* PayPal Mock Implementation for Development */

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;

// Mock implementation when credentials are not available
const useMockPayPal = !PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET;

/* Token generation helpers */

export async function getClientToken() {
  if (useMockPayPal) {
    // Return a mock client token for development
    return "mock_client_token_" + Math.random().toString(36).substring(7);
  }
  
  // TODO: Implement real PayPal client token generation when credentials are available
  return "mock_client_token_" + Math.random().toString(36).substring(7);
}

/*  Process transactions */

export async function createPaypalOrder(req: Request, res: Response) {
  try {
    const { amount, currency, intent } = req.body;

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res
        .status(400)
        .json({
          error: "Invalid amount. Amount must be a positive number.",
        });
    }

    if (!currency) {
      return res
        .status(400)
        .json({ error: "Invalid currency. Currency is required." });
    }

    if (!intent) {
      return res
        .status(400)
        .json({ error: "Invalid intent. Intent is required." });
    }

    if (useMockPayPal) {
      // Mock PayPal order response
      const mockOrderId = "MOCK_ORDER_" + Math.random().toString(36).substring(7).toUpperCase();
      const jsonResponse = {
        id: mockOrderId,
        status: "CREATED",
        links: [
          {
            href: `https://api.sandbox.paypal.com/v2/checkout/orders/${mockOrderId}`,
            rel: "self",
            method: "GET"
          },
          {
            href: `https://www.sandbox.paypal.com/checkoutnow?token=${mockOrderId}`,
            rel: "approve",
            method: "GET"
          },
          {
            href: `https://api.sandbox.paypal.com/v2/checkout/orders/${mockOrderId}/capture`,
            rel: "capture",
            method: "POST"
          }
        ]
      };
      
      return res.status(201).json(jsonResponse);
    }

    // TODO: Implement real PayPal order creation when credentials are available
    res.status(500).json({ error: "PayPal credentials not configured." });
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to create order." });
  }
}

export async function capturePaypalOrder(req: Request, res: Response) {
  try {
    const { orderID } = req.params;
    
    if (useMockPayPal) {
      // Mock successful capture response
      const jsonResponse = {
        id: orderID,
        status: "COMPLETED",
        purchase_units: [
          {
            payments: {
              captures: [
                {
                  id: "CAPTURE_" + Math.random().toString(36).substring(7).toUpperCase(),
                  status: "COMPLETED",
                  amount: {
                    currency_code: "USD",
                    value: "100.00"
                  }
                }
              ]
            }
          }
        ]
      };
      
      return res.status(201).json(jsonResponse);
    }

    // TODO: Implement real PayPal order capture when credentials are available
    res.status(500).json({ error: "PayPal credentials not configured." });
  } catch (error) {
    console.error("Failed to capture order:", error);
    res.status(500).json({ error: "Failed to capture order." });
  }
}

export async function loadPaypalDefault(req: Request, res: Response) {
  const clientToken = await getClientToken();
  res.json({
    clientToken,
  });
}
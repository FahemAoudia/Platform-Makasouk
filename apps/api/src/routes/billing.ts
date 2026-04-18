import { Router } from "express";
import { z } from "zod";
import { authMiddleware, type AuthedRequest } from "../middleware/auth";

/**
 * Stripe Checkout placeholder — wire STRIPE_SECRET_KEY and create session.
 */
const router = Router();
router.use(authMiddleware);

const checkoutSchema = z.object({
  orderId: z.string(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

router.post("/create-checkout-session", async (req: AuthedRequest, res) => {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(501).json({
      error: "Stripe not configured",
      hint: "Set STRIPE_SECRET_KEY and install stripe package.",
    });
  }
  return res.status(501).json({
    error: "Stripe integration stub — implement with stripe.checkout.sessions.create",
  });
});

export default router;

import { supabase } from "../lib/supabase";

export async function issueRefund(
  orderId: string,
  amount: number,
  reason?: string
) {
  const { error } = await supabase.rpc(
    "refund_order_atomic",
    {
      p_order_id: orderId,
      p_amount: amount,
      p_reason: reason ?? null,
    }
  );

  if (error) {
    throw new Error(error.message);
  }
}

import { apiRequest } from "./client";
import { Order, IssueRefundPayload } from "./types";

export function issueRefund(
  orderId: string,
  payload: IssueRefundPayload
) {
  return apiRequest<Order>(
    `/orders/${orderId}/refund`,
    {
      method: "POST",
      body: payload,
    }
  );
}

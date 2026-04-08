// src/utils/orderEvents.ts
import { OrderEvent } from '../api/types';

export function formatOrderEvent(event: OrderEvent): string {
  switch (event.type) {
    case 'created':
      return '🧾 Order placed';

    case 'confirmed':
      return '✅ Order confirmed';

    case 'canceled':
      return '❌ Order canceled';

    case 'refunded_partial':
      return `💸 Partial refund issued ($${event.amount?.toFixed(2)})`;

    case 'refunded_full':
      return '💸 This order was fully refunded';

    default:
      return 'ℹ️ Order updated';
  }
}

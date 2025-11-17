import { useMemo } from 'react';
import { useSelector } from 'react-redux';

export default function useCartSummary(event) {
  const cartItems = useSelector((state) => state.cart.items);

  const allTickets = useMemo(() => {
    if (!event || !event.shows) return [];
    return event.shows.flatMap((show) => show.tickets);
  }, [event]);

  const summaryData = useMemo(() => {
    let totalAmount = 0;
    let totalQuantity = 0;
    let validationError = null;

    if (allTickets.length === 0) {
      return { summaryItems: [], totalAmount, totalQuantity, validationError };
    }

    const summaryItems = Object.entries(cartItems)
      .map(([ticketTypeId, quantity]) => {
        const ticket = allTickets.find((t) => t._id === ticketTypeId);
        if (!ticket) return null;

        // Kiểm tra minPurchase
        if (quantity > 0 && quantity < ticket.minPurchase) {
          validationError = `Loại vé "${ticket.name}" yêu cầu mua tối thiểu ${ticket.minPurchase} vé.`;
        }

        const subtotal = ticket.price * quantity;
        totalAmount += subtotal;
        totalQuantity += quantity;

        return {
          id: ticketTypeId,
          name: ticket.name,
          quantity,
          subtotal,
        };
      })
      .filter(Boolean);

    return { summaryItems, totalAmount, totalQuantity, validationError };
  }, [cartItems, allTickets]);

  return summaryData;
}

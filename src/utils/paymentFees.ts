/**
 * Mirrors the backend's COD surcharge (apps.payments.services.COD_FEE) for
 * display purposes only, so the checkout summary can show it before the
 * order/payment exists. The actual amount charged always comes from the
 * backend's payment_amount_due on the order once a COD payment is initiated.
 */
export const COD_FEE = 15

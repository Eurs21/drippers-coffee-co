import { supabase } from './lib/supabase';

export async function saveOrderToSupabase(orderData) {
  if (!supabase) {
    return {
      ok: false,
      error: 'Supabase client is null. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.',
    };
  }

  const payload = {
    order_number: orderData.orderNumber || `DCC-${Date.now().toString().slice(-6)}`,
    customer_name: (orderData.customerName || '').trim(),
    mobile_number: (orderData.mobileNumber || '').trim(),
    order_type: orderData.orderType === 'takeout' || orderData.orderType === 'Takeout'
      ? 'Takeout'
      : 'Dine-in',
    table_or_pickup:
      (orderData.tableNumber || orderData.pickupPreference || '').trim() || null,
    payment_method: orderData.paymentMethod === 'GCash' ? 'GCash' : 'Cash',
    payment_status:
      orderData.paymentStatus ||
      (orderData.paymentMethod === 'GCash' ? 'Pending Verification' : 'Pay at Counter'),
    order_status: orderData.status || 'Pending',
    items: orderData.items || [],
    subtotal: Number(orderData.subtotal) || 0,
    fees: Number(orderData.fee ?? orderData.fees) || 0,
    total: Number(orderData.total) || 0,
    special_instructions: (orderData.specialInstructions || '').trim() || null,
  };

  const { data, error } = await supabase
    .from('orders')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Supabase insert error:', error);
    return { ok: false, error: error.message };
  }

  return { ok: true, data };
}
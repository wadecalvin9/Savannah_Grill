import { Platform } from 'react-native';

/**
 * Launch Paystack payment.
 * Works on both mobile (via react-native-paystack-webview) and web (InlineJS).
 */
export async function launchPaystackPayment({
  popup,               // from usePaystack() – only used on native
  publicKey,
  email,
  amount,              // in cents
  reference,
  currency = 'KES',
  metadata = {},
  onSuccess,
  onCancel,
}) {
  if (Platform.OS === 'web') {
    // ---------- WEB ----------
    // Load Paystack InlineJS if not already loaded
    if (!window.PaystackPop) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v2/inline.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    const paystack = new window.PaystackPop();
    paystack.newTransaction({
      key: publicKey,
      email,
      amount,
      currency,
      ref: reference,
      metadata,
      onSuccess: (transaction) => {
        onSuccess?.(transaction);
      },
      onCancel: () => {
        onCancel?.();
      },
    });
  } else {
    // ---------- NATIVE (iOS / Android) ----------
    popup.checkout({
      email,
      amount,
      reference,
      currency,
      metadata,
      onSuccess,
      onCancel,
    });
  }
}
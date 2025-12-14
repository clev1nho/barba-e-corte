/**
 * WhatsApp utility functions for opening WhatsApp with pre-filled messages
 */

/**
 * Normalizes a WhatsApp number to international format (digits only)
 * Returns null if the number is invalid
 */
export function normalizeWhatsAppNumber(raw: string | null | undefined): string | null {
  if (!raw) return null;
  
  // Remove all non-digit characters
  let cleaned = raw.replace(/\D/g, "");
  
  // If empty after cleaning, return null
  if (!cleaned) return null;
  
  // If it's a Brazilian number without country code (10-11 digits), add 55
  if (cleaned.length === 10 || cleaned.length === 11) {
    cleaned = "55" + cleaned;
  }
  
  // Validate: must have at least 12 digits for Brazilian numbers (55 + DDD + number)
  if (cleaned.length < 12) {
    return null;
  }
  
  return cleaned;
}

/**
 * Detects if the current device is mobile
 */
export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Builds the appropriate WhatsApp URL based on device type
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const encodedMessage = encodeURIComponent(message);
  
  if (isMobileDevice()) {
    // Mobile: use wa.me
    return `https://wa.me/${phone}?text=${encodedMessage}`;
  } else {
    // Desktop: use web.whatsapp.com
    return `https://web.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`;
  }
}

/**
 * Opens WhatsApp with the given URL
 * Tries window.open first, falls back to location.href if blocked
 */
export function openWhatsApp(url: string): void {
  // Try window.open first
  const newWindow = window.open(url, "_blank", "noopener,noreferrer");
  
  // If blocked by popup blocker, fallback to location change
  if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
    window.location.href = url;
  }
}

/**
 * Complete helper to open WhatsApp with a message
 * Returns an error message if validation fails, or null on success
 */
export function openWhatsAppWithMessage(
  rawNumber: string | null | undefined,
  message: string
): string | null {
  // Validate number exists
  if (!rawNumber || !rawNumber.trim()) {
    return "WhatsApp não configurado no painel admin.";
  }
  
  // Normalize number
  const phone = normalizeWhatsAppNumber(rawNumber);
  if (!phone) {
    return "Número do WhatsApp inválido. Use DDI+DDD+número.";
  }
  
  // Build URL and open
  const url = buildWhatsAppUrl(phone, message);
  openWhatsApp(url);
  
  return null;
}

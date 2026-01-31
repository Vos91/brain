import DOMPurify from "dompurify";

/**
 * Sanitize user input to prevent XSS attacks
 * Strips all HTML tags and attributes
 */
export function sanitizeInput(input: string): string {
  if (typeof window === "undefined") {
    // Server-side: basic sanitization
    return input
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");
  }
  // Client-side: use DOMPurify with strict config (no HTML allowed)
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true 
  });
}

/**
 * Sanitize an object's string fields
 */
export function sanitizeObject<T extends object>(obj: T): T {
  const sanitized = { ...obj } as Record<string, unknown>;
  for (const key in sanitized) {
    if (Object.prototype.hasOwnProperty.call(sanitized, key) && typeof sanitized[key] === "string") {
      sanitized[key] = sanitizeInput(sanitized[key] as string);
    }
  }
  return sanitized as T;
}

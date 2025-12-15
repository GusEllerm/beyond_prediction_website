/**
 * DOM utility functions for safe HTML rendering.
 * 
 * All HTML escaping in the codebase should use the escapeHtml function from this module
 * to ensure consistency and prevent XSS vulnerabilities.
 */

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;',
};

/**
 * Escape HTML special characters to prevent injection / layout breakage.
 * This is the canonical implementation for the whole site.
 * 
 * Escapes the following characters:
 * - & → &amp;
 * - < → &lt;
 * - > → &gt;
 * - " → &quot;
 * - ' → &#039;
 * 
 * All other characters are left unchanged.
 * 
 * @param input - The string to escape
 * @returns The escaped string safe for use in HTML
 */
export function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char] ?? char);
}

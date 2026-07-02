/**
 * Parses a search query (full URL, relative URL, or raw ID)
 * and resolves the matching route path.
 * 
 * Examples:
 * - "https://site.com/feedback/abc12345" -> "/feedback/abc12345"
 * - "/dashboard/abc12345" -> "/dashboard/abc12345"
 * - "abc12345" -> "/u/abc12345"
 */
export const resolveSearchLink = (query) => {
  if (!query) return null;
  
  const trimmed = query.trim();
  
  // 1. Try parsing as full URL
  let path = trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const url = new URL(trimmed);
      path = url.pathname;
    } catch {
      // Ignore URL parse error, treat as raw string
    }
  }

  // 2. Check path patterns
  // Pattern /feedback/ID
  const feedbackMatch = path.match(/(?:^|\/)feedback\/([a-zA-Z0-9]+)/i);
  if (feedbackMatch) {
    return `/feedback/${feedbackMatch[1]}`;
  }

  // Pattern /dashboard/ID
  const dashboardMatch = path.match(/(?:^|\/)dashboard\/([a-zA-Z0-9]+)/i);
  if (dashboardMatch) {
    return `/dashboard/${dashboardMatch[1]}`;
  }

  // Pattern /u/ID
  const profileMatch = path.match(/(?:^|\/)u\/([a-zA-Z0-9]+)/i);
  if (profileMatch) {
    return `/u/${profileMatch[1]}`;
  }

  // 3. Fallback for raw 6-to-24 character alphanumeric user ID
  const rawIdMatch = trimmed.match(/^[a-zA-Z0-9]{6,24}$/);
  if (rawIdMatch) {
    return `/u/${trimmed}`;
  }

  // If nothing matches, return null
  return null;
};

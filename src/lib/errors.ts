/** Turns Firebase and network errors into plain, actionable messages. */
export function friendlyError(e: unknown): string {
  const code = (e as { code?: string })?.code ?? (e as Error)?.message ?? '';
  if (code === 'not-configured')
    return 'Community features are not connected yet. The site owner needs to add Firebase settings.';
  if (code.includes('resource-exhausted') || code.includes('quota'))
    return 'Today’s free database limit has been reached, so this wasn’t saved. Please try again later.';
  if (code.includes('permission-denied'))
    return 'That action isn’t allowed. If you just submitted something, wait a minute before sending another.';
  if (code.includes('unavailable') || code.includes('network') || code.includes('offline'))
    return 'No connection. Check your internet and tap retry.';
  if (code.includes('popup-closed') || code.includes('cancelled-popup'))
    return 'Sign-in window was closed before finishing.';
  if (code.includes('popup-blocked')) return 'Your browser blocked the sign-in window. Allow pop-ups and try again.';
  if (code.includes('admin-restricted-operation') || code.includes('operation-not-allowed'))
    return 'This sign-in method is turned off in Firebase. The site owner needs to enable it.';
  if (code.includes('already-exists'))
    return 'A food with this name has already been submitted for this district. It is either live, waiting for review, or was declined.';
  if (code.includes('throttled')) return 'You can send one food per minute. Your form is kept — try again shortly.';
  return 'Something went wrong and nothing was saved. Please try again.';
}

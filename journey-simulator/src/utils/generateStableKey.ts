/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

/**
 * Generate a stable, unique key for React list items
 * Priority order:
 * 1. id or uuid if available
 * 2. action_id for action items
 * 3. Composite key from specified fields
 * 4. Deterministic hash as last resort
 */
export function generateStableKey(
  item: any,
  fallbackPrefix: string,
  fallbackFields: string[] = []
): string {
  // Priority 1: Use id or uuid if available
  if (item?.id) return String(item.id);
  if (item?.uuid) return String(item.uuid);

  // Priority 2: Use action_id for suggestions/actions
  if (item?.action_id) return `action-${item.action_id}`;

  // Priority 3: Generate composite key from fallback fields
  const compositeParts = fallbackFields
    .map((field) => {
      const value = item?.[field];
      return value ? String(value).trim() : null;
    })
    .filter(Boolean);

  if (compositeParts.length > 0) {
    return `${fallbackPrefix}-${compositeParts.join('-')}`;
  }

  // Priority 4: Last resort - use prefix with a deterministic hash of the item
  const itemStr = JSON.stringify(item);
  const hash = itemStr.split('').reduce((acc, char) => {
    const updated = ((acc << 5) - acc) + char.charCodeAt(0);
    return Math.trunc(updated);
  }, 0);
  return `${fallbackPrefix}-${Math.abs(hash)}`;
}


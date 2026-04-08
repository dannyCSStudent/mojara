function normalizeUnknown(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    const parts = value.map(normalizeUnknown).filter((item): item is string => Boolean(item));
    return parts.length > 0 ? parts.join('; ') : null;
  }

  if (value && typeof value === 'object') {
    const detail = (value as { detail?: unknown }).detail;
    if (detail !== undefined) {
      return normalizeUnknown(detail);
    }

    const message = (value as { message?: unknown }).message;
    if (message !== undefined) {
      return normalizeUnknown(message);
    }

    const errors = Object.values(value)
      .map(normalizeUnknown)
      .filter((item): item is string => Boolean(item));

    return errors.length > 0 ? errors.join('; ') : null;
  }

  return null;
}

export function getApiErrorMessage(data: unknown, fallback = 'API request failed') {
  return normalizeUnknown(data) ?? fallback;
}

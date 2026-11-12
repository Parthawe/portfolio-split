const activeLocks = new Set<string>();

function applyBodyScrollState() {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = activeLocks.size > 0 ? 'hidden' : '';
}

export function lockBodyScroll(key: string) {
  activeLocks.add(key);
  applyBodyScrollState();
}

export function unlockBodyScroll(key: string) {
  activeLocks.delete(key);
  applyBodyScrollState();
}

export function clearBodyScrollLocks() {
  activeLocks.clear();
  applyBodyScrollState();
}

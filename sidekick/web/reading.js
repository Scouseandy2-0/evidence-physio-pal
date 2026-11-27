export const readingDefaults = { size: 'standard', spacing: 'standard', motion: 'system' };
export const readingKey = 'physiosidekick.reading.v1';
export function normalizeReading(value = {}) {
  const input = value && typeof value === 'object' ? value : {};
  return { size: ['standard','larger','largest'].includes(input.size) ? input.size : 'standard', spacing: ['standard','comfortable'].includes(input.spacing) ? input.spacing : 'standard', motion: ['system','reduced'].includes(input.motion) ? input.motion : 'system' };
}
export function loadReading(storage) { try { return normalizeReading(JSON.parse(storage.getItem(readingKey))); } catch { return { ...readingDefaults }; } }
export function saveReading(settings, storage) { try { storage.setItem(readingKey,JSON.stringify(normalizeReading(settings))); return true; } catch { return false; } }
export function applyReading(settings, root) {
  const value = normalizeReading(settings);
  root.style.fontSize = { standard: '100%', larger: '112.5%', largest: '125%' }[value.size];
  root.dataset.readingSpacing = value.spacing; root.dataset.readingMotion = value.motion;
  return value;
}

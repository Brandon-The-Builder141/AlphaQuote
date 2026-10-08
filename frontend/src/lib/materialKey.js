/**
 * Material Key Utilities
 * Consistent material name normalization across the application
 */

export function toMaterialKey(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export default toMaterialKey;



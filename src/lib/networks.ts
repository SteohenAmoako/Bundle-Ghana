import type { Network, NetworkName } from './definitions';

export const NETWORKS: Network[] = [
  { id: 1, name: 'MTN', prefixes: ['024', '054', '055', '059'] },
  { id: 2, name: 'Telecel', prefixes: ['020', '050'] },
  { id: 3, name: 'AirtelTigo', prefixes: ['027', '057', '026', '056'] },
];

const networkPrefixMap = new Map<string, Network>();
NETWORKS.forEach(network => {
  network.prefixes.forEach(prefix => {
    networkPrefixMap.set(prefix, network);
  });
});

export const normalizePhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/\s+/g, ''); // Remove spaces
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  if (cleaned.startsWith('233')) {
    return `0${cleaned.substring(3)}`;
  }
  if (cleaned.length === 9 && (cleaned.startsWith('2') || cleaned.startsWith('5'))) {
    return `0${cleaned}`;
  }
  return cleaned;
};

export const detectNetwork = (phone: string): Network | null => {
  const normalized = normalizePhoneNumber(phone);
  if (normalized.length >= 3) {
    const prefix = normalized.substring(0, 3);
    return networkPrefixMap.get(prefix) || null;
  }
  return null;
};

export const validatePhoneNumber = (phone: string): boolean => {
    const normalized = normalizePhoneNumber(phone);
    return /^0(20|50|24|54|55|59|27|57|26|56)\d{7}$/.test(normalized);
}

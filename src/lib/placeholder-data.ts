import type { Package, Order } from './definitions';
import { NETWORKS } from './networks';

const mtn = NETWORKS.find(n => n.name === 'MTN')!;
const telecel = NETWORKS.find(n => n.name === 'Telecel')!;
const airteltigo = NETWORKS.find(n => n.name === 'AirtelTigo')!;

export const PACKAGES: Package[] = [
  // MTN
  { id: 'mtn-1', network: mtn, dataAmount: '500 MB', validity: '3 Days', price: 5, sharedBundle: 101 },
  { id: 'mtn-2', network: mtn, dataAmount: '1 GB', validity: '7 Days', price: 10, sharedBundle: 102 },
  { id: 'mtn-3', network: mtn, dataAmount: '2 GB', validity: '30 Days', price: 20, sharedBundle: 103 },
  { id: 'mtn-4', network: mtn, dataAmount: '5 GB', validity: '30 Days', price: 45, sharedBundle: 104 },
  { id: 'mtn-5', network: mtn, dataAmount: '10 GB', validity: '30 Days', price: 80, sharedBundle: 105 },

  // Telecel
  { id: 'telecel-1', network: telecel, dataAmount: '700 MB', validity: '3 Days', price: 5, sharedBundle: 201 },
  { id: 'telecel-2', network: telecel, dataAmount: '1.5 GB', validity: '7 Days', price: 10, sharedBundle: 202 },
  { id: 'telecel-3', network: telecel, dataAmount: '3 GB', validity: '30 Days', price: 20, sharedBundle: 203 },
  { id: 'telecel-4', network: telecel, dataAmount: '6 GB', validity: '30 Days', price: 45, sharedBundle: 204 },
  { id: 'telecel-5', network: telecel, dataAmount: '12 GB', validity: '30 Days', price: 80, sharedBundle: 205 },

  // AirtelTigo
  { id: 'airteltigo-1', network: airteltigo, dataAmount: '600 MB', validity: '3 Days', price: 5, sharedBundle: 301 },
  { id: 'airteltigo-2', network: airteltigo, dataAmount: '1.2 GB', validity: '7 Days', price: 10, sharedBundle: 302 },
  { id: 'airteltigo-3', network: airteltigo, dataAmount: '2.5 GB', validity: '30 Days', price: 20, sharedBundle: 303 },
  { id: 'airteltigo-4', network: airteltigo, dataAmount: '5.5 GB', validity: '30 Days', price: 45, sharedBundle: 304 },
  { id: 'airteltigo-5', network: airteltigo, dataAmount: '11 GB', validity: '30 Days', price: 80, sharedBundle: 305 },
];

export const ORDERS: Order[] = [
    {
        id: '1',
        transactionCode: 'TXN123456',
        recipientMsisdn: '0241234567',
        network: 'MTN',
        bundle: '5 GB',
        price: 45.00,
        date: new Date('2024-07-28T10:30:00Z').toISOString(),
        status: 'Completed',
    },
    {
        id: '2',
        transactionCode: 'TXN123457',
        recipientMsisdn: '0209876543',
        network: 'Telecel',
        bundle: '1.5 GB',
        price: 10.00,
        date: new Date('2024-07-28T11:00:00Z').toISOString(),
        status: 'Completed',
    },
    {
        id: '3',
        transactionCode: 'TXN123458',
        recipientMsisdn: '0271112222',
        network: 'AirtelTigo',
        bundle: '2.5 GB',
        price: 20.00,
        date: new Date('2024-07-27T15:45:00Z').toISOString(),
        status: 'Failed',
    },
    ...Array.from({ length: 30 }, (_, i) => ({
        id: (i + 4).toString(),
        transactionCode: `TXN${123458 + i + 1}`,
        recipientMsisdn: `055${Math.floor(1000000 + Math.random() * 9000000)}`,
        network: (['MTN', 'Telecel', 'AirtelTigo'] as const)[i % 3],
        bundle: `${(Math.random() * 10).toFixed(1)} GB`,
        price: parseFloat((Math.random() * 100).toFixed(2)),
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: Math.random() > 0.1 ? 'Completed' : 'Failed' as 'Completed' | 'Failed',
    }))
];

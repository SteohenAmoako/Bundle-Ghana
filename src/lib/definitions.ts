export type NetworkName = 'MTN' | 'Telecel' | 'AirtelTigo';

export interface Network {
  id: number;
  name: NetworkName;
  prefixes: string[];
}

export interface Package {
  id: string; // Using sharedBundle as unique id
  network: Network;
  dataAmount: string;
  validity: string;
  price: number;
  sharedBundle: number;
}

export interface CartItem {
  cartId: string; // A unique ID for the cart item
  recipientMsisdn: string;
  networkId: number;
  networkName: NetworkName;
  sharedBundle: number;
  price: number;
  dataAmount: string;
}

export interface Order {
    id: string;
    transactionCode: string;
    recipientMsisdn: string;
    network: NetworkName;
    bundle: string;
    price: number;
    date: string;
    status: 'Completed' | 'Failed';
}

"use client";

import React, { useState, useMemo } from 'react';
import { PhoneInputForm } from '@/components/phone-input-form';
import { PACKAGES } from '@/lib/placeholder-data';
import type { Package, NetworkName } from '@/lib/definitions';
import { PackageCard } from '@/components/package-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDebounce } from '@/hooks/use-debounce';

const networks: NetworkName[] = ["MTN", "Telecel", "AirtelTigo"];

export default function Home() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [detectedNetwork, setDetectedNetwork] = useState<NetworkName | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkName | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const handlePhoneNumberChange = (number: string, network: NetworkName | null) => {
    setPhoneNumber(number);
    setDetectedNetwork(network);
    if (network) {
      setSelectedNetwork(network);
    }
  };

  const filteredPackages = useMemo(() => {
    return PACKAGES.filter((pkg: Package) => {
      const networkMatch = selectedNetwork === 'All' || pkg.network.name === selectedNetwork;
      const searchMatch = debouncedSearchTerm === '' || pkg.dataAmount.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      return networkMatch && searchMatch;
    });
  }, [selectedNetwork, debouncedSearchTerm]);
  
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <section className="flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-headline text-4xl font-bold tracking-tight md:text-6xl">
            Instant Data Bundles
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Enter a phone number to get started. We'll automatically detect the network for you.
          </p>
        </motion.div>
        
        <motion.div 
          className="mt-8 w-full max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <PhoneInputForm onPhoneNumberChange={handlePhoneNumberChange} />
        </motion.div>
      </section>

      <section className="mt-12 sm:mt-16">
        <div className="mb-8 space-y-4">
            <h2 className="font-headline text-3xl font-bold text-center">
              Choose a Data Package
            </h2>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                <div className="flex flex-wrap justify-center gap-2">
                    <Button
                        variant={selectedNetwork === 'All' ? 'default' : 'outline'}
                        onClick={() => setSelectedNetwork('All')}
                        className="rounded-full"
                    >
                        All
                    </Button>
                    {networks.map(network => (
                        <Button
                            key={network}
                            variant={selectedNetwork === network ? 'default' : 'outline'}
                            onClick={() => setSelectedNetwork(network)}
                            className="rounded-full"
                        >
                            {network}
                        </Button>
                    ))}
                </div>
                <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search e.g., 5GB"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 rounded-full"
                    />
                </div>
            </div>
        </div>

        <AnimatePresence>
            <motion.div
              key={selectedNetwork}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {filteredPackages.length > 0 ? (
                filteredPackages.map((pkg, index) => (
                    <motion.div
                      key={pkg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <PackageCard packageInfo={pkg} phoneNumber={phoneNumber} />
                    </motion.div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-muted-foreground">
                  No packages found for your selection.
                </div>
              )}
            </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}

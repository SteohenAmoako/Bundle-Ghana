"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { detectNetwork, normalizePhoneNumber, validatePhoneNumber } from '@/lib/networks';
import { NetworkLogo } from './network-logo';
import type { NetworkName } from '@/lib/definitions';
import { AnimatePresence, motion } from 'framer-motion';

const FormSchema = z.object({
  phone: z.string().refine(validatePhoneNumber, {
    message: 'Please enter a valid Ghanaian phone number.',
  }),
});

interface PhoneInputFormProps {
  onPhoneNumberChange: (phoneNumber: string, network: NetworkName | null) => void;
}

export function PhoneInputForm({ onPhoneNumberChange }: PhoneInputFormProps) {
  const [detectedNetwork, setDetectedNetwork] = useState<NetworkName | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      phone: '',
    },
    mode: 'onTouched'
  });

  const phoneValue = form.watch('phone');

  useEffect(() => {
    const network = detectNetwork(phoneValue);
    setDetectedNetwork(network?.name || null);
    
    const normalized = normalizePhoneNumber(phoneValue);
    if(validatePhoneNumber(normalized)) {
        onPhoneNumberChange(normalized, network?.name || null);
    } else {
        onPhoneNumberChange('', null);
    }
  }, [phoneValue, onPhoneNumberChange]);

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Phone Number</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    {...field}
                    type="tel"
                    placeholder="e.g., 024 123 4567"
                    className="h-14 rounded-full pl-6 pr-14 text-lg"
                    autoComplete="tel"
                  />
                </FormControl>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 transform">
                  <AnimatePresence>
                    {detectedNetwork && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <NetworkLogo network={detectedNetwork} size={32} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <FormMessage className="pl-6" />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

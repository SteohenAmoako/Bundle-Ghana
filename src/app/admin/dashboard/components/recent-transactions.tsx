'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Transaction } from '@/lib/definitions';
import { NETWORKS } from '@/lib/networks';
import { DataTable } from '@/components/ui/data-table';

const networkMap = new Map(NETWORKS.map((n) => [n.id, n.name]));

const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: 'transaction_code',
    header: 'Transaction Code',
    cell: ({ row }) => <div>{row.getValue('transaction_code')}</div>,
  },
  {
    accessorKey: 'recipient_msisdn',
    header: 'Recipient',
    cell: ({ row }) => <div>{row.getValue('recipient_msisdn') || 'N/A'}</div>,
  },
  {
    accessorKey: 'network_id',
    header: 'Network',
    cell: ({ row }) => {
      const networkId = row.getValue('network_id') as number;
      return <div>{networkMap.get(networkId) || 'N/A'}</div>;
    },
  },
  {
    accessorKey: 'bundle_amount',
    header: 'Bundle',
    cell: ({ row }) => <div>{row.getValue('bundle_amount') || 'N/A'}</div>,
  },
  {
    accessorKey: 'amount',
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      const formatted = new Intl.NumberFormat('en-GH', {
        style: 'currency',
        currency: 'GHS',
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div>{format(new Date(row.getValue('created_at')), 'dd/MM/yyyy, hh:mm:ss a')}</div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const variant = status.toLowerCase() === 'success' ? 'success' : 'destructive';
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
];

export function RecentTransactions({ data, onRefresh }: { data: Transaction[]; onRefresh?: () => void }) {
  return <DataTable columns={columns} data={data} onRefresh={onRefresh} filterColumn="recipient_msisdn" />;
}

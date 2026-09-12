import React, { useState, useEffect } from 'react';
import { CreditCard, ArrowUpRight, ArrowDownRight, RefreshCw, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { paymentService } from '@/services/payment/paymentService';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/empty-states/EmptyState';
import { Spinner } from '@/components/loaders/Spinner';
import { formatCurrency, formatDate, formatTime } from '@/utils/formatters';

export function TransactionsPage() {
  const toast = useToast();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await paymentService.getMyTransactions();
      setTransactions(data || []);
    } catch (err) {
      toast.error('Failed to load transaction history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <Spinner text="Loading payment ledger records..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Payment & Transaction History</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit logs of all checkout settlements, refunds, and payment transactions.
          </p>
        </div>
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadTransactions}>
          Refresh Ledger
        </Button>
      </div>

      {transactions.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-soft-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Transaction Ref</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => {
                  const txDate =
                    tx.createdDate ||
                    tx.created_date ||
                    tx.createdAt ||
                    tx.created_at ||
                    tx.timestamp ||
                    tx.paidAt ||
                    tx.paid_at ||
                    tx.paymentDate ||
                    tx.payment_date ||
                    tx.date;

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-mono text-xs font-semibold text-slate-900">
                        {tx.id?.substring(0, 12)}...
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 text-xs">
                          {tx.type || tx.transactionType || 'PAYMENT'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={
                            tx.status === 'SUCCESS'
                              ? 'emerald'
                              : tx.status === 'FAILED'
                              ? 'rose'
                              : 'amber'
                          }
                        >
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {txDate ? (
                          <div className="flex flex-col items-center justify-center">
                            <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                              {formatDate(txDate, false)}
                            </span>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium mt-0.5">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {formatTime(txDate)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={CreditCard}
          title="No transactions yet"
          description="Your payment transactions and receipts will appear here once you place or fulfill orders."
        />
      )}
    </div>
  );
}

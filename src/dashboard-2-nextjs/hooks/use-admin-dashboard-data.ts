import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type {
  AdminSummary,
  AdminTransaction,
  FinancialOverview,
  MarketingAttributionSummary,
} from '../../lib/api';

export type AdminDashboardData = {
  summary: AdminSummary | null;
  financials: FinancialOverview | null;
  attribution: MarketingAttributionSummary | null;
  transactions: AdminTransaction[];
  isLoading: boolean;
  error: string;
};

const initialState: AdminDashboardData = {
  summary: null,
  financials: null,
  attribution: null,
  transactions: [],
  isLoading: true,
  error: '',
};

export function useAdminDashboardData(range = '1y') {
  const [state, setState] = useState<AdminDashboardData>(initialState);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setState((prev) => ({ ...prev, isLoading: true, error: '' }));

      try {
        const [summary, financials, attribution, transactions] = await Promise.all([
          api.getAdminSummary(),
          api.getAdminFinancials(range),
          api.getAdminMarketingAttribution(8),
          api.getAdminTransactions(5),
        ]);

        if (cancelled) return;
        setState({
          summary,
          financials,
          attribution,
          transactions: transactions.items,
          isLoading: false,
          error: '',
        });
      } catch (error) {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Could not load dashboard data',
        }));
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [range]);

  return state;
}

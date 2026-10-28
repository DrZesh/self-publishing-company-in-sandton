import { useQuery } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';

const DEFAULTS = {
  company_name: 'Creative Books SA',
  email: 'info@creativebooks.co.za',
  currency: 'ZAR',
  currency_symbol: 'R',
  default_vat_rate: 15,
};

/**
 * Returns the singleton CompanySettings record (creates one with defaults if absent).
 * Usage: const { settings, isLoading } = useCompanySettings();
 */
export function useCompanySettings() {
  const { data: settings, isLoading, refetch } = useQuery({
    queryKey: ['companySettings'],
    queryFn: async () => {
      const records = await platform.entities.CompanySettings.filter({ setting_key: 'main' });
      if (records && records.length > 0) return records[0];
      // Auto-create singleton on first load
      return platform.entities.CompanySettings.create({ ...DEFAULTS, setting_key: 'main' });
    },
    staleTime: 5 * 60 * 1000,
  });

  return { settings: settings || DEFAULTS, isLoading, refetch };
}

/**
 * Formats a number as ZAR currency: R 1 234.56
 */
export function formatZAR(amount) {
  if (amount == null || isNaN(amount)) return 'R 0.00';
  return 'R ' + Number(amount).toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
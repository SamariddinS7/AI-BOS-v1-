import { useSettings } from '../contexts/SettingsContext';

export function useCurrencyFormatter() {
  const { settings } = useSettings();

  const formatCurrency = (amount: number, hideSymbol: boolean = false, compact: boolean = false): string => {
    const { currency_format, number_format } = settings;
    
    // Exchange rates (Base: UZS)
    // In a real app, these would come from an API
    const EXCHANGE_RATES: Record<string, number> = {
      UZS: 1,
      USD: 12800,
      EUR: 13800,
      RUB: 135
    };

    const rate = EXCHANGE_RATES[currency_format] || 1;
    const convertedAmount = amount / rate;

    let formattedNumber = convertedAmount;
    let suffix = '';

    if (compact) {
      if (Math.abs(convertedAmount) >= 1000000000) {
        formattedNumber = convertedAmount / 1000000000;
        suffix = ' mlrd';
      } else if (Math.abs(convertedAmount) >= 1000000) {
        formattedNumber = convertedAmount / 1000000;
        suffix = ' mln';
      } else if (Math.abs(convertedAmount) >= 1000) {
        formattedNumber = convertedAmount / 1000;
        suffix = ' k';
      }
    }

    // Format the number part
    let numberString = formattedNumber.toFixed(compact ? 1 : 2);
    // Remove .0 or .00 if compact
    if (compact && (numberString.endsWith('.0') || numberString.endsWith('.00'))) {
        numberString = parseFloat(numberString).toString();
    }
    
    if (number_format === 'space') {
      numberString = numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ' ').replace('.', ',');
    } else if (number_format === 'comma') {
      numberString = numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    } else if (number_format === 'dot') {
      numberString = numberString.replace(/\./g, '#').replace(/\B(?=(\d{3})+(?!\d))/g, '.').replace('#', ',');
    }

    if (hideSymbol) {
      return `${numberString}${suffix}`;
    }

    // Append/Prepend currency symbol
    switch (currency_format) {
      case 'USD':
        return `$${numberString}${suffix}`;
      case 'EUR':
        return `€${numberString}${suffix}`;
      case 'RUB':
        return `${numberString}${suffix} ₽`;
      case 'UZS':
      default:
        return `${numberString}${suffix} so'm`;
    }
  };

  return { formatCurrency, currency: settings.currency_format };
}

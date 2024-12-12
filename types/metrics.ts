export function normalizeMetricValue(value: string): { 
    amount: number, 
    unit: string,
    period?: string 
  } {
    // Remove any commas first
    const cleanValue = value.replace(/,/g, '')
    
    // Handle time-based values (e.g., "2h/month", "2h")
    if (cleanValue.includes('h')) {
      const [amount, period] = cleanValue.split('/')
      return {
        amount: Number(amount.replace('h', '')),
        unit: 'hours',
        period: period || undefined
      }
    }
  
    // Handle thousand-based values (e.g., "1k/month", "1k")
    if (cleanValue.toLowerCase().includes('k')) {
      const [amount, period] = cleanValue.split('/')
      return {
        amount: Number(amount.replace(/k/i, '')) * 1000,
        unit: '',
        period: period || undefined
      }
    }
  
    // Handle million-based values
    if (cleanValue.toLowerCase().includes('m')) {
      const [amount, period] = cleanValue.split('/')
      return {
        amount: Number(amount.replace(/m/i, '')) * 1000000,
        unit: '',
        period: period || undefined
      }
    }
  
    // Handle plain numbers with potential period
    const [amount, period] = cleanValue.split('/')
    return {
      amount: Number(amount),
      unit: '',
      period: period || undefined
    }
  }

// Function to calculate OM Tier Status based on investment amount
export const calculateOMTierStatus = (totalInvested: string): string => {
  if (!totalInvested) return '';
  
  // Extract numeric value from string (remove $ and commas)
  const numericValue = parseFloat(totalInvested.replace(/[$,]/g, ''));
  
  if (isNaN(numericValue)) return '';
  
  if (numericValue >= 999) return 'ZeroJ+KNYT';
  if (numericValue >= 499) return 'FirstKNYT';
  if (numericValue >= 299) return 'KejiKNYT';
  if (numericValue >= 100) return 'KetaKNYT';
  
  return '';
};


// Generate mock data for token price chart
export const generateChartData = () => {
  const today = new Date();
  const data = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Base price with some volatility
    const basePrice = 0.5 + Math.sin(i / 5) * 0.1;
    // Add some random noise
    const price = basePrice + (Math.random() * 0.1 - 0.05);
    // Add some random volume
    const volume = Math.random() * 50000 + 10000;
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: price.toFixed(4),
      volume
    });
  }
  return data;
};

// Generate mock data for token distribution
export const generateDistributionData = () => [
  { name: 'Community', value: 40 },
  { name: 'Team', value: 20 },
  { name: 'Treasury', value: 15 },
  { name: 'Partners', value: 10 },
  { name: 'Ecosystem', value: 15 }
];

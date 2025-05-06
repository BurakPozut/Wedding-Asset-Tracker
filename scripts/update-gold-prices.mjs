import { PrismaClient } from '@prisma/client';
import axios from 'axios';

// Initialize Prisma client
const prisma = new PrismaClient();

async function updateGoldPrices() {
  try {
    console.log('Fetching current gold prices...');
    
    // Fetch the current gold prices from the API
    const response = await axios.get('https://finance.truncgil.com/api/gold-rates');
    
    if (!response.data || !response.data.Rates) {
      throw new Error('Invalid API response structure');
    }
    
    const data = response.data;
    const currentDate = new Date();
    
    // Extract prices for GRAMALTIN (gram gold) and CEYREKALTIN (quarter gold)
    const gramGoldPrice = data.Rates.GRA?.Selling;
    const ceyrekGoldPrice = data.Rates.CEYREKALTIN?.Selling;
    
    if (!gramGoldPrice) {
      throw new Error('Gram gold price not found in API response');
    }
    
    if (!ceyrekGoldPrice) {
      throw new Error('Ceyrek gold price not found in API response');
    }
    
    console.log(`Gram Gold Price: ${gramGoldPrice}`);
    console.log(`Ceyrek Gold Price: ${ceyrekGoldPrice}`);
    
    // Update GRAM_GOLD in AssetTypeInfo
    await prisma.assetTypeInfo.update({
      where: { type: 'GRAM_GOLD' },
      data: {
        currentValue: gramGoldPrice,
        lastUpdated: currentDate,
      },
    });
    console.log('GRAM_GOLD price updated successfully');
    
    // Update CEYREK_ALTIN in AssetTypeInfo
    await prisma.assetTypeInfo.update({
      where: { type: 'CEYREK_ALTIN' },
      data: {
        currentValue: ceyrekGoldPrice,
        lastUpdated: currentDate,
      },
    });
    console.log('CEYREK_ALTIN price updated successfully');
    
    // Optional: Add to historical price tables if needed
    await prisma.gram_gold_prices.upsert({
      where: {
        price_date: new Date(currentDate.setHours(0, 0, 0, 0)),
      },
      update: {
        bid_price: data.Rates.GRA.Buying,
        ask_price: data.Rates.GRA.Selling,
      },
      create: {
        price_date: new Date(currentDate.setHours(0, 0, 0, 0)),
        bid_price: data.Rates.GRA.Buying,
        ask_price: data.Rates.GRA.Selling,
      },
    });
    
    await prisma.cey_gold_prices.upsert({
      where: {
        price_date: new Date(currentDate.setHours(0, 0, 0, 0)),
      },
      update: {
        bid_price: data.Rates.CEYREKALTIN.Buying,
        ask_price: data.Rates.CEYREKALTIN.Selling,
      },
      create: {
        price_date: new Date(currentDate.setHours(0, 0, 0, 0)),
        bid_price: data.Rates.CEYREKALTIN.Buying,
        ask_price: data.Rates.CEYREKALTIN.Selling,
      },
    });
    
    console.log('Gold prices updated at: ' + new Date().toISOString());
  } catch (error) {
    console.error('Error updating gold prices:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
updateGoldPrices(); 
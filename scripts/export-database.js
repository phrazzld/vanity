#!/usr/bin/env node

// Load production environment variables
require('dotenv').config({ path: '.env.production.local' });

const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;

const prisma = new PrismaClient();

async function exportDatabase() {
  try {
    console.log('Connecting to production database...');
    
    // First, let's check what tables exist
    console.log('Checking database tables...');
    const tables = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public'
    `;
    console.log('Available tables:', tables);
    
    // Also check all schemas
    const allTables = await prisma.$queryRaw`
      SELECT schemaname, tablename 
      FROM pg_tables 
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schemaname, tablename
    `;
    console.log('All tables in database:', allTables);
    
    // Check current database name
    const dbInfo = await prisma.$queryRaw`
      SELECT current_database(), current_schema()
    `;
    console.log('Database info:', dbInfo);
    
    // Try to export quotes if table exists
    try {
      console.log('Exporting quotes...');
      const quotes = await prisma.quote.findMany({
        orderBy: { id: 'asc' }
      });
      await fs.writeFile('quotes.json', JSON.stringify(quotes, null, 2));
      console.log(`✅ Exported ${quotes.length} quotes to quotes.json`);
    } catch (error) {
      console.log('❌ Quote table not found or error:', error.message);
      // Create empty file
      await fs.writeFile('quotes.json', '[]');
    }
    
    // Try to export readings if table exists
    try {
      console.log('Exporting readings...');
      const readings = await prisma.reading.findMany({
        orderBy: { id: 'asc' }
      });
      await fs.writeFile('readings.json', JSON.stringify(readings, null, 2));
      console.log(`✅ Exported ${readings.length} readings to readings.json`);
    } catch (error) {
      console.log('❌ Reading table not found or error:', error.message);
      // Create empty file
      await fs.writeFile('readings.json', '[]');
    }
    
    console.log('Database export complete!');
  } catch (error) {
    console.error('Export failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

exportDatabase();
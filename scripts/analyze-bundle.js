#!/usr/bin/env node

/**
 * Bundle Analysis Script
 *
 * Analyzes the Next.js bundle size and generates an interactive treemap.
 *
 * Usage:
 *   npm run analyze
 *
 * This will:
 * 1. Install webpack-bundle-analyzer if not present
 * 2. Build the project with bundle analysis enabled
 * 3. Open the interactive treemap in your browser
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if webpack-bundle-analyzer is installed
const checkAnalyzerInstalled = () => {
  try {
    require.resolve('webpack-bundle-analyzer');
    return true;
  } catch {
    return false;
  }
};

// Install webpack-bundle-analyzer
const installAnalyzer = () => {
  console.log('📦 Installing webpack-bundle-analyzer...');
  return new Promise((resolve, reject) => {
    const install = spawn('npm', ['install', '--save-dev', 'webpack-bundle-analyzer'], {
      stdio: 'inherit',
      shell: true,
    });
    install.on('close', code => {
      if (code !== 0) {
        reject(new Error('Failed to install webpack-bundle-analyzer'));
      } else {
        resolve();
      }
    });
  });
};

// Create temporary next.config for analysis
const createAnalysisConfig = () => {
  const configPath = path.join(__dirname, '..', 'next.config.analyze.ts');
  const configContent = `
import type { NextConfig } from 'next';
import baseConfig from './next.config';

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const nextConfig: NextConfig = {
  ...baseConfig,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: 8888,
          openAnalyzer: true,
          generateStatsFile: true,
          statsFilename: 'bundle-stats.json',
        })
      );
    }
    return config;
  },
};

export default nextConfig;
`;

  fs.writeFileSync(configPath, configContent);
  return configPath;
};

// Run the build with analysis
const runAnalysis = async () => {
  // Check if analyzer is installed
  if (!checkAnalyzerInstalled()) {
    await installAnalyzer();
  }

  console.log('🔍 Starting bundle analysis...');
  console.log('📊 Building project with bundle analyzer...');

  // Create temporary config
  const configPath = createAnalysisConfig();

  // Run build with ANALYZE flag
  const build = spawn('npm', ['run', 'build'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      ANALYZE: 'true',
      NEXT_CONFIG_PATH: configPath,
    },
  });

  build.on('close', code => {
    // Clean up temporary config
    try {
      fs.unlinkSync(configPath);
    } catch {
      // Ignore cleanup errors
    }

    if (code !== 0) {
      console.error('❌ Build failed');
      process.exit(1);
    }

    console.log('✅ Bundle analysis complete!');
    console.log('📈 View the interactive treemap at http://localhost:8888');
    console.log('💡 Press Ctrl+C to stop the analyzer server');
  });
};

// Main execution
console.log('🚀 Next.js Bundle Analyzer');
console.log('==========================');

runAnalysis().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});

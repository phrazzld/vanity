// Define the maximum file size in bytes (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const fs = require('fs');

// Patterns for sensitive data
const SENSITIVE_PATTERNS = [
  // API keys and tokens
  /(['"`;]?(key|api.?key|token|secret|password|pwd|auth)['"`]?\s*[:=]\s*['"`][a-zA-Z0-9_\-]{32,}['"`])/i,
  // AWS access keys
  /(AKIA[0-9A-Z]{16})/,
  // Private keys
  /(-----BEGIN PRIVATE KEY-----|-----BEGIN RSA PRIVATE KEY-----|-----BEGIN DSA PRIVATE KEY-----|-----BEGIN EC PRIVATE KEY-----)/,
  // Environment variables that look like credentials
  /(['"`;]?([A-Z_]+_(KEY|SECRET|TOKEN|PASSWORD))['"`]?\s*[:=]\s*['"`][a-zA-Z0-9_\-~!@#$%^&*]{8,}['"`])/i,
];

module.exports = {
  // Apply to all staged files
  '*': (filenames) => {
    const commands = [];
    const sensitiveFilesDetected = [];
    const largeFilesDetected = [];

    // Check each file
    filenames.forEach((file) => {
      try {
        const stats = fs.statSync(file);
        
        // Check file size
        if (stats.size > MAX_FILE_SIZE) {
          largeFilesDetected.push(`${file} (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);
        }
        
        // Skip binary files for sensitive data check
        const isBinary = /\.(jpg|jpeg|png|gif|webp|ico|svg|woff|woff2|ttf|eot|otf|mp4|webm|ogg|mp3|wav|flac|aac|obj|gz|zip|rar|tar|7z|bin|exe|dll|so|dylib)$/i.test(file);
        
        if (!isBinary) {
          // Read file content
          const content = fs.readFileSync(file, 'utf8');
          
          // Check for sensitive data
          SENSITIVE_PATTERNS.forEach((pattern) => {
            if (pattern.test(content)) {
              sensitiveFilesDetected.push(`${file} (matches pattern: ${pattern})`);
            }
          });
        }
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
      }
    });

    // If sensitive data is detected, throw an error
    if (sensitiveFilesDetected.length > 0) {
      throw new Error(`Potential sensitive data detected in files:\n${sensitiveFilesDetected.join('\n')}\n\nPlease remove sensitive data before committing.`);
    }

    // If large files are detected, throw an error
    if (largeFilesDetected.length > 0) {
      throw new Error(`Files exceeding size limit (5MB) detected:\n${largeFilesDetected.join('\n')}\n\nPlease remove large files before committing or use Git LFS.`);
    }

    // Continue with other checks (linting, formatting, etc.)
    commands.push('npm run lint');
    commands.push('npm run format:check');
    commands.push('npm run typecheck');
    
    return commands;
  },
};
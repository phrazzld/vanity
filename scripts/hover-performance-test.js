/**
 * Hover Performance Validation Script
 *
 * This script validates that hover interactions maintain 60fps performance
 * for the vanity project. It tests both CSS-only and JavaScript-based hover
 * interactions identified in the codebase.
 *
 * Usage:
 * 1. Run `npm run dev` to start the development server
 * 2. Open browser DevTools Console
 * 3. Paste and run this script
 * 4. Review the performance report
 */

/* global performance, requestAnimationFrame, cancelAnimationFrame */

class HoverPerformanceTester {
  constructor() {
    this.results = [];
    this.frameCount = 0;
    this.startTime = 0;
    this.rafId = null;
    this.isMonitoring = false;
  }

  // Monitor frame rate
  startFrameMonitoring() {
    this.frameCount = 0;
    this.startTime = performance.now();
    this.isMonitoring = true;

    const measureFrame = () => {
      if (!this.isMonitoring) return;

      this.frameCount++;
      this.rafId = requestAnimationFrame(measureFrame);
    };

    measureFrame();
  }

  stopFrameMonitoring() {
    this.isMonitoring = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }

    const duration = performance.now() - this.startTime;
    const fps = (this.frameCount / duration) * 1000;

    return {
      fps: Math.round(fps),
      frameCount: this.frameCount,
      duration: Math.round(duration),
      droppedFrames: Math.max(0, Math.round(duration / 16.67 - this.frameCount)),
    };
  }

  // Simulate hover interaction
  async simulateHover(element, duration = 1000) {
    return new Promise(resolve => {
      // Start monitoring
      this.startFrameMonitoring();

      // Trigger mouseenter
      element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      element.classList.add('hover-test-active');

      // Hold hover state
      setTimeout(() => {
        // Trigger mouseleave
        element.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
        element.classList.remove('hover-test-active');

        // Stop monitoring and resolve
        const metrics = this.stopFrameMonitoring();
        resolve(metrics);
      }, duration);
    });
  }

  // Test CSS-only hover performance
  async testCSSHovers() {
    console.log('🎨 Testing CSS-only hover interactions...');
    const testCases = [
      { selector: '.nav-list a', name: 'Navigation Links' },
      { selector: '.content-link', name: 'Content Links' },
      { selector: 'button', name: 'Buttons' },
      { selector: '.project-card', name: 'Project Cards' },
    ];

    const results = [];

    for (const testCase of testCases) {
      const elements = document.querySelectorAll(testCase.selector);
      if (elements.length > 0) {
        const element = elements[0];
        console.log(`  Testing ${testCase.name}...`);

        const metrics = await this.simulateHover(element, 500);
        results.push({
          type: 'CSS-only',
          name: testCase.name,
          ...metrics,
          status: metrics.fps >= 55 ? '✅ PASS' : '❌ FAIL',
        });
      }
    }

    return results;
  }

  // Test JavaScript-based hover performance
  async testJavaScriptHovers() {
    console.log('⚡ Testing JavaScript-based hover interactions...');
    const results = [];

    // Test TypewriterQuotes component
    const quoteElement = document.querySelector('[data-testid="typewriter-quotes"]');
    if (quoteElement) {
      console.log('  Testing TypewriterQuotes pause on hover...');
      const metrics = await this.simulateHover(quoteElement, 1000);
      results.push({
        type: 'JavaScript',
        name: 'TypewriterQuotes Animation Pause',
        ...metrics,
        status: metrics.fps >= 55 ? '✅ PASS' : '❌ FAIL',
      });
    }

    // Test ReadingCard component
    const readingCards = document.querySelectorAll('[data-testid="reading-card"]');
    if (readingCards.length > 0) {
      console.log('  Testing ReadingCard overlay animation...');
      const metrics = await this.simulateHover(readingCards[0], 1000);
      results.push({
        type: 'JavaScript + CSS',
        name: 'ReadingCard Overlay (with 🎧 indicator)',
        ...metrics,
        status: metrics.fps >= 55 ? '✅ PASS' : '❌ FAIL',
      });
    }

    return results;
  }

  // Use Performance Observer API for detailed metrics
  async measureRenderPerformance() {
    console.log('📊 Measuring render performance...');

    return new Promise(resolve => {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const metrics = {
          longTasks: entries.filter(e => e.entryType === 'longtask').length,
          totalBlockingTime: entries
            .filter(e => e.entryType === 'longtask')
            .reduce((sum, e) => sum + Math.max(0, e.duration - 50), 0),
          largestContentfulPaint:
            entries
              .filter(e => e.entryType === 'largest-contentful-paint')
              .map(e => e.renderTime || e.loadTime)[0] || 0,
        };

        observer.disconnect();
        resolve(metrics);
      });

      observer.observe({
        entryTypes: ['longtask', 'largest-contentful-paint', 'layout-shift'],
      });

      // Trigger some hover interactions to generate performance entries
      setTimeout(() => {
        const elements = document.querySelectorAll('[data-testid="reading-card"], button, a');
        elements.forEach((el, i) => {
          setTimeout(() => {
            el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
            setTimeout(() => {
              el.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
            }, 100);
          }, i * 150);
        });
      }, 100);

      // Resolve after collecting data
      setTimeout(() => {
        observer.disconnect();
        resolve({
          longTasks: 0,
          totalBlockingTime: 0,
          largestContentfulPaint: 0,
        });
      }, 3000);
    });
  }

  // Generate performance report
  generateReport(cssResults, jsResults, renderMetrics) {
    console.log('\n' + '='.repeat(60));
    console.log('📈 HOVER PERFORMANCE VALIDATION REPORT');
    console.log('='.repeat(60));

    console.log('\n🎯 Success Criteria: 60fps (minimum 55fps acceptable)');
    console.log('Target frame time: 16.67ms per frame\n');

    // CSS Hover Results
    console.log('CSS-ONLY HOVER INTERACTIONS:');
    console.log('-'.repeat(40));
    cssResults.forEach(result => {
      console.log(`${result.status} ${result.name}`);
      console.log(
        `   FPS: ${result.fps} | Frames: ${result.frameCount} | Dropped: ${result.droppedFrames}`
      );
    });

    // JavaScript Hover Results
    console.log('\nJAVASCRIPT-BASED HOVER INTERACTIONS:');
    console.log('-'.repeat(40));
    jsResults.forEach(result => {
      console.log(`${result.status} ${result.name}`);
      console.log(
        `   FPS: ${result.fps} | Frames: ${result.frameCount} | Dropped: ${result.droppedFrames}`
      );
    });

    // Render Performance Metrics
    console.log('\nRENDER PERFORMANCE METRICS:');
    console.log('-'.repeat(40));
    console.log(`Long Tasks: ${renderMetrics.longTasks}`);
    console.log(`Total Blocking Time: ${Math.round(renderMetrics.totalBlockingTime)}ms`);
    console.log(`Largest Contentful Paint: ${Math.round(renderMetrics.largestContentfulPaint)}ms`);

    // Summary
    const allResults = [...cssResults, ...jsResults];
    const passCount = allResults.filter(r => r.status.includes('PASS')).length;
    const totalCount = allResults.length;
    const avgFPS = Math.round(allResults.reduce((sum, r) => sum + r.fps, 0) / totalCount);

    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY:');
    console.log(`Tests Passed: ${passCount}/${totalCount}`);
    console.log(`Average FPS: ${avgFPS}`);
    console.log(
      `Performance: ${avgFPS >= 60 ? '✅ EXCELLENT' : avgFPS >= 55 ? '⚠️ ACCEPTABLE' : '❌ NEEDS OPTIMIZATION'}`
    );

    // Recommendations
    if (avgFPS < 60) {
      console.log('\n💡 RECOMMENDATIONS:');
      const lowPerformers = allResults.filter(r => r.fps < 55);
      lowPerformers.forEach(result => {
        console.log(
          `- Optimize ${result.name}: Consider using CSS-only transitions or reducing repaint areas`
        );
      });
    }

    console.log('='.repeat(60));

    return {
      passed: passCount === totalCount && avgFPS >= 55,
      avgFPS,
      results: allResults,
    };
  }

  // Main test runner
  async runTests() {
    console.log('🚀 Starting Hover Performance Validation...\n');

    try {
      // Run CSS hover tests
      const cssResults = await this.testCSSHovers();

      // Small delay between test suites
      await new Promise(resolve => setTimeout(resolve, 500));

      // Run JavaScript hover tests
      const jsResults = await this.testJavaScriptHovers();

      // Measure render performance
      const renderMetrics = await this.measureRenderPerformance();

      // Generate and display report
      const report = this.generateReport(cssResults, jsResults, renderMetrics);

      // Store results globally for reference
      window.__hoverPerformanceResults = report;

      console.log('\n✅ Test complete! Results stored in window.__hoverPerformanceResults');

      return report;
    } catch (error) {
      console.error('❌ Error during performance testing:', error);
      return null;
    }
  }
}

// Export for use in browser console or as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HoverPerformanceTester;
} else {
  window.HoverPerformanceTester = HoverPerformanceTester;
  console.log('🎯 Hover Performance Tester loaded!');
  console.log('Run: new HoverPerformanceTester().runTests()');
}

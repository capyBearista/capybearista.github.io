/*
  ========================================
  SHARED JAVASCRIPT FOR PORTFOLIO WEBSITE
  ========================================
  
  This file contains all the JavaScript functionality shared across
  all pages of the portfolio website, including theme management,
  animations, and performance optimizations.
  
  Filename: script.js
  Author:   capyBearista
  Last Updated: 30 September 2025
*/

// 
// ========================================
// PERFORMANCE OPTIMIZATION
// ========================================
//
// requestAnimationFrame provides smooth 60fps animations by syncing with the browser's refresh rate.
// The fallback ensures compatibility with older browsers.
//
const raf = window.requestAnimationFrame || 
            window.webkitRequestAnimationFrame || 
            window.mozRequestAnimationFrame || 
            window.msRequestAnimationFrame || 
            function(callback) { setTimeout(callback, 16); };

// 
// ========================================
// ACCESSIBILITY: REDUCED MOTION
// ========================================
//
// Check if the user prefers reduced motion.
// This helps users with vestibular disorders.
//
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 
// ========================================
// THEME MANAGEMENT SYSTEM
// ========================================
//
// This object handles all theme-related functionality including switching themes,
// saving preferences, and detecting system preferences.
//
const themeManager = {
  // 
  // Initialize the theme system
  // This sets up the toggle button, loads saved preferences, and watches for system theme changes.
  //
  init() {
    this.setupToggle();
    this.loadTheme();
    this.watchSystemPreference();
  },

  // 
  // Set up the theme toggle button
  // Adds a click event listener to the toggle button so users can switch themes.
  //
  setupToggle() {
    const toggle = document.getElementById('themeToggle');
    if (toggle) {
      toggle.addEventListener('click', () => this.toggleTheme());
    }
  },

  // 
  // Load the appropriate theme
  // Checks localStorage for saved preferences, falls back to system preference if none saved.
  //
  loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme(systemPrefersDark ? 'dark' : 'light');
    }
  },

  // 
  // Apply a specific theme
  // Removes existing theme classes and adds the new one, then saves the preference to localStorage.
  //
  setTheme(theme) {
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    if (theme === 'light') {
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.classList.add('theme-dark');
    }
    localStorage.setItem('theme', theme);
  },

  // 
  // Toggle between light and dark themes
  // Determines current theme and switches to the opposite.
  //
  toggleTheme() {
    const currentTheme = document.documentElement.classList.contains('theme-light') ? 'light' : 'dark';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  },

  // 
  // Watch for system theme changes
  // Listens for changes in system color scheme preference and updates the theme if user hasn't manually set one.
  //
  watchSystemPreference() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem('theme')) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
};

// 
// ========================================
// SCROLL-TRIGGERED ANIMATIONS
// ========================================
//
// Intersection Observer watches for elements entering the viewport and triggers animations.
//
const observerOptions = {
  threshold: 0.1,                    // Trigger when 10% of element is visible
  rootMargin: '0px 0px -50px 0px'   // Trigger 50px before element enters viewport
};

// Create the observer that will trigger animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !prefersReducedMotion) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

// 
// ========================================
// APPLY SCROLL ANIMATIONS TO ELEMENTS
// ========================================
//
// Find elements that should animate on scroll and add the appropriate CSS classes.
// Excludes project preview cards and main content sections to prevent unwanted fade-ins.
//
function setupScrollAnimations() {
  const scrollElements = document.querySelectorAll('aside');
  scrollElements.forEach(el => {
    el.classList.add('fade-in-on-scroll');
    observer.observe(el);
  });
}

// 
// ========================================
// SMOOTH SCROLLING FOR ANCHOR LINKS
// ========================================
//
// Makes internal page links scroll smoothly instead of jumping instantly.
//
function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// 
// ========================================
// IMAGE LOADING ANIMATIONS
// ========================================
//
// Adds visual feedback when images load and handles loading errors gracefully.
//
function setupImageAnimations() {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.addEventListener('load', () => {
      img.style.opacity = '1';
    });
    
    img.addEventListener('error', () => {
      img.style.opacity = '0.5';
    });
  });
}

// 
// ========================================
// PERFORMANCE MONITORING
// ========================================
//
// Monitors performance periodically and reduces animation intensity if needed.
//
function checkPerformance() {
  // Simple performance check using requestIdleCallback if available
  if (window.requestIdleCallback) {
    window.requestIdleCallback(() => {
      const now = performance.now();
      const threshold = 16.67; // Target: 60fps (16.67ms per frame)
      
      // Simple check: if we're in an idle period, performance is likely good
      // If requestIdleCallback isn't being called, performance might be poor
      if (!prefersReducedMotion && document.body.style.getPropertyValue('--animation-duration') !== '0.1s') {
        // Only reduce animations if we detect performance issues
        const memoryInfo = performance.memory;
        if (memoryInfo && memoryInfo.usedJSHeapSize > memoryInfo.totalJSHeapSize * 0.9) {
          document.body.style.setProperty('--animation-duration', '0.1s');
          console.log('Performance optimization: Reduced animation duration due to memory usage');
        }
      }
    });
  }
}

// Check performance every 5 seconds instead of every frame
let performanceCheckInterval;

// 
// ========================================
// CLICK FEEDBACK ANIMATIONS
// ========================================
//
// Adds ripple effects when users click on interactive elements.
//
function setupClickAnimations() {
  document.addEventListener('click', (e) => {
    if (!prefersReducedMotion && e.target.matches('a, button, .project-preview')) {
      // Create a ripple element
      const ripple = document.createElement('div');
      ripple.style.position = 'absolute';
      ripple.style.borderRadius = '50%';
      ripple.style.background = 'rgba(0, 188, 212, 0.3)';
      ripple.style.transform = 'scale(0)';
      ripple.style.animation = 'ripple 0.6s linear';
      ripple.style.pointerEvents = 'none';
      
      // Calculate ripple position and size
      const rect = e.target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      
      // Add ripple to the clicked element
      e.target.style.position = 'relative';
      e.target.appendChild(ripple);
      
      // Remove ripple after animation completes
      setTimeout(() => {
        ripple.remove();
      }, 600);
    }
  });
}

// 
// ========================================
// DYNAMIC CSS ANIMATION
// ========================================
//
// Add the ripple animation keyframe to the page dynamically.
//
function addRippleAnimation() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// 
// ========================================
// MOBILE TOUCH OPTIMIZATIONS
// ========================================
//
// Reduce animation intensity on touch devices and add touch-specific feedback.
//
function setupMobileOptimizations() {
  if ('ontouchstart' in window) {
    // Reduce animation intensity on touch devices
    document.body.style.setProperty('--animation-duration', '0.2s');
    
    // Add touch feedback for interactive elements
    document.addEventListener('touchstart', (e) => {
      if (e.target.matches('a, button, .project-preview')) {
        e.target.style.transform = 'scale(0.98)';
      }
    });
    
    document.addEventListener('touchend', (e) => {
      if (e.target.matches('a, button, .project-preview')) {
        setTimeout(() => {
          e.target.style.transform = '';
        }, 150);
      }
    });
  }
}

// 
// ========================================
// PAGE LOAD COMPLETION
// ========================================
//
// Add a class to the body when the page has finished loading for additional styling.
//
function setupPageLoadAnimation() {
  window.addEventListener('load', () => {
    if (!prefersReducedMotion) {
      document.body.classList.add('loaded');
    }
  });
}

// 
// ========================================
// INITIALIZATION FUNCTION
// ========================================
//
// This function initializes all the JavaScript functionality when the page loads.
//
function initializePage() {
  // Initialize theme management
  themeManager.init();
  
  // Setup animations and interactions
  setupScrollAnimations();
  setupSmoothScrolling();
  setupImageAnimations();
  setupClickAnimations();
  setupMobileOptimizations();
  setupPageLoadAnimation();
  
  // Add ripple animation
  addRippleAnimation();
  
  // Start periodic performance monitoring if animations are enabled
  if (!prefersReducedMotion) {
    performanceCheckInterval = setInterval(checkPerformance, 5000);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePage);
} else {
  initializePage();
} 
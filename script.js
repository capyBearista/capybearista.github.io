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
// IMAGE EXPANSION MODAL
// ========================================
//
// Handles the image expansion functionality with modal overlay
//
const imageModal = {
  modal: null,
  modalContent: null,
  modalImage: null,
  modalCaption: null,
  modalClose: null,
  
  // Initialize the modal system
  init() {
    this.createModal();
    this.setupEventListeners();
    this.makeImagesExpandable();
  },
  
  // Create the modal HTML structure
  createModal() {
    // Create modal overlay
    this.modal = document.createElement('div');
    this.modal.className = 'image-modal';
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');
    this.modal.setAttribute('aria-label', 'Expanded image view');
    
    // Create modal content container
    this.modalContent = document.createElement('div');
    this.modalContent.className = 'image-modal-content';
    
    // Create close button
    this.modalClose = document.createElement('button');
    this.modalClose.className = 'image-modal-close';
    this.modalClose.innerHTML = '×';
    this.modalClose.setAttribute('aria-label', 'Close expanded image');
    
    // Create image element
    this.modalImage = document.createElement('img');
    this.modalImage.setAttribute('alt', '');
    
    // Create caption element
    this.modalCaption = document.createElement('div');
    this.modalCaption.className = 'image-modal-caption';
    
    // Assemble modal structure
    this.modalContent.appendChild(this.modalClose);
    this.modalContent.appendChild(this.modalImage);
    this.modalContent.appendChild(this.modalCaption);
    this.modal.appendChild(this.modalContent);
    
    // Add to document
    document.body.appendChild(this.modal);
  },
  
  // Set up event listeners for modal interactions
  setupEventListeners() {
    // Close modal when clicking close button
    this.modalClose.addEventListener('click', () => this.closeModal());
    
    // Close modal when clicking outside content
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.closeModal();
      }
    });
    
    // Prevent modal content clicks from closing modal
    this.modalContent.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  },
  
  // Make existing images expandable
  makeImagesExpandable() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      // Skip small icons and already processed images
      if (img.classList.contains('sidebar-icon') || img.hasAttribute('data-expandable')) {
        return;
      }
      
      // Add expandable attribute and event listener
      img.setAttribute('data-expandable', 'true');
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => this.openModal(img));
      
      // Add accessibility attributes
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', `Click to expand image: ${img.alt || 'Image'}`);
      
      // Add keyboard support
      img.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openModal(img);
        }
      });
      
      // Add visual indicator on focus
      img.addEventListener('focus', () => {
        if (!prefersReducedMotion) {
          img.style.outline = `2px solid var(--accent)`;
          img.style.outlineOffset = '2px';
        }
      });
      
      img.addEventListener('blur', () => {
        img.style.outline = '';
        img.style.outlineOffset = '';
      });
    });
  },
  
  // Open modal with specified image
  openModal(sourceImage) {
    // Store reference to the source image for focus restoration
    this.sourceImage = sourceImage;
    
    // Set loading state
    this.modalImage.setAttribute('data-loading', 'true');
    
    // Set modal image source and alt text
    this.modalImage.src = sourceImage.src;
    this.modalImage.alt = sourceImage.alt;
    
    // Remove loading state when image loads
    this.modalImage.addEventListener('load', () => {
      this.modalImage.removeAttribute('data-loading');
    }, { once: true });
    
    // Set caption from figcaption or alt text
    const figcaption = sourceImage.closest('figure')?.querySelector('figcaption');
    if (figcaption) {
      this.modalCaption.innerHTML = figcaption.innerHTML;
      this.modalCaption.style.display = 'block';
    } else if (sourceImage.alt) {
      this.modalCaption.textContent = sourceImage.alt;
      this.modalCaption.style.display = 'block';
    } else {
      this.modalCaption.style.display = 'none';
    }
    
    // Show modal
    this.modal.classList.add('active');
    
    // Focus management for accessibility
    setTimeout(() => {
      this.modalClose.focus();
    }, 100);
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    
    // Trap focus within modal
    this.trapFocus();
  },
  
  // Close modal
  closeModal() {
    this.modal.classList.remove('active');
    
    // Restore body scrolling
    document.body.style.overflow = '';
    
    // Remove focus trap
    this.removeFocusTrap();
    
    // Return focus to source image
    if (this.sourceImage) {
      setTimeout(() => {
        this.sourceImage.focus();
      }, 100);
    }
  },
  
  // Trap focus within modal for accessibility
  trapFocus() {
    const focusableElements = this.modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    this.focusTrapHandler = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
    
    document.addEventListener('keydown', this.focusTrapHandler);
  },
  
  // Remove focus trap when modal closes
  removeFocusTrap() {
    if (this.focusTrapHandler) {
      document.removeEventListener('keydown', this.focusTrapHandler);
      this.focusTrapHandler = null;
    }
  }
};

// 
// ========================================
// BISCUIT GALLERY FUNCTIONALITY
// ========================================
//
// Enhanced modal functionality specifically for Biscuit photo gallery
// Handles the display of photos with descriptions and dates
// ========================================
// BISCUIT GALLERY MODAL FUNCTIONALITY (DISABLED)
// ========================================
// Modal functionality for Biscuit photo gallery - commented out for simpler static display
// Can be re-enabled by uncommenting this section and re-adding data attributes to photos

/*
const biscuitGallery = {
  modal: null,
  modalImage: null,
  modalCaption: null,
  modalDate: null,
  modalStory: null,
  modalClose: null,
  
  init() {
    // Use existing modal or create new one
    this.modal = document.getElementById('biscuit-modal') || this.createBiscuitModal();
    
    if (this.modal) {
      this.setupModalElements();
      this.setupBiscuitEventListeners();
      this.makeBiscuitPhotosClickable();
    }
  },
  
  // Create Biscuit-specific modal if it doesn't exist
  createBiscuitModal() {
    const modal = document.createElement('div');
    modal.id = 'biscuit-modal';
    modal.className = 'image-modal biscuit-enhanced';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'biscuit-modal-title');
    
    modal.innerHTML = `
      <div class="image-modal-content biscuit-modal-content">
        <button class="image-modal-close" aria-label="Close photo">×</button>
        <div class="biscuit-modal-image-container">
          <img id="biscuit-modal-image" src="" alt="" class="biscuit-modal-image">
        </div>
        <div class="biscuit-modal-info">
          <h2 id="biscuit-modal-title" class="biscuit-modal-caption"></h2>
          <time class="biscuit-modal-date"></time>
          <div class="biscuit-modal-story"></div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    return modal;
  },
  
  // Set up references to modal elements
  setupModalElements() {
    this.modalImage = this.modal.querySelector('#biscuit-modal-image');
    this.modalCaption = this.modal.querySelector('.biscuit-modal-caption');
    this.modalDate = this.modal.querySelector('.biscuit-modal-date');
    this.modalStory = this.modal.querySelector('.biscuit-modal-story');
    this.modalClose = this.modal.querySelector('.image-modal-close');
  },
  
  // Set up event listeners for Biscuit modal
  setupBiscuitEventListeners() {
    // Close modal when clicking close button
    this.modalClose.addEventListener('click', () => this.closeBiscuitModal());
    
    // Close modal when clicking outside content
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.closeBiscuitModal();
      }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.closeBiscuitModal();
      }
    });
    
    // Prevent modal content clicks from closing modal
    const modalContent = this.modal.querySelector('.image-modal-content');
    modalContent.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  },
  
  // Make Biscuit gallery photos clickable
  makeBiscuitPhotosClickable() {
    const biscuitPhotos = document.querySelectorAll('.biscuit-photo');
    
    biscuitPhotos.forEach((photo, index) => {
      // Add loading states and optimize aspect ratio handling
      const img = photo.querySelector('.biscuit-photo-img');
      
      if (img) {
        img.addEventListener('load', () => {
          // If no aspect ratio data, calculate it dynamically
          if (!photo.dataset.aspectRatio) {
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            let aspectCategory = 'square';
            
            if (aspectRatio > 1.5) {
              aspectCategory = 'panorama';
            } else if (aspectRatio > 1.2) {
              aspectCategory = 'landscape';
            } else if (aspectRatio < 0.8) {
              aspectCategory = 'portrait';
            }
            
            // Apply aspect ratio class dynamically
            photo.classList.add(`biscuit-photo--${aspectCategory}`);
            photo.setAttribute('data-aspect-ratio', aspectCategory);
          }
          
          // Add fade-in animation once loaded
          photo.style.opacity = '1';
        });
        
        // Start with slight transparency until loaded
        photo.style.opacity = '0.8';
        photo.style.transition = 'opacity 0.3s ease';
      }
      
      // Handle click events
      photo.addEventListener('click', (e) => {
        e.preventDefault();
        this.openBiscuitModal(photo);
      });
      
      // Handle keyboard navigation (Enter and Space)
      photo.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openBiscuitModal(photo);
        }
      });
      
      // Add focus indicators for keyboard users
      photo.addEventListener('focus', () => {
        if (!prefersReducedMotion) {
          photo.style.outline = `2px solid var(--accent)`;
          photo.style.outlineOffset = '2px';
        }
      });
      
      photo.addEventListener('blur', () => {
        photo.style.outline = '';
        photo.style.outlineOffset = '';
      });
    });
  },
  
  // Open Biscuit modal with photo data
  openBiscuitModal(photoElement) {
    // Store reference to source element for focus restoration
    this.sourcePhoto = photoElement;
    
    // Extract data from photo element
    const imageSrc = photoElement.dataset.photoSrc;
    const caption = photoElement.dataset.photoCaption;
    const story = photoElement.dataset.photoStory;
    const dateStr = photoElement.dataset.photoDate;
    
    // Set modal image
    this.modalImage.src = imageSrc;
    this.modalImage.alt = caption;
    
    // Set caption
    this.modalCaption.textContent = caption || 'Biscuit Photo';
    
    // Format and set date
    if (dateStr) {
      const date = new Date(dateStr);
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      this.modalDate.textContent = formattedDate;
      this.modalDate.setAttribute('datetime', dateStr);
    }
    
    // Set story/description
    if (story) {
      this.modalStory.textContent = story;
      this.modalStory.style.display = 'block';
    } else {
      this.modalStory.style.display = 'none';
    }
    
    // Show modal
    this.modal.classList.add('active');
    
    // Focus management for accessibility
    setTimeout(() => {
      this.modalClose.focus();
    }, 100);
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
  },
  
  // Close Biscuit modal
  closeBiscuitModal() {
    this.modal.classList.remove('active');
    
    // Restore body scrolling
    document.body.style.overflow = '';
    
    // Return focus to source photo
    if (this.sourcePhoto) {
      setTimeout(() => {
        this.sourcePhoto.focus();
      }, 100);
    }
  }
};
*/

// 
// ========================================
// HERO CAROUSEL FUNCTIONALITY
// ========================================
//
// Hero Image Carousel functionality
const heroCarousel = {
  currentSlide: 0,
  slides: [],
  indicators: [],
  autoplayInterval: null,
  autoplayDelay: 4000, // 4 seconds between slides
  isTransitioning: false, // Prevent rapid transitions
  
  init() {
    const carousel = document.querySelector('.hero-image-carousel');
    if (!carousel) return;
    
    this.slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
    this.indicators = Array.from(carousel.querySelectorAll('.indicator'));
    
    if (this.slides.length === 0) return;
    
    this.setupEventListeners();
    this.startAutoplay();
  },
  
  setupEventListeners() {
    // Navigation buttons
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.goToPrevSlide());
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.goToNextSlide());
    }
    
    // Indicator buttons
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => this.goToSlide(index));
    });
    
    // Pause autoplay on hover, resume on leave
    const container = document.querySelector('.carousel-container');
    if (container) {
      container.addEventListener('mouseenter', () => this.stopAutoplay());
      container.addEventListener('mouseleave', () => this.startAutoplay());
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.goToPrevSlide();
      if (e.key === 'ArrowRight') this.goToNextSlide();
    });
    
    // Touch/swipe support for mobile
    let startX = 0;
    let currentX = 0;
    let threshold = 50;
    
    if (container) {
      container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
      });
      
      container.addEventListener('touchmove', (e) => {
        currentX = e.touches[0].clientX;
      });
      
      container.addEventListener('touchend', () => {
        const diffX = startX - currentX;
        if (Math.abs(diffX) > threshold) {
          if (diffX > 0) {
            this.goToNextSlide();
          } else {
            this.goToPrevSlide();
          }
        }
      });
    }
  },
  
  goToSlide(index) {
    if (index === this.currentSlide || this.isTransitioning) return;
    
    this.isTransitioning = true;
    const prevSlideIndex = this.currentSlide;
    
    // Remove active class from current slide and indicator
    this.slides[this.currentSlide].classList.remove('active');
    this.indicators[this.currentSlide].classList.remove('active');
    
    // Add prev class for exit animation to current slide only
    this.slides[this.currentSlide].classList.add('prev');
    
    // Update current slide
    this.currentSlide = index;
    
    // Add active class to new slide and indicator
    this.slides[this.currentSlide].classList.add('active');
    this.indicators[this.currentSlide].classList.add('active');
    
    // Clean up prev class from the specific slide that was transitioning
    setTimeout(() => {
      this.slides[prevSlideIndex].classList.remove('prev');
      this.isTransitioning = false; // Allow new transitions
    }, 500);
  },
  
  goToNextSlide() {
    const nextIndex = (this.currentSlide + 1) % this.slides.length;
    this.goToSlide(nextIndex);
  },
  
  goToPrevSlide() {
    const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.goToSlide(prevIndex);
  },
  
  startAutoplay() {
    if (prefersReducedMotion) return; // Respect reduced motion preference
    
    this.stopAutoplay(); // Clear any existing interval
    this.autoplayInterval = setInterval(() => {
      this.goToNextSlide();
    }, this.autoplayDelay);
  },
  
  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }
};

// 
// ========================================
// MOBILE WARNING MODAL
// ========================================
//
// Modal system to warn mobile users about non-optimized experience
//
const mobileModal = {
  modal: null,
  continueBtn: null,
  storageKey: 'mobileWarningDismissed',
  
  init() {
    this.modal = document.getElementById('mobileWarningModal');
    this.continueBtn = document.getElementById('mobileModalContinue');
    
    if (this.modal && this.continueBtn) {
      this.setupEventListeners();
      this.checkAndShow();
    }
  },
  
  setupEventListeners() {
    // Continue button closes modal and saves preference
    this.continueBtn.addEventListener('click', () => {
      this.hide();
      this.saveDismissedState();
    });
    
    // Close modal when clicking backdrop
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide();
        this.saveDismissedState();
      }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible()) {
        this.hide();
        this.saveDismissedState();
      }
    });
  },
  
  checkAndShow() {
    // Only show on mobile devices and if not previously dismissed
    if (this.isMobileDevice() && !this.isDismissed()) {
      this.show();
    }
  },
  
  isMobileDevice() {
    // Multiple checks to ensure we catch mobile devices
    const userAgent = navigator.userAgent.toLowerCase();
    const isTouchDevice = 'ontouchstart' in window;
    const isSmallScreen = window.innerWidth <= 900;
    const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    return (isTouchDevice && isSmallScreen) || isMobileUserAgent;
  },
  
  isDismissed() {
    return localStorage.getItem(this.storageKey) === 'true';
  },
  
  saveDismissedState() {
    localStorage.setItem(this.storageKey, 'true');
  },
  
  show() {
    if (this.modal) {
      this.modal.classList.add('show');
      this.modal.setAttribute('aria-hidden', 'false');
      
      // Focus the continue button for accessibility
      setTimeout(() => {
        if (this.continueBtn) {
          this.continueBtn.focus();
        }
      }, 100);
    }
  },
  
  hide() {
    if (this.modal) {
      this.modal.classList.remove('show');
      this.modal.setAttribute('aria-hidden', 'true');
    }
  },
  
  isVisible() {
    return this.modal && this.modal.classList.contains('show');
  }
};

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
  
  // Initialize mobile warning modal
  mobileModal.init();
  
  // Setup animations and interactions
  setupScrollAnimations();
  setupSmoothScrolling();
  setupImageAnimations();
  setupClickAnimations();
  setupMobileOptimizations();
  setupPageLoadAnimation();
  
  // Initialize image expansion modal
  imageModal.init();
  
  // Initialize Biscuit photo gallery (disabled for simpler static display)
  // biscuitGallery.init();
  
  // Initialize hero image carousel
  heroCarousel.init();
  
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
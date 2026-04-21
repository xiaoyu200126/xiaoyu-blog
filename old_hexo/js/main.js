/**
 * Casper Theme - Main JavaScript
 * Ghost-inspired Modern Blog Functionality
 */

(function() {
  'use strict';

  // ============================================
  // DOM Ready
  // ============================================
  document.addEventListener('DOMContentLoaded', function() {
    initHeader();
    initReadingProgress();
    initLazyLoad();
    initSmoothScroll();
    initScrollAnimations();
    initSearch();
  });

  // ============================================
  // Header Scroll Effect
  // ============================================
  function initHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    let lastScroll = 0;
    const scrollThreshold = 100;

    window.addEventListener('scroll', function() {
      const currentScroll = window.pageYOffset;
      
      if (currentScroll > scrollThreshold) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      
      lastScroll = currentScroll;
    }, { passive: true });
  }

  // ============================================
  // Reading Progress Bar
  // ============================================
  function initReadingProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', function() {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrollTop = window.pageYOffset;
      const progress = (scrollTop / documentHeight) * 100;
      
      progressBar.style.width = progress + '%';
    }, { passive: true });
  }

  // ============================================
  // Lazy Load Images
  // ============================================
  function initLazyLoad() {
    if ('IntersectionObserver' in window) {
      const lazyImages = document.querySelectorAll('img[loading="lazy"]');
      
      const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.classList.add('loaded');
            imageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });

      lazyImages.forEach(function(img) {
        imageObserver.observe(img);
      });
    }
  }

  // ============================================
  // Smooth Scroll
  // ============================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // ============================================
  // Scroll Animations
  // ============================================
  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.post-card');
    
    if ('IntersectionObserver' in window) {
      const animationObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            animationObserver.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
      });

      animatedElements.forEach(function(el) {
        animationObserver.observe(el);
      });
    }
  }

  // ============================================
  // Search
  // ============================================
  function initSearch() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', debounce(function(e) {
      const query = e.target.value.toLowerCase();
      const posts = document.querySelectorAll('.post-card');
      
      posts.forEach(function(post) {
        const title = post.querySelector('.post-card-title').textContent.toLowerCase();
        const excerpt = post.querySelector('.post-card-excerpt')?.textContent.toLowerCase() || '';
        
        if (title.includes(query) || excerpt.includes(query)) {
          post.style.display = '';
        } else {
          post.style.display = 'none';
        }
      });
    }, 300));
  }

  // ============================================
  // Utility Functions
  // ============================================
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = function() {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(function() {
          inThrottle = false;
        }, limit);
      }
    };
  }

  // ============================================
  // Share Functionality
  // ============================================
  window.sharePost = function(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    
    const shareUrls = {
      twitter: 'https://twitter.com/intent/tweet?url=' + url + '&text=' + title,
      facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + url,
      linkedin: 'https://www.linkedin.com/shareArticle?mini=true&url=' + url + '&title=' + title,
      weibo: 'https://service.weibo.com/share/share.php?url=' + url + '&title=' + title,
      telegram: 'https://t.me/share/url?url=' + url + '&text=' + title,
      whatsapp: 'https://api.whatsapp.com/send?text=' + title + ' ' + url,
      email: 'mailto:?subject=' + title + '&body=' + url
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

})();

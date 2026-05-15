document.addEventListener('DOMContentLoaded', function () {

  //  1. MOBILE NAV TOGGLE 
  var navToggle = document.getElementById('navToggle');
  var mainNav   = document.getElementById('mainNav');

  if (navToggle && mainNav) {

    navToggle.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close nav when a link is clicked
    var navLinks = mainNav.querySelectorAll('a');
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function () {
        mainNav.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    }

    // Close nav when clicking outside of it
    document.addEventListener('click', function (e) {
      if (!mainNav.contains(e.target) && !navToggle.contains(e.target)) {
        mainNav.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }


  //  2. CART SYSTEM 
  var cart = [];

  // Adds a product to the cart array and shows a toast notification
  window.addToCart = function (productName, price) {
    cart.push({ name: productName, price: price });

    var msg = '\u2705 Added: ' + productName + ' \u2014 BHD ' + price.toFixed(3);
    if (cart.length > 1) {
      msg += ' (\uD83D\uDED2 ' + cart.length + ' items in cart)';
    }

    showToast(msg);
  };

  // Shows the cart toast and hides it after 3 seconds
  function showToast(message) {
    var toast = document.getElementById('cart-toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(function () {
      toast.classList.remove('show');
    }, 3000);
  }


  //  3. LIGHTBOX GALLERY 
  var lightbox  = document.getElementById('lightbox');
  var lbImg     = document.getElementById('lightbox-img');
  var lbCaption = document.getElementById('lightbox-caption');
  var lbCurrent = document.getElementById('lb-current');
  var lbTotal   = document.getElementById('lb-total');

  // Build an array of all gallery images from the DOM
  var galleryImages = [];
  var galleryBtns   = document.querySelectorAll('.gallery-thumb-btn');

  for (var g = 0; g < galleryBtns.length; g++) {
    var btn     = galleryBtns[g];
    var thumbEl = btn.querySelector('.gallery-thumb');
    var captEl  = btn.closest('figure') ? btn.closest('figure').querySelector('figcaption') : null;

    galleryImages.push({
      src     : thumbEl ? thumbEl.src : '',
      alt     : thumbEl ? thumbEl.alt : 'Gallery image',
      caption : captEl  ? captEl.textContent.trim() : ''
    });
  }

  var currentLbIndex = 0;

  // Opens the lightbox at the given image index
  window.openLightbox = function (index) {
    if (!lightbox || galleryImages.length === 0) return;

    currentLbIndex = index;
    renderLightbox();

    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    var closeBtn = lightbox.querySelector('.lightbox-close');
    if (closeBtn) closeBtn.focus();
  };

  // Closes the lightbox
  window.closeLightbox = function () {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  // Moves to the next or previous image
  window.changeLightbox = function (direction) {
    currentLbIndex = currentLbIndex + direction;

    if (currentLbIndex < 0) {
      currentLbIndex = galleryImages.length - 1;
    }
    if (currentLbIndex >= galleryImages.length) {
      currentLbIndex = 0;
    }

    renderLightbox();
  };

  // Updates the lightbox image, caption, and counter
  function renderLightbox() {
    if (galleryImages.length === 0) return;

    var item = galleryImages[currentLbIndex];

    if (lbImg)     { lbImg.src = item.src; lbImg.alt = item.alt; }
    if (lbCaption) { lbCaption.textContent = item.caption; }
    if (lbCurrent) { lbCurrent.textContent = String(currentLbIndex + 1); }
    if (lbTotal)   { lbTotal.textContent   = String(galleryImages.length); }
  }

  // Keyboard navigation: Escape closes, arrows navigate
  document.addEventListener('keydown', function (e) {
    if (!lightbox || !lightbox.classList.contains('open')) return;

    if (e.key === 'Escape')     { window.closeLightbox(); }
    else if (e.key === 'ArrowLeft')  { window.changeLightbox(-1); }
    else if (e.key === 'ArrowRight') { window.changeLightbox(1); }
  });


  // 4. PRODUCT CATEGORY FILTER
  var filterBtns   = document.querySelectorAll('.filter-btn[data-filter]');
  var productCards = document.querySelectorAll('#productsGrid .product-card');
  var noResultsDiv = document.getElementById('no-results-msg');

  // Global function so onclick="filterProducts(...)" in HTML works without ReferenceError
  window.filterProducts = function (category, clickedBtn) {
    // Update active button state
    for (var ff = 0; ff < filterBtns.length; ff++) {
      filterBtns[ff].classList.remove('active');
    }
    if (clickedBtn) { clickedBtn.classList.add('active'); }

    var visibleCount = 0;

    for (var pc = 0; pc < productCards.length; pc++) {
      var cardCategory = productCards[pc].getAttribute('data-category');

      if (category === 'all' || cardCategory === category) {
        productCards[pc].style.display = '';
        productCards[pc].classList.add('animate-fade-in');
        visibleCount++;
      } else {
        productCards[pc].style.display = 'none';
        productCards[pc].classList.remove('animate-fade-in');
      }
    }

    // Update product count label if present
    var countLabel = document.getElementById('product-count');
    if (countLabel) { countLabel.textContent = String(visibleCount); }

    // Show no-results message if nothing matches
    if (noResultsDiv) {
      noResultsDiv.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  };

  // onclick attributes on filter buttons call window.filterProducts directly.
  // No separate event listeners needed - that would cause double-execution.


  // 5. FAQ ACCORDION
  var faqQuestions = document.querySelectorAll('.faq-question');

  // Global function so onclick="toggleFAQ(this)" in HTML works without ReferenceError
  window.toggleFAQ = function (clickedBtn) {
    var faqItem    = clickedBtn.closest('.faq-item');
    var answer     = faqItem ? faqItem.querySelector('.faq-answer') : null;
    var isExpanded = clickedBtn.getAttribute('aria-expanded') === 'true';

    // Close all FAQ items first
    for (var fa = 0; fa < faqQuestions.length; fa++) {
      var otherItem   = faqQuestions[fa].closest('.faq-item');
      var otherAnswer = otherItem ? otherItem.querySelector('.faq-answer') : null;
      faqQuestions[fa].setAttribute('aria-expanded', 'false');
      var otherSpan = faqQuestions[fa].querySelector('span[aria-hidden]');
      if (otherSpan) { otherSpan.textContent = '+'; }
      if (otherAnswer) { otherAnswer.hidden = true; }
    }

    // If it was closed, open it
    if (!isExpanded) {
      clickedBtn.setAttribute('aria-expanded', 'true');
      var btnSpan = clickedBtn.querySelector('span[aria-hidden]');
      if (btnSpan) { btnSpan.textContent = '−'; }
      if (answer) { answer.hidden = false; }
    }
  };

  // onclick attributes on FAQ buttons call window.toggleFAQ directly.
  // No separate event listeners needed - that would cause double-execution
  // (open then immediately close on same click).


  // 6. NEWSLETTER FORM VALIDATION 
  window.handleNewsletter = function (e) {
    e.preventDefault();

    var nameInput  = document.getElementById('nl-name');
    var emailInput = document.getElementById('nl-email');

    if (!emailInput) return;

    var emailVal = emailInput.value.trim();
    var nameVal  = nameInput ? nameInput.value.trim() : '';

    if (emailVal === '') {
      showNewsletterMsg('\u26a0\ufe0f Please enter your email address.', 'error');
      return;
    }

    // Basic email format check using indexOf
    if (emailVal.indexOf('@') === -1 || emailVal.indexOf('.') === -1) {
      showNewsletterMsg('\u26a0\ufe0f Please enter a valid email address.', 'error');
      return;
    }

    var greeting = nameVal !== '' ? ', ' + nameVal : '';
    showNewsletterMsg('\uD83C\uDF89 Welcome' + greeting + '! You\u2019re subscribed to Ajeeb drops.', 'success');

    if (nameInput) nameInput.value = '';
    emailInput.value = '';
  };

  function showNewsletterMsg(message, type) {
    var msgDiv = document.getElementById('newsletter-msg');
    if (!msgDiv) return;
    msgDiv.textContent = message;
    msgDiv.style.color = type === 'error' ? '#F03E3E' : '#00C896';
  }


  // 7. CONTACT FORM VALIDATION 
  window.handleContact = function (e) {
    e.preventDefault();

    // Fields to validate
    var fields = [
      { id: 'c-name',    errId: 'c-name-err',    label: 'Full name'     },
      { id: 'c-email',   errId: 'c-email-err',   label: 'Email address' },
      { id: 'c-subject', errId: 'c-subject-err', label: 'Subject'       },
      { id: 'c-message', errId: 'c-message-err', label: 'Message'       }
    ];

    var isValid = true;

    // Check each field is not empty
    for (var v = 0; v < fields.length; v++) {
      var field = document.getElementById(fields[v].id);
      var errEl = document.getElementById(fields[v].errId);

      if (!field) continue;

      if (field.value.trim() === '') {
        showFieldError(field, errEl, fields[v].label + ' is required.');
        isValid = false;
      } else {
        clearFieldError(field, errEl);
      }
    }

    // Additional email format check
    var emailField = document.getElementById('c-email');
    var emailErr   = document.getElementById('c-email-err');
    if (emailField && emailField.value.trim() !== '') {
      var ev = emailField.value.trim();
      if (ev.indexOf('@') === -1 || ev.indexOf('.') === -1) {
        showFieldError(emailField, emailErr, 'Please enter a valid email address.');
        isValid = false;
      }
    }

    // Show success message and reset form if all fields are valid
    if (isValid) {
      var feedback = document.getElementById('contact-feedback');
      if (feedback) {
        feedback.textContent = '\u2705 Message sent! We\u2019ll get back to you within 24 hours.';
        feedback.className   = 'form-feedback success';
      }
      e.target.reset();

      setTimeout(function () {
        if (feedback) {
          feedback.textContent = '';
          feedback.className   = 'form-feedback';
        }
      }, 6000);
    }
  };

  function showFieldError(field, errEl, message) {
    if (field) field.style.borderColor = '#F03E3E';
    if (errEl) errEl.textContent = message;
  }

  function clearFieldError(field, errEl) {
    if (field) field.style.borderColor = '';
    if (errEl) errEl.textContent = '';
  }


  // 8. SECRET OFFER POPUP
  // Reveals the hidden offer popup when the footer link is clicked
  window.showSecretOffer = function (e) {
    e.preventDefault();
    var offer = document.getElementById('secret-offer');
    if (!offer) return;

    offer.style.display = 'flex';
    offer.setAttribute('aria-hidden', 'false');
  };


  // 9. SCROLL-REVEAL ANIMATIONS
  var revealEls = document.querySelectorAll(
    '.product-card, .feature-card, .value-card, .team-card, ' +
    '.testimonial-card, .gallery-item, .stat-item, .media-card'
  );

  if ('IntersectionObserver' in window && revealEls.length > 0) {

    // Start all elements invisible and shifted down
    for (var ri = 0; ri < revealEls.length; ri++) {
      revealEls[ri].style.opacity   = '0';
      revealEls[ri].style.transform = 'translateY(24px)';
      revealEls[ri].style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
    }

    // Fade each element in when it enters the viewport
    var scrollObserver = new IntersectionObserver(function (entries) {
      for (var ei = 0; ei < entries.length; ei++) {
        if (entries[ei].isIntersecting) {
          entries[ei].target.style.opacity   = '1';
          entries[ei].target.style.transform = 'translateY(0)';
          scrollObserver.unobserve(entries[ei].target);
        }
      }
    }, { threshold: 0.12 });

    for (var ro = 0; ro < revealEls.length; ro++) {
      scrollObserver.observe(revealEls[ro]);
    }
  }


  // 10. HEADER SCROLL SHADOW 
  var siteHeader = document.querySelector('.site-header');

  if (siteHeader) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 20) {
        siteHeader.style.boxShadow = '0 4px 30px rgba(0,0,0,0.35)';
      } else {
        siteHeader.style.boxShadow = '';
      }
    });
  }


  // 11. SHOP PAGE FILTER — handled globally by window.filterProducts (section 4).
  // Kept as a reference variable for the URL param filter below.
  var shopFilterBtns = document.querySelectorAll('.filter-btn[data-filter]');
  var shopCards      = document.querySelectorAll('#productsGrid .product-card'); // eslint-disable-line no-unused-vars


  // 12. STATS COUNTER ANIMATION 
  // Counts numbers up when the stats section is scrolled into view
  var statNums = document.querySelectorAll('.stat-big');

  if ('IntersectionObserver' in window && statNums.length > 0) {

    var counterObserver = new IntersectionObserver(function (entries) {
      for (var ci = 0; ci < entries.length; ci++) {

        if (entries[ci].isIntersecting) {
          var el      = entries[ci].target;
          var rawText = el.textContent.trim();
          var numPart = rawText.replace(/[^0-9.]/g, '');
          var suffix  = rawText.replace(/[0-9.]/g, '');
          var target  = parseFloat(numPart);

          if (isNaN(target) || target === 0) continue;

          var step = target / 40;

          (function (element, tgt, sfx, stp) {
            var cur = 0;
            var t = setInterval(function () {
              cur += stp;
              if (cur >= tgt) { cur = tgt; clearInterval(t); }
              var display = tgt >= 1000 ? Math.floor(cur).toLocaleString() : Math.floor(cur);
              element.textContent = display + sfx;
            }, 40);
          })(el, target, suffix, step);

          counterObserver.unobserve(el);
        }
      }
    }, { threshold: 0.5 });

    for (var sn = 0; sn < statNums.length; sn++) {
      counterObserver.observe(statNums[sn]);
    }
  }


  // 13. BACK TO TOP BUTTON
  var backBtn = document.createElement('button');
  backBtn.id          = 'back-to-top';
  backBtn.textContent = '\u2191';
  backBtn.setAttribute('aria-label', 'Back to top');
  backBtn.style.cssText = [
    'position:fixed',
    'bottom:90px',
    'right:28px',
    'width:44px',
    'height:44px',
    'border-radius:50%',
    'background:#6B4EFF',
    'color:#fff',
    'border:none',
    'font-size:20px',
    'cursor:pointer',
    'z-index:3000',
    'display:none',
    'align-items:center',
    'justify-content:center',
    'box-shadow:0 4px 20px rgba(107,78,255,0.4)',
    'transition:opacity 0.3s ease, transform 0.3s ease'
  ].join(';');

  document.body.appendChild(backBtn);

  // Show button after scrolling 400px, hide when near the top
  window.addEventListener('scroll', function () {
    backBtn.style.display = window.scrollY > 400 ? 'flex' : 'none';
  });

  backBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });


  // 14. URL PARAMETER FILTER
  // Auto-applies a category filter if ?category= is present in the URL
  var urlParams = new URLSearchParams(window.location.search);
  var catParam  = urlParams.get('category');

  if (catParam && shopFilterBtns.length > 0) {
    for (var up = 0; up < shopFilterBtns.length; up++) {
      if (shopFilterBtns[up].getAttribute('data-filter') === catParam) {
        shopFilterBtns[up].click();
        break;
      }
    }
  }

}); // end DOMContentLoaded
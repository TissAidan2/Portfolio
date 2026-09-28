document.addEventListener('DOMContentLoaded', () => {

  const bootSplash = document.getElementById('boot-splash');
  const windowElement = document.getElementById('window');
  let booted = false;

  // Function that triggers CRT animation and typewriter upon user interaction
  function bootSystem() {
    if (booted) return;
    booted = true;

    // 1. Hide splash screen
    if (bootSplash) {
      bootSplash.classList.add('hidden');
    }

    // 2. Trigger CRT Power-On Animation on #window
    if (windowElement) {
      windowElement.classList.add('boot-anim');
    }

    // // 3. Hide header cursor after delay
    // const headerCursor = document.querySelector('#window-header .cursor');
    // if (headerCursor) {
    //   setTimeout(() => {
    //     headerCursor.style.display = 'none';
    //   }, 2500);
    // }

    // 4. Start typing animation on current tab
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash) {
      activateTab(initialHash);
    } else {
      const defaultTab = document.querySelector('.tab-content.active-tab');
      if (defaultTab) {
        setTimeout(() => {
          typeWriterTab(defaultTab);
        }, 400);
      }
    }
  }

  // Listen for mouse click, tap, or any keypress
  window.addEventListener('keydown', bootSystem);
  window.addEventListener('click', bootSystem);
  window.addEventListener('touchstart', bootSystem);

  // 5. Handle Async Contact Form Submission (No Page Redirect)
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-btn');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);
      submitBtn.disabled = true;
      submitBtn.textContent = '[ PROCCESSING... ]';
      formStatus.textContent = '> initializing message...';
      formStatus.style.color = 'var(--text-muted)';

      try {
        const response = await fetch('https://formspree.io/f/mzezkodj', {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          formStatus.textContent = '[ SUCCESS ]: Message delivered successfully.';
          formStatus.style.color = 'var(--accent-color)';
          contactForm.reset();
        } else {
          const data = await response.json();
          if (Object.hasOwn(data, 'errors')) {
            formStatus.textContent = `[ ERROR ]: ${data.errors.map(error => error.message).join(", ")}`;
          } else {
            formStatus.textContent = '[ ERROR ]: Failed to send message. Please try again.';
          }
          formStatus.style.color = '#ef4444';
        }
      } catch (error) {
        formStatus.textContent = '[ ERROR ]: Network connection failed.';
        formStatus.style.color = '#ef4444';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '[ SEND MESSAGE ]';
      }
    });
  }

  const folderToggles = document.querySelectorAll('.folder-toggle');
  const navLinks = document.querySelectorAll('#directory-nav a.nav-link');
  const tabContents = document.querySelectorAll('.tab-content');

  /**
   * Types out element text while preserving nested HTML tags like <a>.
   * Returns a Promise that resolves when finished.
   */
  function typeWriterElement(element, speed = 20) {
    return new Promise((resolve) => {
      if (!element.dataset.originalHtml) {
        element.dataset.originalHtml = element.innerHTML;
      }

      const fullHtml = element.dataset.originalHtml;
      element.innerHTML = '';
      element.style.visibility = 'visible';
      element.classList.add('typing-active');

      let i = 0;
      if (element.typingInterval) {
        clearInterval(element.typingInterval);
      }

      element.typingInterval = setInterval(() => {
        if (i < fullHtml.length) {
          if (fullHtml.charAt(i) === '<') {
            i = fullHtml.indexOf('>', i) + 1;
          } else {
            i++;
          }
          element.innerHTML = fullHtml.substring(0, i);
        } else {
          clearInterval(element.typingInterval);
          element.classList.remove('typing-active');
          resolve();
        }
      }, speed);
    });
  }

  /**
   * Sequentially types out all text elements in a tab container.
   */
  async function typeWriterTab(container) {
    const targets = container.querySelectorAll('h2, p, .skill-detail-box li, .contact-box p');
    
    targets.forEach(target => {
      if (!target.dataset.originalHtml) {
        target.dataset.originalHtml = target.innerHTML;
      }
      target.innerHTML = '';
      target.style.visibility = 'hidden';
    });

    for (const target of targets) {
      const isHeading = target.tagName.toLowerCase() === 'h2';
      const typingSpeed = isHeading ? 45 : 18; 
      
      await typeWriterElement(target, typingSpeed);
    }
  }

  // Helper function to activate a tab
  function activateTab(targetId) {
    const targetLink = document.querySelector(`#directory-nav a[data-target="${targetId}"]`);
    const targetSection = document.getElementById(targetId);

    if (targetSection && targetLink) {
      navLinks.forEach(l => l.classList.remove('active'));
      tabContents.forEach(tab => tab.classList.remove('active-tab'));

      targetLink.classList.add('active');
      targetSection.classList.add('active-tab');

      // Trigger sequential typing effect only if already booted
      if (booted) {
        typeWriterTab(targetSection);
      }

      const parentFolder = targetLink.closest('.folder-group');
      if (parentFolder && !parentFolder.classList.contains('open')) {
        parentFolder.classList.add('open');
        const toggle = parentFolder.querySelector('.folder-toggle');
        if (toggle) {
          toggle.textContent = toggle.textContent.replace('[ + ]', '[ - ]');
        }
      }
    }
  }

  // Expand / Collapse Folders
  folderToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const parentFolder = toggle.closest('.folder-group');
      parentFolder.classList.toggle('open');

      if (parentFolder.classList.contains('open')) {
        toggle.textContent = toggle.textContent.replace('[ + ]', '[ - ]');
      } else {
        toggle.textContent = toggle.textContent.replace('[ - ]', '[ + ]');
      }
    });
  });

  // Click Navigation Links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('data-target');
      activateTab(targetId);
      
      if (history.pushState) {
        history.pushState(null, null, `#${targetId}`);
      } else {
        location.hash = `#${targetId}`;
      }
    });
  });

  // Terminal Image Modal
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-img');
  const modalCaption = document.getElementById('modal-caption');
  const modalClose = document.querySelector('.modal-close');
  const modalTriggers = document.querySelectorAll('.modal-trigger');

  modalTriggers.forEach(img => {
    img.addEventListener('click', () => {
      modal.style.display = 'flex';
      modalImg.src = img.src;
      modalCaption.textContent = `[ PREVIEW ]: ${img.alt}`;
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      modal.style.display = 'none';
    }
  });
});
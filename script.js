document.addEventListener('DOMContentLoaded', () => {

  const bootSplash = document.getElementById('boot-splash');
  const windowElement = document.getElementById('window');
  let booted = false;

  function bootSystem() {
    if (booted) return;
    booted = true;

    if (bootSplash) {
      bootSplash.classList.add('hidden');
    }

    if (windowElement) {
      windowElement.classList.add('boot-anim');
    }
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

  window.addEventListener('keydown', bootSystem);
  window.addEventListener('click', bootSystem);
  window.addEventListener('touchstart', bootSystem);

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

async function typeWriterTab(container) {
  // Hide parent containers initially
  const boxes = container.querySelectorAll(
    '.info-block, .quick-stats, .stack-tags, .action-buttons, .skill-detail-box, .project-card, .contact-box'
  );
  boxes.forEach(box => box.classList.remove('visible'));

  // Target all typeable text elements including buttons
  const targets = container.querySelectorAll(
    'h2, p, .stat-tag, .terminal-list li, .tech-badge, .skill-detail-box li, .contact-box p, .tech-tags li, .action-buttons .btn'
  );

  targets.forEach(target => {
    if (!target.dataset.originalHtml) {
      target.dataset.originalHtml = target.innerHTML;
    }
    target.innerHTML = '';
    target.style.visibility = 'hidden';
  });

  for (const target of targets) {
    // Reveal parent container box as soon as its first child starts typing
    const parentBox = target.closest(
      '.info-block, .quick-stats, .stack-tags, .action-buttons, .skill-detail-box, .project-card, .contact-box'
    );
    if (parentBox && !parentBox.classList.contains('visible')) {
      parentBox.classList.add('visible');
    }

    const isHeading = target.tagName.toLowerCase() === 'h2';
    const isLabel = target.classList.contains('block-label') || target.tagName.toLowerCase() === 'p';

    const typingSpeed = isHeading ? 40 : isLabel ? 18 : 10;

    await typeWriterElement(target, typingSpeed);
  }
}

  function activateTab(targetId) {
    const targetLink = document.querySelector(`#directory-nav a[data-target="${targetId}"]`);
    const targetSection = document.getElementById(targetId);

    if (targetSection && targetLink) {
      navLinks.forEach(l => l.classList.remove('active'));
      tabContents.forEach(tab => tab.classList.remove('active-tab'));

      targetLink.classList.add('active');
      targetSection.classList.add('active-tab');

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

  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-img');
  const modalCaption = document.getElementById('modal-caption');
  const modalClose = document.querySelector('.modal-close');
  const modalTriggers = document.querySelectorAll('.modal-trigger');

document.addEventListener('click', (e) => {
  const img = e.target.closest('.modal-trigger');
  if (img) {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const modalCaption = document.getElementById('modal-caption');

    if (modal && modalImg) {
      modal.style.display = 'flex';
      modalImg.src = img.src;
      if (modalCaption) {
        modalCaption.textContent = `[ PREVIEW ]: ${img.alt}`;
      }
    }
  }
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
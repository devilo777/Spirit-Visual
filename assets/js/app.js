// --- OPTIMIZED SMOOTH PARTICLE BACKGROUND (LAG-FREE) ---
document.addEventListener('DOMContentLoaded', () => {
  const canvases = document.querySelectorAll('#particle-canvas');
  canvases.forEach(canvas => {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = Math.floor((width * height) / 25000);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.5 + 0.2
      });
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168, 85, 247, ${p.alpha})`;
        ctx.fill();

        for (let j = index + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 80) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(168, 85, 247, ${0.1 * (1 - dist / 80)})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      });

      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  });

  // Initialize App
  window.initPortfolioApp = initApp;
  if (window.db) {
    initApp();
  } else {
    initApp();
  }

  // Public Feedback Form Image Converter & Listener
  const pubForm = document.getElementById('public-feedback-form');
  const pubLogoFileInput = document.getElementById('pub-logo-file');
  const pubLogoUrlInput = document.getElementById('pub-logo');
  const pubPreviewBox = document.getElementById('pub-preview-box');
  const pubPreviewImg = document.getElementById('pub-preview-img');
  let selectedPubLogoBase64 = "";

  if (pubLogoFileInput) {
    pubLogoFileInput.addEventListener('change', function(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          selectedPubLogoBase64 = e.target.result;
          if (pubPreviewImg) pubPreviewImg.src = e.target.result;
          if (pubPreviewBox) pubPreviewBox.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (pubForm) {
    pubForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const urlInputVal = pubLogoUrlInput ? pubLogoUrlInput.value.trim() : "";
      const defaultLogo = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop";
      
      const finalLogo = selectedPubLogoBase64 !== "" ? selectedPubLogoBase64 : (urlInputVal !== "" ? urlInputVal : defaultLogo);

      const newFeedback = {
        client: document.getElementById('pub-client').value,
        logo: finalLogo,
        role: document.getElementById('pub-role').value,
        text: document.getElementById('pub-text').value
      };

      if (window.db) {
        try {
          const snapshot = await window.dbGet(window.dbRef(window.db, 'spirit_feedback'));
          let feedbackList = snapshot.exists() && Array.isArray(snapshot.val()) ? snapshot.val() : [];
          feedbackList.unshift(newFeedback);
          await window.dbSet(window.dbRef(window.db, 'spirit_feedback'), feedbackList);
        } catch (err) {
          console.error("Firebase write error:", err);
        }
      } else {
        let feedbackList = JSON.parse(localStorage.getItem('spirit_feedback')) || [];
        feedbackList.unshift(newFeedback);
        localStorage.setItem('spirit_feedback', JSON.stringify(feedbackList));
      }

      pubForm.reset();
      selectedPubLogoBase64 = "";
      if (pubPreviewBox) pubPreviewBox.style.display = 'none';
      closeFeedbackModal();
    });
  }
});

// Default Initial Data
const defaultWorks = [
  { title: "Cinematic Gaming Thumbnail", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1920&auto=format&fit=crop" },
  { title: "Esports Championship Banner", image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1920&auto=format&fit=crop" },
  { title: "Streamer Overlay Assets", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop" }
];

const defaultContact = {
  whatsapp: "+919876543210",
  email: "spiritvisuals@gmail.com",
  discord: "spiritgfx#0001"
};

const defaultFeedback = [
  {
    client: "Top Gaming Creator",
    logo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
    role: "2.4M+ Subscribers",
    text: "Spirit's thumbnails completely changed my channel's click-through rates. Absolute master of visual hierarchy!"
  },
  {
    client: "Team Velocity",
    logo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    role: "Esports Organization",
    text: "Working with Spirit for 4 years has been amazing. Professional, incredibly fast, and top-tier quality every time."
  }
];

// --- INITIALIZE & INSTANT LOCAL SYNC ---
function initApp() {
  // 1. Instant local render (0-second delay)
  const localWorks = JSON.parse(localStorage.getItem('spirit_works'));
  renderWorks(localWorks && Array.isArray(localWorks) ? localWorks : defaultWorks);

  const localContact = JSON.parse(localStorage.getItem('spirit_contact'));
  renderContact(localContact || defaultContact);

  const localFeedback = JSON.parse(localStorage.getItem('spirit_feedback'));
  renderFeedback(localFeedback && Array.isArray(localFeedback) ? localFeedback : defaultFeedback);

  // 2. Background Firebase Real-Time Sync
  if (window.db) {
    window.dbOnValue(window.dbRef(window.db, 'spirit_works'), (snapshot) => {
      const works = (snapshot.exists() && Array.isArray(snapshot.val())) ? snapshot.val() : null;
      if (works) {
        localStorage.setItem('spirit_works', JSON.stringify(works));
        renderWorks(works);
      }
    });

    window.dbOnValue(window.dbRef(window.db, 'spirit_contact'), (snapshot) => {
      const contact = (snapshot.exists() && snapshot.val()) ? snapshot.val() : null;
      if (contact) {
        localStorage.setItem('spirit_contact', JSON.stringify(contact));
        renderContact(contact);
      }
    });

    window.dbOnValue(window.dbRef(window.db, 'spirit_feedback'), (snapshot) => {
      const feedback = (snapshot.exists() && Array.isArray(snapshot.val())) ? snapshot.val() : null;
      if (feedback) {
        localStorage.setItem('spirit_feedback', JSON.stringify(feedback));
        renderFeedback(feedback);
      }
    });
  }
}

// --- RENDER FUNCTIONS ---
function renderWorks(works) {
  const showreelTrack = document.getElementById('showreel-track');
  if (showreelTrack) {
    const cardHTML = works.map(w => `
      <div class="glass-box work-card" onclick="openLightbox('${w.image}')" style="padding: 0; overflow: hidden;">
        <div class="work-img-wrapper" style="aspect-ratio: 16/9; width: 100%;">
          <img src="${w.image}" alt="${w.title || 'Work'}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop'">
        </div>
      </div>
    `).join('');

    showreelTrack.innerHTML = cardHTML + cardHTML;
  }
}

function renderContact(contact) {
  const contactContainer = document.getElementById('contact-container');
  if (contactContainer) {
    contactContainer.innerHTML = `
      <a href="https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}" target="_blank" class="glass-box contact-card">
        <div class="contact-icon"><i class="fa-brands fa-whatsapp"></i></div>
        <div class="contact-details">
          <span>WhatsApp</span>
          <h4>${contact.whatsapp}</h4>
        </div>
      </a>
      <a href="mailto:${contact.email}" class="glass-box contact-card">
        <div class="contact-icon"><i class="fa-solid fa-envelope"></i></div>
        <div class="contact-details">
          <span>Email</span>
          <h4>${contact.email}</h4>
        </div>
      </a>
      <a href="https://discord.com" target="_blank" class="glass-box contact-card">
        <div class="contact-icon"><i class="fa-brands fa-discord"></i></div>
        <div class="contact-details">
          <span>Discord</span>
          <h4>${contact.discord}</h4>
        </div>
      </a>
    `;
  }
}

function renderFeedback(feedback) {
  const feedbackGrid = document.getElementById('feedback-grid');
  if (feedbackGrid) {
    feedbackGrid.innerHTML = feedback.map(f => `
      <div class="glass-box feedback-card">
        <p class="feedback-body">"${f.text}"</p>
        <div class="client-meta">
          <img src="${f.logo}" alt="${f.client}" class="client-logo" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop'">
          <div class="client-info">
            <h4>${f.client}</h4>
            <span>${f.role}</span>
          </div>
        </div>
      </div>
    `).join('');
  }
}

// --- LIGHTBOX & FEEDBACK MODAL FUNCTIONS ---
window.openLightbox = function(imgSrc) {
  const modal = document.getElementById('lightbox-modal');
  const modalImg = document.getElementById('lightbox-img');
  if (modal && modalImg) {
    modalImg.src = imgSrc;
    modal.classList.add('active');
  }
}

window.closeLightbox = function() {
  const modal = document.getElementById('lightbox-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

window.openFeedbackModal = function() {
  const modal = document.getElementById('feedback-modal');
  if (modal) modal.classList.add('active');
}

window.closeFeedbackModal = function() {
  const modal = document.getElementById('feedback-modal');
  if (modal) modal.classList.remove('active');
}

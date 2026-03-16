// NAVBAR SCROLL + MOBILE TOGGLE
const navbar = document.querySelector(".navbar");
const navToggle = document.querySelector(".nav-toggle");

window.addEventListener("scroll", () => {
  if (!navbar) return;
  if (window.scrollY > 40) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

if (navToggle && navbar) {
  navToggle.addEventListener("click", () => {
    navToggle.classList.toggle("is-open");
    navbar.classList.toggle("is-open");
  });

  navbar.querySelectorAll("a[href^='#']").forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.classList.remove("is-open");
      navbar.classList.remove("is-open");
    });
  });
}

// SMOOTH SCROLL
document.querySelectorAll("a[href^='#']").forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
});

// HERO BANNER SLIDER
const track = document.querySelector(".hero-banner-track");
const dots = document.querySelectorAll(".hero-banner-dots .dot");
const homeMenuCards = document.querySelectorAll(".home-menu-card");

let currentSlide = 0;
const totalSlides = dots.length;

function updateSlide(index) {
  if (!track) return;
  currentSlide = index;

  const bannerHeight = track.firstElementChild?.getBoundingClientRect().height || 0;
  track.style.transform = `translateY(-${bannerHeight + 14 * index * 0}px)`; // 14px gap accounted visually

  dots.forEach((dot, i) => {
    dot.classList.toggle("is-active", i === currentSlide);
  });
}

dots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    updateSlide(index);
  });
});

let slideInterval = null;
function startHeroAutoSlide() {
  if (!totalSlides) return;
  slideInterval = setInterval(() => {
    const next = (currentSlide + 1) % totalSlides;
    updateSlide(next);
  }, 5000);
}

if (track && totalSlides > 0) {
  updateSlide(0);
  startHeroAutoSlide();
}

// Home page cards -> menu jump
homeMenuCards.forEach((card) => {
  card.addEventListener("click", () => {
    const jump = card.dataset.jump;
    if (jump) {
      window.location.href = `menu.html?jump=${encodeURIComponent(jump)}`;
    }
  });
});

// CART + EMAILJS ORDERING (menu page)
const isMenuPage = document.body.dataset.page === "menu";

if (isMenuPage) {
  const cartItemsEl = document.getElementById("cart-items");
  const subtotalEl = document.getElementById("cart-subtotal");
  const orderForm = document.getElementById("order-form");
  const feedbackEl = document.getElementById("order-feedback");

  const categoryCards = document.querySelectorAll(".category-card");
  const menuModal = document.getElementById("menu-modal");
  const menuModalOverlay = document.getElementById("menu-modal-overlay");
  const menuModalClose = document.getElementById("menu-modal-close");
  const menuModalTitle = document.getElementById("menu-modal-title");
  const menuModalItems = document.getElementById("menu-modal-items");
  const continueBtn = document.getElementById("continue-ordering");
  const finishBtn = document.getElementById("finish-order");
  const mainFinishBtn = document.getElementById("main-finish-order");

  const cart = [];

  function formatMoney(amount) {
    return `R${amount.toFixed(0)}`;
  }

  function findCartItem(name, price) {
    return cart.find((item) => item.name === name && item.price === price);
  }

  function addToCart(name, price) {
    const numericPrice = Number(price) || 0;
    if (!numericPrice) return;

    const existing = findCartItem(name, numericPrice);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ name, price: numericPrice, qty: 1 });
    }
    renderCart();
  }

  function updateQty(index, delta) {
    const item = cart[index];
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      cart.splice(index, 1);
    }
    renderCart();
  }

  function removeItem(index) {
    cart.splice(index, 1);
    renderCart();
  }

  function renderCart() {
    if (!cartItemsEl || !subtotalEl) return;
    cartItemsEl.innerHTML = "";

    let subtotal = 0;

    cart.forEach((item, index) => {
      subtotal += item.price * item.qty;

      const li = document.createElement("li");
      li.className = "cart-item";
      li.innerHTML = `
        <div class="cart-item-main">
          <span class="cart-item-name">${item.qty} × ${item.name}</span>
          <span class="cart-item-meta">${formatMoney(item.price)} each</span>
        </div>
        <div class="cart-item-actions">
          <button type="button" data-action="dec">-</button>
          <button type="button" data-action="inc">+</button>
          <button type="button" data-action="remove">x</button>
        </div>
      `;

      li.querySelectorAll("button").forEach((btn) => {
        const action = btn.dataset.action;
        btn.addEventListener("click", () => {
          if (action === "inc") updateQty(index, 1);
          if (action === "dec") updateQty(index, -1);
          if (action === "remove") removeItem(index);
        });
      });

      cartItemsEl.appendChild(li);
    });

    subtotalEl.textContent = formatMoney(subtotal);
  }

  function openMenuModal() {
    if (!menuModal) return;
    menuModal.classList.add("is-open");
    menuModal.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
  }

  function closeMenuModal() {
    if (!menuModal) return;
    menuModal.classList.remove("is-open");
    menuModal.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "";
    // reset checkout form visibility
    if (orderForm) orderForm.classList.add("is-hidden");
  }

  function setActiveCategory(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section || !menuModalItems) return;

    const title = section.querySelector("h2")?.textContent?.trim() || "Menu";
    if (menuModalTitle) menuModalTitle.textContent = title;

    menuModalItems.innerHTML = "";
    const items = section.querySelectorAll(".menu-item");
    items.forEach((li) => {
      const name = li.dataset.name || li.textContent.trim();
      const price = Number(li.dataset.price || "0");
      const display = li.textContent.replace(/\s+/g, " ").trim();

      const itemEl = document.createElement("li");
      itemEl.className = "menu-modal-item";
      itemEl.innerHTML = `
        <div class="menu-modal-item-top">
          <span class="menu-modal-item-name">${name}</span>
          <span class="menu-modal-item-price">R${price}</span>
        </div>
        <div class="menu-modal-item-desc">${display}</div>
      `;
      itemEl.addEventListener("click", () => {
        addToCart(name, price);
      });
      menuModalItems.appendChild(itemEl);
    });
  }

  categoryCards.forEach((btn) => {
    btn.addEventListener("click", () => {
      const sectionId = btn.dataset.category;
      if (!sectionId) return;
      setActiveCategory(sectionId);
      openMenuModal();
    });
  });

  if (menuModalOverlay) menuModalOverlay.addEventListener("click", closeMenuModal);
  if (menuModalClose) menuModalClose.addEventListener("click", closeMenuModal);
  if (continueBtn) continueBtn.addEventListener("click", closeMenuModal);
  if (finishBtn) {
    finishBtn.addEventListener("click", () => {
      if (!cart.length) {
        return;
      }
      if (orderForm) orderForm.classList.remove("is-hidden");
      if (orderForm) orderForm.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (mainFinishBtn) {
    mainFinishBtn.addEventListener("click", () => {
      if (!cart.length) {
        // Also open the modal on the first category to guide them
        const firstCard = categoryCards[0];
        if (firstCard) {
          const sectionId = firstCard.dataset.category;
          if (sectionId) setActiveCategory(sectionId);
          openMenuModal();
        }
        return;
      }

      // If there is already food in the plate, open modal on any category and show checkout
      const firstCard = categoryCards[0];
      if (firstCard) {
        const sectionId = firstCard.dataset.category;
        if (sectionId) setActiveCategory(sectionId);
      }
      openMenuModal();
      if (orderForm) orderForm.classList.remove("is-hidden");
      if (orderForm) orderForm.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenuModal();
  });

  // Jump handling for homepage cards (menu.html?jump=...)
  const params = new URLSearchParams(window.location.search);
  const jump = params.get("jump");
  if (jump) {
    const map = {
      pico: "section-pico",
      wings: "section-wings",
      fries: "section-fries",
      pata: "section-pata",
    };
    const sectionId = map[jump];
    if (sectionId) {
      setActiveCategory(sectionId);
      openMenuModal();
    }
  }

  if (orderForm) {
    orderForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!window.emailjs) {
        if (feedbackEl) {
          feedbackEl.textContent = "Email service not configured yet.";
          feedbackEl.style.color = "#f97316";
        }
        return;
      }

      if (!cart.length) {
        if (feedbackEl) {
          feedbackEl.textContent = "Please add at least one item to your plate first.";
          feedbackEl.style.color = "#f97316";
        }
        return;
      }

      const formData = new FormData(orderForm);
      const fullName = formData.get("fullName") || "";
      const email = formData.get("email") || "";
      const whatsapp = formData.get("whatsapp") || "";
      const notes = formData.get("notes") || "";

      let subtotal = 0;
      const lines = cart.map((item) => {
        const lineTotal = item.price * item.qty;
        subtotal += lineTotal;
        return `${item.qty} × ${item.name} — ${formatMoney(lineTotal)}`;
      });

      const orderSummary = lines.join("\n");

      // Match your EmailJS template fields:
      // {{name}}, {{email}}, {{whatsapp}}, {{order_details}}
      const templateParams = {
        name: fullName,
        email,
        whatsapp,
        order_details: `${orderSummary}\n\nTotal: ${formatMoney(subtotal)}\nNotes: ${notes || "None"}`,
        // Helpful standard fields
        reply_to: email,
      };

      if (feedbackEl) {
        feedbackEl.textContent = "Sending your order…";
        feedbackEl.style.color = "#9ca3af";
      }

      try {
        await emailjs.send("service_5x43lc8", "template_gk7slp7", templateParams);
        if (feedbackEl) {
          feedbackEl.textContent =
            "Order sent! Check your email for the slip and wait for WhatsApp confirmation.";
          feedbackEl.style.color = "#4ade80";
        }

        // Generate PDF slip using jsPDF (only on menu page)
        if (window.jspdf && window.jspdf.jsPDF) {
          const { jsPDF } = window.jspdf;
          const doc = new jsPDF();

          // Background
          doc.setFillColor(3, 7, 18);
          doc.rect(0, 0, 210, 297, "F");

          // Header
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(20);
          doc.text("FOOD BY MR BUFFALO", 14, 20);

          doc.setFontSize(11);
          doc.setTextColor(209, 213, 219);
          doc.text("Order Slip / Invoice", 14, 28);

          // Customer info
          doc.setFontSize(10);
          doc.text(`Name: ${fullName}`, 14, 40);
          doc.text(`Email: ${email}`, 14, 46);
          doc.text(`WhatsApp: ${whatsapp}`, 14, 52);

          // Totals
          doc.text(`Total: ${formatMoney(subtotal)}`, 14, 62);

          // Order details
          doc.setFontSize(11);
          doc.text("Items:", 14, 76);
          doc.setFontSize(9);
          const linesWrapped = doc.splitTextToSize(orderSummary, 182);
          doc.text(linesWrapped, 14, 84);

          // Notes
          if (notes) {
            doc.setFontSize(10);
            doc.text("Notes:", 14, 84 + linesWrapped.length * 5 + 6);
            const notesWrapped = doc.splitTextToSize(notes.toString(), 182);
            doc.setFontSize(9);
            doc.text(notesWrapped, 14, 84 + linesWrapped.length * 5 + 12);
          }

          const filename = `FoodByMrBuffalo-${Date.now()}.pdf`;
          doc.save(filename);
        }
      } catch (err) {
        if (feedbackEl) {
          feedbackEl.textContent = "Could not send order. Please try again in a moment.";
          feedbackEl.style.color = "#f97316";
        }
        // eslint-disable-next-line no-console
        console.error("EmailJS error", err);
      }
    });
  }
}

// SCROLL ANIMATIONS (sections + cards)
const animatedNodes = document.querySelectorAll("[data-animate]");

if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const type = el.dataset.animate;
        const delay = parseFloat(el.dataset.delay || "0");

        if (type === "fade-up") {
          el.classList.add("will-animate");
          requestAnimationFrame(() => {
            setTimeout(() => {
              el.classList.add("animate-in");
            }, delay * 1000);
          });
        } else if (type === "card-rise") {
          el.style.opacity = "0";
          el.style.transform = "translateY(18px)";
          setTimeout(() => {
            el.style.transition =
              "opacity 0.6s cubic-bezier(0.19,1,0.22,1), transform 0.6s cubic-bezier(0.19,1,0.22,1)";
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          }, delay * 1000);
        } else if (type === "float-card") {
          el.classList.add("float-card");
          requestAnimationFrame(() => {
            setTimeout(() => {
              el.classList.add("float-card-in");
            }, delay * 1000);
          });
        } else if (type === "slide-in") {
          el.style.opacity = "0";
          el.style.transform = "translateX(26px)";
          setTimeout(() => {
            el.style.transition =
              "opacity 0.7s cubic-bezier(0.19,1,0.22,1), transform 0.7s cubic-bezier(0.19,1,0.22,1)";
            el.style.opacity = "1";
            el.style.transform = "translateX(0)";
          }, delay * 1000);
        } else if (type === "marquee") {
          // handled via CSS keyframes, but we can ensure visibility
          el.style.opacity = "1";
        }

        io.unobserve(el);
      });
    },
    { threshold: 0.2 }
  );

  animatedNodes.forEach((node) => io.observe(node));
}

// YEAR IN FOOTER
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear().toString();
}
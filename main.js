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

// NAVBAR SCROLL + MOBILE TOGGLE + SMOOTH SCROLL + HERO SLIDER (fixed) + HOME CARDS JUMP
// ... keep all your original code up to here ...

// CART + EMAILJS (updated)
const isMenuPage = document.body.dataset.page === "menu";

if (isMenuPage) {
  const cartItemsEl = document.getElementById("cart-items");
  const subtotalEl = document.getElementById("cart-subtotal");
  const orderForm = document.getElementById("order-form");
  const feedbackEl = document.getElementById("order-feedback");

  const floatingCartBtn = document.getElementById("floating-cart-btn");
  const cartBadge = document.getElementById("cart-badge");
  const cartSheet = document.getElementById("cart-sheet");
  const sheetClose = document.getElementById("cart-sheet-close");
  const sheetContinue = document.getElementById("sheet-continue");
  const sheetFinish = document.getElementById("sheet-finish");
  const sheetCartItems = document.getElementById("sheet-cart-items");
  const sheetSubtotalEl = document.getElementById("sheet-cart-subtotal");

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

  function formatMoney(amount) { return `R${amount.toFixed(0)}`; }

  function findCartItem(name, price) {
    return cart.find(item => item.name === name && item.price === price);
  }

  function showAddedFeedback(name) {
    const toast = document.createElement("div");
    toast.className = "added-toast";
    toast.textContent = `${name} added to plate!`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = "1"; toast.style.transform = "translateX(-50%) translateY(-10px)"; }, 10);
    setTimeout(() => { toast.style.opacity = "0"; setTimeout(() => toast.remove(), 400); }, 1800);
  }

  function addToCart(name, price) {
    const numericPrice = Number(price) || 0;
    if (!numericPrice) return;
    const existing = findCartItem(name, numericPrice);
    if (existing) existing.qty += 1;
    else cart.push({ name, price: numericPrice, qty: 1 });
    renderCart();
    renderSheetCart();
    updateCartBadge();
    showAddedFeedback(name);
  }

  function updateQty(index, delta) {
    const item = cart[index];
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart.splice(index, 1);
    renderCart();
    renderSheetCart();
    updateCartBadge();
  }

  function updateCartBadge() {
    if (!cartBadge) return;
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    cartBadge.textContent = totalQty > 99 ? "99+" : totalQty;
    cartBadge.classList.toggle("is-hidden", totalQty === 0);
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
          <button type="button" data-action="dec" data-index="${index}">-</button>
          <button type="button" data-action="inc" data-index="${index}">+</button>
        </div>
      `;
      cartItemsEl.appendChild(li);
    });
    subtotalEl.textContent = formatMoney(subtotal);
  }

  function renderSheetCart() {
    if (!sheetCartItems || !sheetSubtotalEl) return;
    sheetCartItems.innerHTML = "";
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
          <button type="button" data-action="dec" data-index="${index}">-</button>
          <button type="button" data-action="inc" data-index="${index}">+</button>
        </div>
      `;
      sheetCartItems.appendChild(li);
    });
    sheetSubtotalEl.textContent = formatMoney(subtotal);
  }

  function setupCartDelegation(container) {
    if (!container) return;
    container.addEventListener("click", e => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const action = btn.dataset.action;
      const index = parseInt(btn.dataset.index, 10);
      if (isNaN(index)) return;
      if (action === "inc") updateQty(index, 1);
      if (action === "dec") updateQty(index, -1);
    });
  }

  setupCartDelegation(cartItemsEl);
  setupCartDelegation(sheetCartItems);

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
    if (orderForm) orderForm.classList.add("is-hidden");
  }

  function setActiveCategory(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section || !menuModalItems) return;
    menuModalTitle.textContent = section.querySelector("h2")?.textContent?.trim() || "Menu";
    menuModalItems.innerHTML = "";
    section.querySelectorAll(".menu-item").forEach(li => {
      const name = li.dataset.name || li.textContent.trim();
      const price = Number(li.dataset.price || "0");
      const display = li.textContent.replace(/\s+/g, " ").trim();
      const itemEl = document.createElement("li");
      itemEl.className = "menu-modal-item";
      itemEl.innerHTML = `
        <div class="menu-modal-item-top">
          <span class="menu-modal-item-name">${name}</span>
          <div style="display:flex;align-items:center;gap:12px;">
            <span class="menu-modal-item-price">R${price}</span>
            <button class="btn primary add-btn" style="padding:6px 14px;font-size:0.8rem;">Add</button>
          </div>
        </div>
        <div class="menu-modal-item-desc">${display}</div>
      `;
      itemEl.querySelector(".add-btn").addEventListener("click", e => { e.stopPropagation(); addToCart(name, price); });
      itemEl.addEventListener("click", () => addToCart(name, price));
      menuModalItems.appendChild(itemEl);
    });
  }

  categoryCards.forEach(btn => {
    btn.addEventListener("click", () => {
      const sectionId = btn.dataset.category;
      if (sectionId) {
        setActiveCategory(sectionId);
        openMenuModal();
      }
    });
  });

  menuModalOverlay?.addEventListener("click", closeMenuModal);
  menuModalClose?.addEventListener("click", closeMenuModal);
  continueBtn?.addEventListener("click", closeMenuModal);

  function showCheckoutForm() {
    if (!cart.length) {
      alert("Add at least one item first!");
      return;
    }
    if (!menuModal.classList.contains("is-open")) {
      const first = categoryCards[0];
      if (first) {
        setActiveCategory(first.dataset.category);
        openMenuModal();
      }
    }
    if (orderForm) {
      orderForm.classList.remove("is-hidden");
      setTimeout(() => orderForm.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
    }
  }

  finishBtn?.addEventListener("click", showCheckoutForm);
  mainFinishBtn?.addEventListener("click", showCheckoutForm);
  sheetFinish?.addEventListener("click", () => { cartSheet?.classList.remove("is-open"); showCheckoutForm(); });

  floatingCartBtn?.addEventListener("click", () => {
    if (!cart.length) return showCheckoutForm();
    cartSheet?.classList.add("is-open");
    renderSheetCart();
  });

  sheetClose?.addEventListener("click", () => cartSheet?.classList.remove("is-open"));
  sheetContinue?.addEventListener("click", () => cartSheet?.classList.remove("is-open"));

  window.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeMenuModal();
      cartSheet?.classList.remove("is-open");
    }
  });

  // Jump from home
  const params = new URLSearchParams(location.search);
  const jump = params.get("jump");
  if (jump) {
    const map = { pico: "section-pico", wings: "section-wings", fries: "section-fries", pata: "section-pata" };
    const id = map[jump];
    if (id) { setActiveCategory(id); openMenuModal(); }
  }

  // Order submit (unchanged)
  orderForm?.addEventListener("submit", async e => {
    e.preventDefault();
    // ... your existing EmailJS + jsPDF code ...
  });

  renderCart();
  renderSheetCart();
  updateCartBadge();
}

// ... keep animations + year footer ...

// YEAR IN FOOTER
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear().toString();
}
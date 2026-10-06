
(() => {
        const categoryButtons = [...document.querySelectorAll(".category-chip")];
        const products = [...document.querySelectorAll(".product-card")];
        const searchInput = document.querySelector("#product-search");
        const emptyState = document.querySelector("#empty-state");
        const countBadge = document.querySelector("#cart-count");
        const cartHeadingCount = document.querySelector("#cart-heading-count");
        const cartDrawer = document.querySelector("#cart-drawer");
        const cartOverlay = document.querySelector("#cart-overlay");
        const cartItems = document.querySelector("#cart-items");
        const subtotal = document.querySelector("#cart-subtotal");
        const toast = document.querySelector("#toast");
        const cart = new Map();
        let activeCategory = "All";
        let toastTimer;

        const formatPrice = (value) =>
          new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          }).format(value);

        const filterProducts = () => {
          const query = searchInput.value.trim().toLowerCase();
          let visibleCount = 0;

          products.forEach((product) => {
            const matchesCategory =
              activeCategory === "All" || product.dataset.category === activeCategory;
            const matchesSearch =
              !query ||
              `${product.dataset.name} ${product.dataset.category}`.toLowerCase().includes(query);
            const isVisible = matchesCategory && matchesSearch;
            product.hidden = !isVisible;
            if (isVisible) visibleCount += 1;
          });

          emptyState.classList.toggle("is-visible", visibleCount === 0);
        };

        const showToast = (message) => {
          toast.textContent = message;
          toast.classList.add("is-visible");
          window.clearTimeout(toastTimer);
          toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2300);
        };

        const updateCart = () => {
          const items = [...cart.values()];
          const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
          const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

          countBadge.textContent = totalItems;
          cartHeadingCount.textContent = `(${totalItems})`;
          subtotal.textContent = formatPrice(totalPrice);
          cartItems.replaceChildren();

          if (items.length === 0) {
            const emptyMessage = document.createElement("div");
            emptyMessage.className = "cart-empty";
            const title = document.createElement("strong");
            title.textContent = "A good find is waiting.";
            emptyMessage.append(title, "Your bag is empty for now.");
            cartItems.append(emptyMessage);
            return;
          }

          items.forEach((item) => {
            const row = document.createElement("div");
            row.className = "cart-item";

            const image = document.createElement("img");
            image.src = item.image;
            image.alt = "";
            image.loading = "lazy";

            const details = document.createElement("div");
            const name = document.createElement("p");
            name.className = "cart-item-name";
            name.textContent = item.name;
            const price = document.createElement("span");
            price.className = "cart-item-price";
            price.textContent = `${formatPrice(item.price)} · Qty ${item.quantity}`;
            details.append(name, price);

            const remove = document.createElement("button");
            remove.className = "cart-item-remove";
            remove.type = "button";
            remove.setAttribute("aria-label", `Remove ${item.name}`);
            remove.innerHTML =
              '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 6h12M8 6V4h4v2m-6 0 1 10h6l1-10" /></svg>';
            remove.addEventListener("click", () => {
              cart.delete(item.name);
              updateCart();
              showToast(`${item.name} removed from your bag`);
            });

            row.append(image, details, remove);
            cartItems.append(row);
          });
        };

        const setCartOpen = (isOpen) => {
          cartDrawer.classList.toggle("is-open", isOpen);
          cartOverlay.classList.toggle("is-open", isOpen);
          cartDrawer.setAttribute("aria-hidden", String(!isOpen));
          cartOverlay.setAttribute("aria-hidden", String(!isOpen));
          document.body.style.overflow = isOpen ? "hidden" : "";
          if (isOpen) document.querySelector("#close-cart").focus();
        };

        categoryButtons.forEach((button) => {
          button.addEventListener("click", () => {
            activeCategory = button.dataset.category;
            categoryButtons.forEach((item) => item.classList.remove("is-active"));
            button.classList.add("is-active");
            filterProducts();
          });
        });

        document.querySelectorAll("[data-category-link]").forEach((link) => {
          link.addEventListener("click", () => {
            const category = link.dataset.categoryLink;
            const button = categoryButtons.find((item) => item.dataset.category === category);
            if (button) button.click();
          });
        });

        searchInput.addEventListener("input", filterProducts);

        document.querySelectorAll(".add-button").forEach((button) => {
          button.addEventListener("click", () => {
            const product = button.closest(".product-card");
            const item = {
              name: product.dataset.name,
              price: Number(product.dataset.price),
              image: product.dataset.image,
              quantity: 1,
            };
            const existing = cart.get(item.name);
            if (existing) existing.quantity += 1;
            else cart.set(item.name, item);
            updateCart();
            showToast(`${item.name} added to your bag`);
          });
        });

        document.querySelectorAll(".product-save").forEach((button) => {
          button.addEventListener("click", () => {
            const isSaved = button.classList.toggle("is-saved");
            button.setAttribute("aria-pressed", String(isSaved));
            const name = button.closest(".product-card").dataset.name;
            showToast(isSaved ? `${name} saved for later` : `${name} removed from saved`);
          });
        });

        document.querySelector("#open-cart").addEventListener("click", () => setCartOpen(true));
        document.querySelector("#close-cart").addEventListener("click", () => setCartOpen(false));
        cartOverlay.addEventListener("click", () => setCartOpen(false));
        document.addEventListener("keydown", (event) => {
          if (event.key === "Escape") setCartOpen(false);
        });

        document.querySelector("#checkout-button").addEventListener("click", () => {
          if (cart.size === 0) {
            showToast("Your bag is empty. Find a little something first.");
            return;
          }
          showToast("Thanks for stopping by. Checkout is coming soon.");
        });

        document.querySelector("#newsletter-form").addEventListener("submit", (event) => {
          event.preventDefault();
          const message = document.querySelector("#newsletter-message");
          message.textContent = "You're on the list. Keep an eye on your inbox.";
          event.currentTarget.reset();
        });

        document.querySelector("#current-year").textContent = new Date().getFullYear();
        updateCart();
      })();
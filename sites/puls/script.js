const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");

function setMenuState(isOpen) {
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
  navigation.dataset.open = String(isOpen);
}

menuButton.addEventListener("click", () => {
  setMenuState(menuButton.getAttribute("aria-expanded") !== "true");
});

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenuState(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
    setMenuState(false);
    menuButton.focus();
  }
});

const billingButtons = document.querySelectorAll("[data-billing]");
const prices = document.querySelectorAll(
  "[data-price-monthly][data-price-yearly]"
);
const billingNote = document.querySelector("[data-billing-note]");
const numberFormatter = new Intl.NumberFormat("ru-RU");

billingButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const billing = button.dataset.billing;

    billingButtons.forEach((item) => {
      item.setAttribute(
        "aria-pressed",
        String(item.dataset.billing === billing)
      );
    });

    prices.forEach((price) => {
      price.textContent = numberFormatter
        .format(
          Number(
            price.dataset[
              `price${billing === "yearly" ? "Yearly" : "Monthly"}`
            ]
          )
        )
        .replace(/\u00a0/g, " ");
    });

    billingNote.textContent =
      billing === "yearly"
        ? "Цена за месяц при оплате за год"
        : "Оплата каждый месяц";
  });
});

const accessForm = document.querySelector("#access-form");
const accessStatus = document.querySelector("#access-status");

accessForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = accessForm.elements.name.value.trim();
  const emailField = accessForm.elements.email;
  const email = emailField.value.trim();

  if (!name || !email || !emailField.validity.valid) {
    accessStatus.setAttribute("role", "alert");
    accessStatus.textContent = "Укажите имя и рабочую почту";
    return;
  }

  accessStatus.setAttribute("role", "status");
  accessStatus.textContent = "Доступ открыт в демонстрационном режиме";
  accessForm.reset();
});

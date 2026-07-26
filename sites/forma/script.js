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

const estimateForm = document.querySelector("#estimate");
const areaInput = document.querySelector("#area");
const repairTypeInput = document.querySelector("#repair-type");
const estimateResult = document.querySelector("#estimate-result");
const rates = {
  cosmetic: 18000,
  capital: 32000,
  design: 48000
};
const numberFormatter = new Intl.NumberFormat("ru-RU");

estimateForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const area = Number(areaInput.value);
  if (area < 10 || area > 500) {
    estimateResult.textContent = "Укажите площадь от 10 до 500 м²";
    return;
  }

  const total = area * rates[repairTypeInput.value];
  estimateResult.textContent = `Предварительная стоимость ${numberFormatter.format(total)} ₽`;
});

repairTypeInput.addEventListener("change", () => {
  if (estimateResult.textContent) estimateForm.requestSubmit();
});

const contactForm = document.querySelector("#contact-form");

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  contactForm.querySelector("[role=status]").textContent =
    "Заявка принята в демонстрационном режиме";
});

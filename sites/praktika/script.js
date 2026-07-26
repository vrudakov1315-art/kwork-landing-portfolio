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

const programButtons = document.querySelectorAll(".program-item > button");

programButtons.forEach((button) => {
  const panel = document.getElementById(button.getAttribute("aria-controls"));
  panel.hidden = button.getAttribute("aria-expanded") !== "true";

  button.addEventListener("click", () => {
    const willOpen = button.getAttribute("aria-expanded") !== "true";

    button.setAttribute("aria-expanded", String(willOpen));
    panel.hidden = !willOpen;
  });
});

const courseForm = document.querySelector("#course-form");
const formMessage = courseForm.querySelector(".form-message");

courseForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = courseForm.elements.name.value.trim();
  const contact = courseForm.elements.contact.value.trim();
  const hasConsent = courseForm.elements.consent.checked;

  if (!name || !contact) {
    formMessage.setAttribute("role", "alert");
    formMessage.textContent = "Заполните имя и контакты";
    return;
  }

  if (!hasConsent) {
    formMessage.setAttribute("role", "alert");
    formMessage.textContent = "Подтвердите согласие на обработку данных";
    return;
  }

  formMessage.setAttribute("role", "status");
  formMessage.textContent = "Заявка принята в демонстрационном режиме";
});

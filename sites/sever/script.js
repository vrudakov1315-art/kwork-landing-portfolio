const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");
const bookingForm = document.querySelector("#booking-form");
const bookingDate = bookingForm.querySelector('[name="date"]');
const bookingGuests = bookingForm.querySelector('[name="guests"]');
const errorMessage = bookingForm.querySelector('[role="alert"]');
const successMessage = bookingForm.querySelector('[role="status"]');

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function setDefaultBookingDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  bookingDate.min = formatDate(tomorrow);
  bookingDate.value = formatDate(tomorrow);
}

function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  navigation.dataset.open = "false";
}

menuButton.addEventListener("click", () => {
  const shouldOpen = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(shouldOpen));
  navigation.dataset.open = String(shouldOpen);
});

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
    closeMenu();
    menuButton.focus();
  }
});

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(bookingForm);
  const name = String(data.get("name") || "").trim();
  const contact = String(data.get("contact") || "").trim();
  const date = String(data.get("date") || "").trim();
  const guests = Number(data.get("guests"));

  errorMessage.hidden = true;
  successMessage.hidden = true;

  if (!name || !contact) {
    errorMessage.textContent = "Заполните имя и контакты";
    errorMessage.hidden = false;
    return;
  }

  if (!date || !bookingDate.validity.valid) {
    errorMessage.textContent = "Выберите доступную дату бронирования";
    errorMessage.hidden = false;
    bookingDate.focus();
    return;
  }

  if (!date || !Number.isInteger(guests) || guests < 1 || guests > 10) {
    errorMessage.textContent = "Выберите дату и число гостей от 1 до 10";
    errorMessage.hidden = false;
    return;
  }

  bookingForm.reset();
  setDefaultBookingDate();
  bookingGuests.value = "2";
  successMessage.textContent = "Заявка принята в демонстрационном режиме";
  successMessage.hidden = false;
});

document.querySelector("#year").textContent = new Date().getFullYear();
setDefaultBookingDate();

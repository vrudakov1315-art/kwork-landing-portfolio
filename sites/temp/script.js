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

const schedules = {
  gym: [
    { time: "07:30", title: "Силовой старт", coach: "Нина · 55 минут" },
    { time: "12:00", title: "Кардио-ритм", coach: "Марк · 45 минут" },
    { time: "19:30", title: "Мобильность", coach: "Ася · 55 минут" },
  ],
  online: [
    { time: "08:00", title: "Мобилити live", coach: "Ася · 45 минут" },
    { time: "13:00", title: "Функциональный микс", coach: "Нина · 50 минут" },
    { time: "20:00", title: "Спина без спешки", coach: "Марк · 45 минут" },
  ],
};

const schedule = document.querySelector("#schedule");
const modeButtons = document.querySelectorAll("[data-training-mode] button");

function renderSchedule(mode) {
  schedule.replaceChildren(
    ...schedules[mode].map((session) => {
      const row = document.createElement("article");
      row.className = "schedule-row";

      const time = document.createElement("span");
      time.className = "schedule-time";
      time.textContent = session.time;

      const title = document.createElement("h3");
      title.textContent = session.title;

      const coach = document.createElement("p");
      coach.textContent = session.coach;

      const link = document.createElement("a");
      link.href = "#signup";
      link.textContent = "Записаться";

      row.append(time, title, coach, link);
      return row;
    })
  );
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    modeButtons.forEach((item) => {
      item.setAttribute("aria-pressed", String(item === button));
    });
    renderSchedule(button.dataset.mode);
  });
});

document.querySelectorAll(".faq-item button").forEach((button) => {
  const panel = document.querySelector(`#${button.getAttribute("aria-controls")}`);
  panel.hidden = button.getAttribute("aria-expanded") !== "true";

  button.addEventListener("click", () => {
    const shouldOpen = button.getAttribute("aria-expanded") === "false";

    document.querySelectorAll(".faq-item button").forEach((item) => {
      item.setAttribute("aria-expanded", "false");
      document.querySelector(`#${item.getAttribute("aria-controls")}`).hidden = true;
    });

    if (shouldOpen) {
      button.setAttribute("aria-expanded", "true");
      document.querySelector(`#${button.getAttribute("aria-controls")}`).hidden =
        false;
    }
  });
});

document.querySelector("#training-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const name = form.elements.name.value.trim();
  const contact = form.elements.contact.value.trim();
  const status = form.querySelector("[role=status]");
  const error = form.querySelector("[role=alert]");

  status.textContent = "";
  error.textContent = "";

  if (!name || !contact) {
    error.textContent = "Заполните имя и контакт для связи";
    return;
  }

  status.textContent = "Запись принята в демонстрационном режиме";
  form.reset();
});

renderSchedule("gym");

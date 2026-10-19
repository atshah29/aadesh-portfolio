const menu = document.querySelector(".menu"),
  nav = document.querySelector(".links");
menu?.addEventListener("click", () => {
  const on = menu.getAttribute("aria-expanded") !== "true";
  menu.setAttribute("aria-expanded", on);
  nav.classList.toggle("open", on);
});
nav?.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("open");
    menu?.setAttribute("aria-expanded", "false");
  }),
);
const dialog = document.querySelector("dialog");
document.querySelectorAll("[data-zoom]").forEach((b) =>
  b.addEventListener("click", () => {
    const i = b.querySelector("img");
    dialog.querySelector("img").src = i.src;
    dialog.querySelector("img").alt = i.alt;
    dialog.showModal();
  }),
);
document
  .querySelector(".close-dialog")
  ?.addEventListener("click", () => dialog.close());
dialog?.addEventListener("click", (e) => {
  if (e.target === dialog) dialog.close();
});
const steps = [
  [
    "Rename: find a prediction",
    "The predictor combines the instruction PC with folded branch history to look up VTAGE providers. It also snapshots history and the prediction-queue position for recovery.",
  ],
  [
    "Dispatch: let dependents run",
    "A confident predicted value is written into the physical register file, and the destination is marked ready. Dependent instructions can issue before the producer computes its actual result.",
  ],
  [
    "Execute: check the value",
    "The actual result is compared with the prediction. On a mismatch, the register is corrected and a value-misprediction squash triggers recovery from speculative execution.",
  ],
  [
    "Retire: train on committed work",
    "Correct-path instructions update confidence and allocate entries. Branch recovery separately rewinds speculative queue state so wrong-path work does not corrupt the stride baseline.",
  ],
];
document.querySelectorAll("[data-step]").forEach((b) =>
  b.addEventListener("click", () => {
    document
      .querySelectorAll("[data-step]")
      .forEach((x) => x.setAttribute("aria-pressed", x === b));
    const s = steps[Number(b.dataset.step)];
    document.querySelector("#step-title").textContent = s[0];
    document.querySelector("#step-body").textContent = s[1];
  }),
);

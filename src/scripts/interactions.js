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
    "Rename: predict and checkpoint",
    "During register renaming, the predictor uses the instruction address and recent conditional-branch history to search the stride and tagged-history tables. It records the speculative history and prediction-queue position needed for recovery.",
  ],
  [
    "Dispatch: let dependents run",
    "At dispatch, a sufficiently confident predicted result is written into the instruction’s destination physical register and marked available. Dependent instructions can execute before the producer computes its actual result.",
  ],
  [
    "Execute: validate and recover",
    "The simulator compares the actual result with the prediction. Incorrect predictions trigger recovery so instructions that consumed the wrong value cannot commit incorrect results. Recovery restores checkpointed or committed history and unwinds in-flight prediction bookkeeping.",
  ],
  [
    "Retire: train on committed work",
    "Retirement updates stride information, confidence, and permanent table state using committed instructions. A branch rollback separately rewinds the prediction queue and undoes wrong-path stride-predictor instance counts.",
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

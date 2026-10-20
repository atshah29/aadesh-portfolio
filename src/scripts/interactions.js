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
    "Fetch: instruction stream",
    "The existing front end fetches instructions and predicts control flow. Instruction addresses and conditional-branch history provide the context that the value predictor uses later in the pipeline."
  ],
  [
    "Decode: identify operations and operands",
    "Decode identifies operation types and source and destination registers. The predictor uses this information to check eligibility and apply different training and allocation policies to loads, floating-point operations, and generic ALU operations."
  ],
  [
    "Rename 1: form the instruction bundle",
    "The first rename sub-stage transfers an instruction bundle from the fetch queue to the second rename sub-stage. It preserves the simulator’s existing backpressure when the next bundle cannot advance."
  ],
  [
    "Rename 2: predict and checkpoint",
    "I integrated stride and tagged-history lookup with register renaming, provider selection, and in-flight prediction tracking. Branch checkpoints capture speculative history and the prediction-queue position so later recovery can undo wrong-path work."
  ],
  [
    "Dispatch: forward a predicted result",
    "I write a sufficiently confident prediction into the destination physical register and mark it available. Consumers dispatched afterward can see their operands as ready before the producer computes its actual result."
  ],
  [
    "Schedule: issue ready consumers",
    "The existing issue scheduler selects instructions whose operands are ready. Marking predicted values available at dispatch lets dependent instructions become eligible for execution earlier, without waiting for the actual producer result."
  ],
  [
    "Register read: consume speculative operands",
    "Consumers read operands from physical registers, including predicted values. I adjusted the normal producer wakeup path so an instruction with a forwarded prediction does not repeat the usual register-read wakeup."
  ],
  [
    "Execute: validate actual results",
    "I compare predicted values with actual results for loads and arithmetic operations. Correct predictions preserve early execution; mismatches write the actual value and flag recovery. Execution also records actual results for retirement-time training."
  ],
  [
    "Writeback: complete and restore state",
    "I record actual results in the prediction queue as instructions complete. On a branch misprediction, writeback rewinds the queue, undoes wrong-path stride instance counts, and restores checkpointed branch history."
  ],
  [
    "Retire: train and commit safely",
    "I update stride values, VTAGE confidence, usefulness, allocation, and committed branch history at retirement. Value-misprediction handling commits the corrected producer and discards younger speculative work before incorrect consumers can commit."
  ],
  [
    "Recovery: clear speculative bookkeeping",
    "I extended full-pipeline recovery to clear in-flight stride counts, empty the value-prediction queue, and restore committed history. Partial branch recovery instead restores its checkpoint while retaining older valid predictions."
  ]
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

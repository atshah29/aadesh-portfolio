---
slug: "value-prediction"
order: 1
title: "Hybrid SVP + VTAGE Value Predictor"
cardTitle: "Hybrid Value Predictor"
category: "Computer architecture"
summary: "A hybrid value predictor that lets dependent instructions execute before their inputs are computed, with validation and recovery across an out-of-order simulator."
description: "A hybrid SVP + VTAGE value predictor achieving 2.054 harmonic-mean IPC versus a 1.66 baseline without value prediction, approximately 24% higher, within a 32 KB storage budget."
role: "Sole software implementer within a two-person project team."
context: "Graduate architecture project · Jan–Apr 2026"
technology: "C++ · SVP · VTAGE"
tags: ["C++", "SVP + VTAGE", "Simulation"]
result: "≈24% higher harmonic-mean IPC: 1.66 → 2.054 · 31.97 KB predictor"
visual: "predictor"
image: "/assets/value-predictor-architecture.png"
imageAlt: "Hybrid value predictor block diagram with stride and tagged-history tables, prediction queue, provider selection, and retirement training"
benchmarkNote: "Baseline (without value prediction)"
sourceNote: "Source code is private in accordance with course requirements."
links:
  [
    {
      "label": "Project presentation ↓",
      "href": "/assets/value-predictor-slides.pptx",
    },
  ]
---

## Value prediction

A dependent instruction normally waits for its producer to compute a value. A confident value prediction can make that value available earlier, allowing dependent instructions to execute sooner.

The design combines a stride value predictor (SVP), which learns regular changes in an instruction’s results, with VTAGE, a tagged history-based value predictor that learns patterns associated with control-flow context. A value-prediction queue (VPQ) tracks in-flight predictions for training and recovery.

## Architecture

<figure><button class="figure-button" data-zoom aria-label="Enlarge: Hybrid SVP and VTAGE value predictor architecture"><img src="/assets/value-predictor-architecture.png" alt="Instruction addresses and branch history feed stride and VTAGE tables; a 256-entry prediction queue connects prediction selection with retirement training and correction" loading="lazy" width="1844" height="853"></button><figcaption>Hybrid predictor architecture: stride and tagged-history prediction, in-flight bookkeeping, provider selection, and retirement training. Fully confident VTAGE takes priority over SVP. Select image to enlarge.</figcaption></figure>

SVP predicts regular value changes using the retired value, stride, and number of in-flight instances of an instruction. VTAGE searches tables with different history lengths to distinguish value patterns arising in different control-flow contexts. The history register records conditional-branch outcomes, excluding unconditional branches and other instructions.

## Pipeline integration

<div class="stepper"><div class="mini-label" style="margin-bottom:15px">Explore the pipeline</div><div class="step-tabs"><button data-step="0" aria-pressed="true">1. Rename</button><button data-step="1" aria-pressed="false">2. Dispatch</button><button data-step="2" aria-pressed="false">3. Execute</button><button data-step="3" aria-pressed="false">4. Retire</button></div><div aria-live="polite"><h3 id="step-title">Rename: predict and checkpoint</h3><p id="step-body">During register renaming, the predictor uses the instruction address and recent conditional-branch history to search the stride and tagged-history tables. It records the speculative history and prediction-queue position needed for recovery.</p></div></div>

### Prediction and checkpointing

During register renaming, the predictor uses the instruction address and recent conditional-branch history to search the stride and tagged-history tables. It records the speculative history and prediction-queue position needed for recovery.

### Provider selection

The matching VTAGE table with the longest history supplies the primary prediction. A shorter-history match or the stride predictor supplies an alternate. A fully confident VTAGE prediction takes priority over SVP; otherwise a confident SVP prediction can be used.

### Speculative forwarding

At dispatch, a sufficiently confident predicted result is written into the instruction’s destination physical register and marked available. Dependent instructions can execute before the producer computes its actual result.

### Validation

Once the actual result is available, the simulator compares it with the prediction. Incorrect predictions trigger recovery so instructions that consumed the wrong value do not commit incorrect results.

### Recovery

A branch rollback restores checkpointed history and rewinds the prediction queue, undoing wrong-path SVP instance counts. Full recovery clears in-flight prediction bookkeeping and restores committed history.

### Training

Retirement updates stride information, confidence, and permanent table state using committed instructions.

## Confidence and table management

### Train by instruction type

Loads and floating-point operations train confidence more readily than generic arithmetic and logic (ALU) operations. After a correct prediction, the stochastic gates for increasing confidence are one-in-two for loads/FP and one-in-eight for generic ALU operations. These probabilistic updates make the confidence counter a trust signal rather than a count of consecutive correct predictions.

An incorrect ALU prediction resets confidence, while memory and floating-point predictions receive a smaller penalty. This allows recurring patterns to regain confidence without treating every instruction class identically.

### Allocate where context helps

A correct SVP alternate can block redundant VTAGE allocation. VTAGE usefulness tracks whether its provider adds value compared with the alternate, preserving entries that contribute distinct predictions.

ALU allocation is throttled to one-in-sixteen, while loads and floating-point operations receive priority. Allocation pressure ages usefulness bits through a global counter so stale entries can be replaced.

### Retain a 256-entry queue

Increasing VPQ capacity from 256 to 300 entries produced minimal IPC gains. I retained 256 entries to reserve capacity for VTAGE within the 32 KB budget.

## Performance and storage

<div class="metrics"><div class="metric"><strong>≈24%</strong><span>higher harmonic-mean IPC</span></div><div class="metric"><strong>2.054</strong><span>final harmonic-mean IPC</span></div><div class="metric"><strong>31.97 KB</strong><span>storage · 32 KB budget</span></div></div>

<figure class="bar-chart" aria-label="Harmonic-mean IPC: baseline without value prediction 1.66; final hybrid 2.054. Bars start at zero."><div class="eyebrow">Harmonic-mean instructions per cycle · bars start at zero</div><div class="bar-row">Baseline (without value prediction)<div style="width:75.45%">1.660</div></div><div class="bar-row">Final SVP + VTAGE<div style="width:93.36%">2.054</div></div><figcaption>The hybrid achieved 2.054 harmonic-mean IPC versus 1.66 without value prediction, an approximately 24% improvement.</figcaption></figure>

Compared with the stride-only predictor, harmonic-mean IPC increased from 2.02 to 2.054, approximately 1.7%.

### Benchmark examples

The benchmark examples are from the <a href="https://www.spec.org/cpu2006/CINT2006/" target="_blank" rel="noopener noreferrer">SPEC CPU2006 integer benchmark suite</a>:

- <a href="https://www.spec.org/cpu2006/Docs/400.perlbench.html" target="_blank" rel="noopener noreferrer">400.perlbench</a>, a Perl interpreter workload, increased from 5.01 to 5.63 IPC, approximately 12.4%.
- <a href="https://www.spec.org/cpu2006/Docs/429.mcf.html" target="_blank" rel="noopener noreferrer">429.mcf</a>, a vehicle-scheduling workload based on minimum-cost network flow, increased from 0.82 to 1.67 IPC, approximately 104%.

### Final configuration

- **SVP:** 1,024 entries, 10-bit tags, and a confidence ceiling of 47.
- **VTAGE:** five tables with 256 entries each, 11-bit tags, conditional-branch histories spanning 3 to 54, and a confidence ceiling of 63.
- **VPQ:** 256 in-flight prediction entries.
- **Storage:** 31.97 KB total within a 32 KB budget.

## Implementation summary

I implemented the prediction path, speculative register forwarding, result validation, recovery bookkeeping, and retirement-time training, then tuned provider selection, confidence, and table allocation together with the simulator’s storage configuration.

Predicting a value can let dependent instructions run sooner, but an incorrect prediction forces the processor to discard speculative work and recover. I tuned when predictions were trusted and which predictor supplied them so the time saved by correct predictions outweighed the cost of recovery.

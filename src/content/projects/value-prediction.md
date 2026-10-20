---
slug: "value-prediction"
order: 1
title: "Hybrid SVP + VTAGE Value Predictor"
cardTitle: "Hybrid Value Predictor"
category: "Computer architecture"
summary: "A hybrid value predictor that lets dependent instructions execute before their inputs are computed, with validation and recovery across an out-of-order simulator."
description: "Placed 2nd out of 60 teams in a graduate-level competition with a hybrid value predictor delivering approximately 24% higher IPC within a 32 KB budget."
role: "Predictor architecture, design, implementation, and evaluation"
context: "Graduate architecture project · Jan–Apr 2026"
technology: "C++ · SVP · VTAGE"
tags: ["C++", "SVP + VTAGE", "Simulation"]
result: "2nd of 60 teams · ≈24% higher harmonic-mean IPC: 1.66 → 2.054"
visual: "predictor"
image: "/assets/value-predictor-architecture.png"
imageAlt: "Hybrid value predictor block diagram with stride and tagged-history tables, prediction queue, provider selection, and retirement training"
benchmarkNote: "Graduate-level competition · 31.97 KB predictor · Baseline without value prediction"
sourceNote: "Source code is private in accordance with course requirements."
links:
  [
    {
      "label": "Project presentation ↓",
      "href": "/assets/value-predictor-slides.pptx",
    },
  ]
---

## Competition outcome

Our project placed **2nd out of 60 teams** in a graduate-level value-prediction competition, with additional recognition for exploring a novel approach. The hybrid achieved **2.054 harmonic-mean IPC**, approximately **24% higher** than the 1.66 baseline without value prediction, within a **32 KB predictor budget**.

## My contribution

In this two-person project, I designed the hybrid predictor, implemented its integration across the simulator pipeline, and conducted the experiments that guided provider selection, confidence training, and storage allocation.

## Value prediction

A dependent instruction normally waits for its producer to compute a value. A confident value prediction can make that value available earlier, allowing dependent instructions to execute sooner.

The design combines a stride value predictor (SVP), which learns regular changes in an instruction’s results, with VTAGE, a tagged history-based value predictor that learns patterns associated with control-flow context. A value-prediction queue (VPQ) tracks in-flight predictions for training and recovery.

## Architecture

<figure><button class="figure-button" data-zoom aria-label="Enlarge: Hybrid SVP and VTAGE value predictor architecture"><img src="/assets/value-predictor-architecture.png" alt="Instruction addresses and branch history feed stride and VTAGE tables; a 256-entry prediction queue connects prediction selection with retirement training and correction" loading="lazy" width="1844" height="853"></button><figcaption>Hybrid predictor architecture: stride and tagged-history prediction, in-flight bookkeeping, provider selection, and retirement training. Fully confident VTAGE takes priority over SVP. Select image to enlarge.</figcaption></figure>

SVP predicts regular value changes using the retired value, stride, and number of in-flight instances of an instruction. VTAGE searches tables with different history lengths to distinguish value patterns arising in different control-flow contexts. The history register records conditional-branch outcomes, excluding unconditional branches and other instructions.

## Pipeline integration

I integrated value prediction into an existing RISC-V out-of-order simulator, connecting prediction, early operand availability, result validation, committed training, and recovery. Explore the complete instruction path below, including both rename sub-stages and the existing front end and scheduler.

<div class="stepper"><div class="mini-label" style="margin-bottom:15px">Full pipeline and recovery</div><div class="step-tabs pipeline-tabs" role="group" aria-label="Instruction stages and recovery"><button data-step="0" aria-pressed="false" aria-controls="pipeline-detail">1. Fetch</button><button data-step="1" aria-pressed="false" aria-controls="pipeline-detail">2. Decode</button><button data-step="2" aria-pressed="false" aria-controls="pipeline-detail">3. Rename 1</button><button data-step="3" aria-pressed="true" aria-controls="pipeline-detail">4. Rename 2</button><button data-step="4" aria-pressed="false" aria-controls="pipeline-detail">5. Dispatch</button><button data-step="5" aria-pressed="false" aria-controls="pipeline-detail">6. Schedule</button><button data-step="6" aria-pressed="false" aria-controls="pipeline-detail">7. Register read</button><button data-step="7" aria-pressed="false" aria-controls="pipeline-detail">8. Execute</button><button data-step="8" aria-pressed="false" aria-controls="pipeline-detail">9. Writeback</button><button data-step="9" aria-pressed="false" aria-controls="pipeline-detail">10. Retire</button><button data-step="10" aria-pressed="false" aria-controls="pipeline-detail">Recovery</button></div><div id="pipeline-detail" aria-live="polite"><h3 id="step-title">Rename 2: predict and checkpoint</h3><p id="step-body">I integrated stride and tagged-history lookup with register renaming, provider selection, and in-flight prediction tracking. Branch checkpoints capture speculative history and the prediction-queue position so later recovery can undo wrong-path work.</p></div></div>

The implementation also extends shared instruction metadata and register-management state to carry predictions, checkpoint positions, and misprediction flags across stages. The value-prediction queue connects speculative execution with retirement-time training, while recovery must keep that queue, register readiness, stride instance counts, and branch history consistent.

## Predictor design changes

Building on stride prediction and tagged-history research, I introduced three changes to how the two predictors cooperate:

- **VTAGE priority at full confidence:** A fully confident history-based prediction takes priority over SVP. Until VTAGE reaches that confidence, a confident stride prediction can supply the result. This keeps both simple stride patterns and context-dependent patterns useful.
- **SVP alternate as an allocation veto:** I carried the stride prediction alongside the VTAGE provider. When that alternate is correct, it blocks redundant VTAGE allocation, reserving history-table capacity for patterns that SVP cannot already predict.
- **Protection against SVP aliasing:** When a fully confident VTAGE provider correctly predicts an instruction, I prevent that instruction from replacing a different SVP entry at the same index. This protects established stride patterns from unnecessary eviction.

These changes were evaluated alongside instruction-aware confidence training, allocation throttling, conditional-branch-only history, and predictor sizing.

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

## Design tradeoff

Predicting a value can let dependent instructions run sooner, but an incorrect prediction forces the processor to discard speculative work and recover. I tuned when predictions were trusted and which predictor supplied them so the time saved by correct predictions outweighed the cost of recovery.

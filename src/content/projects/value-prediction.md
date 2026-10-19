---
slug: "value-prediction"
order: 1
title: "Hybrid SVP + VTAGE Value Predictor"
cardTitle: "Hybrid Value Predictor"
category: "Computer architecture"
summary: "A hybrid SVP + VTAGE predictor integrated across an out-of-order pipeline, from speculative forwarding to recovery."
description: "A hybrid SVP + VTAGE value predictor integrated across an out-of-order simulator under a 32 KB storage budget."
role: "Primary implementation across the prediction pipeline"
context: "Graduate architecture project · Jan–Apr 2026"
technology: "C++ · SVP · VTAGE"
tags: ["C++", "SVP + VTAGE", "Simulation"]
result: "32 KB budget · Full pipeline integration"
visual: "predictor"
image: ""
imageAlt: ""
benchmarkNote: ""
links:
  [
    {
      "label": "Project presentation ↓",
      "href": "/assets/value-predictor-slides.pptx",
    },
  ]
---

## Value prediction

A dependent instruction normally waits for its producer to compute a value. A confident value prediction can make that value available earlier, exposing parallelism that would otherwise remain blocked.

I implemented the hybrid value-prediction project across the simulator pipeline: prediction, speculative injection, validation, recovery, and training. The design combines a stride value predictor (SVP) with history-based VTAGE tables.

## Pipeline integration

<div class="stepper"><div class="mini-label" style="margin-bottom:15px">Explore the pipeline</div><div class="step-tabs"><button data-step="0" aria-pressed="true">1. Rename</button><button data-step="1" aria-pressed="false">2. Dispatch</button><button data-step="2" aria-pressed="false">3. Execute</button><button data-step="3" aria-pressed="false">4. Retire</button></div><div aria-live="polite"><h3 id="step-title">Rename: find a prediction</h3><p id="step-body">The predictor combines the instruction PC with folded branch history to look up VTAGE providers. It also snapshots history and the prediction-queue position for recovery.</p></div></div>

The key integration point is dispatch. A confident prediction is written into the physical register file, and the destination is marked ready. Dependent instructions can then wake up and execute before the producer finishes.

That early execution creates a recovery obligation. Actual results must be checked, incorrect speculation must be squashed, and branch recovery must unwind wrong-path predictor state.

### Rename: lookup and checkpointing

The prediction path calls `pipeline_t::value_predict()`. Folded global branch history is XORed with the instruction PC to construct VTAGE indices and tags. Tables are searched from longest history to shortest to identify a provider and an alternate. Each instruction captures the current history and value-prediction queue tail for branch recovery.

### Dispatch: speculative forwarding

When `v_pred` indicates a confident prediction, dispatch writes the predicted value through `REN->write` and marks the physical register ready with `REN->set_ready`. This changes the dependency timing: consumers can issue before the actual producer finishes.

### Execute: verification and value recovery

The computed result is compared with the predicted value. A mismatch causes the physical register to be overwritten with the correct result and a value-misprediction flag to trigger the squash path. Consumers that used incorrect speculative data must be recovered.

### Branch recovery: undo wrong-path state

On a branch misprediction, the writeback recovery path walks the value-prediction queue backward to the checkpointed tail. It decrements SVP instance counters for wrong-path speculative matches, preventing discarded instructions from corrupting the stride baseline.

### Retirement: committed training

Confidence and permanent table allocation updates occur at retirement. Speculative bookkeeping supports early prediction, while committed training is restricted to correct-path instructions.

## Confidence and table management

### Choose the provider carefully

The hybrid combines the strengths of stride and history-based prediction. A proven, maximum-confidence VTAGE provider can take precedence; SVP remains useful while the history predictor establishes confidence.

### Train selectively

Confidence training depends on instruction type. Loads and floating-point operations have a one-in-two chance of incrementing confidence, while generic ALU operations are throttled to one-in-eight. Confidence and allocation training occur at retirement on correct-path work.

### Make penalties asymmetric

An incorrect ALU prediction resets confidence, whereas memory operations receive a softer penalty. The distinction allows patterns that restabilize to recover without treating every instruction class identically.

### Keep tables reusable

When allocation into a longer-history VTAGE table fails because entries remain useful, a global TICK counter records the pressure. Once it exceeds 512, usefulness bits decay so stale entries can be replaced. This keeps the finite table budget available to changing patterns.

## Performance and storage

The project presentation compares pure SVP with the hybrid design. Harmonic-mean IPC increases from 2.02 to 2.051, approximately 1.5%. These are presentation-reported simulation results.

<figure class="bar-chart" aria-label="Harmonic mean IPC: pure SVP 2.02, hybrid SVP and VTAGE 2.051. Bars start at zero."><div class="eyebrow">Harmonic-mean instructions per cycle · zero baseline</div><div class="bar-row">Pure SVP<div style="width:91.82%">2.020</div></div><div class="bar-row">SVP + VTAGE<div style="width:93.23%">2.051</div></div></figure>

The presentation documents five VTAGE tables with 256 entries each, branch-history lengths spanning 3 to 48, and 11-bit tags. SVP uses 1,024 entries and 10-bit tags; the value-prediction queue holds 256 entries. Confidence limits are 47 for SVP and 63 for VTAGE.

Within the 32 KB budget, the rounded storage breakdown is 19.03 KB for SVP and 12.97 KB for VTAGE.

<div class="storage" aria-label="SVP 19.03 KB, VTAGE 12.97 KB"><span style="width:59.47%">SVP · 19.03 KB</span><span style="width:40.53%">VTAGE · 12.97 KB</span></div>

<p class="note">This is a simulator implementation. The aggregate chart uses the retained project presentation; it does not represent a new benchmark run.</p>

## Implementation summary

I implemented the prediction path, speculative register injection, result validation, recovery bookkeeping, and retirement-time training. The project presentation records exploration of more than 50 configurations across three codebases.

The central tradeoff was between issuing more useful work early and paying for incorrect speculation. Provider selection, confidence gates, and allocation policy all affect that balance, so I evaluated the predictor as part of the pipeline rather than as an isolated lookup mechanism.

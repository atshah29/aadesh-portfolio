---
slug: "cpp-optimizer"
order: 2
title: "C++ Optimize Assistant"
cardTitle: "C++ Optimize Assistant"
category: "AI-assisted optimization"
summary: "Upload a C/C++ project and define its workloads. An LLM proposes targeted source edits; the backend compiles, validates, and benchmarks candidates before retaining improvements."
description: "An AI-assisted C/C++ optimization tool that validates source changes and measures their effect on execution time."
role: "Personal project · Full-stack development"
context: "Local C/C++ optimization"
technology: "FastAPI · React · Clang · Docker"
tags: ["C++", "FastAPI / React", "Clang", "Applied AI"]
result: "≈70% average execution-time reduction"
visual: "optimizer"
image: "/assets/optimizer.webp"
imageAlt: "C++ optimizer interface showing a successful compile-only run"
benchmarkNote: "22 custom benchmarks · Apple M4 · Clang -O3 baseline. Rounded average; includes unchanged cases."
links:
  [
    {
      "label": "View source ↗",
      "href": "https://github.com/atshah29/Cpp-optimize-assistant",
    },
  ]
---

## The problem

Generating a plausible optimization is only part of the job. The changed program still needs to build, preserve expected behavior, and run faster under a meaningful workload. Multi-file projects introduce another constraint: the tool must preserve the structure developers already work with.

I built a local workbench that connects model-generated source edits to a controlled build, verification, and measurement loop. Changes are accepted only after validation and performance checks.

<figure><button class="figure-button" data-zoom aria-label="Enlarge: Optimizer interface with file upload, configuration, and a successful compile-only result"><img src="/assets/optimizer.webp" alt="Optimizer interface with file upload, configuration, and a successful compile-only result" loading="lazy" width="1200" height="800"></button><figcaption>The application interface after a compile-only run. The screen shows the build workflow. Select image to enlarge.</figcaption></figure>

## Optimization workflow

<div class="flow"><div><b>01</b><span>Upload a source file or ZIP and define build settings and representative workloads.</span></div><div><b>02</b><span>Compile and validate the original project, then measure baseline performance.</span></div><div><b>03</b><span>Select source context using Clang AST locations and optional profiling, alongside workload timings and recent attempt feedback.</span></div><div><b>04</b><span>Ask the LLM to propose targeted source edits in a structured response.</span></div><div><b>05</b><span>Apply valid exact-match edits to a temporary copy of the current best project.</span></div><div><b>06</b><span>Compile the candidate, check behavior on supplied workloads, and repeatedly compare performance with the current best.</span></div><div><b>07</b><span>Retain accepted improvements and provide rejection feedback to later attempts.</span></div><div><b>08</b><span>Confirm the retained version against the original. Restore the original if confirmation fails, and return the project, diff, and report.</span></div></div>

### Request and job handling

The React interface submits a job to FastAPI and polls for progress. A sequential background executor coordinates jobs to reduce benchmark interference. Job state is saved locally as JSON, with cancellation and report-download routes.

### Source context and model proposals

libclang provides symbol names and source locations. The context selector includes complete files when they fit, or selects function ranges, nearby declarations, and referenced helpers within an approximately 8 KB source budget. Optional Callgrind output helps prioritize hotspots; later attempts can rotate through other functions.

The Groq-hosted `openai/gpt-oss-120b` model receives source text, timing/profile information, edit constraints, and recent feedback. It returns structured exact-match edits. The pipeline excludes test sources from editable files and checks configured protected benchmark drivers. The model proposes edits while deterministic backend code controls validation and acceptance. Clang AST information selects source context for the model.

### Candidate lifecycle

The original, current best, and each candidate remain separate copies. Rejected edits never replace the current best; repeated candidate contents are detected to avoid redundant benchmarks. After an accepted change, the pipeline refreshes analysis and profiling while retaining the original output references. It stops after two unsuccessful proposals or when the configured attempt budget ends.

### Execution boundary

The host runner starts a worker inside a temporary Docker container using a reusable toolchain image. Inputs are mounted read-only; the container has no network, drops capabilities, runs as an unprivileged user, and has resource limits. The worker compiles and evaluates the project. Model requests occur separately on the host. Native mode runs the worker directly for trusted local code.

### Final output

A retained improvement is checked again against the original project. If that comparison fails, the pipeline restores the original. The download includes the project, a unified source diff, and a structured report with measurements and proposal history.

## Implementation decisions

### Keep the project intact

Focused edits preserve source files, headers, and multi-file build targets. That makes the output reviewable as a diff instead of an unfamiliar reconstruction.

### Separate suggestions from acceptance

The model cannot declare its own rewrite correct. The backend compiles it, compares stdout, stderr, and declared output files, then evaluates performance against the supplied workload.

### Control the measurement

Warmups and repeated runs alternate baseline/candidate execution order. The worker uses paired bootstrap estimates across workload rounds and requires the lower confidence bound to clear the configured improvement threshold. It also rejects material per-workload regressions and baseline workloads shorter than 5 ms. Profiling runs separately from timing so instrumentation overhead does not become the performance result.

### Make execution an explicit boundary

Restricted Docker workers are the default. Trusted local projects can use native execution. Compile-only and benchmark-only modes run without model calls.

## Evaluation

<div class="metrics"><div class="metric"><strong>≈70%</strong><span>average execution-time reduction</span></div><div class="metric"><strong>22</strong><span>custom optimization benchmarks</span></div><div class="metric"><strong>Clang -O3</strong><span>baseline on Apple M4</span></div></div>

The local Apple M4 evaluation compares optimized candidates against a Clang `-O3` baseline across 22 custom optimization benchmarks. The headline rounds the average reduction to the nearest ten percentage points and includes unchanged cases.

<details class="details"><summary>How the aggregate is calculated</summary><p>The report uses the arithmetic mean of per-benchmark runtime reductions. Each benchmark’s runtime is the sum of its timed-workload medians. Both versions use the same build settings. Compilation and fixture preparation are excluded, while process startup and program I/O are included.</p></details>

### Benchmark coverage

Evaluation includes the custom suite of 22 optimization exercises and a separate subset of five pinned LLVM test-suite programs: arrays (`ary3`), matrices (`matrix`), lists (`lists1`), prime sieve (`sieve`), and heapsort. The LLVM adapter verifies source hashes and upstream reference outputs, protects benchmark drivers from edits, and reports this subset separately from the custom suite. It uses selected inputs and the application’s own evaluation harness.

The approximately 70% headline applies to the 22 custom benchmarks in the local Apple M4 evaluation. The five-program LLVM subset is a separate collection.

<a href="https://github.com/atshah29/Cpp-optimize-assistant/tree/main/benchmarks/llvm" target="_blank" rel="noopener noreferrer">Explore the LLVM subset and evaluation policy ↗</a>

## Validation scope

Matching the supplied outputs is evidence of correct behavior on those workloads, not a proof of equivalence for all inputs. Representative tests and deterministic outputs remain essential.

Implementation references: <a href="https://github.com/atshah29/Cpp-optimize-assistant/blob/main/pipeline.py" target="_blank" rel="noopener noreferrer">pipeline</a>, <a href="https://github.com/atshah29/Cpp-optimize-assistant/blob/main/context.py" target="_blank" rel="noopener noreferrer">context selection</a>, and <a href="https://github.com/atshah29/Cpp-optimize-assistant/blob/main/worker.py" target="_blank" rel="noopener noreferrer">evaluation worker</a>.

The application targets local use with a single API instance. It produces reviewable changes with supporting measurements. Improvements depend on the program and workloads.

---
slug: "bcough"
order: 3
title: "BCough: On-Device Cough Detection"
cardTitle: "BCough"
category: "Embedded machine learning"
summary: "Model development, quantization, and C audio preprocessing for cough detection on the MAX78000."
description: "Bringing model development, quantization, and audio preprocessing together for cough detection on a constrained microcontroller."
role: "Model development · Quantization · C preprocessing"
context: "NC State research · Co-author"
technology: "PyTorch · Embedded C · MAX78000"
tags: ["PyTorch", "Embedded C", "Quantization"]
result: "Published research · 15–16 ms inference"
visual: "bcough"
image: "/assets/bcough-hardware.webp"
imageAlt: "BCough bench prototype with sensing and microcontroller hardware"
benchmarkNote: ""
links:
  [
    {
      "label": "Read the paper ↗",
      "href": "https://doi.org/10.3390/electronics15091912",
    },
    {
      "label": "Quantization tooling ↗",
      "href": "https://github.com/analogdevicesinc/ai8x-synthesis",
    },
  ]
---

## The research problem

On-device cough detection connects several engineering problems: sensing, signal representation, model accuracy, and embedded execution. A model that works in a training environment also has to fit the target hardware and receive the right input representation.

BCough investigates a bone-conduction sensing platform with embedded AI. I worked on model development, quantization using ai8x-synthesis, C mel-spectrogram conversion, and testing to improve model performance.

<figure><button class="figure-button" data-zoom aria-label="Enlarge: BCough sensing, data collection, model training, and embedded inference overview"><img src="/assets/bcough-overview.webp" alt="BCough sensing, data collection, model training, and embedded inference overview" loading="lazy" width="1200" height="800"></button><figcaption>System overview from Sanap et al., BCough, Electronics (2026). The complete platform is a team research contribution. Select image to enlarge.</figcaption></figure>

## Signal processing and deployment

<div class="flow"><div><b>01</b><span>Collect and label wearable sensor signals.</span></div><div><b>02</b><span>Convert audio into model input features.</span></div><div><b>03</b><span>Develop and evaluate the neural network.</span></div><div><b>04</b><span>Quantize and prepare the model for the MAX78000.</span></div><div><b>05</b><span>Integrate embedded preprocessing and test inference.</span></div></div>

My contribution spans the model-to-device boundary. I developed the model and worked on quantization, then implemented mel-spectrogram conversion in C to support embedded audio preprocessing. Testing connected these pieces back to the classification task.

<figure><button class="figure-button" data-zoom aria-label="Enlarge: Waveform, mel spectrogram, delta, and delta-delta feature representations"><img src="/assets/bcough-features.webp" alt="Waveform, mel spectrogram, delta, and delta-delta feature representations" loading="lazy" width="1200" height="800"></button><figcaption>Feature representations explored in the paper. The illustration does not imply that every channel was used in the final deployed configuration. Select image to enlarge.</figcaption></figure>

## Deployment constraints

### Preprocessing is part of the model

Windowing, spectral conversion, and feature formatting determine what the network sees. Implementing the preprocessing in C makes this an embedded systems problem as well as a machine-learning problem.

### Quantization changes the tradeoffs

Model development has to account for reduced-precision execution on the device. The paper’s feature experiments also show why richer representations do not automatically translate into better quantized deployment behavior.

### Evaluate beyond a single split

The paper evaluates across participants using leave-one-subject-out testing. That evaluation asks a different question from accuracy measured on an earlier model-development split.

<figure><button class="figure-button" data-zoom aria-label="Enlarge: BCough sensor, ESP32S3, and MAX78000 bench hardware"><img src="/assets/bcough-hardware.webp" alt="BCough sensor, ESP32S3, and MAX78000 bench hardware" loading="lazy" width="1200" height="800"></button><figcaption>Bench prototype from Sanap et al., BCough, Electronics (2026). Hardware and system results are attributed to the research team. Select image to enlarge.</figcaption></figure>

## Paper-reported results

<div class="metrics"><div class="metric"><strong>0.80</strong><span>macro F1</span></div><div class="metric"><strong>15–16 ms</strong><span>inference latency</span></div><div class="metric"><strong>≈20 μJ</strong><span>on-chip inference energy</span></div></div>

The paper reports 0.81 balanced accuracy, 0.74 cough F1, and 0.89 AUC, alongside the measurements above. Its evaluation includes five participants using leave-one-subject-out testing.

<p class="note">This is a controlled feasibility study. The energy figure covers on-chip inference, not the entire sensing and communication platform.</p>

The results belong to the team’s published system. My individual contribution is the model, quantization, preprocessing, and testing work described here.

## Publication

**BCough: Design and Evaluation of a Bone-Conduction-Embedded AI Platform for On-Device Cough Detection.** Mayur Sanap, Joseph de la Viesca, Aadesh Shah, Sameer Dalal, Jack Twiddy, Michael Daniele, and Edgar Lobaton. _Electronics_, 2026.

[Read the published paper ↗](https://doi.org/10.3390/electronics15091912)

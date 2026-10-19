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
sourceNote: "Research code is private. The published paper describes the model, evaluation, and embedded deployment."
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

BCough investigates on-device cough detection using a wearable bone-conduction sensor and the MAX78000 neural accelerator. The project connects signal representation, model accuracy, quantization, and embedded execution so cough classification can run within the device’s compute and memory limits.

## My contributions

I developed and evaluated CNN models for cough detection, implemented post-training quantization with ai8x-synthesis, and wrote the C audio preprocessing pipeline, including mel-spectrogram generation and multi-channel feature conversion. I also tested the models and embedded pipeline to improve accuracy and deployment reliability.

Working with faculty, I used Google Cloud VMs and parallel multi-seed experiments as part of the research-to-deployment workflow, comparing model and preprocessing choices before embedded testing.

<figure><button class="figure-button" data-zoom aria-label="Enlarge: BCough sensing, data collection, model training, and embedded inference overview"><img src="/assets/bcough-overview.webp" alt="BCough sensing, data collection, model training, and embedded inference overview" loading="lazy" width="1200" height="800"></button><figcaption>System overview from Sanap et al., BCough, Electronics (2026). Select image to enlarge.</figcaption></figure>

## CoughNet architecture

CoughNet is a compact CNN designed for the MAX78000 accelerator. The deployed model takes a single-channel 128 × 128 mel spectrogram through six convolutional layers and a fully connected cough/non-cough classifier. Fused convolution and ReLU operations extract features, with intermediate max-pooling reducing spatial resolution to 8 × 8. Feature channels expand from 16 to 64 and then reduce to 32 and 16 to fit device memory.

<div class="flow" aria-label="CoughNet architecture from the published paper"><div><b>01</b><span>Input: one-channel 128 × 128 mel spectrogram.</span></div><div><b>02</b><span>Convolutions 1–3: extract features and expand channels from 16 to 64.</span></div><div><b>03</b><span>Convolutions 4–6: reduce channels to 32 and 16, producing a 16 × 8 × 8 feature map.</span></div><div><b>04</b><span>Flatten 1,024 features for the fully connected classifier.</span></div><div><b>05</b><span>Output: cough or non-cough.</span></div></div>

The paper describes approximately 57,000 trainable parameters and 8-bit deployment. Model development used ai8x-training; ai8x-synthesis handled quantization and synthesis for the device.

## Signal processing and deployment

<div class="flow"><div><b>01</b><span>Prepare 1-second audio segments sampled at 16 kHz.</span></div><div><b>02</b><span>Generate one-channel 128 × 128 mel-spectrogram inputs.</span></div><div><b>03</b><span>Train and evaluate CoughNet across participants and random seeds.</span></div><div><b>04</b><span>Quantize to 8 bits and synthesize for the MAX78000.</span></div><div><b>05</b><span>Integrate C preprocessing and test embedded inference.</span></div></div>

### Choose features that fit

Richer features must justify their memory cost as well as their quantized accuracy. The two-channel 128 × 128 Mel + delta representation exceeded available memory during preprocessing and CNN input allocation. The final deployment therefore uses a single mel channel, 1-second segments, and 16 kHz sampling.

My multi-channel conversion work supported experiments, including three-channel features. The deployed pipeline uses the single-channel configuration selected for its quantized performance and memory feasibility.

<figure><button class="figure-button" data-zoom aria-label="Enlarge: Waveform, mel spectrogram, delta, and delta-delta feature representations"><img src="/assets/bcough-features.webp" alt="Waveform, mel spectrogram, delta, and delta-delta feature representations explored during development" loading="lazy" width="1200" height="800"></button><figcaption>Feature representations explored in Sanap et al., BCough (2026). The final deployment uses a single-channel mel spectrogram. Select image to enlarge.</figcaption></figure>

### Connect preprocessing to inference

Windowing, spectral conversion, and feature formatting determine the network’s input. I implemented this preprocessing in C and tested it alongside the quantized models, connecting training experiments with device execution.

<figure><button class="figure-button" data-zoom aria-label="Enlarge: BCough sensor, ESP32S3, and MAX78000 bench hardware"><img src="/assets/bcough-hardware.webp" alt="BCough sensor, ESP32S3, and MAX78000 bench hardware" loading="lazy" width="1200" height="800"></button><figcaption>Bench prototype from Sanap et al., BCough, Electronics (2026). Select image to enlarge.</figcaption></figure>

## Published evaluation

<div class="metrics"><div class="metric"><strong>0.80</strong><span>macro F1</span></div><div class="metric"><strong>15–16 ms</strong><span>inference latency</span></div><div class="metric"><strong>≈20 μJ</strong><span>on-chip inference energy</span></div></div>

The paper also reports 0.81 balanced accuracy, 0.74 cough F1, and 0.89 AUC. Leave-one-subject-out evaluation across five participants tested generalization to a participant excluded from training.

<p class="note">The paper reports a controlled feasibility study. The energy figure covers on-chip inference.</p>

## Publication

**BCough: Design and Evaluation of a Bone-Conduction-Embedded AI Platform for On-Device Cough Detection.** Mayur Sanap, Joseph de la Viesca, Aadesh Shah, Sameer Dalal, Jack Twiddy, Michael Daniele, and Edgar Lobaton. _Electronics_, 2026.

<a href="https://doi.org/10.3390/electronics15091912" target="_blank" rel="noopener noreferrer">Read the published paper ↗</a>, including the architecture (§4.1), development pipeline (§4.2), and deployment selection (§6.2).

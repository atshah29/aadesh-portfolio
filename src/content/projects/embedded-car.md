---
slug: "embedded-car"
order: 4
title: "Wireless & Autonomous Embedded Car"
cardTitle: "Wireless & Autonomous Car"
category: "Embedded systems"
summary: "Firmware for an MSP430FR2355 + ESP32 car built to follow a complex examination course, with wireless commands, calibrated sensing, and variable speed control."
description: "An MSP430FR2355 + ESP32 car that moves from wireless driving commands to calibrated, autonomous line-following behavior."
role: "Firmware development · Controls and maneuver modes"
context: "Embedded systems project"
technology: "C · MSP430FR2355 · ESP32 · ADC / DAC"
tags: ["Embedded C", "MSP430", "ESP32", "ADC / DAC"]
result: "Completed the final course on the first attempt"
visual: "car"
image: "/assets/car.webp"
imageAlt: "Embedded car with controllers, motors, and LCD"
benchmarkNote: ""
links: []
---

## Hardware and firmware

I built firmware to guide an MSP430FR2355 + ESP32 car through a final examination course with required checkpoints and complex line-following sections. Wireless command handling, maneuver modes, DAC speed control, PWM motor control, ADC sensor calibration, and LCD feedback supported remote driving and autonomous course navigation.

<figure><button class="figure-button" data-zoom aria-label="Enlarge: Overhead view of the embedded car showing its motors, batteries, microcontroller boards, and LCD"><img src="/assets/car.webp" alt="Overhead view of the embedded car showing its motors, batteries, microcontroller boards, and LCD" loading="lazy" width="1200" height="800"></button><figcaption>The physical build: MSP430FR2355 + ESP32, motor hardware, sensors, and status display. Select image to enlarge.</figcaption></figure>

## Control architecture

<div class="flow"><div><b>01</b><span>Wireless commands enter the command-processing path.</span></div><div><b>02</b><span>The MSP430 selects an operating mode and movement sequence.</span></div><div><b>03</b><span>Timer coordination, DAC settings, and PWM outputs control motion.</span></div><div><b>04</b><span>ADC readings from the line detectors guide autonomous corrections.</span></div><div><b>05</b><span>The LCD reports operating state and progress.</span></div></div>

The firmware initializes GPIO, clocks, timers, ADC, DAC, serial interfaces, and the LCD. A foreground loop coordinates state with timer and interrupt activity.

## Manual and autonomous modes

### Direct and timed commands

Forward, reverse, turning, and rotation primitives support manual driving and timed command sequences. Three speed settings are backed by DAC control, alongside PWM motor outputs.

### Autonomous maneuvers

The line-following sequence includes approach, line interception, alignment, circular-path following, and exit. When the line is lost, recovery behavior attempts to reacquire it rather than continuing the normal tracking state.

### Feedback at the vehicle

LCD updates expose the current operating state, helping connect commands and sensor behavior to what the vehicle is doing.

## Sensor calibration

Raw sensor values need interpretation. The firmware samples left and right detectors through the ADC and calibrates against black and white surfaces, using averaged measurements to establish detection thresholds.

Keeping wheel-control primitives separate from higher-level maneuver states makes the autonomous sequence easier to reason about. Motor outputs are stopped before new directional settings are applied, and PWM values are capped.

The implementation uses a foreground loop and interrupts, with blocking delays in parts of the maneuver sequence. It is not an RTOS implementation.

## Project outcome

The car completed the final examination course on its first attempt, earning bonus points for first-attempt completion. It reached the required checkpoints, displayed course-progress information on the LCD, and followed a black line through a curved track with loops and complex sections.

I repeatedly tested and tuned the vehicle before the exam, calibrating its sensors and adjusting tracking behavior to improve reliability. The most demanding part was maintaining line tracking through the complex course, where sensor thresholds and movement corrections had to work together consistently.

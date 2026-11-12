// Short explanations of the existing case studies, shared by the hero controls.
export const featuredProjects = {
  'value-prediction': {
    value: '2', unit: 'nd', caption: 'out of 60 teams', context: 'Graduate-level competition',
    result: '≈24% higher harmonic-mean IPC', left: 'SVP + VTAGE', right: '31.97 / 32 KB',
    labels: ['Predicted values let dependents execute early'],
    steps: [
      { label: 'Predict', caption: 'A confident value enters the pipeline', text: 'Stride and branch-history predictors offer candidate values. A fully confident VTAGE prediction takes priority; otherwise, a confident stride prediction can supply the result.' },
      { label: 'Execute early', caption: 'Dependent ready · producer still running', text: 'The predicted value makes an operand available before its producer finishes, allowing dependent instructions to execute earlier.' },
      { label: 'Verify', caption: 'Check the result, then retire safely', text: 'Execution checks the prediction against the actual result. A mismatch triggers recovery; retirement trains the predictors and prevents incorrect consumers from committing.' },
    ],
  },
  'cpp-optimizer': {
    value: '≈70', unit: '%', caption: 'average runtime reduction', context: '22 custom benchmarks',
    result: 'LLM proposals, validated improvements', left: 'Apple M4 · Clang -O3', right: '22 custom benchmarks',
    labels: ['Analyze', 'Propose', 'Validate'],
    steps: [
      { label: 'Analyze', caption: 'Source context + workload evidence', text: 'Clang AST locations guide source-context selection. Workload timings, optional profiling, and recent attempt feedback help focus the next proposal.' },
      { label: 'Propose', caption: 'A focused edit, applied to a separate copy', text: 'The LLM proposes structured source edits. Valid exact-match edits are applied to a temporary copy, preserving the original and the current best version.' },
      { label: 'Validate', caption: 'Build → check outputs → measure', text: 'The backend builds each candidate, checks outputs on supplied workloads, and measures performance before retaining an improvement. Rejected edits leave the current best intact.' },
    ],
  },
  bcough: {
    value: '15–16', unit: 'ms', caption: 'inference latency', context: 'MAX78000 on-device CNN',
    result: 'Published research · On-device cough detection', left: '8-bit CoughNet', right: '0.80 macro F1',
    labels: ['Audio', 'Mel spectrogram', 'CNN'],
    steps: [
      { label: 'Audio', caption: 'One-second segments · 16 kHz', text: 'Audio from a bone-conduction sensor is prepared as one-second segments sampled at 16 kHz for on-device cough detection.' },
      { label: 'Features', caption: 'C preprocessing → mel spectrogram', text: 'C preprocessing converts the audio into mel-spectrogram features. The final deployment uses a single 128 × 128 mel channel from the implemented preprocessing pipeline.' },
      { label: 'CNN', caption: '8-bit CoughNet → cough / non-cough', text: 'The quantized CNN classifies the features on the MAX78000. Eight-bit quantization reduced model weight storage by approximately 75%.' },
    ],
  },
  'embedded-car': {
    value: '1', unit: 'st', caption: 'attempt completion', context: 'Final examination course',
    result: 'Wireless control and autonomous line following', left: 'MSP430 + ESP32', right: 'Embedded C',
    labels: ['Sense', 'Correct', 'Follow'],
    steps: [
      { label: 'Sense', caption: 'Read the line position', text: 'Calibrated sensor readings locate the track and provide the feedback used by the line-following algorithm.' },
      { label: 'Calculate turn', caption: 'Calculate the correction strength', text: 'The algorithm calculates turn intensity from sensor readings, avoiding aggressive corrections that could send the vehicle off the track.' },
      { label: 'Adjust', caption: 'Apply the correction and keep following', text: 'Motor adjustments bring the vehicle back toward the line. Wireless commands make speed and correction settings configurable during testing.' },
    ],
  },
};

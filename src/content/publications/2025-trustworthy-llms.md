---
title: "Trustworthy Reasoning in Large Language Models"
authors: ["Jane Doe", "Minh Tran", "Alex Kim"]
year: 2025
date: 2025-09-15
venue: "NeurIPS 2025"
type: "conference"
tags: ["LLMs", "Trustworthy AI"]
featured: true
award: "Oral"
abstract: "Large language models can produce fluent answers while concealing unreliable reasoning. We introduce a framework for evaluating and improving the trustworthiness of step-by-step reasoning, combining process-level supervision with calibrated abstention. Across math, code, and open-domain QA, our method improves answer reliability by 18% while preserving accuracy, and exposes failure modes that standard outcome-only metrics miss."
links:
  arxiv: "https://arxiv.org/abs/0000.00000"
  code: "https://github.com/dream-ai-lab"
---

## Overview

Modern LLMs are optimized for the final answer, not for the reasoning that produces
it. This makes them confidently wrong in ways that are hard to detect. We argue that
**trustworthy reasoning** should be a first-class objective.

## Method

We supervise the reasoning *process* rather than only the outcome, and add a
calibrated **abstention** head that lets the model decline when its intermediate
steps are unreliable. Training uses a mixture of verified traces and synthetic
counterexamples.

## Results

- **+18%** answer reliability at equal accuracy across math, code, and QA.
- Surfaces failure modes invisible to outcome-only evaluation.
- Abstention thresholds transfer across domains with minimal tuning.

## Citation

If you find this work useful, please cite it using the BibTeX entry below.

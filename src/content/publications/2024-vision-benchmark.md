---
title: "A Benchmark for Robust Visual Understanding"
authors: ["Minh Tran", "Sara Lopez"]
year: 2024
date: 2024-06-01
venue: "Journal of Machine Learning Research"
type: "journal"
tags: ["Vision", "Benchmarks"]
abstract: "Vision models often degrade sharply under distribution shift, yet most benchmarks measure accuracy only on clean, in-distribution data. We present RobustVQA, a benchmark that systematically stress-tests visual understanding across corruption, viewpoint, and domain shifts. We evaluate 30 models and find that scale alone does not guarantee robustness, motivating new training and evaluation protocols."
links:
  pdf: "https://example.com/paper.pdf"
  doi: "https://doi.org/10.0000/jmlr.2024"
---

## Overview

Benchmarks shape what the field optimizes for. Today's vision benchmarks reward
in-distribution accuracy, hiding brittleness that shows up in the real world.

## The benchmark

**RobustVQA** spans three axes of shift — corruption, viewpoint, and domain — with
matched clean references so robustness can be measured as a *gap*, not an absolute.

## Findings

- Larger models are not reliably more robust.
- Robustness rankings differ substantially from clean-accuracy rankings.
- Simple augmentation closes only part of the gap.

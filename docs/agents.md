# AGENTS.md

# Nyakizu Digital Platform — AI Development Guide

## Your Role

You are the Lead Software Engineer, Product Designer, UX Designer, HCI Specialist, and Software Architect for the Nyakizu Digital Platform.

Your responsibility is to make this project production-ready.

Never optimize for visual appearance alone.

Optimize for usability, maintainability, performance, accessibility, and trust.

---

# Before Writing Code

Always follow this workflow.

1. Audit the existing implementation.
2. Understand how the frontend connects to the backend.
3. Reuse existing components whenever possible.
4. Preserve existing APIs.
5. Explain your implementation plan before making major architectural changes.
6. Implement incrementally.
7. Verify nothing else breaks.

Never replace working functionality unless there is a clear improvement.

---

# Project Overview

Nyakizu is a Progressive Web App (PWA) connecting wholesalers and retailers.

Primary audience:

- Banyamulenge business community
- Android users
- Mobile-first
- Low-end phones
- Slow internet
- Limited digital literacy

Desktop is secondary.

---

# Core Product Principle

Every screen should answer:

> "What should this user do next?"

Avoid empty dashboards.

Avoid meaningless analytics.

Guide users step by step.

---

# Mobile First

Design for:

- 360px width first
- Large touch targets (minimum 48px)
- One-handed usage
- Large readable typography
- Sticky primary actions
- Minimal typing

Assume 99% of users use phones.

---

# UX Rules

Avoid:

- Generic SaaS dashboards
- AI-generated templates
- Empty tables
- Empty charts
- Technical jargon

Prefer:

- Simple language
- Friendly instructions
- Guided workflows
- Progressive disclosure
- Visual feedback

---

# HCI Rules

Every important action should include:

- icon
- title
- helper text
- confirmation
- success message

Every destructive action requires confirmation.

Never rely only on colour.

---

# Seller Experience

The seller journey is the highest priority.

The Seller Dashboard is a workspace, not an analytics page.

Seller flow:

Registration

↓

Awaiting Approval

↓

Approval Email

↓

Store Setup

↓

Add Products

↓

Receive Orders

↓

Business Summary

Never show analytics before meaningful business data exists.

Always tell sellers what they should do next.

---

# Product Management

Adding products should feel simple.

Prefer:

- image previews
- large buttons
- simple forms
- progress indicators

When there are no products:

Do not display empty tables.

Show:

- illustration
- explanation
- large "Add Product" button

---

# Forms

Forms should:

- be short
- grouped logically
- use persistent labels
- validate immediately
- explain errors in plain language

Avoid placeholder-only labels.

---

# Empty States

Never display:

"No data available."

Instead explain:

- what this page is for
- why it is empty
- what to do next

Always provide a clear primary action.

---

# Loading States

Prefer:

- Skeleton loaders
- Optimistic UI
- Progress indicators

Avoid endless spinners.

---

# Performance

Always optimize for:

- slow internet
- low-memory phones
- lazy loading
- code splitting
- minimal re-renders

Do not introduce unnecessary dependencies.

---

# Accessibility

Support:

- keyboard navigation
- screen readers
- semantic HTML
- high contrast
- clear focus states

Accessibility is mandatory.

---

# Code Quality

Every change must be:

- production-ready
- strongly typed
- reusable
- maintainable
- documented

Avoid:

- duplicated logic
- dead code
- unnecessary abstractions
- hardcoded mock data

---

# Architecture Rules

Never create a new API when an existing one can be extended.

Reuse components before creating new ones.

Do not duplicate business logic.

Keep backend and frontend aligned.

---

# Existing Pages

Preserve existing routing unless explicitly requested.

Existing functionality should continue working after every change.

Always verify:

- authentication
- permissions
- API integration
- responsive behaviour
- loading states
- error handling

---

# Communication

Before major implementation:

1. Audit the existing code.
2. Explain current issues.
3. Explain the proposed solution.
4. Identify reusable components.
5. Implement incrementally.

Do not perform large rewrites without justification.

---

# Goal

Every improvement should make Nyakizu feel like software built specifically for its users—not like a generic admin template.

Prioritize clarity, trust, simplicity, and mobile usability over visual novelty.
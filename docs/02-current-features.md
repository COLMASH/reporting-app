# Chapter 2: Current Features & Capabilities

## 2.1 Overview

This chapter describes what's operational today—features you can use and test right now. Understanding current capabilities helps clarify what remains to complete the MVP.

## 2.2 Secure Authentication

The platform uses NextAuth v5 for authentication with JWT session tokens. When you log in, the system validates your credentials against the backend server, generates an encrypted session token valid for 30 minutes, and manages your access automatically.

The authentication flow protects all dashboard routes. Attempting to access portfolio data without authentication redirects you to the login page. All communication uses HTTPS encryption, and passwords are stored as one-way cryptographic hashes, not plain text.

Session management is automatic—during active use, you stay logged in, but the system logs you out after 30 minutes of inactivity to protect against unauthorized access if you leave your computer unattended.

## 2.3 Excel File Analysis

Upload Excel files through the interface, and the system automatically analyzes the data and generates dashboards with appropriate visualizations. The analysis engine reads spreadsheet contents, identifies data patterns, determines suitable chart types, and creates interactive reports.

Files are stored securely in Supabase cloud storage with proper access controls. You can upload multiple files, track analysis history, and revisit previous results. The system maintains associations between source files and generated analyses.

## 2.4 Portfolio Dashboards

Complete dashboard interfaces are operational with demonstration data. Once connected to your portfolio database (final MVP work), these interfaces will display your actual holdings.

### 2.4.1 Overview Dashboard

Aggregate view of the entire portfolio showing total value, returns, and allocation breakdowns by asset class, geography, and holding entity. The design prioritizes key metrics prominently while providing access to detailed breakdowns.

Charts show asset allocation, performance trends, and distribution across categories. All visualizations are interactive—hover for details, click to filter, and adjust views based on what you want to analyze.

### 2.4.2 Equities Dashboard

Displays stock holdings with valuations, returns, sector allocations, and performance tracking. Shows individual positions with current values and return profiles, highlights sector concentration, and tracks performance at both position and aggregate levels.

The interface handles both long-term equity holdings and actively traded positions with clear presentation of purchase dates, costs, quantities, and current valuations.

### 2.4.3 Commodities Dashboard

Focused on commodity positions with pricing, quantity holdings, and valuations. Handles commodities held through various instruments—direct ownership, ETFs, futures, or structured products with commodity exposure.

Shows performance in both denomination currency and base currency, accounting for currency effects that can be significant in commodity investing.

### 2.4.4 Alternative Investments Dashboard

Handles private equity, hedge funds, real estate, and other non-traditional assets. Tracks current investments and unfunded commitments (capital committed but not yet called), displays metrics like paid-in capital and distributions, and accommodates irregular valuation schedules common in alternative investments.

The dashboard makes clear which values are current versus estimated and when valuations were last updated, recognizing that alternative investment data is often less current than publicly traded securities.

### 2.4.5 Structured Notes Dashboard

Displays structured products with their specialized characteristics: coupon rates and payment schedules, underlying indices and performance relative to strike levels, barrier provisions and protection features, and maturity dates and redemption conditions.

For autocallable notes and other conditional structures, the dashboard shows current index levels relative to trigger points, helping assess the probability of various outcomes.

## 2.5 User Interface

The interface uses a modern design system with semantic color schemes that automatically adapt to light or dark mode based on system preferences. All visualizations use Recharts, providing consistent styling and interactive capabilities across the platform.

The design is fully responsive—layouts adapt intelligently to desktop monitors, laptops, tablets, and smartphones. Charts remain legible, tables reorganize for narrower screens, and controls adjust for touch interaction when appropriate.

Navigation is straightforward with consistent headers, clear dashboard organization, and logical grouping of related functions. The file management section maintains separation from portfolio reporting, recognizing these as distinct capabilities.

## 2.6 Data Visualization

Charts support hover interactions for detailed values, zoom capabilities for focused analysis, and automatic scaling based on data ranges. Color schemes use meaningful conventions (green for positive returns, red for declines) with adequate contrast for accessibility.

Visualizations prioritize clarity—chart elements are sized for readability, axis labels are concise, and legends are clear. The focus is on presenting data accurately and understandably, not decoration.

## 2.7 File Management

The file system displays all uploaded Excel files with metadata (name, upload date, size, analysis status). For each file, you can initiate analyses, view existing results, or delete files no longer needed.

Files store securely in Supabase with automatic backup and encryption. Cloud storage means files are accessible from any location where you access the platform, with no local storage dependencies.

## 2.8 Current Status

Everything described above is operational. The authentication system secures access, the Excel analysis tool processes files and generates dashboards, and the portfolio visualization interfaces render data (currently demonstration data, soon your actual holdings).

You can access the platform today to familiarize yourself with the interface and capabilities. The Excel analysis feature, while perhaps not aligned with regular workflow needs, demonstrates how the system processes data and creates visualizations using the same technology that will drive portfolio reporting.

<!-- ijfw schema:1 codebase-index -->
# Codebase index

Generated: 2026-09-14T04:34:24Z
Root: .

Files: 103

## By file

- `./.agents/AGENTS.md` (42 lines, .md) -- Follow this philosophy throughout every code change, UI layout, and feature refinement:
- `./AGENTS.md` (56 lines, .md) -- ijfw_version: 1.3.2
- `./CLAUDE.md` (33 lines, .md) -- Stack: React / TypeScript
- `./README.md` (410 lines, .md) -- <div align=\"center\">
- `./api/chat.ts` (71 lines, .ts) -- import { VercelRequest, VercelResponse } from '@vercel/node';
- `./api/extract-pdf.ts` (102 lines, .ts) -- import { VercelRequest, VercelResponse } from '@vercel/node';
- `./api/extract.ts` (97 lines, .ts) -- import { VercelRequest, VercelResponse } from '@vercel/node';
- `./api/finance-news.ts` (100 lines, .ts) -- import { VercelRequest, VercelResponse } from '@vercel/node';
- `./api/health.ts` (19 lines, .ts) -- import { VercelRequest, VercelResponse } from '@vercel/node';
- `./api/index.ts` (3 lines, .ts) -- import app from '../server';
- `./docs/superpowers/plans/2026-08-25-routing-migration.md` (620 lines, .md) -- > **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:
- `./lib/taxEngine.js` (183 lines, .js) -- export function calculateHRAExemption(hraReceived, basicSalary, rentPaid, isMetro = false) {
- `./remove-claude.sh` (8 lines, .sh) -- git filter-repo --force --commit-callback '
- `./scratch/test_env.js` (6 lines, .js) -- import dotenv from 'dotenv';
- `./scratch/test_extract.ts` (36 lines, .ts) -- import { GoogleGenAI, Type } from '@google/genai';
- `./scratch/test_fetch.js` (19 lines, .js) -- import fetch from 'node-fetch'; // wait, node 25 has native fetch, but let's just use native fetch first
- `./scratch/test_gemini.ts` (29 lines, .ts) -- import { GoogleGenAI } from '@google/genai';
- `./scratch/test_gemini_pure.js` (29 lines, .js) -- import { GoogleGenAI } from '@google/genai';
- `./scratch/test_headers.js` (59 lines, .js) -- import http from 'http';
- `./scratch/test_headers_direct.js` (33 lines, .js) -- import { GoogleGenAI } from '@google/genai';
- `./scratch/test_pipeline.ts` (73 lines, .ts) -- import handler from '../api/extract';
- `./scratch/test_validation.js` (38 lines, .js) -- import { validateEnvironment } from '../services/ai/googleClient.ts';
- `./server.ts` (403 lines, .ts) -- import express from 'express';
- `./services/ai/googleClient.ts` (287 lines, .ts) -- import { GoogleGenAI } from '@google/genai';
- `./src/App.tsx` (1678 lines, .tsx) -- import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense, useRef } from 'react';
- `./src/components/AIFilingWorkspaceModal.tsx` (479 lines, .tsx) -- import React, { useState, useEffect } from 'react';
- `./src/components/AIReasoningDrawer.tsx` (887 lines, .tsx) -- import React, { useState, useEffect, useRef } from 'react';
- `./src/components/CommandPalette.tsx` (170 lines, .tsx) -- import React, { useState, useEffect } from 'react';
- `./src/components/CountUp.tsx` (31 lines, .tsx) -- import React, { useState, useEffect } from 'react';
- `./src/components/DeductionCard.tsx` (1405 lines, .tsx) -- import React from 'react';
- `./src/components/DocumentVault.tsx` (925 lines, .tsx) -- import React, { useState, useEffect } from 'react';
- `./src/components/ErrorBoundary.tsx` (79 lines, .tsx) -- import React, { Component, ErrorInfo, ReactNode } from 'react';
- `./src/components/ExtractionConfirm.tsx` (621 lines, .tsx) -- import React from 'react';
- `./src/components/FilingGuide.tsx` (602 lines, .tsx) -- import React, { useState, useEffect } from 'react';
- `./src/components/FilingReviewCard.tsx` (365 lines, .tsx) -- import React from 'react';
- `./src/components/GenerateReturnCard.tsx` (185 lines, .tsx) -- import React from 'react';
- `./src/components/GlowBorder.tsx` (165 lines, .tsx) -- import React from 'react';
- `./src/components/HeroSection.tsx` (607 lines, .tsx) -- import React, { useState, useEffect, useRef, useMemo } from 'react';
- `./src/components/HistoryArchive.tsx` (957 lines, .tsx) -- import React from 'react';
- `./src/components/LandingPage.tsx` (617 lines, .tsx) -- import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
- `./src/components/RegimeComparison.tsx` (500 lines, .tsx) -- import React, { useState, useMemo, useCallback } from 'react';
- `./src/components/SmartDocumentChecklist.tsx` (524 lines, .tsx) -- import React, { useState, useMemo, useRef, useCallback } from 'react';
- `./src/components/VisualTaxBreakdown.tsx` (344 lines, .tsx) -- import React, { useState, useMemo } from 'react';
- `./src/components/WhatIfSimulatorModal.tsx` (644 lines, .tsx) -- import React, { useState, useMemo } from 'react';
- `./src/components/WorkspaceSelection.tsx` (615 lines, .tsx) -- import React, { useState, useEffect } from 'react';
- `./src/components/compliance/FilingDeadlineBar.tsx` (236 lines, .tsx) -- import React, { useState, useEffect, useMemo } from 'react';
- `./src/components/copilot/AICopilot.tsx` (290 lines, .tsx) -- import React, { useState, useEffect, useRef } from 'react';
- `./src/components/dashboard/AIFilingReadinessEngine.tsx` (244 lines, .tsx) -- import React, { useState } from 'react';
- `./src/components/dashboard/CTCEfficiencyScorecard.tsx` (166 lines, .tsx) -- import React, { useMemo } from 'react';
- `./src/components/dashboard/DashboardCommandCenter.tsx` (949 lines, .tsx) -- import React, { useState } from 'react';
- `./src/components/dashboard/DashboardComponents.tsx` (813 lines, .tsx) -- import React, { useState, useRef, useEffect } from 'react';
- `./src/components/export/PDFComputationExporter.tsx` (274 lines, .tsx) -- import React, { useState, useMemo } from 'react';
- `./src/components/landing/ComparisonSection.tsx` (171 lines, .tsx) -- import React from 'react';
- `./src/components/landing/CopilotSection.tsx` (420 lines, .tsx) -- import React, { useState } from 'react';
- `./src/components/landing/DeadlineBanner.tsx` (172 lines, .tsx) -- import React, { useState, useEffect } from 'react';
- `./src/components/landing/FAQSection.tsx` (204 lines, .tsx) -- import React, { useState } from 'react';
- `./src/components/landing/GetStartedSection.tsx` (54 lines, .tsx) -- import React from 'react';
- `./src/components/landing/InteractiveShowcaseSection.tsx` (234 lines, .tsx) -- import React, { useState } from 'react';
- `./src/components/landing/JourneySection.tsx` (207 lines, .tsx) -- import React, { useState, useRef } from 'react';
- `./src/components/landing/LegalSection.tsx` (113 lines, .tsx) -- import React from 'react';
- `./src/components/landing/Navbar.tsx` (297 lines, .tsx) -- import React, { useState, useEffect, useRef } from 'react';
- `./src/components/landing/ProductVideoPlayer.tsx` (858 lines, .tsx) -- import React, { useState, useEffect, useRef, useMemo } from 'react';
- `./src/components/landing/RefundFinderWidget.tsx` (199 lines, .tsx) -- import React, { useState } from 'react';
- `./src/components/landing/SecuritySection.tsx` (129 lines, .tsx) -- import React from 'react';
- `./src/components/landing/ShareSavingsModal.tsx` (118 lines, .tsx) -- import React, { useState } from 'react';
- `./src/components/landing/TippingPointVisualizer.tsx` (176 lines, .tsx) -- import React, { useState } from 'react';
- `./src/components/landing/helpers/AnimatedCounter.tsx` (36 lines, .tsx) -- import React, { useState, useEffect } from 'react';
- `./src/components/landing/helpers/CardSpotlight.tsx` (42 lines, .tsx) -- import React, { useRef, useState } from 'react';
- `./src/components/landing/helpers/CountUp.tsx` (37 lines, .tsx) -- import React, { useState, useEffect, useRef } from 'react';
- `./src/components/landing/helpers/PremiumCard.tsx` (109 lines, .tsx) -- import React, { useState, useRef } from 'react';
- `./src/components/landing/helpers/RollingText.tsx` (30 lines, .tsx) -- import React from 'react';
- `./src/components/landing/helpers/ThinkingDots.tsx` (12 lines, .tsx) -- import React, { useState, useEffect } from 'react';
- `./src/components/landing/index.ts` (14 lines, .ts) -- export { JourneySection } from './JourneySection';
- `./src/components/profile/FamilyProfileSwitcher.tsx` (349 lines, .tsx) -- import React, { useState } from 'react';
- `./src/components/security/SecurityInspectorModal.tsx` (106 lines, .tsx) -- import React from 'react';
- `./src/components/sidebar/CollapseButton.tsx` (35 lines, .tsx) -- import React from 'react';
- `./src/components/sidebar/SearchModal.tsx` (175 lines, .tsx) -- import React, { useEffect, useState, useRef } from 'react';
- `./src/components/sidebar/Sidebar.tsx` (466 lines, .tsx) -- import React, { useEffect, useState, useRef } from 'react';
- `./src/components/sidebar/SidebarGroup.tsx` (52 lines, .tsx) -- import React from 'react';
- `./src/components/sidebar/SidebarHeader.tsx` (154 lines, .tsx) -- import React, { useState, useRef, useEffect } from 'react';
- `./src/components/sidebar/SidebarItem.tsx` (148 lines, .tsx) -- import React from 'react';
- `./src/components/sidebar/Tooltip.tsx` (50 lines, .tsx) -- import React from 'react';
- `./src/components/sidebar/UserProfile.tsx` (89 lines, .tsx) -- import React from 'react';
- `./src/components/sidebar/useSidebarStore.ts` (122 lines, .ts) -- import { create } from 'zustand';
- `./src/components/vault/VaultComponents.tsx` (2543 lines, .tsx) -- import React, { useState, useEffect, useRef } from 'react';
- `./src/config.ts` (37 lines, .ts) -- export const TAX_CONFIG = {
- `./src/hooks/useSessionTimeout.ts` (56 lines, .ts) -- import { useEffect, useState, useRef } from 'react';
- `./src/lib/supabase.ts` (24 lines, .ts) -- import { createClient } from '@supabase/supabase-js';
- `./src/lib/taxEngine.js` (234 lines, .js) -- export function calculateHRAExemption(hraReceived, basicSalary, rentPaid, isMetro = false) {
- `./src/main.tsx` (16 lines, .tsx) -- import {StrictMode} from 'react';
- `./src/routes/stepRoutes.ts` (37 lines, .ts) -- import type { CurrentStep } from '../store/useTaxStore';
- `./src/services/ExportService.ts` (299 lines, .ts) -- import { jsPDF } from 'jspdf';
- `./src/services/GoogleAuthService.ts` (166 lines, .ts) -- export class GoogleAuthService {
- `./src/services/ai/ContextService.ts` (98 lines, .ts) -- import { useTaxStore } from '../../store/useTaxStore';
- `./src/services/ai/ConversationMemory.ts` (38 lines, .ts) -- import { ChatMessageItem } from '../../store/useTaxStore';
- `./src/services/ai/PromptBuilder.ts` (68 lines, .ts) -- import { AIContextPayload } from './ContextService';
- `./src/services/ai/StreamingService.ts` (91 lines, .ts) -- export class StreamingService {
- `./src/store/useTaxStore.ts` (661 lines, .ts) -- import { create } from 'zustand';
- `./src/types.ts` (77 lines, .ts) -- export interface TaxData {
- `./src/utils/audioPool.ts` (57 lines, .ts) -- class AudioPoolManager {
- `./src/utils/taxCalculator.ts` (297 lines, .ts) -- import { TaxData, TaxCalculation, TaxRegimeBreakdown } from '../types';
- `./src/vite-env.d.ts` (1 lines, .ts) -- <empty>
- `./vite.config.ts` (22 lines, .ts) -- import tailwindcss from '@tailwindcss/vite';

## By language
- .tsx: 60
- .ts: 29
- .js: 8
- .md: 5
- .sh: 1

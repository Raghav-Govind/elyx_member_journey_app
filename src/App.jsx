import React, { useMemo, useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, ReferenceArea
} from "recharts";

import { motion } from "framer-motion";
import { Sun, Moon, Search, Upload, MessageSquare, Activity, Users, CalendarDays, Info, Filter } from "lucide-react";

const Card = ({ className = "", children, ...props }) => (
  <div
    {...props}
    className={`bg-white/90 dark:bg-zinc-900/90 rounded-2xl shadow-lg border border-zinc-200/60 dark:border-zinc-800/60 p-4 ${className}`}
  >
    {children}
  </div>
);

const Button = ({ className = "", children, ...props }) => (
  <button className={`px-3 py-2 rounded-2xl shadow bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200/60 dark:border-zinc-700/60 transition ${className}`} {...props}>{children}</button>
);
const Input = ({ className = "", ...props }) => (
  <input className={`w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 outline-none focus:ring-2 ring-zinc-300 dark:ring-zinc-700 border border-zinc-200/60 dark:border-zinc-700/60 ${className}`} {...props} />
);

// --- Synthetic data generators (deterministic; no uploads needed) ---
function inRange(d, s, e) { return d >= s && d <= e; }
function isTravelDay(date, trips) {
  return (trips || []).some(t => inRange(date, new Date(t.start_at), new Date(t.end_at)));
}

function genWearableDaily(startISO, endISO, trips) {
  const start = new Date(startISO), end = new Date(endISO);
  const out = [];
  // slow improvement phases that reflect plan adherence (better HRV & Recovery after certain dates)
  const phase = (day) => {
    if (day >= new Date("2025-04-15")) return { hrvBoost: +2.2, recBoost: +4 };   // after D01 + I0008
    if (day >= new Date("2025-03-20")) return { hrvBoost: +1.2, recBoost: +2 };   // after I0005 trial starts
    return { hrvBoost: 0, recBoost: 0 };
  };
  for (let d = new Date(start), i = 0; d <= end; d.setDate(d.getDate() + 1), i++) {
    const weekly = Math.sin((2 * Math.PI * (i % 7)) / 7);        // weekly rhythm
    const circ = Math.sin(i * 0.12) * 0.6 + Math.cos(i * 0.07) * 0.4; // low-freq mix
    const travelPenalty = isTravelDay(d, trips) ? -3.0 : 0;
    const p = phase(d);

    const baseHRV = 43 + 1.5 * (i / 90);                     // slow upward trend across period
    const hrv = Math.max(32, Math.min(78, baseHRV + 2 * weekly + circ + travelPenalty + p.hrvBoost));
    const recovery = Math.max(30, Math.min(95, 48 + (hrv - 43) * 1.2 + (weekly * 4) + p.recBoost));
    const deep = Math.max(45, Math.min(120, Math.round(65 + (hrv - 43) * 0.9 + Math.cos(i * 0.7) * 8)));
    const rem = Math.max(75, Math.min(150, Math.round(90 + (hrv - 43) * 0.7 + Math.sin(i * 0.6) * 8)));
    const steps = Math.max(2500, Math.min(18000, Math.round(9000 + (hrv - 43) * 110 + Math.cos(i * 0.3) * 3500)));

    out.push({
      date: d.toISOString().slice(0, 10),
      member_id: "M0001",
      HRV_ms: +hrv.toFixed(1),
      recovery_pct: Math.round(recovery),
      deep_sleep_min: deep,
      rem_sleep_min: rem,
      steps
    });
  }
  return out;
}

function genInternalMetrics(startISO, endISO) {
  const start = new Date(startISO), end = new Date(endISO);
  const monday = (d) => { const r = new Date(d); const day = (r.getDay() + 6) % 7; r.setDate(r.getDate() - day); r.setHours(0, 0, 0, 0); return r; };
  const team = [
    ["Ruby", "Concierge/Orchestrator", [3.5, 5.5]],
    ["Dr. Warren", "Medical Strategist", [1.5, 2.8]],
    ["Advik", "Performance Scientist", [1.8, 3.2]],
    ["Carla", "Nutritionist", [1.2, 2.4]],
    ["Rachel", "Physiotherapist", [1.0, 2.2]],
    ["Neel", "Concierge Lead", [1.0, 2.0]],
  ];
  const out = [];
  for (let w = monday(start); w <= end; w.setDate(w.getDate() + 7)) {
    const week = w.toISOString().slice(0, 10);
    team.forEach(([name, role, [lo, hi]], idx) => {
      const t = (w.getTime() / 86400000) + idx * 7; // deterministic
      const frac = (Math.sin(t) + 1) / 2;
      const hours = +(lo + (hi - lo) * frac).toFixed(1);
      out.push({ week_start: week, member_id: "M0001", team_member: name, role, hours });
    });
  }
  return out;
}



// ---- Embedded dataset (no uploads required) ----
const EMBED = (() => {
  const base = {
    member: {
      member_id: "M0001",
      preferred_name: "Rohan Patel",
      dob: "1979-03-12",
      age: 46,
      gender: "Male",
      primary_residence: "Singapore",
      travel_hubs: ["London, UK", "New York, USA", "Seoul, South Korea", "Jakarta, Indonesia"],
      occupation: "Regional Head of Sales (FinTech)",
      assistant: "Sarah Tan",
      chronic_condition: "Autonomic dysfunction (POTS) with occasional elevated BP",
      wearables: ["Garmin"]
    },
    episodes: [
      { episode_id: "E01", title: "Onboarding & Data Consolidation", start_at: "2025-01-15T09:00:00+08:00", end_at: "2025-01-29T09:00:00+08:00", summary: "Kickoff, gather data sources, align goals." },
      { episode_id: "E02", title: "Initial Plans & Wearable Calibration", start_at: "2025-01-30T09:00:00+08:00", end_at: "2025-02-20T09:00:00+08:00", summary: "Baseline exercise/nutrition; calibrate HRV & sleep." },
      { episode_id: "E03", title: "Optimization v2.0 & First Wins", start_at: "2025-02-21T09:00:00+08:00", end_at: "2025-03-14T09:00:00+08:00", summary: "Resolve friction, adopt Zone 2 cadence." },
      { episode_id: "E04", title: "Diagnostics & Course Correction", start_at: "2025-04-10T09:00:00+08:00", end_at: "2025-05-01T09:00:00+08:00", summary: "Quarterly panel + plan adjustments." }
    ],
    trips: [
      { member_id: "M0001", trip_id: "T01", location: "London, UK", start_at: "2025-02-03T08:00:00+08:00", end_at: "2025-02-10T08:00:00+08:00" },
      { member_id: "M0001", trip_id: "T02", location: "New York, USA", start_at: "2025-03-03T08:00:00+08:00", end_at: "2025-03-10T08:00:00+08:00" },
      { member_id: "M0001", trip_id: "T03", location: "Seoul, South Korea", start_at: "2025-04-07T08:00:00+08:00", end_at: "2025-04-14T08:00:00+08:00" }
    ],
    diagnostics: [
      // Anchors for LDL/hsCRP and to tie decisions to outcomes
      { member_id: "M0001", diagnostic_id: "D00", date: "2025-02-12", ApoB: 112, LDL_C: 132, HDL_C: 48, TG: 160, hsCRP: 2.1, Notes: "Baseline prior to plan" },
      { member_id: "M0001", diagnostic_id: "D01", date: "2025-04-15", ApoB: 99, LDL_C: 118, HDL_C: 50, TG: 145, hsCRP: 1.8, Notes: "Quarterly review panel" },
      { member_id: "M0001", diagnostic_id: "D03", date: "2025-05-30", ApoB: 94, LDL_C: 112, HDL_C: 51, TG: 138, hsCRP: 1.6, Notes: "Post-plan follow-up" },
      { member_id: "M0001", diagnostic_id: "D02", date: "2025-07-14", ApoB: 90, LDL_C: 106, HDL_C: 53, TG: 128, hsCRP: 1.4, Notes: "Quarterly review panel" }
    ],

    interventions: [
      {
        member_id: "M0001", intervention_id: "I0001", type: "Exercise",
        title: "Zone 2 + Mobility Block (kickoff)",
        start_at: "2025-01-30", end_at: "2025-02-12", adherence: "inconsistent", status: "completed",
        owner: "Rachel (Physiotherapist)",
        expected: { note: "Improve autonomic tone", metrics: { HRV_ms: { delta: "+4 to +6", window: "14d" } } },
        actual: { metrics: { HRV_ms: { before: 41.5, after: 45.3, delta: +3.8, window: "14d" } }, note: "Partially achieved; inconsistent adherence early." }
      },
      {
        member_id: "M0001", intervention_id: "I0002", type: "Nutrition",
        title: "Omega-3 (TG form) + caffeine cutoff 2PM",
        start_at: "2025-02-01", end_at: "2025-02-28", adherence: "good", status: "completed",
        owner: "Carla (Nutritionist)",
        expected: { note: "Lower LDL-C 5-10 mg/dL in ~6 weeks", metrics: { LDL_C: { delta: "−8", window: "6w" } } },
        actual: { metrics: { LDL_C: { before: 132, after: 118, delta: -14, window: "D00→D01" } }, note: "Better than expected; dietary compliance high." }
      },
      {
        member_id: "M0001", intervention_id: "I0005", type: "Medication",
        title: "Low-dose ARB trial (losartan 25mg)",
        start_at: "2025-03-20", end_at: "2025-04-10", adherence: "good", status: "completed",
        owner: "Dr. Warren (Physician)",
        expected: { note: "Reduce orthostatic symptoms; modest recovery↑", metrics: { recovery_pct: { delta: "+4 to +6", window: "3w" } } },
        actual: { metrics: { recovery_pct: { before: 48, after: 54, delta: +6, window: "trial" } }, note: "Orthostatic episodes ↓ and sleep more consolidated." }
      },
      {
        member_id: "M0001", intervention_id: "I0008", type: "Exercise",
        title: "Zone 2 + Mobility (travel-proof)",
        start_at: "2025-04-10", end_at: "2025-04-23", adherence: "good", status: "completed",
        owner: "Advik (Performance Scientist)",
        expected: { note: "Maintain HRV during travel; reduce dips", metrics: { HRV_ms: { delta: "+2", window: "2w" } } },
        actual: { metrics: { HRV_ms: { before: 44.1, after: 46.0, delta: +1.9, window: "2w" } }, note: "Travel dips smaller vs. February trip." }
      }
    ],
    "chat": [
      // Rachel ↔ Rohan (Physio)
      { "message_id": "R001", "timestamp": "2025-01-29T09:10:00+08:00", "sender_id": "U_Rachel", "sender": "Rachel", "sender_role": "physio", "receiver_id": "M0001", "receiver": "Rohan Patel", "receiver_role": "member", "topic": "Kickoff cardio plan", "text": "Morning Rohan — how are Zone 2 sessions feeling so far?" },
      { "message_id": "R002", "timestamp": "2025-01-29T09:12:00+08:00", "sender_id": "M0001", "sender": "Rohan Patel", "sender_role": "member", "receiver_id": "U_Rachel", "receiver": "Rachel", "receiver_role": "physio", "topic": "Kickoff cardio plan", "text": "A bit tough early; HR spikes sometimes." },
      { "message_id": "R003", "timestamp": "2025-01-29T09:14:00+08:00", "sender_id": "U_Rachel", "sender": "Rachel", "sender_role": "physio", "receiver_id": "M0001", "receiver": "Rohan Patel", "receiver_role": "member", "topic": "Kickoff cardio plan", "text": "Let’s slow cadence and add a 5‑min warmup." },
      { "message_id": "R004", "timestamp": "2025-01-29T09:16:00+08:00", "sender_id": "M0001", "sender": "Rohan Patel", "sender_role": "member", "receiver_id": "U_Rachel", "receiver": "Rachel", "receiver_role": "physio", "topic": "Kickoff cardio plan", "text": "Got it, will try that this evening." },
      { "message_id": "R005", "timestamp": "2025-01-29T09:18:00+08:00", "sender_id": "U_Rachel", "sender": "Rachel", "sender_role": "physio", "receiver_id": "M0001", "receiver": "Rohan Patel", "receiver_role": "member", "topic": "Kickoff cardio plan", "text": "Please add rib‑cage‑down cue and 2×30s decompressions." },
      { "message_id": "R006", "timestamp": "2025-01-29T09:21:00+08:00", "sender_id": "M0001", "sender": "Rohan Patel", "sender_role": "member", "receiver_id": "U_Rachel", "receiver": "Rachel", "receiver_role": "physio", "topic": "Kickoff cardio plan", "text": "Cue helps posture; decompressions feel good." },
      { "message_id": "R007", "timestamp": "2025-01-29T09:25:00+08:00", "sender_id": "U_Rachel", "sender": "Rachel", "sender_role": "physio", "receiver_id": "M0001", "receiver": "Rohan Patel", "receiver_role": "member", "topic": "Kickoff cardio plan", "text": "Great — keep 3×/week; share RPE after each." },
      { "message_id": "R008", "timestamp": "2025-01-29T09:27:00+08:00", "sender_id": "M0001", "sender": "Rohan Patel", "sender_role": "member", "receiver_id": "U_Rachel", "receiver": "Rachel", "receiver_role": "physio", "topic": "Kickoff cardio plan", "text": "Will log RPE 5–6 most days." },
      { "message_id": "R009", "timestamp": "2025-01-29T09:30:00+08:00", "sender_id": "U_Rachel", "sender": "Rachel", "sender_role": "physio", "receiver_id": "M0001", "receiver": "Rohan Patel", "receiver_role": "member", "topic": "Kickoff cardio plan", "text": "If recovery is <50%, do mobility only." },
      { "message_id": "R010", "timestamp": "2025-01-29T09:32:00+08:00", "sender_id": "M0001", "sender": "Rohan Patel", "sender_role": "member", "receiver_id": "U_Rachel", "receiver": "Rachel", "receiver_role": "physio", "topic": "Kickoff cardio plan", "text": "Understood." },

      // Carla ↔ Rohan (Nutrition)
      { "message_id": "C001", "timestamp": "2025-02-03T10:00:00+08:00", "sender_id": "U_Carla", "sender": "Carla", "sender_role": "nutrition", "receiver_id": "M0001", "receiver": "Rohan Patel", "receiver_role": "member", "topic": "Omega‑3 + caffeine cutoff", "text": "Add 2g EPA+DHA; cutoff caffeine at 2pm to help sleep/HRV." },
      { "message_id": "C002", "timestamp": "2025-02-03T10:02:00+08:00", "sender_id": "M0001", "sender": "Rohan Patel", "sender_role": "member", "receiver_id": "U_Carla", "receiver": "Carla", "receiver_role": "nutrition", "topic": "Omega‑3 + caffeine cutoff", "text": "Starting today — any brand you recommend?" },
      { "message_id": "C003", "timestamp": "2025-02-03T10:04:00+08:00", "sender_id": "U_Carla", "sender": "Carla", "sender_role": "nutrition", "receiver_id": "M0001", "receiver": "Rohan Patel", "receiver_role": "member", "topic": "Omega‑3 + caffeine cutoff", "text": "TG form with meals; Nordic Naturals or Carlson are fine." },
      { "message_id": "C004", "timestamp": "2025-02-03T10:07:00+08:00", "sender_id": "M0001", "sender": "Rohan Patel", "sender_role": "member", "receiver_id": "U_Carla", "receiver": "Carla", "receiver_role": "nutrition", "topic": "Omega‑3 + caffeine cutoff", "text": "Ordered; I’ll track LDL in the next panel." },
      { "message_id": "C005", "timestamp": "2025-02-03T10:12:00+08:00", "sender_id": "U_Carla", "sender": "Carla", "sender_role": "nutrition", "receiver_id": "M0001", "receiver": "Rohan Patel", "receiver_role": "member", "topic": "Nutrition plan", "text": "Aim protein 120g/day; bump fiber to ~30g." },
      { "message_id": "C006", "timestamp": "2025-02-03T10:14:00+08:00", "sender_id": "M0001", "sender": "Rohan Patel", "sender_role": "member", "receiver_id": "U_Carla", "receiver": "Carla", "receiver_role": "nutrition", "topic": "Nutrition plan", "text": "Protein may be tight on travel days — I’ll prep." },
      { "message_id": "C007", "timestamp": "2025-02-03T10:17:00+08:00", "sender_id": "U_Carla", "sender": "Carla", "sender_role": "nutrition", "receiver_id": "M0001", "receiver": "Rohan Patel", "receiver_role": "member", "topic": "Nutrition plan", "text": "Travel pack: tins of fish + protein sachets." },
      { "message_id": "C008", "timestamp": "2025-02-03T10:19:00+08:00", "sender_id": "M0001", "sender": "Rohan Patel", "sender_role": "member", "receiver_id": "U_Carla", "receiver": "Carla", "receiver_role": "nutrition", "topic": "Nutrition plan", "text": "Perfect — I’ll pack for London." },
      { "message_id": "C009", "timestamp": "2025-02-03T10:22:00+08:00", "sender_id": "U_Carla", "sender": "Carla", "sender_role": "nutrition", "receiver_id": "M0001", "receiver": "Rohan Patel", "receiver_role": "member", "topic": "Nutrition plan", "text": "Share food pics for 3 days; I’ll review." },
      { "message_id": "C010", "timestamp": "2025-02-03T10:30:00+08:00", "sender_id": "M0001", "sender": "Rohan Patel", "sender_role": "member", "receiver_id": "U_Carla", "receiver": "Carla", "receiver_role": "nutrition", "topic": "Nutrition plan", "text": "Will do." },

      // Dr. Warren ↔ Rohan (Physician)
      { "message_id": "W001", "timestamp": "2025-03-20T08:40:00+08:00", "sender_id": "U_Warren", "sender": "Dr. Warren", "sender_role": "physician", "receiver_id": "M0001", "receiver": "Rohan Patel", "receiver_role": "member", "topic": "Losartan trial", "text": "BP logs show morning spikes; consider losartan 25mg nightly." },
      { "message_id": "W002", "timestamp": "2025-03-20T08:42:00+08:00", "sender_id": "M0001", "sender": "Rohan Patel", "sender_role": "member", "receiver_id": "U_Warren", "receiver": "Dr. Warren", "receiver_role": "physician", "topic": "Losartan trial", "text": "Open to trial — any side effects to watch?" },
      { "message_id": "W003", "timestamp": "2025-03-20T08:44:00+08:00", "sender_id": "U_Warren", "sender": "Dr. Warren", "sender_role": "physician", "receiver_id": "M0001", "receiver": "Rohan Patel", "receiver_role": "member", "topic": "Losartan trial", "text": "Dizziness; hydrate; monitor orthostatic symptoms." },
      { "message_id": "W004", "timestamp": "2025-03-20T08:46:00+08:00", "sender_id": "M0001", "sender": "Rohan Patel", "sender_role": "member", "receiver_id": "U_Warren", "receiver": "Dr. Warren", "receiver_role": "physician", "topic": "Losartan trial", "text": "I’ll take nightly and log symptoms daily." },
      { "message_id": "W005", "timestamp": "2025-03-20T08:55:00+08:00", "sender_id": "U_Warren", "sender": "Dr. Warren", "sender_role": "physician", "receiver_id": "M0001", "receiver": "Rohan Patel", "receiver_role": "member", "topic": "Losartan trial", "text": "Great; recheck BMP in 10–14 days." },
      { "message_id": "W006", "timestamp": "2025-03-24T09:10:00+08:00", "sender_id": "M0001", "sender": "Rohan Patel", "sender_role": "member", "receiver_id": "U_Warren", "receiver": "Dr. Warren", "receiver_role": "physician", "topic": "Losartan trial", "text": "Day 4: fewer head rushes; sleep better." },
      { "message_id": "W007", "timestamp": "2025-03-24T09:12:00+08:00", "sender_id": "U_Warren", "sender": "Dr. Warren", "sender_role": "physician", "receiver_id": "M0001", "receiver": "Rohan Patel", "receiver_role": "member", "topic": "Losartan trial", "text": "Good sign; keep dose; avoid NSAIDs." },
      { "message_id": "W008", "timestamp": "2025-03-24T09:20:00+08:00", "sender_id": "M0001", "sender": "Rohan Patel", "sender_role": "member", "receiver_id": "U_Warren", "receiver": "Dr. Warren", "receiver_role": "physician", "topic": "Losartan trial", "text": "Noted." },
      { "message_id": "W009", "timestamp": "2025-03-24T09:26:00+08:00", "sender_id": "U_Warren", "sender": "Dr. Warren", "sender_role": "physician", "receiver_id": "M0001", "receiver": "Rohan Patel", "receiver_role": "member", "topic": "Losartan trial", "text": "If standing SBP <100 consistently, message me." },
      { "message_id": "W010", "timestamp": "2025-03-24T09:30:00+08:00", "sender_id": "M0001", "sender": "Rohan Patel", "sender_role": "member", "receiver_id": "U_Warren", "receiver": "Dr. Warren", "receiver_role": "physician", "topic": "Losartan trial", "text": "Will do." },
      // Diagnostics (D01) ↔ Rohan
      {
        message_id: "D001",
        timestamp: "2025-04-15T10:00:00+08:00",
        sender_id: "U_Warren", sender: "Dr. Warren", sender_role: "physician",
        receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member",
        topic: "Diagnostics results",
        text: "Panel shows LDL-C 118 (down from 132), ApoB 99, hsCRP 1.8."
      },
      {
        message_id: "D002",
        timestamp: "2025-04-15T10:04:00+08:00",
        sender_id: "M0001", sender: "Rohan Patel", sender_role: "member",
        receiver_id: "U_Warren", receiver: "Dr. Warren", receiver_role: "physician",
        topic: "Diagnostics results",
        text: "Great — that’s reassuring. Let’s keep the nutrition plan."
      },



      // Advik ↔ Rohan (Performance)
      { "message_id": "A001", "timestamp": "2025-04-09T20:05:00+08:00", "sender_id": "U_Advik", "sender": "Advik", "sender_role": "performance", "receiver_id": "M0001", "receiver": "Rohan Patel", "receiver_role": "member", "topic": "Travel‑proof Z2", "text": "We’ll structure Z2 around flights; mobility on low‑recovery days." },
      { "message_id": "A002", "timestamp": "2025-04-09T20:07:00+08:00", "sender_id": "M0001", "sender": "Rohan Patel", "sender_role": "member", "receiver_id": "U_Advik", "receiver": "Advik", "receiver_role": "performance", "topic": "Travel‑proof Z2", "text": "Flying Monday; hotel gym uncertain." },
      { "message_id": "A003", "timestamp": "2025-04-09T20:09:00+08:00", "sender_id": "U_Advik", "sender": "Advik", "sender_role": "performance", "receiver_id": "M0001", "receiver": "Rohan Patel", "receiver_role": "member", "topic": "Travel‑proof Z2", "text": "Use bodyweight circuit; 25 min Z2 via brisk walk." },
      { "message_id": "A004", "timestamp": "2025-04-09T20:12:00+08:00", "sender_id": "M0001", "sender": "Rohan Patel", "sender_role": "member", "receiver_id": "U_Advik", "receiver": "Advik", "receiver_role": "performance", "topic": "Travel‑proof Z2", "text": "Walks near hotel doable." },
      { "message_id": "A005", "timestamp": "2025-04-09T20:16:00+08:00", "sender_id": "U_Advik", "sender": "Advik", "sender_role": "performance", "receiver_id": "M0001", "receiver": "Rohan Patel", "receiver_role": "member", "topic": "Travel‑proof Z2", "text": "Use HR strap; cap RPE at 6 during travel." },
      { "message_id": "A006", "timestamp": "2025-04-09T20:18:00+08:00", "sender_id": "M0001", "sender": "Rohan Patel", "sender_role": "member", "receiver_id": "U_Advik", "receiver": "Advik", "receiver_role": "performance", "topic": "Travel‑proof Z2", "text": "Copy." },
      { "message_id": "A007", "timestamp": "2025-04-09T20:25:00+08:00", "sender_id": "U_Advik", "sender": "Advik", "sender_role": "performance", "receiver_id": "M0001", "receiver": "Rohan Patel", "receiver_role": "member", "topic": "Travel‑proof Z2", "text": "Send Garmin export after the week." },
      { "message_id": "A008", "timestamp": "2025-04-09T20:27:00+08:00", "sender_id": "M0001", "sender": "Rohan Patel", "sender_role": "member", "receiver_id": "U_Advik", "receiver": "Advik", "receiver_role": "performance", "topic": "Travel‑proof Z2", "text": "Will export Friday." },
      { "message_id": "A009", "timestamp": "2025-04-09T20:40:00+08:00", "sender_id": "U_Advik", "sender": "Advik", "sender_role": "performance", "receiver_id": "M0001", "receiver": "Rohan Patel", "receiver_role": "member", "topic": "Travel‑proof Z2", "text": "If red recovery, swap to breathwork + mobility." },
      { "message_id": "A010", "timestamp": "2025-04-09T20:45:00+08:00", "sender_id": "M0001", "sender": "Rohan Patel", "sender_role": "member", "receiver_id": "U_Advik", "receiver": "Advik", "receiver_role": "performance", "topic": "Travel‑proof Z2", "text": "Sounds good." },

      // Ruby ↔ Rohan (Concierge)
      { "message_id": "RB001", "timestamp": "2025-02-15T11:00:00+08:00", "sender_id": "U_Ruby", "sender": "Ruby", "sender_role": "concierge", "receiver_id": "M0001", "receiver": "Rohan Patel", "receiver_role": "member", "topic": "Logistics", "text": "Booked physio slots Tue/Thu 7pm; calendar invites sent." },
      { "message_id": "RB002", "timestamp": "2025-02-15T11:02:00+08:00", "sender_id": "M0001", "sender": "Rohan Patel", "sender_role": "member", "receiver_id": "U_Ruby", "receiver": "Ruby", "receiver_role": "concierge", "topic": "Logistics", "text": "Received, thanks." },
      { "message_id": "RB003", "timestamp": "2025-02-15T11:10:00+08:00", "sender_id": "U_Ruby", "sender": "Ruby", "sender_role": "concierge", "receiver_id": "M0001", "receiver": "Rohan Patel", "receiver_role": "member", "topic": "Travel", "text": "Need lounge access in NY next week?" },
      { "message_id": "RB004", "timestamp": "2025-02-15T11:12:00+08:00", "sender_id": "M0001", "sender": "Rohan Patel", "sender_role": "member", "receiver_id": "U_Ruby", "receiver": "Ruby", "receiver_role": "concierge", "topic": "Travel", "text": "Yes, Terminal 4 if possible." },
      { "message_id": "RB005", "timestamp": "2025-02-15T11:20:00+08:00", "sender_id": "U_Ruby", "sender": "Ruby", "sender_role": "concierge", "receiver_id": "M0001", "receiver": "Rohan Patel", "receiver_role": "member", "topic": "Travel", "text": "Done; also arranging a quiet hotel room." },
      { "message_id": "RB006", "timestamp": "2025-02-15T11:25:00+08:00", "sender_id": "M0001", "sender": "Rohan Patel", "sender_role": "member", "receiver_id": "U_Ruby", "receiver": "Ruby", "receiver_role": "concierge", "topic": "Logistics", "text": "Much appreciated." },
      { "message_id": "RB007", "timestamp": "2025-02-15T11:30:00+08:00", "sender_id": "U_Ruby", "sender": "Ruby", "sender_role": "concierge", "receiver_id": "M0001", "receiver": "Rohan Patel", "receiver_role": "member", "topic": "Sleep", "text": "Daily reminder set for 9:30pm wind‑down." },
      { "message_id": "RB008", "timestamp": "2025-02-15T11:33:00+08:00", "sender_id": "M0001", "sender": "Rohan Patel", "sender_role": "member", "receiver_id": "U_Ruby", "receiver": "Ruby", "receiver_role": "concierge", "topic": "Sleep", "text": "Good addition." },
      { "message_id": "RB009", "timestamp": "2025-02-15T11:36:00+08:00", "sender_id": "U_Ruby", "sender": "Ruby", "sender_role": "concierge", "receiver_id": "M0001", "receiver": "Rohan Patel", "receiver_role": "member", "topic": "Logistics", "text": "Anything else to coordinate?" },
      { "message_id": "RB010", "timestamp": "2025-02-15T11:38:00+08:00", "sender_id": "M0001", "sender": "Rohan Patel", "sender_role": "member", "receiver_id": "U_Ruby", "receiver": "Ruby", "receiver_role": "concierge", "topic": "Logistics", "text": "All good for now." },

      // Neel ↔ Rohan (Lead)
      { "message_id": "N001", "timestamp": "2025-02-18T13:00:00+08:00", "sender_id": "U_Neel", "sender": "Neel", "sender_role": "lead", "receiver_id": "M0001", "receiver": "Rohan Patel", "receiver_role": "member", "topic": "Check‑in", "text": "Quick check‑in: top friction this week?" },
      { "message_id": "N002", "timestamp": "2025-02-18T13:03:00+08:00", "sender_id": "M0001", "sender": "Rohan Patel", "sender_role": "member", "receiver_id": "U_Neel", "receiver": "Neel", "receiver_role": "lead", "topic": "Check‑in", "text": "Late dinners after client meetings." },
      { "message_id": "N003", "timestamp": "2025-02-18T13:05:00+08:00", "sender_id": "U_Neel", "sender": "Neel", "sender_role": "lead", "receiver_id": "M0001", "receiver": "Rohan Patel", "receiver_role": "member", "topic": "Check‑in", "text": "We’ll shift training to mornings and add easy options." },
      { "message_id": "N004", "timestamp": "2025-02-18T13:07:00+08:00", "sender_id": "M0001", "sender": "Rohan Patel", "sender_role": "member", "receiver_id": "U_Neel", "receiver": "Neel", "receiver_role": "lead", "topic": "Check‑in", "text": "Morning works on non‑travel days." },
      { "message_id": "N005", "timestamp": "2025-02-18T13:10:00+08:00", "sender_id": "U_Neel", "sender": "Neel", "sender_role": "lead", "receiver_id": "M0001", "receiver": "Rohan Patel", "receiver_role": "member", "topic": "Check‑in", "text": "Escalated to Carla for meal plan; Rachel to adjust sessions." },
      { "message_id": "N006", "timestamp": "2025-02-18T13:12:00+08:00", "sender_id": "M0001", "sender": "Rohan Patel", "sender_role": "member", "receiver_id": "U_Neel", "receiver": "Neel", "receiver_role": "lead", "topic": "Check‑in", "text": "Thanks." },
      { "message_id": "N007", "timestamp": "2025-02-18T13:20:00+08:00", "sender_id": "U_Neel", "sender": "Neel", "sender_role": "lead", "receiver_id": "M0001", "receiver": "Rohan Patel", "receiver_role": "member", "topic": "Feedback", "text": "How’s the app summaries — useful?" },
      { "message_id": "N008", "timestamp": "2025-02-18T13:22:00+08:00", "sender_id": "M0001", "sender": "Rohan Patel", "sender_role": "member", "receiver_id": "U_Neel", "receiver": "Neel", "receiver_role": "lead", "topic": "Feedback", "text": "Yes, graphs are clear." },
      { "message_id": "N009", "timestamp": "2025-02-18T13:25:00+08:00", "sender_id": "U_Neel", "sender": "Neel", "sender_role": "lead", "receiver_id": "M0001", "receiver": "Rohan Patel", "receiver_role": "member", "topic": "Feedback", "text": "Great. Ping anytime." },
      { "message_id": "N010", "timestamp": "2025-02-18T13:26:00+08:00", "sender_id": "M0001", "sender": "Rohan Patel", "sender_role": "member", "receiver_id": "U_Neel", "receiver": "Neel", "receiver_role": "lead", "topic": "Feedback", "text": "Will do." }
    ],

    rationales: [
      {
        decision_type: "Exercise", decision_id: "I0001", date: "2025-01-30", member_id: "M0001",
        reason_summary: "Improve autonomic tone and mobility foundations; address posture/breathing.",
        evidence_message_ids: ["R001", "R002"] // Rachel ↔ Rohan
      },
      {
        decision_type: "Nutrition", decision_id: "I0002", date: "2025-02-01", member_id: "M0001",
        reason_summary: "Lower LDL-C and support sleep (caffeine cutoff) to aid recovery.",
        evidence_message_ids: ["C001", "C002"] // Carla ↔ Rohan
      },
      {
        decision_type: "Medication", decision_id: "I0005", date: "2025-03-20", member_id: "M0001",
        reason_summary: "Short ARB trial to improve orthostatic symptoms and recovery.",
        evidence_message_ids: ["W001", "W002"] // Dr. Warren ↔ Rohan
      },
      {
        decision_type: "Exercise", decision_id: "I0008", date: "2025-04-10", member_id: "M0001",
        reason_summary: "Maintain HRV during travel; reduce dips via mobility add-ons.",
        evidence_message_ids: ["A001", "A002"] // Advik ↔ Rohan
      },
      {
        decision_type: "Diagnostic", decision_id: "D01", date: "2025-04-15", member_id: "M0001",
        reason_summary: "Quantify risk and track ApoB/LDL-C/hs-CRP changes after interventions.",
        evidence_message_ids: ["D001", "D002"] // Diagnostic results thread
      }
    ]

  };

  // 60 days of wearable + weekly internal metrics
  base.wearable_daily = genWearableDaily("2025-03-01", "2025-05-01", base.trips);
  base.internal_metrics = genInternalMetrics("2025-03-01", "2025-05-01");
  return base;
})();


const fmtDate = (d) => {
  if (!d) return "—";
  // If we were passed a preformatted label, just return it
  if (typeof d === "string" && /\b[a-z]{3,}/i.test(d) && !/^\d{4}-\d{2}-\d{2}/.test(d)) return d;
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return typeof d === "string" ? d : "—";
  return dt.toLocaleDateString();
};
const formatDate = fmtDate;


const parseISODateOnly = (s) => new Date(s + "T00:00:00");

function loadJSONL(text) {
  return text.split(/\n+/).filter(Boolean).map(line => { try { return JSON.parse(line); } catch { return null; } }).filter(Boolean);
}
function simpleSearch(items, q, fields) {
  const Q = q.toLowerCase();
  return items.filter(it => fields.some(f => String(it[f] ?? "").toLowerCase().includes(Q)));
}






function parseWindow(query, fallbackEnd, daysDefault = 30) {
  const q = query.toLowerCase();
  const end = fallbackEnd ?? new Date();
  const m = q.match(/last\s+(\d+)\s*(day|days|week|weeks|month|months)/);
  if (m) {
    const n = parseInt(m[1], 10);
    const unit = m[2];
    const mult = unit.startsWith("day") ? 1 : unit.startsWith("week") ? 7 : 30;
    const d = n * mult;
    const start = new Date(end.getTime() - d * 24 * 3600 * 1000);
    return { start, end };
  }
  const start = new Date(end.getTime() - daysDefault * 24 * 3600 * 1000);
  return { start, end };
}

function answerQuestion(query, ctx) {
  const q = query.trim();
  if (!q) return { text: "Ask me about diagnostics, HRV, adherence, travel, or say ‘Why I0005?’" };
  const lower = q.toLowerCase();
  const idMatch = lower.match(/\b(i\d{3,4}|d\d{2,3})\b/);
  const findDecisionById = (id) => (ctx.interventions || []).find(x => x.intervention_id?.toLowerCase() === id) || (ctx.diagnostics || []).find(x => x.diagnostic_id?.toLowerCase() === id);
  const findRationale = (id) => (ctx.rationales || []).find(r => (r.decision_id || "").toLowerCase() === id);

  if (lower.includes("why") && idMatch) {
    const id = idMatch[1].toUpperCase();
    const dec = findDecisionById(id);
    const rat = findRationale(id);
    if (!dec) return { text: `I couldn’t find a decision ${id}.` };
    const date = dec.date || dec.start_at || dec.end_at;
    return { text: `Decision ${id} on ${fmtDate(date)} — ${rat?.reason_summary || "No rationale available."}`, evidenceIds: rat?.evidence_message_ids || [] };
  }

  if (lower.includes("hrv") || lower.includes("recovery")) {
    const series = ctx.wearable_daily || [];
    if (!series.length) return { text: "No wearable data yet." };
    const lastDate = new Date(series[series.length - 1].date || "2025-04-04");
    const { start, end } = parseWindow(lower, lastDate, 14);
    const inRange = series.filter(x => { const d = new Date(x.date); return d >= start && d <= end; });
    if (!inRange.length) return { text: "No data in that window." };
    const avg = (arr, f) => (arr.reduce((s, a) => s + (+f(a) || 0), 0) / arr.length);
    const hrv = avg(inRange, x => x.HRV_ms).toFixed(1);
    const rec = avg(inRange, x => x.recovery_pct).toFixed(0);
    return { text: `From ${fmtDate(start)} to ${fmtDate(end)}: HRV avg ${hrv} ms; Recovery avg ${rec}%.` };
  }

  if (lower.includes("diagnostic") || lower.includes("apo") || lower.includes("ldl") || lower.includes("crp")) {
    const dx = ctx.diagnostics || []; if (!dx.length) return { text: "No diagnostics yet." };
    const latest = dx[dx.length - 1];
    return { text: `Latest panel (${fmtDate(latest.date)}): ApoB ${latest.ApoB}, LDL-C ${latest.LDL_C}, hs-CRP ${latest.hsCRP}.` };
  }

  const msgs = ctx.chat || [];
  const hits = simpleSearch(msgs, q, ["text", "topic", "sender"]).slice(0, 6);
  if (hits.length) return { text: `Here are ${hits.length} relevant messages:`, hits };
  return { text: "I couldn’t find that. Try: ‘Why I0005’, ‘adherence last month’, ‘travel last 60 days’, or ‘latest diagnostics’." };
}


// ------- Metric defs, ranges, and series helpers -------

// Ranges tweaked by age/gender (simple heuristic for demo)
function rangeHRV(age, gender) {
  const yearsOver25 = Math.max(0, age - 25);
  const lo = Math.max(25, Math.round(40 - yearsOver25 * 0.3));
  const hi = Math.round(80 - yearsOver25 * 0.4);
  return [lo, hi];
}
function rangeRecovery(age) { return [45, 95]; }
function rangeDeepSleep(age) { return [60, 120]; }
function rangeREM(age) { return [80, 150]; }
function rangeSteps(age) { return [7000, 12000]; }
function rangeLDL(age) { return [60, 100]; } // mg/dL
function rangeApoB(age) { return [60, 90]; }
function rangeHDL(age, gender) { return [gender === "Female" ? 50 : 40, 80]; }
function rangehsCRP(age) { return [0.2, 2.0]; } // mg/L

// All 12 metrics (map labels to canonical IDs + ranges)
const METRIC_DEFS = [
  { id: "HRV_ms", label: "HRV (ms)", unit: "ms", src: "wearable", field: "HRV_ms", range: (m) => rangeHRV(m.age, m.gender) },
  { id: "recovery_pct", label: "Recovery (%)", unit: "%", src: "wearable", field: "recovery_pct", range: (m) => rangeRecovery(m.age) },
  { id: "deep_sleep_min", label: "Deep Sleep (min)", unit: "min", src: "wearable", field: "deep_sleep_min", range: (m) => rangeDeepSleep(m.age) },
  { id: "rem_sleep_min", label: "REM Sleep (min)", unit: "min", src: "wearable", field: "rem_sleep_min", range: (m) => rangeREM(m.age) },
  { id: "steps", label: "Steps", unit: "", src: "wearable", field: "steps", range: (m) => rangeSteps(m.age) },

  { id: "HRV_7d", label: "HRV 7d avg", unit: "ms", src: "roll7", field: "HRV_ms", range: (m) => rangeHRV(m.age, m.gender) },
  { id: "REC_7d", label: "Recovery 7d avg", unit: "%", src: "roll7", field: "recovery_pct", range: (m) => rangeRecovery(m.age) },
  { id: "HRV_30d", label: "HRV 30d avg", unit: "ms", src: "roll30", field: "HRV_ms", range: (m) => rangeHRV(m.age, m.gender) },

  { id: "ApoB", label: "ApoB", unit: "", src: "diagn", field: "ApoB", range: (m) => rangeApoB(m.age) },
  { id: "LDL_C", label: "LDL-C", unit: "mg/dL", src: "ldl", field: "LDL_C", range: (m) => rangeLDL(m.age) },
  { id: "HDL_C", label: "HDL-C", unit: "", src: "diagn", field: "HDL_C", range: (m) => rangeHDL(m.age, m.gender) },
  { id: "hsCRP", label: "hs-CRP", unit: "mg/L", src: "diagn", field: "hsCRP", range: (m) => rangehsCRP(m.age) },
];


// Which direction is "good"
const METRIC_DIRECTION = { HRV_ms: "up", recovery_pct: "up", HDL_C: "up", LDL_C: "down", ApoB: "down", hsCRP: "down" };

// "+4 to +6" or "−8" → {min,max}
function parseDelta(val) {
  if (!val) return null;
  const m = String(val).replace(/[–—]/g, "-").match(/[-+]?[\d.]+/g);
  if (!m?.length) return null;
  const nums = m.map(Number);
  return nums.length > 1 ? { min: Math.min(...nums), max: Math.max(...nums) } : { min: nums[0], max: nums[0] };
}

// Compare actual vs expected for one metric
function scoreOutcome(metricKey, expected, actual) {
  const dir = METRIC_DIRECTION[metricKey] || "up";
  const e = parseDelta(expected?.delta);
  const a = (actual?.delta != null && !Number.isNaN(+actual.delta))
    ? Number(actual.delta)
    : (Number.isFinite(+actual.after) && Number.isFinite(+actual.before) ? (+actual.after - +actual.before) : null);

  if (a == null || !e) return { status: "na", normA: 0, normE: 0 };

  const normA = dir === "down" ? -a : a;       // normalize so larger = better
  const normE = dir === "down" ? -(e.min) : e.min;

  if (normA >= normE) return { status: "met", normA, normE };
  if (normA >= 0.6 * normE) return { status: "partial", normA, normE };
  return { status: "missed", normA, normE };
}

// Pretty pill for status
function OutcomeBadge({ status }) {
  const map = {
    met: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-300",
    partial: "bg-amber-100  dark:bg-amber-900/30  text-amber-800  dark:text-amber-200  border-amber-300",
    missed: "bg-rose-100    dark:bg-rose-900/30    text-rose-800    dark:text-rose-200    border-rose-300",
    na: "bg-zinc-100    dark:bg-zinc-800       text-zinc-700    dark:text-zinc-200    border-zinc-300",
  };
  const label = { met: "Met / Exceeded", partial: "Partially met", missed: "Missed", na: "N/A" }[status] || "N/A";
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs border ${map[status]}`}>{label}</span>;
}


// tiny utilities
const byLabel = Object.fromEntries(METRIC_DEFS.map(m => [m.label, m]));
const byId = Object.fromEntries(METRIC_DEFS.map(m => [m.id, m]));

function rolling(series, key, win) {
  const out = [];
  let sum = 0, q = [];
  for (let i = 0; i < series.length; i++) {
    const v = Number(series[i][key]);
    q.push(v); sum += v;
    if (q.length > win) sum -= q.shift();
    if (q.length === win) out.push({ date: series[i].date, value: +(sum / win).toFixed(key.includes("HRV") ? 1 : 0) });
    else out.push({ date: series[i].date, value: null });
  }
  return out;
}

function buildDailyFromDiagnostics(diagnostics, field, startISO, endISO) {
  const pts = (diagnostics || [])
    .filter(d => d[field] != null)
    .map(d => ({ t: new Date(d.date).getTime(), v: +d[field] }))
    .sort((a, b) => a.t - b.t);
  if (!pts.length) return {};
  const out = {};
  const start = new Date(startISO), end = new Date(endISO);
  let i = 0;
  for (let d = new Date(start), day = 0; d <= end; d.setDate(d.getDate() + 1), day++) {
    const t = d.getTime();
    while (i < pts.length - 1 && t > pts[i + 1].t) i++;
    const a = pts[Math.max(0, Math.min(i, pts.length - 1))];
    const b = pts[Math.min(i + 1, pts.length - 1)];
    let val = a.v;
    if (b && b.t !== a.t) {
      const r = (t - a.t) / (b.t - a.t);
      val = a.v + (b.v - a.v) * r;
    }
    const wiggle = Math.sin(day * 0.25) * 2; // small physiological variability
    out[d.toISOString().slice(0, 10)] = Math.round(val + (field === "hsCRP" ? wiggle * 0.15 : wiggle));
  }
  return out;
}

// Interpolate daily LDL-C between lab dates, safely (handles empty/missing values)
function buildLDLDaily(diagnostics, startISO, endISO) {
  const pts = (diagnostics || [])
    .filter(d => d && d.date && d.LDL_C != null && !isNaN(+d.LDL_C))
    .map(d => ({
      t: new Date(d.date + "T00:00:00").getTime(),
      v: +d.LDL_C
    }))
    .sort((a, b) => a.t - b.t);

  if (!pts.length) return {}; // no labs → return empty map

  const start = new Date(startISO + "T00:00:00");
  const end = new Date(endISO + "T00:00:00");

  const out = {};
  let i = 0; // index into pts

  for (let d = new Date(start), dayIdx = 0; d <= end; d.setDate(d.getDate() + 1), dayIdx++) {
    const t = d.getTime();

    // advance anchor while the current day has passed the next lab point
    while (i < pts.length - 1 && t > pts[i + 1].t) i++;

    const a = pts[i] || pts[0];
    const b = pts[i + 1] || pts[i]; // if no next point, hold last value

    let val = a.v;
    if (b && b.t !== a.t) {
      const r = (t - a.t) / (b.t - a.t);          // 0..1 between labs
      val = a.v + (b.v - a.v) * r;                // linear interpolation
    }
    const wiggle = Math.sin(dayIdx * 0.25) * 2;   // ±2 mg/dL physiological small noise
    out[d.toISOString().slice(0, 10)] = Math.round(val + wiggle);
  }
  return out;
}



// Segment a series into in-range vs out-of-range lines (so we can color them)
function makeSegmented(series, lo, hi) {
  return series.map(p => ({
    date: p.date,
    inRange: p.value != null && p.value >= lo && p.value <= hi ? p.value : null,
    outRange: p.value != null && (p.value < lo || p.value > hi) ? p.value : null
  }));
}

// ---- Decision Flow helpers & styles ----
// ---- Decision Flow helpers ----
const TYPE_COLORS = {
  Exercise: "#2563eb", // blue-600
  Nutrition: "#f59e0b", // amber-500
  Medication: "#ef4444", // red-500
  Diagnostic: "#10b981", // emerald-500
};

// Legend for decision colors
const FlowLegend = () => (
  <div className="flex flex-wrap gap-3 text-xs">
    {Object.entries(TYPE_COLORS).map(([name, color]) => (
      <div key={name} className="inline-flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-zinc-600 dark:text-zinc-300">{name}</span>
      </div>
    ))}
  </div>
);


function getDecisionType(d) {
  if (d.diagnostic_id) return "Diagnostic";
  const t = (d.type || "").toString();
  if (/exercise/i.test(t)) return "Exercise";
  if (/nutrition/i.test(t)) return "Nutrition";
  if (/medication|drug|rx/i.test(t)) return "Medication";
  return "Exercise";
}
function getDecisionDateISO(d) {
  return (d.start_at || d.date || d.end_at || "").slice(0, 10);
}
function trunc(s, n = 24) { return s?.length > n ? s.slice(0, n - 1) + "…" : (s || ""); }


function DecisionFlowSVG({ decisions, onSelect, onHover, height = 220, compact = false }) {
  const n = decisions.length;
  const padX = 40;
  const gap = 180;
  const width = Math.max(padX * 2 + (n - 1) * gap, 420);
  const cy = compact ? height / 2 : 120;

  return (
    <div className="w-full overflow-x-auto">
      <svg width={width} height={height} className="block">
        {/* base line (dark-mode friendly) */}
        <line
          x1={padX} y1={cy} x2={width - padX} y2={cy}
          stroke="currentColor"
          className="text-zinc-200 dark:text-zinc-700"
          strokeWidth="2"
        />
        {/* connectors */}
        {decisions.slice(0, -1).map((d, i) => {
          const x1 = padX + i * gap, x2 = padX + (i + 1) * gap;
          return (
            <line
              key={`ln-${i}`}
              x1={x1} y1={cy} x2={x2} y2={cy}
              stroke="currentColor"
              className="text-zinc-200 dark:text-zinc-700"
              strokeWidth="2"
            />
          );
        })}
        {/* nodes */}
        {decisions.map((d, i) => {
          const x = padX + i * gap;
          const color = TYPE_COLORS[d.type] || "#6366f1";
          return (
            <g
              key={d.id || `${d.type}-${d.dateISO}-${i}`}
              className="cursor-pointer"
              onClick={() => onSelect?.(d)}
              onMouseEnter={(e) => onHover?.(d, e.clientX, e.clientY)}
              onMouseMove={(e) => onHover?.(d, e.clientX, e.clientY)}
              onMouseLeave={() => onHover?.(null)}
            >
              <circle cx={x} cy={cy} r="12" fill={color} stroke="white" strokeWidth="2" />
              {!compact && (
                <>
                  {/* date (muted) */}
                  <text
                    x={x} y={cy - 24} textAnchor="middle" fontSize="10"
                    fill="currentColor"
                    className="text-zinc-500 dark:text-zinc-400"
                  >
                    {d.dateLabel}
                  </text>
                  {/* title (strong) */}
                  <text
                    x={x} y={cy + 32} textAnchor="middle" fontSize="12"
                    fill="currentColor"
                    className="text-zinc-900 dark:text-zinc-100"
                  >
                    {trunc(d.label, 26)}
                  </text>
                  {/* pill with type */}
                  <rect
                    x={x - 38} y={cy + 40} rx="8" ry="8" width="76" height="20"
                    fill={`${color}22`} stroke={`${color}44`}
                  />
                  <text
                    x={x} y={cy + 54} textAnchor="middle" fontSize="11"
                    fill="currentColor"
                    className="text-zinc-900 dark:text-zinc-100"
                    style={{ fontWeight: 600 }}
                  >
                    {d.type}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}



// --- Member/roster helpers ---
const ROLE_COLORS = {
  Physician: "#0ea5e9",
  Physio: "#7c3aed",
  Nutrition: "#f59e0b",
  Performance: "#22c55e",
  Concierge: "#a78bfa",
  Lead: "#f97316",
  Team: "#64748b",
};

const TEAM_SEED = [
  { name: "Dr. Warren", role: "Physician" },
  { name: "Rachel", role: "Physio" },
  { name: "Carla", role: "Nutrition" },
  { name: "Advik", role: "Performance" },
  { name: "Ruby", role: "Concierge" },
  { name: "Neel", role: "Lead" },
];

// Classify whether a message belongs to the member (Rohan) using role, id and name variants
function isMemberMessage(m, member) {
  const full = member?.preferred_name || "Rohan Patel";
  const first = full.split(" ")[0] || full;
  const id = member?.member_id || "M0001";
  const role = String(m?.role || "").toLowerCase();

  return (
    role === "member" ||
    (m?.member_id && m.member_id === id) ||
    m?.sender === full ||
    m?.sender === first
  );
}

// Case-insensitive role → color (uses your ROLE_COLORS)
const roleColor = (role) => {
  const key = String(role || "Team").toLowerCase();
  // map lowercase keys to your Title-Case keys
  const map = {
    physician: "Physician",
    physio: "Physio",
    nutrition: "Nutrition",
    performance: "Performance",
    concierge: "Concierge",
    lead: "Lead",
    team: "Team",
    member: null, // neutral for Rohan
  };
  const k = map[key];
  if (!k) return "#111827"; // member
  return (ROLE_COLORS && ROLE_COLORS[k]) || "#64748b";
};

const titleCase = (s = "") => s.replace(/\w\S*/g, t => t[0].toUpperCase() + t.slice(1).toLowerCase());

// Normalize chat into a 2-party shape (works for legacy lines too)
function normalizeChat(arr, member) {
  const mid = member?.member_id || "M0001";
  const mname = member?.preferred_name || "Rohan Patel";
  return (arr || [])
    .map(m => {
      if (m.sender_id && m.receiver_id && m.sender && m.receiver) return m;
      const isMember =
        String(m.role || "").toLowerCase() === "member" ||
        m.member_id === mid || m.sender === mname;
      if (isMember) {
        if (!(m.receiver_id && m.receiver)) return null;
        return { ...m, sender_id: mid, sender: mname, sender_role: "member" };
      }
      return {
        ...m,
        sender_id: m.sender_id || `U_${m.sender || "Unknown"}`,
        sender: m.sender || "Unknown",
        sender_role: m.sender_role || (m.role || "team"),
        receiver_id: m.receiver_id || mid,
        receiver: m.receiver || mname,
        receiver_role: m.receiver_role || "member",
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}







export default function App() {
  const [dark, setDark] = useState(true);
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); }, [dark]);

  const [bundle, setBundle] = useState(EMBED);
  const [chat, setChat] = useState(normalizeChat(EMBED.chat || [], EMBED.member));
  const [rationales, setRationales] = useState(EMBED.rationales || []);
  const [query, setQuery] = useState("");
  const [qa, setQa] = useState(null);
  const [selDecision, setSelDecision] = useState(null);
  const [metricOpen, setMetricOpen] = useState(null); // holds a metric id like "HRV_ms"
  const [flowOpen, setFlowOpen] = useState(false);
  const [flowSel, setFlowSel] = useState(null); // selected node in the flow
  const [hoverNode, setHoverNode] = useState(null); // tooltip node
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [chatOpen, setChatOpen] = useState(false);
  const [peer, setPeer] = useState(null); // {name, role, color}
  const [decisionsQuery, setDecisionsQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [ownerFilter, setOwnerFilter] = useState([]);
  const [focusMsgId, setFocusMsgId] = useState(null);




  const ctx = useMemo(() => ({ ...bundle, chat, rationales }), [bundle, chat, rationales]);


  const memberId = bundle.member?.member_id || "M0001";

  const roster = useMemo(() => {
    // try derive from chat
    const map = new Map();
    for (const m of chat) {
      if (!m.sender_id || !m.receiver_id) continue;
      const isSenderPeer = m.sender_id !== memberId;
      const id = isSenderPeer ? m.sender_id : m.receiver_id;
      if (id === memberId) continue;
      const name = isSenderPeer ? m.sender : m.receiver;
      const role = isSenderPeer ? (m.sender_role || "team") : (m.receiver_role || "team");
      if (!map.has(id)) map.set(id, { id, name, role, color: roleColor(role) });
    }
    const fromChat = Array.from(map.values());
    if (fromChat.length) return fromChat;

    // fallback to TEAM_SEED so UI shows chips even before uploading chats
    return (TEAM_SEED || []).map(t => ({
      id: `U_${t.name.replace(/\s+/g, "_")}`,
      name: t.name,
      role: t.role,
      color: roleColor(t.role),
    }));
  }, [chat, memberId]);

  const legendRoles = useMemo(
    () => Array.from(new Set(roster.map(r => titleCase(r.role)))),
    [roster]
  );


  // Use the merged decisions object for selection so we have dateLabel, type, owner, etc.
  const selId = useMemo(
    () => (selDecision?.id || "").toUpperCase(),
    [selDecision]
  );

  // IMPORTANT: read rationales/evidence from EMBED (as you asked)
  const selRationale = useMemo(() => {
    return (EMBED.rationales || []).find(
      r => (r.decision_id || "").toUpperCase() === selId
    );
  }, [selId]);

  const evidenceMsgs = useMemo(() => {
    const ids = selRationale?.evidence_message_ids || [];
    const all = EMBED.chat || [];
    return ids.map(mid => all.find(m => m.message_id === mid)).filter(Boolean);
  }, [selRationale]);





  // Combine interventions + diagnostics into one, ordered by date
  const decisions = useMemo(() => {
    const all = [];

    (bundle.interventions || []).forEach(iv => {
      const iso = getDecisionDateISO(iv);
      if (!iso) return;
      const type = getDecisionType(iv);
      all.push({
        id: iv.intervention_id, type,
        dateISO: iso, dateLabel: formatDate(iso),
        label: iv.title || `${type} plan`,
        owner: iv.owner || (type === "Medication" ? "Dr. Warren" : type === "Nutrition" ? "Carla" : "Advik/Rachel"),
        expected: iv.expected || null,
        actual: iv.actual || null
      });
    });

    (bundle.diagnostics || []).forEach(dx => {
      const iso = getDecisionDateISO(dx);
      if (!iso) return;
      all.push({
        id: dx.diagnostic_id, type: "Diagnostic",
        dateISO: iso, dateLabel: formatDate(iso),
        label: dx.Notes || "Diagnostic panel",
        owner: "Dr. Warren",
        expected: { note: "Quantify risk markers", metrics: { ApoB: {}, LDL_C: {}, hsCRP: {} } },
        actual: { note: `ApoB ${dx.ApoB}, LDL-C ${dx.LDL_C}, hsCRP ${dx.hsCRP}` }
      });
    });

    all.sort((a, b) => a.dateISO.localeCompare(b.dateISO));
    return all;
  }, [bundle.interventions, bundle.diagnostics]);

  // Rationale + evidence for the currently selected node
  const flowDetail = useMemo(() => {
    if (!flowSel) return null;
    const rat = (rationales || []).find(r => r.decision_id === flowSel.id);
    const evidence = (rat?.evidence_message_ids || []).map(mid =>
      (chat || []).find(m => m.message_id === mid)
    ).filter(Boolean);
    return { rationale: rat, evidence };
  }, [flowSel, rationales, chat]);


  function ownerInfo(owner, type) {
    const name = (owner || "").split("(")[0].trim();
    const match = (roster || []).find(p => p.name.toLowerCase() === name.toLowerCase());
    if (match) return match;

    const role =
      /physio/i.test(owner) ? "Physio" :
        /nutri/i.test(owner) ? "Nutrition" :
          /physician|doctor|dr/i.test(owner) ? "Physician" :
            /performance/i.test(owner) ? "Performance" :
              (type === "Medication" ? "Physician" : "Team");

    return { name: name || "Unknown", role, color: ROLE_COLORS[role] || ROLE_COLORS.Team };
  }

  function OwnerBadge({ owner, type, className = "" }) {
    const { name, role, color } = ownerInfo(owner, type);
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border ${className}`}
        style={{ borderColor: color, backgroundColor: `${color}1a`, color }}
        title={`${name} • ${role}`}
      >
        <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }} />
        {name} • {role}
      </span>
    );
  }

  const ownerOptions = useMemo(() => {
    const map = new Map();
    decisions.forEach(d => {
      const info = ownerInfo(d.owner, d.type);
      const key = info.name.toLowerCase();
      if (!map.has(key)) map.set(key, info);
    });
    // sort by name for a stable list
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [decisions]);

  // Toggle one owner in multi-select
  const toggleOwner = (name) =>
    setOwnerFilter(prev => prev.includes(name)
      ? prev.filter(n => n !== name)
      : [...prev, name]);

  // Clear filter
  const clearOwners = () => setOwnerFilter([]);

  // Final filtered + sorted list for rendering (DESC by date)
  // requires: const [ownerFilter, setOwnerFilter] = useState([])
  // and an ownerInfo(owner, type) helper (same one we used for the badges)
  const filteredDecisions = useMemo(() => {
    const q = decisionsQuery.trim().toLowerCase();
    const selected = new Set(ownerFilter.map(n => n.toLowerCase()));

    return decisions
      // 1) search always applies
      .filter(d => {
        if (!q) return true;
        const hay = [d.label, d.type, d.owner, d.dateLabel].join(" ").toLowerCase();
        return hay.includes(q);
      })
      // 2) owner multi-select (no selection = show all)
      .filter(d => {
        if (selected.size === 0) return true;
        const info = ownerInfo(d.owner, d.type);            // { name, role, color }
        return selected.has(info.name.toLowerCase());
      })
      // 3) sort by date (newest first). For oldest-first, flip a/b.
      .sort((a, b) => b.dateISO.localeCompare(a.dateISO));
  }, [decisions, decisionsQuery, ownerFilter]);


  // helper to open the selected decision by id
  function openDecisionById(id) {
    if (!id) return;
    if (String(id).startsWith("I")) {
      const it = (bundle.interventions || []).find(x => x.intervention_id === id);
      it && setSelDecision(it);
    } else {
      const dx = (bundle.diagnostics || []).find(x => x.diagnostic_id === id);
      dx && setSelDecision(dx);
    }
  }





  // Build LDL-C daily values aligned to wearable date range (single source of truth)
  const ldlByDay = useMemo(() => {
    const w = bundle.wearable_daily || [];
    if (!w.length) return {};
    const startISO = w[0].date;
    const endISO = w[w.length - 1].date;
    return buildLDLDaily(bundle.diagnostics || [], startISO, endISO);
  }, [bundle.wearable_daily, bundle.diagnostics]);

  // Merge into one time series for the trends chart
  const trendData = useMemo(() => {
    const w = bundle.wearable_daily || [];
    return w.map(d => ({
      date: d.date,
      HRV_ms: d.HRV_ms,
      recovery_pct: d.recovery_pct,
      LDL_C: ldlByDay[d.date] ?? null
    }));
  }, [bundle.wearable_daily, ldlByDay]);

  // Shared Y domain for left/right axes
  const yMax = useMemo(() => {
    if (!trendData.length) return 100;
    const vals = trendData.flatMap(t => [t.HRV_ms, t.recovery_pct, t.LDL_C].filter(v => v != null));
    const max = Math.max(100, ...vals);
    return Math.ceil((max + 5) / 10) * 10; // rounded headroom
  }, [trendData]);




  const KPIs = useMemo(() => {
    const w = bundle.wearable_daily || [];
    const last = w[w.length - 1] || {};
    const dx = bundle.diagnostics || [];
    const latestDx = dx[dx.length - 1] || {};
    const avgLast = (n, key) => {
      if (!w.length) return "—";
      const slice = w.slice(-n);
      const vals = slice.map(d => Number(d[key])).filter(v => Number.isFinite(v));
      if (!vals.length) return "—";
      const decimals = key.includes("HRV") ? 1 : 0;
      return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(decimals);
    };
    return [
      { label: "HRV (ms)", value: last.HRV_ms ?? "—" },
      { label: "Recovery (%)", value: last.recovery_pct ?? "—" },
      { label: "Deep Sleep (min)", value: last.deep_sleep_min ?? "—" },
      { label: "REM Sleep (min)", value: last.rem_sleep_min ?? "—" },
      { label: "Steps", value: last.steps ?? "—" },
      { label: "HRV 7d avg", value: avgLast(7, "HRV_ms") },
      { label: "Recovery 7d avg", value: avgLast(7, "recovery_pct") },
      { label: "HRV 30d avg", value: avgLast(30, "HRV_ms") },
      { label: "ApoB", value: latestDx.ApoB ?? "—" },
      { label: "LDL-C", value: latestDx.LDL_C ?? "—" },
      { label: "HDL-C", value: latestDx.HDL_C ?? "—" },
      { label: "hs-CRP", value: latestDx.hsCRP ?? "—" }
    ];
  }, [bundle]);



  const diagDaily = useMemo(() => {
    const w = bundle.wearable_daily || [];
    if (!w.length) return { ApoB: {}, HDL_C: {}, hsCRP: {} };
    const startISO = w[0].date, endISO = w[w.length - 1].date;
    return {
      ApoB: buildDailyFromDiagnostics(bundle.diagnostics || [], "ApoB", startISO, endISO),
      HDL_C: buildDailyFromDiagnostics(bundle.diagnostics || [], "HDL_C", startISO, endISO),
      hsCRP: buildDailyFromDiagnostics(bundle.diagnostics || [], "hsCRP", startISO, endISO),
    };
  }, [bundle]);

  // Return a daily {date, value} series for a metric id
  function getSeries(id) {
    const def = byId[id];
    const wear = bundle.wearable_daily || [];
    if (!def || !wear.length) return [];

    // base series by source
    let base;
    if (def.src === "wearable") {
      base = wear.map(d => ({ date: d.date, value: Number(d[def.field]) || null }));
    } else if (def.src === "roll7") {
      base = rolling(wear, def.field, 7);
    } else if (def.src === "roll30") {
      base = rolling(wear, def.field, 30);
    } else if (def.src === "ldl") {
      base = wear.map(d => ({ date: d.date, value: ldlByDay[d.date] ?? null }));
    } else if (def.src === "diagn") {
      const map = diagDaily[def.field] || {};
      base = wear.map(d => ({ date: d.date, value: map[d.date] ?? null }));
    } else {
      base = wear.map(d => ({ date: d.date, value: null }));
    }
    return base;
  }

  // Generic chart (mini or full) with segmented coloring + green band for target
  function MetricChart({ data, range, height = 180, legend = false }) {
    const [lo, hi] = range;
    const seg = makeSegmented(data, lo, hi);

    const values = data.map(d => d.value).filter(v => v != null);
    const max = values.length ? Math.max(100, ...values) : 100;
    const yMax = Math.ceil((max + 5) / 10) * 10;

    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={seg} margin={{ top: 8, right: 12, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" hide />
          <YAxis domain={[0, yMax]} />
          <Tooltip labelFormatter={(l) => `Date: ${l}`} formatter={(v, name) => [v, name === "inRange" ? "In range" : "Out of range"]} />
          {legend && <Legend />}
          {/* Soft green band for the target zone */}
          <ReferenceArea y1={lo} y2={hi} fill="#10b981" fillOpacity={0.12} />
          {/* Segmented lines */}
          <Line type="monotone" dataKey="inRange" stroke="#16a34a" strokeWidth={3} dot={false} name="In range" />
          <Line type="monotone" dataKey="outRange" stroke="#dc2626" strokeWidth={3} dot={false} name="Out of range" />
        </LineChart>
      </ResponsiveContainer>
    );
  }



  const handleUpload = async (file, kind) => {
    const text = await file.text();
    if (file.name.endsWith(".json")) {
      try { const j = JSON.parse(text); setBundle(j); } catch { }
      return;
    }
    if (file.name.includes("chat_messages") || kind === "chat") {
      const raw = loadJSONL(text);
      setChat(normalizeChat(raw, bundle.member));
      return;
    }
    if (file.name.includes("rationales") || kind === "rationales") { setRationales(loadJSONL(text)); return; }
  };

  const ask = () => { setQa(answerQuestion(query, ctx)); };

  function RoleDot({ color = "#6366f1" }) {
    return <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />;
  }

  function TeamLegend({ roles }) {
    if (!roles?.length) return null;
    return (
      <div className="flex flex-wrap gap-3 text-xs">
        {roles.map(r => (
          <span key={r} className="inline-flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: roleColor(r) }} />
            <span className="text-zinc-600 dark:text-zinc-300">{titleCase(r)}</span>
          </span>
        ))}
      </div>
    );
  }

  function ChatModal({ open, onClose, peer, member, messages, focusMessageId }) {
    const containerRef = React.useRef(null);

    if (!open || !peer) return null;

    const memberId = member?.member_id || "M0001";
    const thread = useMemo(() => {
      return (messages || [])
        .filter(m =>
          (m.sender_id === memberId && m.receiver_id === peer.id) ||
          (m.receiver_id === memberId && m.sender_id === peer.id)
        )
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }, [messages, memberId, peer]);

    // After mount/update, scroll to the focused msg (if any) and highlight briefly
    useEffect(() => {
      if (!open || !focusMessageId) return;
      const el = containerRef.current?.querySelector(`[data-mid="${focusMessageId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-amber-400");
        const t = setTimeout(() => el.classList.remove("ring-2", "ring-amber-400"), 1800);
        return () => clearTimeout(t);
      }
    }, [open, focusMessageId, thread]);

    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Chat with {peer.name}</div>
              <Button onClick={onClose}>Close</Button>
            </div>

            <div
              ref={containerRef}
              className="h-[60vh] overflow-auto rounded-xl p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
            >
              {thread.length === 0 && <div className="text-sm text-zinc-500">No messages in this thread.</div>}

              {thread.map(m => {
                const me = m.sender_id === memberId;
                return (
                  <div key={m.message_id} className={`flex ${me ? "justify-end" : "justify-start"} mb-2`} data-mid={m.message_id}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-3 py-2 shadow border ${me
                        ? "bg-emerald-600 text-white border-emerald-700"
                        : "text-zinc-900 dark:text-zinc-100"
                        }`}
                      style={
                        me
                          ? undefined
                          : { backgroundColor: `${peer.color}1a`, borderColor: peer.color }
                      }
                    >
                      <div className="text-xs opacity-70 mb-1" style={!me ? { color: peer.color } : undefined}>
                        {me ? member?.preferred_name : peer.name}
                      </div>
                      <div className="text-sm leading-snug">{m.text}</div>
                      <div className={`text-[10px] mt-1 opacity-70 ${me ? "text-white" : "text-zinc-600"}`}>
                        {new Date(m.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    );
  }






  const Badge = ({ children }) => <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">{children}</span>;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 text-zinc-900 dark:text-zinc-100">
      <div className="sticky top-0 z-10 backdrop-blur border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="text-xl font-bold">Elyx Member Journey</motion.div>
            <Badge>Demo</Badge>
          </div>
          <div className="flex gap-2 items-center">
            <label className="cursor-pointer hidden md:block"><Button><Upload className="w-4 h-4 mr-2" />dataset_summary.json</Button>
              <input type="file" className="hidden" accept="application/json" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
            </label>
            <label className="cursor-pointer hidden md:block"><Button><Upload className="w-4 h-4 mr-2" />chat_messages.jsonl</Button>
              <input type="file" className="hidden" accept=".jsonl,text/plain" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], "chat")} />
            </label>
            <label className="cursor-pointer hidden md:block"><Button><Upload className="w-4 h-4 mr-2" />rationales.jsonl</Button>
              <input type="file" className="hidden" accept=".jsonl,text/plain" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], "rationales")} />
            </label>
            <Button onClick={() => setDark(d => !d)}>{dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">{bundle.member?.preferred_name || "(upload dataset)"}</h1>
            <p className="text-zinc-500">Trace decisions, see trends, and ask "why" — with evidence from the chat.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-4 mb-6">
          <Card className="md:col-span-4">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-5 h-5" />
              <h2 className="font-semibold">Member Snapshot</h2>
            </div>
            <div className="text-sm space-y-1">
              <div><span className="text-zinc-500">Residence:</span> {bundle.member?.primary_residence || "—"}</div>
              <div><span className="text-zinc-500">Chronic:</span> {bundle.member?.chronic_condition || "—"}</div>
              <div><span className="text-zinc-500">Wearables:</span> {(bundle.member?.wearables || []).join(", ")}</div>
              <div><span className="text-zinc-500">Travel hubs:</span> {(bundle.member?.travel_hubs || []).join(" • ")}</div>
            </div>
          </Card>
          <Card className="md:col-span-8">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="w-5 h-5" />
              <h2 className="font-semibold">Key Trends — HRV, Recovery, LDL-C</h2>
            </div>

            <div className="h-64">
              <ResponsiveContainer>
                <LineChart
                  data={trendData}
                  margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" minTickGap={24} tickMargin={8} />
                  {/* SAME RANGE on left and right */}
                  <YAxis yAxisId="left" domain={[0, yMax]} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, yMax]} />

                  <Tooltip
                    formatter={(val, name) => {
                      const unit =
                        name.includes("LDL") ? "mg/dL" :
                          name.includes("Recovery") ? "%" : "ms";
                      return [`${val} ${unit}`, name];
                    }}
                    labelFormatter={(l) => `Date: ${l}`}
                  />

                  <Legend verticalAlign="top" height={28} />

                  {/* Thicker lines + distinct colors */}
                  <Line
                    type="monotone"
                    dataKey="HRV_ms"
                    name="HRV (ms)"
                    yAxisId="left"
                    stroke="#7c3aed"   // violet-600
                    strokeWidth={3}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="recovery_pct"
                    name="Recovery (%)"
                    yAxisId="left"
                    stroke="#16a34a"   // green-600
                    strokeWidth={3}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="LDL_C"
                    name="LDL-C (mg/dL)"
                    yAxisId="right"
                    stroke="#dc2626"   // red-600
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {KPIs.map((k, i) => {
            const def = byLabel[k.label];
            const member = bundle.member || { age: 40, gender: "Male" };
            const [lo, hi] = def ? def.range(member) : [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY];
            const v = Number(k.value);
            const inRange = Number.isFinite(v) && v >= lo && v <= hi;
            const valueClass = inRange ? "text-emerald-600" : "text-rose-600";
            const series = def ? getSeries(def.id) : [];

            return (
              <div key={def?.id || i} className="relative group">
                <Card
                  role="button"
                  tabIndex={0}
                  className="text-center hover:shadow-xl transition cursor-pointer"
                  onClick={() => def && setMetricOpen(def.id)}
                  onKeyDown={(e) => ((e.key === 'Enter' || e.key === ' ') && def) && setMetricOpen(def.id)}
                  title={def ? `${def.label} — target ${lo}–${hi} ${def.unit || ""}` : ""}
                >

                  <div className="text-xs text-zinc-500">{k.label}</div>
                  <div className={`text-2xl font-semibold mt-1 ${valueClass}`}>
                    {k.value}{def?.unit ? ` ${def.unit}` : ""}
                  </div>
                </Card>

                {/* Hover preview (mini chart) */}
                {def && series.length > 0 && (
                  <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition duration-200 absolute z-20 left-0 top-full mt-2 w-[320px]">
                    <Card className="shadow-2xl">
                      <MetricChart data={series} range={[lo, hi]} height={160} />
                    </Card>
                  </div>
                )}
              </div>
            );
          })}
        </div>


        {/* Hover tooltip for flow nodes (works for preview & modal) */}
        {hoverNode && (
          <div
            className="fixed z-[60] pointer-events-none"
            style={{ top: hoverPos.y + 12, left: hoverPos.x + 12 }}
          >
            <Card className="p-3 shadow-2xl">
              <div className="text-xs text-zinc-500">
                {hoverNode.dateLabel} • {hoverNode.type}
              </div>
              <div className="text-sm font-medium">{hoverNode.label}</div>
              {hoverNode.owner && <div className="text-xs mt-1">Owner: {hoverNode.owner}</div>}
              {hoverNode.expected?.metrics && (
                <div className="text-xs text-zinc-500 mt-1">
                  Expected: {hoverNode.expected.note || "—"}
                </div>
              )}
            </Card>
          </div>
        )}


        {/* Decisions Flow (preview) */}
        <Card
          className="mt-6 mb-6 hover:shadow-lg cursor-pointer"
          role="button"
          title="Click to open full decision flow"
          onClick={() => setFlowOpen(true)}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">Decision Flow (preview)</div>
            <div className="text-xs text-zinc-500">click to expand</div>
          </div>

          {/* NEW: color legend */}
          <div className="mb-3">
            <FlowLegend />
          </div>

          {decisions.length ? (
            <DecisionFlowSVG
              decisions={decisions.slice(-5)}
              height={200}
              onSelect={() => setFlowOpen(true)}
              onHover={(d, x, y) => { setHoverNode(d); setHoverPos({ x, y }); }}
            />
          ) : (
            <div className="text-sm text-zinc-500">No decisions yet.</div>
          )}
        </Card>






        <div className="grid md:grid-cols-12 gap-4">
          {/* LEFT: Decisions list with search + owner filter (always visible) */}
          <Card className="md:col-span-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                <h2 className="font-semibold">Decisions</h2>
              </div>
            </div>

            {/* search (always visible) */}
            <div className="mb-3">
              <Input
                value={decisionsQuery}
                onChange={e => setDecisionsQuery(e.target.value)}
                placeholder="Search decisions (title, type, owner, date)"
              />
            </div>

            {/* owner filters (always visible) */}
            <div className="mb-3">
              <div className="text-[11px] uppercase tracking-wide text-zinc-500 mb-1">
                Filters
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {ownerOptions.map(opt => {
                  const active = ownerFilter.includes(opt.name);
                  return (
                    <button
                      key={opt.name}
                      onClick={() => toggleOwner(opt.name)}
                      className="px-2.5 py-1 rounded-full border text-xs transition"
                      style={{
                        borderColor: active ? opt.color : "rgba(113,113,122,0.35)",
                        backgroundColor: active ? `${opt.color}1a` : "transparent",
                        color: active ? opt.color : "inherit"
                      }}
                      title={`${opt.name} • ${opt.role}`}
                    >
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-1 align-middle"
                        style={{ background: opt.color }}
                      />
                      {opt.name} • {opt.role}
                    </button>
                  );
                })}

                {ownerFilter.length > 0 && (
                  <button
                    onClick={() => setOwnerFilter([])}
                    className="ml-1 text-xs underline text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* list (sorted by date) */}
            <div className="space-y-2 max-h-[28rem] overflow-auto pr-1">
              {filteredDecisions
                .slice()
                .sort((a, b) => a.dateISO.localeCompare(b.dateISO))
                .map(d => (
                  <div
                    key={d.id}
                    className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition"
                    onClick={() => setSelDecision(d)} // select the unified decision object
                  >
                    <div className="flex items-center justify-between text-sm text-zinc-500">
                      <div>{d.type} • {d.dateLabel}</div>
                      <OwnerBadge owner={d.owner} type={d.type} />
                    </div>
                    <div className="font-medium mt-1">{d.label}</div>
                  </div>
                ))}

              {filteredDecisions.length === 0 && (
                <div className="text-sm text-zinc-500 p-3 rounded-xl border border-dashed">
                  No decisions match your search/filter.
                </div>
              )}
            </div>
          </Card>

          {/* RIGHT: Evidence with owner badge, rationale + outcomes + chat evidence */}
          <Card className="md:col-span-7">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5" />
              <h2 className="font-semibold">Why this decision?</h2>
            </div>

            {!selDecision ? (
              <div className="text-zinc-500 text-sm">
                Select a decision to view its rationale, outcomes, and chat evidence.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Header */}
                <div>
                  <div className="text-lg font-semibold">{selDecision.label}</div>
                  {/* SAME date as in list */}
                  <div className="text-sm text-zinc-500">{selDecision.type} • {selDecision.dateLabel}</div>
                  <div className="mt-1">
                    <OwnerBadge owner={selDecision.owner} type={selDecision.type} />
                  </div>
                </div>

                {/* Expected vs Actual (reuse your scoring UI) */}
                {(selDecision.expected || selDecision.actual) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Expected */}
                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50 dark:bg-zinc-900/50">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Expected outcome</div>
                        <OutcomeBadge status="na" />
                      </div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">
                        {selDecision.expected?.note || "—"}
                      </div>
                      {selDecision.expected?.metrics && (
                        <div className="mt-2 grid grid-cols-1 gap-2">
                          {Object.entries(selDecision.expected.metrics).map(([metricKey, v]) => (
                            <div key={metricKey} className="flex items-center justify-between text-sm">
                              <div className="text-zinc-500">{metricKey}</div>
                              <div className="font-medium">
                                {v.delta || "—"}{" "}
                                {v.window ? <span className="text-xs text-zinc-500">({v.window})</span> : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actual (scored) */}
                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 bg-white dark:bg-zinc-900">
                      <div className="text-sm font-medium mb-1">Actual outcome</div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-300">
                        {selDecision.actual?.note || "—"}
                      </div>

                      {selDecision.expected?.metrics && selDecision.actual?.metrics && (
                        <div className="mt-3 grid grid-cols-1 gap-2">
                          {Object.entries(selDecision.expected.metrics).map(([metricKey, exp]) => {
                            const act = selDecision.actual.metrics[metricKey] || {};
                            const { status } = scoreOutcome(metricKey, exp, act);
                            const cardMap = {
                              met: "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300",
                              partial: "bg-amber-50  dark:bg-amber-900/30  border-amber-300",
                              missed: "bg-rose-50    dark:bg-rose-900/30    border-rose-300",
                              na: "bg-zinc-50    dark:bg-zinc-900/40    border-zinc-300",
                            };
                            return (
                              <div key={metricKey} className={`rounded-lg border p-3 ${cardMap[status]}`}>
                                <div className="flex items-center justify-between">
                                  <div className="font-medium">{metricKey}</div>
                                  <OutcomeBadge status={status} />
                                </div>
                                <div className="text-xs mt-1 text-zinc-600 dark:text-zinc-300">
                                  Expected: {exp.delta || "—"}{exp.window ? ` (${exp.window})` : ""} ·{" "}
                                  Actual: {act.before != null ? `${act.before} → ` : ""}{act.after ?? "—"}
                                  {act.delta != null ? ` (${act.delta > 0 ? "+" : ""}${act.delta})` : ""}
                                  {act.window ? ` — ${act.window}` : ""}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Rationale (from EMBED via useMemo selRationale) */}
                <div>
                  <div className="text-sm font-medium mb-1">Rationale</div>
                  <div className="text-sm">
                    {selRationale?.reason_summary || "No rationale found for this decision."}
                  </div>
                </div>

                {/* Evidence (chat) — from EMBED via useMemo evidenceMsgs */}
                <div>
                  <div className="font-medium mb-1">Evidence (from chat)</div>

                  {evidenceMsgs.length ? (
                    <div className="space-y-2 max-h-60 overflow-auto pr-1">
                      {evidenceMsgs.map(m => {
                        // figure out who the non-member peer is for this message
                        const memberId = bundle.member?.member_id || "M0001";
                        const nonMemberId = m.sender_id === memberId ? m.receiver_id : m.sender_id;

                        // try to find the peer in roster; if missing, build a fallback
                        const peerForMsg =
                          (roster || []).find(r => r.id === nonMemberId) ||
                          (() => {
                            const isSenderPeer = m.sender_id !== memberId;
                            const name = isSenderPeer ? m.sender : m.receiver;
                            const role = (isSenderPeer ? m.sender_role : m.receiver_role) || "Team";
                            const color = ROLE_COLORS[role] || ROLE_COLORS.Team;
                            return { id: nonMemberId, name, role, color };
                          })();

                        return (
                          <button
                            key={m.message_id}
                            onClick={() => {
                              setPeer(peerForMsg);
                              setChatOpen(true);
                              // let the modal mount, then set focus for smooth scroll/highlight
                              setTimeout(() => setFocusMsgId && setFocusMsgId(m.message_id), 0);
                            }}
                            className="w-full text-left"
                            title={`Open chat with ${peerForMsg.name}`}
                          >
                            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80 transition border border-zinc-200 dark:border-zinc-700">
                              <div className="flex items-center justify-between">
                                <div className="text-xs text-zinc-500">
                                  {new Date(m.timestamp).toLocaleString()} • {m.sender} → {m.receiver} • {m.topic}
                                </div>
                                <OwnerBadge owner={selDecision.owner} type={selDecision.type} />
                              </div>
                              <div className="text-sm mt-1">{m.text}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-zinc-500">No linked messages.</div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>





        {/* Care Team */}
        <div className="mt-6">
          <Card>
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Care Team</div>
              <div className="text-xs text-zinc-500">
                Click a person to view chat with {bundle.member?.preferred_name?.split(" ")[0] || "Member"}
              </div>
            </div>

            {/* Legend */}
            <div className="mb-3">
              <TeamLegend roles={legendRoles} />
            </div>

            {/* Chips */}
            <div className="flex flex-wrap gap-2">
              {roster.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setPeer(p); setChatOpen(true); }}
                  className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex items-center gap-2"
                  title={titleCase(p.role)}
                >
                  <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-sm font-medium">{p.name}</span>
                  <span className="text-xs text-zinc-500">• {titleCase(p.role)}</span>
                </button>
              ))}
              {roster.length === 0 && (
                <div className="text-sm text-zinc-500">No team chats yet. Load <code>chat_messages.jsonl</code>.</div>
              )}
            </div>
          </Card>
        </div>

        {/* Chat modal */}
        <ChatModal
          open={chatOpen}
          onClose={() => { setChatOpen(false); setFocusMsgId(null); }}
          peer={peer}
          member={bundle.member}
          messages={chat}
          focusMessageId={focusMsgId}
        />




        <div className="grid md:grid-cols-12 gap-4 mt-6">
          <Card className="md:col-span-7">
            <div className="flex items-center gap-2 mb-3"><MessageSquare className="w-5 h-5" /><h2 className="font-semibold">Conversation Viewer</h2></div>
            <div className="flex gap-2 mb-3">
              <Input placeholder="Search messages (topic, text, sender)" />
              <Button><Search className="w-4 h-4" /></Button>
            </div>
            <div className="space-y-2 max-h-[28rem] overflow-auto pr-1">
              {(EMBED.chat || []).map(m => (
                <div key={m.message_id} className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                  <div className="text-xs text-zinc-500">{fmtDate(m.timestamp)} • {m.sender} • {m.topic}</div>
                  <div className="text-sm">{m.text}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="md:col-span-5">
            <div className="flex items-center gap-2 mb-3"><Search className="w-5 h-5" /><h2 className="font-semibold">Ask the Member Assistant</h2></div>
            <div className="flex gap-2 mb-3">
              <Input placeholder="e.g., Why I0005? adherence last month, latest diagnostics" />
            </div>
            <div className="text-sm text-zinc-500">Use the Decisions panel to explore traceability; the embedded dataset allows offline demo immediately.</div>
          </Card>
        </div>

        <div className="text-xs text-zinc-500 mt-8">
          Preconfigured Tailwind. Run <code>npm install</code> then <code>npm run dev</code>.
        </div>

        {/* Full-screen metric modal */}
        {metricOpen && (() => {
          const def = byId[metricOpen];
          const member = bundle.member || { age: 40, gender: "Male" };
          const [lo, hi] = def.range(member);
          const series = getSeries(def.id);

          return (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setMetricOpen(null)}>
              <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-lg font-semibold">{def.label}</div>
                      <div className="text-xs text-zinc-500">Target range: {lo}–{hi} {def.unit || ""}</div>
                    </div>
                    <Button onClick={() => setMetricOpen(null)}>Close</Button>
                  </div>
                  <MetricChart data={series} range={[lo, hi]} height={420} legend />
                </Card>
              </div>
            </div>
          );
        })()}

        {/* Decision Flow — full window */}
        {flowOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => { setFlowOpen(false); setFlowSel(null); }}
          >
            <div className="max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-lg">Decision Flow — {bundle.member?.preferred_name || ""}</div>
                  <Button onClick={() => { setFlowOpen(false); setFlowSel(null); }}>Close</Button>
                </div>

                <div className="mb-3">
                  <FlowLegend />
                </div>

                {/* Full flow chart */}
                {decisions.length ? (
                  <DecisionFlowSVG
                    decisions={decisions}
                    height={240}
                    onSelect={(d) => setFlowSel(d)}
                    onHover={(d, x, y) => { setHoverNode(d); setHoverPos({ x, y }); }}
                  />
                ) : (
                  <div className="text-sm text-zinc-500">No decisions to show.</div>
                )}

                {/* Selected decision details */}
                {flowSel && (
                  <div className="mt-4 grid md:grid-cols-12 gap-4">
                    {/* Left: headline + owner + Expected/Actual summary cards */}
                    <Card className="md:col-span-5">
                      <div className="text-sm text-zinc-500 mb-1">{flowSel.type} • {flowSel.dateLabel}</div>
                      <div className="text-lg font-semibold">{flowSel.label}</div>
                      {flowSel.owner && <div className="text-sm mt-1">Owner: {flowSel.owner}</div>}

                      {/* Expected vs Actual (highlighted / larger) */}
                      <div className="mt-4 grid grid-cols-1 gap-3">
                        {/* Expected */}
                        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50 dark:bg-zinc-900/50">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium">Expected outcome</div>
                            <OutcomeBadge status={Object.keys(flowSel.expected?.metrics || {}).length ? "na" : "na"} />
                          </div>
                          <div className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">{flowSel.expected?.note || "—"}</div>
                          {flowSel.expected?.metrics && (
                            <div className="mt-2 grid grid-cols-1 gap-2">
                              {Object.entries(flowSel.expected.metrics).map(([metricKey, v]) => (
                                <div key={metricKey} className="flex items-center justify-between text-sm">
                                  <div className="text-zinc-500">{metricKey}</div>
                                  <div className="font-medium">{v.delta || "—"} {v.window ? <span className="text-xs text-zinc-500">({v.window})</span> : null}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Actual with scoring per metric */}
                        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 bg-white dark:bg-zinc-900">
                          <div className="text-sm font-medium mb-1">Actual outcome</div>
                          <div className="text-sm text-zinc-600 dark:text-zinc-300">{flowSel.actual?.note || "—"}</div>

                          {/* Metric-by-metric colored cards */}
                          {flowSel.expected?.metrics && flowSel.actual?.metrics && (
                            <div className="mt-3 grid grid-cols-1 gap-2">
                              {Object.entries(flowSel.expected.metrics).map(([metricKey, exp]) => {
                                const act = flowSel.actual.metrics[metricKey] || {};
                                const { status } = scoreOutcome(metricKey, exp, act);

                                const cardMap = {
                                  met: "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300",
                                  partial: "bg-amber-50  dark:bg-amber-900/30  border-amber-300",
                                  missed: "bg-rose-50    dark:bg-rose-900/30    border-rose-300",
                                  na: "bg-zinc-50    dark:bg-zinc-900/40    border-zinc-300",
                                };

                                return (
                                  <div key={metricKey} className={`rounded-lg border p-3 ${cardMap[status]}`}>
                                    <div className="flex items-center justify-between">
                                      <div className="font-medium">{metricKey}</div>
                                      <OutcomeBadge status={status} />
                                    </div>
                                    <div className="text-xs mt-1 text-zinc-600 dark:text-zinc-300">
                                      Expected: {exp.delta || "—"}{exp.window ? ` (${exp.window})` : ""} ·{" "}
                                      Actual: {act.before != null ? `${act.before} → ` : ""}{act.after ?? "—"}{act.delta != null ? ` (${act.delta > 0 ? "+" : ""}${act.delta})` : ""}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>

                    {/* Right: rationale + chat evidence */}
                    <Card className="md:col-span-7">
                      <div className="text-sm font-medium mb-2">Why this decision?</div>
                      {flowDetail?.rationale ? (
                        <>
                          <div className="text-sm">{flowDetail.rationale.reason_summary}</div>
                          <div className="text-sm font-medium mt-3">Evidence (chat)</div>
                          {flowDetail.evidence?.length ? (
                            <div className="space-y-2 max-h-64 overflow-auto pr-1 mt-1">
                              {flowDetail.evidence.map(m => (
                                <div key={m.message_id} className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                                  <div className="text-xs text-zinc-500">{new Date(m.timestamp).toLocaleString()} • {m.sender}</div>
                                  <div className="text-sm">{m.text}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-zinc-500">No linked messages.</div>
                          )}
                        </>
                      ) : (
                        <div className="text-sm text-zinc-500">No rationale loaded.</div>
                      )}
                    </Card>
                  </div>
                )}

              </Card>
            </div>
          </div>
        )}



      </div>
    </div>
  );
}

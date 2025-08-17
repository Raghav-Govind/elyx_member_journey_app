import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, ReferenceArea, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";

import { createPortal } from "react-dom";


import { motion } from "framer-motion";
import { Sun, Moon, Search, Upload, MessageSquare, Activity, Users, CalendarDays, Info, Filter, MapPin, Briefcase, Stethoscope, Plane, User, Send, Loader2 } from "lucide-react";




// const Card = ({ className = "", children, ...props }) => (
//   <div
//     {...props}
//     className={`bg-white/90 dark:bg-zinc-900/90 rounded-2xl shadow-lg border border-zinc-200/60 dark:border-zinc-800/60 p-4 ${className}`}
//   >
//     {children}
//   </div>
// );

const Card = ({ className = "", children, variant = "solid", padding = "p-4", ...props }) => {
  const baseBg = variant === "transparent" ? "bg-transparent dark:bg-transparent" : "bg-white/90 dark:bg-zinc-900/90";
  return (
    <div
      {...props}
      className={`${baseBg} rounded-2xl shadow-lg border border-zinc-200/60 dark:border-zinc-800/60 ${padding} ${className}`}
    >
      {children}
    </div>
  );
};

const Button = ({ className = "", children, ...props }) => (
  <button className={`px-3 py-2 rounded-2xl shadow bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200/60 dark:border-zinc-700/60 transition ${className}`} {...props}>{children}</button>
);
const Input = ({ className = "", ...props }) => (
  <input className={`w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 outline-none focus:ring-2 ring-zinc-300 dark:ring-zinc-700 border border-zinc-200/60 dark:border-zinc-700/60 ${className}`} {...props} />
);

// --- New: glossy premium badge ---
const PremiumBadge = ({ className = "" }) => (
  <span
    className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium text-white
    bg-gradient-to-r from-amber-500 via-pink-500 to-violet-500
    border border-white/20 backdrop-blur-sm ${className}`}
  >
    Elyx Premium Member
  </span>
);



// --- New: subtle data-status pill for the top bar ---
const DataStatus = ({ updatedAt, className = "" }) => (
  <span
    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border
    bg-white/70 dark:bg-zinc-900/70 border-zinc-200/70 dark:border-zinc-800/70
    text-zinc-700 dark:text-zinc-200 ${className}`}
    title="Data status"
  >
    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
    <span className="text-sm">Synced</span>
    <span className="text-xs text-zinc-500">• Updated {fmtDate(updatedAt)}</span>
  </span>
);


// --- Synthetic data generators (deterministic; no uploads needed) ---
function inRange(d, s, e) { return d >= s && d <= e; }
function isTravelDay(date, trips) {
  return (trips || []).some(t => inRange(date, new Date(t.start_at), new Date(t.end_at)));
}



// --- HARD-CODED WEARABLE DATA (no generation) ---
// Range targets used below (46y male):
// HRV 38–65 ms • Recovery 55–90% • Deep 75–110 min • REM 90–140 min • Steps 8k–11k
// const WEARABLE_HARDCODED = [
//   { date: "2025-03-01", member_id: "M0001", HRV_ms: 41.2, recovery_pct: 49, deep_sleep_min: 72, rem_sleep_min: 96, steps: 7800 },
//   { date: "2025-03-02", member_id: "M0001", HRV_ms: 42.0, recovery_pct: 50, deep_sleep_min: 76, rem_sleep_min: 98, steps: 8200 },
//   { date: "2025-03-03", member_id: "M0001", HRV_ms: 39.5, recovery_pct: 51, deep_sleep_min: 74, rem_sleep_min: 95, steps: 7600 },
//   { date: "2025-03-04", member_id: "M0001", HRV_ms: 36.8, recovery_pct: 48, deep_sleep_min: 70, rem_sleep_min: 92, steps: 7300 },  // HRV + Recovery below range (red)
//   { date: "2025-03-05", member_id: "M0001", HRV_ms: 40.3, recovery_pct: 52, deep_sleep_min: 78, rem_sleep_min: 97, steps: 8600 },
//   { date: "2025-03-06", member_id: "M0001", HRV_ms: 44.1, recovery_pct: 53, deep_sleep_min: 80, rem_sleep_min: 100, steps: 9100 },
//   { date: "2025-03-07", member_id: "M0001", HRV_ms: 46.0, recovery_pct: 55, deep_sleep_min: 82, rem_sleep_min: 102, steps: 9800 },  // Recovery enters green
//   { date: "2025-03-08", member_id: "M0001", HRV_ms: 38.0, recovery_pct: 54, deep_sleep_min: 76, rem_sleep_min: 96, steps: 8200 },
//   { date: "2025-03-09", member_id: "M0001", HRV_ms: 37.4, recovery_pct: 52, deep_sleep_min: 75, rem_sleep_min: 94, steps: 8000 },  // HRV red (below)
//   { date: "2025-03-10", member_id: "M0001", HRV_ms: 43.2, recovery_pct: 56, deep_sleep_min: 84, rem_sleep_min: 104, steps: 10500 },
//   { date: "2025-03-11", member_id: "M0001", HRV_ms: 45.0, recovery_pct: 57, deep_sleep_min: 88, rem_sleep_min: 108, steps: 11200 }, // Steps above (good-out)
//   { date: "2025-03-12", member_id: "M0001", HRV_ms: 47.5, recovery_pct: 58, deep_sleep_min: 90, rem_sleep_min: 110, steps: 11800 },
//   { date: "2025-03-13", member_id: "M0001", HRV_ms: 49.0, recovery_pct: 59, deep_sleep_min: 86, rem_sleep_min: 106, steps: 11500 },
//   { date: "2025-03-14", member_id: "M0001", HRV_ms: 51.2, recovery_pct: 60, deep_sleep_min: 92, rem_sleep_min: 112, steps: 9800 },  // Deep above (good-out)
//   { date: "2025-03-15", member_id: "M0001", HRV_ms: 52.6, recovery_pct: 58, deep_sleep_min: 88, rem_sleep_min: 104, steps: 9300 },
//   { date: "2025-03-16", member_id: "M0001", HRV_ms: 50.1, recovery_pct: 57, deep_sleep_min: 85, rem_sleep_min: 101, steps: 8700 },
//   { date: "2025-03-17", member_id: "M0001", HRV_ms: 48.4, recovery_pct: 55, deep_sleep_min: 82, rem_sleep_min: 100, steps: 8500 },
//   { date: "2025-03-18", member_id: "M0001", HRV_ms: 46.7, recovery_pct: 54, deep_sleep_min: 80, rem_sleep_min: 98, steps: 8200 },
//   { date: "2025-03-19", member_id: "M0001", HRV_ms: 44.9, recovery_pct: 53, deep_sleep_min: 78, rem_sleep_min: 96, steps: 7900 },
//   { date: "2025-03-20", member_id: "M0001", HRV_ms: 42.8, recovery_pct: 56, deep_sleep_min: 83, rem_sleep_min: 102, steps: 11000 },
//   { date: "2025-03-21", member_id: "M0001", HRV_ms: 41.0, recovery_pct: 55, deep_sleep_min: 81, rem_sleep_min: 100, steps: 12000 }, // Steps above (good-out)
//   { date: "2025-03-22", member_id: "M0001", HRV_ms: 39.2, recovery_pct: 53, deep_sleep_min: 77, rem_sleep_min: 98, steps: 9800 },
//   { date: "2025-03-23", member_id: "M0001", HRV_ms: 41.8, recovery_pct: 52, deep_sleep_min: 79, rem_sleep_min: 97, steps: 9200 },
//   { date: "2025-03-24", member_id: "M0001", HRV_ms: 44.0, recovery_pct: 57, deep_sleep_min: 84, rem_sleep_min: 105, steps: 10000 },
//   { date: "2025-03-25", member_id: "M0001", HRV_ms: 46.3, recovery_pct: 58, deep_sleep_min: 88, rem_sleep_min: 109, steps: 10800 },
//   { date: "2025-03-26", member_id: "M0001", HRV_ms: 48.9, recovery_pct: 59, deep_sleep_min: 90, rem_sleep_min: 112, steps: 12500 }, // Deep above + steps above
//   { date: "2025-03-27", member_id: "M0001", HRV_ms: 50.5, recovery_pct: 60, deep_sleep_min: 87, rem_sleep_min: 108, steps: 9900 },
//   { date: "2025-03-28", member_id: "M0001", HRV_ms: 52.0, recovery_pct: 58, deep_sleep_min: 85, rem_sleep_min: 104, steps: 9300 },
//   { date: "2025-03-29", member_id: "M0001", HRV_ms: 49.8, recovery_pct: 57, deep_sleep_min: 82, rem_sleep_min: 101, steps: 8900 },
//   { date: "2025-03-30", member_id: "M0001", HRV_ms: 47.2, recovery_pct: 55, deep_sleep_min: 80, rem_sleep_min: 99, steps: 8600 },
//   { date: "2025-03-31", member_id: "M0001", HRV_ms: 45.5, recovery_pct: 54, deep_sleep_min: 78, rem_sleep_min: 97, steps: 8300 },
//   { date: "2025-04-01", member_id: "M0001", HRV_ms: 43.6, recovery_pct: 53, deep_sleep_min: 76, rem_sleep_min: 95, steps: 8000 },
//   { date: "2025-04-02", member_id: "M0001", HRV_ms: 41.9, recovery_pct: 56, deep_sleep_min: 83, rem_sleep_min: 102, steps: 10800 },
//   { date: "2025-04-03", member_id: "M0001", HRV_ms: 40.0, recovery_pct: 54, deep_sleep_min: 79, rem_sleep_min: 98, steps: 9700 },
//   { date: "2025-04-04", member_id: "M0001", HRV_ms: 38.3, recovery_pct: 53, deep_sleep_min: 77, rem_sleep_min: 96, steps: 9400 },
//   { date: "2025-04-05", member_id: "M0001", HRV_ms: 39.0, recovery_pct: 52, deep_sleep_min: 74, rem_sleep_min: 94, steps: 9000 },  // Deep below (red)
//   { date: "2025-04-06", member_id: "M0001", HRV_ms: 42.5, recovery_pct: 58, deep_sleep_min: 85, rem_sleep_min: 105, steps: 11000 },
//   { date: "2025-04-07", member_id: "M0001", HRV_ms: 45.1, recovery_pct: 59, deep_sleep_min: 88, rem_sleep_min: 108, steps: 11800 },
//   { date: "2025-04-08", member_id: "M0001", HRV_ms: 47.6, recovery_pct: 61, deep_sleep_min: 92, rem_sleep_min: 112, steps: 12200 },
//   { date: "2025-04-09", member_id: "M0001", HRV_ms: 49.9, recovery_pct: 60, deep_sleep_min: 89, rem_sleep_min: 109, steps: 11500 }
// ];



// Wearables for 8 months: 2025-02-01 → 2025-09-30
// Travel weeks annotated below. Values are hardcoded (no runtime generation).
const WEARABLE_HARDCODED = [
  { date: "2025-02-01", member_id: "M0001", HRV_ms: 39.9, recovery_pct: 47, deep_sleep_min: 77, rem_sleep_min: 105, steps: 8784 },
  { date: "2025-02-02", member_id: "M0001", HRV_ms: 41.6, recovery_pct: 49, deep_sleep_min: 75, rem_sleep_min: 92, steps: 10338 },
  // Travel week: London, UK (2025-02-03 → 2025-02-09)
  { date: "2025-02-03", member_id: "M0001", HRV_ms: 39.1, recovery_pct: 42, deep_sleep_min: 69, rem_sleep_min: 83, steps: 6782 },
  { date: "2025-02-04", member_id: "M0001", HRV_ms: 39.7, recovery_pct: 44, deep_sleep_min: 73, rem_sleep_min: 91, steps: 10079 },
  { date: "2025-02-05", member_id: "M0001", HRV_ms: 38.1, recovery_pct: 42, deep_sleep_min: 69, rem_sleep_min: 89, steps: 10675 },
  { date: "2025-02-06", member_id: "M0001", HRV_ms: 39.2, recovery_pct: 43, deep_sleep_min: 70, rem_sleep_min: 89, steps: 10374 },
  { date: "2025-02-07", member_id: "M0001", HRV_ms: 37.8, recovery_pct: 42, deep_sleep_min: 63, rem_sleep_min: 89, steps: 10220 },
  { date: "2025-02-08", member_id: "M0001", HRV_ms: 38.5, recovery_pct: 41, deep_sleep_min: 64, rem_sleep_min: 93, steps: 11121 },
  { date: "2025-02-09", member_id: "M0001", HRV_ms: 37.9, recovery_pct: 41, deep_sleep_min: 61, rem_sleep_min: 95, steps: 5309 },
  { date: "2025-02-10", member_id: "M0001", HRV_ms: 40.3, recovery_pct: 48, deep_sleep_min: 74, rem_sleep_min: 106, steps: 10516 },
  { date: "2025-02-11", member_id: "M0001", HRV_ms: 41.7, recovery_pct: 46, deep_sleep_min: 73, rem_sleep_min: 95, steps: 11573 },
  { date: "2025-02-12", member_id: "M0001", HRV_ms: 40.3, recovery_pct: 49, deep_sleep_min: 84, rem_sleep_min: 104, steps: 13277 },
  { date: "2025-02-13", member_id: "M0001", HRV_ms: 42.8, recovery_pct: 49, deep_sleep_min: 80, rem_sleep_min: 100, steps: 12567 },
  { date: "2025-02-14", member_id: "M0001", HRV_ms: 40.1, recovery_pct: 45, deep_sleep_min: 66, rem_sleep_min: 93, steps: 10692 },
  { date: "2025-02-15", member_id: "M0001", HRV_ms: 41.4, recovery_pct: 48, deep_sleep_min: 75, rem_sleep_min: 94, steps: 10263 },
  { date: "2025-02-16", member_id: "M0001", HRV_ms: 41.9, recovery_pct: 50, deep_sleep_min: 83, rem_sleep_min: 103, steps: 11515 },
  { date: "2025-02-17", member_id: "M0001", HRV_ms: 42.4, recovery_pct: 51, deep_sleep_min: 82, rem_sleep_min: 108, steps: 13309 },
  { date: "2025-02-18", member_id: "M0001", HRV_ms: 40.9, recovery_pct: 50, deep_sleep_min: 78, rem_sleep_min: 108, steps: 12253 },
  { date: "2025-02-19", member_id: "M0001", HRV_ms: 40.2, recovery_pct: 48, deep_sleep_min: 77, rem_sleep_min: 103, steps: 10392 },
  { date: "2025-02-20", member_id: "M0001", HRV_ms: 41.8, recovery_pct: 51, deep_sleep_min: 83, rem_sleep_min: 98, steps: 11937 },
  { date: "2025-02-21", member_id: "M0001", HRV_ms: 42.6, recovery_pct: 48, deep_sleep_min: 70, rem_sleep_min: 89, steps: 9626 },
  { date: "2025-02-22", member_id: "M0001", HRV_ms: 43.0, recovery_pct: 51, deep_sleep_min: 80, rem_sleep_min: 99, steps: 11384 },
  { date: "2025-02-23", member_id: "M0001", HRV_ms: 41.6, recovery_pct: 50, deep_sleep_min: 80, rem_sleep_min: 95, steps: 10976 },
  { date: "2025-02-24", member_id: "M0001", HRV_ms: 41.3, recovery_pct: 50, deep_sleep_min: 85, rem_sleep_min: 108, steps: 13504 },
  { date: "2025-02-25", member_id: "M0001", HRV_ms: 43.0, recovery_pct: 51, deep_sleep_min: 82, rem_sleep_min: 106, steps: 13550 },
  { date: "2025-02-26", member_id: "M0001", HRV_ms: 42.2, recovery_pct: 52, deep_sleep_min: 78, rem_sleep_min: 102, steps: 11602 },
  { date: "2025-02-27", member_id: "M0001", HRV_ms: 40.3, recovery_pct: 48, deep_sleep_min: 69, rem_sleep_min: 95, steps: 10008 },
  { date: "2025-02-28", member_id: "M0001", HRV_ms: 41.7, recovery_pct: 52, deep_sleep_min: 87, rem_sleep_min: 113, steps: 12972 },
  { date: "2025-03-01", member_id: "M0001", HRV_ms: 41.9, recovery_pct: 48, deep_sleep_min: 70, rem_sleep_min: 100, steps: 8857 },
  { date: "2025-03-02", member_id: "M0001", HRV_ms: 40.8, recovery_pct: 48, deep_sleep_min: 80, rem_sleep_min: 92, steps: 10325 },
  // Travel week: New York, USA (2025-03-03 → 2025-03-09)
  { date: "2025-03-03", member_id: "M0001", HRV_ms: 38.9, recovery_pct: 42, deep_sleep_min: 67, rem_sleep_min: 86, steps: 6677 },
  { date: "2025-03-04", member_id: "M0001", HRV_ms: 38.8, recovery_pct: 41, deep_sleep_min: 69, rem_sleep_min: 83, steps: 10275 },
  { date: "2025-03-05", member_id: "M0001", HRV_ms: 37.6, recovery_pct: 41, deep_sleep_min: 63, rem_sleep_min: 88, steps: 10078 },
  { date: "2025-03-06", member_id: "M0001", HRV_ms: 38.7, recovery_pct: 43, deep_sleep_min: 69, rem_sleep_min: 94, steps: 11046 },
  { date: "2025-03-07", member_id: "M0001", HRV_ms: 38.6, recovery_pct: 44, deep_sleep_min: 68, rem_sleep_min: 92, steps: 10045 },
  { date: "2025-03-08", member_id: "M0001", HRV_ms: 38.5, recovery_pct: 44, deep_sleep_min: 63, rem_sleep_min: 86, steps: 11451 },
  { date: "2025-03-09", member_id: "M0001", HRV_ms: 38.3, recovery_pct: 41, deep_sleep_min: 65, rem_sleep_min: 94, steps: 6133 },
  { date: "2025-03-10", member_id: "M0001", HRV_ms: 40.8, recovery_pct: 48, deep_sleep_min: 87, rem_sleep_min: 109, steps: 12425 },
  { date: "2025-03-11", member_id: "M0001", HRV_ms: 41.7, recovery_pct: 49, deep_sleep_min: 85, rem_sleep_min: 101, steps: 12640 },
  { date: "2025-03-12", member_id: "M0001", HRV_ms: 40.1, recovery_pct: 48, deep_sleep_min: 73, rem_sleep_min: 93, steps: 10539 },
  { date: "2025-03-13", member_id: "M0001", HRV_ms: 42.5, recovery_pct: 50, deep_sleep_min: 86, rem_sleep_min: 110, steps: 13017 },
  { date: "2025-03-14", member_id: "M0001", HRV_ms: 42.1, recovery_pct: 52, deep_sleep_min: 85, rem_sleep_min: 107, steps: 12874 },
  { date: "2025-03-15", member_id: "M0001", HRV_ms: 43.0, recovery_pct: 51, deep_sleep_min: 85, rem_sleep_min: 111, steps: 12708 },
  { date: "2025-03-16", member_id: "M0001", HRV_ms: 42.3, recovery_pct: 51, deep_sleep_min: 85, rem_sleep_min: 112, steps: 12125 },
  { date: "2025-03-17", member_id: "M0001", HRV_ms: 41.0, recovery_pct: 51, deep_sleep_min: 83, rem_sleep_min: 100, steps: 12425 },
  { date: "2025-03-18", member_id: "M0001", HRV_ms: 41.0, recovery_pct: 50, deep_sleep_min: 74, rem_sleep_min: 88, steps: 10431 },
  { date: "2025-03-19", member_id: "M0001", HRV_ms: 43.0, recovery_pct: 51, deep_sleep_min: 80, rem_sleep_min: 102, steps: 13159 },
  { date: "2025-03-20", member_id: "M0001", HRV_ms: 41.8, recovery_pct: 48, deep_sleep_min: 74, rem_sleep_min: 95, steps: 11841 },
  { date: "2025-03-21", member_id: "M0001", HRV_ms: 41.3, recovery_pct: 48, deep_sleep_min: 71, rem_sleep_min: 101, steps: 12074 },
  { date: "2025-03-22", member_id: "M0001", HRV_ms: 44.0, recovery_pct: 53, deep_sleep_min: 91, rem_sleep_min: 110, steps: 12996 },
  { date: "2025-03-23", member_id: "M0001", HRV_ms: 41.1, recovery_pct: 47, deep_sleep_min: 72, rem_sleep_min: 88, steps: 10064 },
  { date: "2025-03-24", member_id: "M0001", HRV_ms: 42.1, recovery_pct: 51, deep_sleep_min: 84, rem_sleep_min: 100, steps: 13013 },
  { date: "2025-03-25", member_id: "M0001", HRV_ms: 42.2, recovery_pct: 54, deep_sleep_min: 88, rem_sleep_min: 109, steps: 13023 },
  { date: "2025-03-26", member_id: "M0001", HRV_ms: 42.9, recovery_pct: 53, deep_sleep_min: 82, rem_sleep_min: 103, steps: 12753 },
  { date: "2025-03-27", member_id: "M0001", HRV_ms: 43.2, recovery_pct: 49, deep_sleep_min: 72, rem_sleep_min: 88, steps: 10061 },
  { date: "2025-03-28", member_id: "M0001", HRV_ms: 43.2, recovery_pct: 50, deep_sleep_min: 84, rem_sleep_min: 99, steps: 12473 },
  { date: "2025-03-29", member_id: "M0001", HRV_ms: 43.3, recovery_pct: 49, deep_sleep_min: 75, rem_sleep_min: 103, steps: 11646 },
  { date: "2025-03-30", member_id: "M0001", HRV_ms: 44.2, recovery_pct: 51, deep_sleep_min: 85, rem_sleep_min: 113, steps: 13575 },
  { date: "2025-03-31", member_id: "M0001", HRV_ms: 42.9, recovery_pct: 49, deep_sleep_min: 76, rem_sleep_min: 90, steps: 10305 },
  { date: "2025-04-01", member_id: "M0001", HRV_ms: 42.1, recovery_pct: 52, deep_sleep_min: 84, rem_sleep_min: 113, steps: 13307 },
  { date: "2025-04-02", member_id: "M0001", HRV_ms: 41.8, recovery_pct: 50, deep_sleep_min: 78, rem_sleep_min: 98, steps: 11817 },
  { date: "2025-04-03", member_id: "M0001", HRV_ms: 43.7, recovery_pct: 52, deep_sleep_min: 86, rem_sleep_min: 101, steps: 12574 },
  { date: "2025-04-04", member_id: "M0001", HRV_ms: 41.9, recovery_pct: 48, deep_sleep_min: 66, rem_sleep_min: 84, steps: 10219 },
  { date: "2025-04-05", member_id: "M0001", HRV_ms: 43.9, recovery_pct: 50, deep_sleep_min: 80, rem_sleep_min: 106, steps: 13171 },
  { date: "2025-04-06", member_id: "M0001", HRV_ms: 43.9, recovery_pct: 50, deep_sleep_min: 80, rem_sleep_min: 103, steps: 12176 },
  // Travel week: Seoul, South Korea (2025-04-07 → 2025-04-13)
  { date: "2025-04-07", member_id: "M0001", HRV_ms: 41.8, recovery_pct: 45, deep_sleep_min: 72, rem_sleep_min: 89, steps: 8531 },
  { date: "2025-04-08", member_id: "M0001", HRV_ms: 41.8, recovery_pct: 44, deep_sleep_min: 73, rem_sleep_min: 84, steps: 11269 },
  { date: "2025-04-09", member_id: "M0001", HRV_ms: 40.7, recovery_pct: 44, deep_sleep_min: 74, rem_sleep_min: 86, steps: 11221 },
  { date: "2025-04-10", member_id: "M0001", HRV_ms: 41.1, recovery_pct: 45, deep_sleep_min: 72, rem_sleep_min: 86, steps: 9977 },
  { date: "2025-04-11", member_id: "M0001", HRV_ms: 41.1, recovery_pct: 44, deep_sleep_min: 72, rem_sleep_min: 86, steps: 9728 },
  { date: "2025-04-12", member_id: "M0001", HRV_ms: 41.4, recovery_pct: 45, deep_sleep_min: 71, rem_sleep_min: 90, steps: 10631 },
  { date: "2025-04-13", member_id: "M0001", HRV_ms: 40.0, recovery_pct: 43, deep_sleep_min: 72, rem_sleep_min: 90, steps: 6082 },
  { date: "2025-04-14", member_id: "M0001", HRV_ms: 43.5, recovery_pct: 53, deep_sleep_min: 90, rem_sleep_min: 111, steps: 13238 },
  { date: "2025-04-15", member_id: "M0001", HRV_ms: 41.7, recovery_pct: 52, deep_sleep_min: 82, rem_sleep_min: 99, steps: 12483 },
  { date: "2025-04-16", member_id: "M0001", HRV_ms: 43.9, recovery_pct: 52, deep_sleep_min: 84, rem_sleep_min: 108, steps: 13593 },
  { date: "2025-04-17", member_id: "M0001", HRV_ms: 41.3, recovery_pct: 49, deep_sleep_min: 70, rem_sleep_min: 95, steps: 10172 },
  { date: "2025-04-18", member_id: "M0001", HRV_ms: 45.6, recovery_pct: 53, deep_sleep_min: 90, rem_sleep_min: 112, steps: 13228 },
  { date: "2025-04-19", member_id: "M0001", HRV_ms: 43.0, recovery_pct: 49, deep_sleep_min: 70, rem_sleep_min: 91, steps: 10536 },
  { date: "2025-04-20", member_id: "M0001", HRV_ms: 45.6, recovery_pct: 53, deep_sleep_min: 92, rem_sleep_min: 114, steps: 13387 },
  { date: "2025-04-21", member_id: "M0001", HRV_ms: 44.0, recovery_pct: 50, deep_sleep_min: 84, rem_sleep_min: 96, steps: 12138 },
  { date: "2025-04-22", member_id: "M0001", HRV_ms: 42.6, recovery_pct: 52, deep_sleep_min: 90, rem_sleep_min: 106, steps: 12981 },
  { date: "2025-04-23", member_id: "M0001", HRV_ms: 44.0, recovery_pct: 53, deep_sleep_min: 90, rem_sleep_min: 105, steps: 13487 },
  { date: "2025-04-24", member_id: "M0001", HRV_ms: 43.6, recovery_pct: 52, deep_sleep_min: 89, rem_sleep_min: 108, steps: 12945 },
  { date: "2025-04-25", member_id: "M0001", HRV_ms: 45.4, recovery_pct: 54, deep_sleep_min: 88, rem_sleep_min: 110, steps: 13087 },
  { date: "2025-04-26", member_id: "M0001", HRV_ms: 43.1, recovery_pct: 52, deep_sleep_min: 84, rem_sleep_min: 105, steps: 13014 },
  { date: "2025-04-27", member_id: "M0001", HRV_ms: 45.7, recovery_pct: 54, deep_sleep_min: 92, rem_sleep_min: 115, steps: 13609 },
  { date: "2025-04-28", member_id: "M0001", HRV_ms: 44.7, recovery_pct: 52, deep_sleep_min: 83, rem_sleep_min: 101, steps: 12485 },
  { date: "2025-04-29", member_id: "M0001", HRV_ms: 43.9, recovery_pct: 50, deep_sleep_min: 78, rem_sleep_min: 102, steps: 11434 },
  { date: "2025-04-30", member_id: "M0001", HRV_ms: 44.5, recovery_pct: 52, deep_sleep_min: 88, rem_sleep_min: 115, steps: 13536 },
  { date: "2025-05-01", member_id: "M0001", HRV_ms: 45.5, recovery_pct: 53, deep_sleep_min: 91, rem_sleep_min: 114, steps: 13515 },
  { date: "2025-05-02", member_id: "M0001", HRV_ms: 44.3, recovery_pct: 54, deep_sleep_min: 87, rem_sleep_min: 108, steps: 13216 },
  // Travel week: Jakarta, Indonesia (2025-05-05 → 2025-05-11)
  { date: "2025-05-03", member_id: "M0001", HRV_ms: 45.8, recovery_pct: 55, deep_sleep_min: 90, rem_sleep_min: 115, steps: 13483 },
  { date: "2025-05-04", member_id: "M0001", HRV_ms: 43.6, recovery_pct: 51, deep_sleep_min: 80, rem_sleep_min: 97, steps: 11814 },
  { date: "2025-05-05", member_id: "M0001", HRV_ms: 41.1, recovery_pct: 47, deep_sleep_min: 74, rem_sleep_min: 87, steps: 7672 },
  { date: "2025-05-06", member_id: "M0001", HRV_ms: 42.5, recovery_pct: 48, deep_sleep_min: 80, rem_sleep_min: 99, steps: 11859 },
  { date: "2025-05-07", member_id: "M0001", HRV_ms: 41.8, recovery_pct: 49, deep_sleep_min: 80, rem_sleep_min: 94, steps: 12191 },
  { date: "2025-05-08", member_id: "M0001", HRV_ms: 42.8, recovery_pct: 49, deep_sleep_min: 82, rem_sleep_min: 97, steps: 11487 },
  { date: "2025-05-09", member_id: "M0001", HRV_ms: 42.7, recovery_pct: 50, deep_sleep_min: 82, rem_sleep_min: 92, steps: 11788 },
  { date: "2025-05-10", member_id: "M0001", HRV_ms: 41.2, recovery_pct: 47, deep_sleep_min: 76, rem_sleep_min: 93, steps: 11231 },
  { date: "2025-05-11", member_id: "M0001", HRV_ms: 40.9, recovery_pct: 45, deep_sleep_min: 74, rem_sleep_min: 97, steps: 6010 },
  { date: "2025-05-12", member_id: "M0001", HRV_ms: 44.0, recovery_pct: 50, deep_sleep_min: 86, rem_sleep_min: 108, steps: 12567 },
  { date: "2025-05-13", member_id: "M0001", HRV_ms: 45.7, recovery_pct: 54, deep_sleep_min: 92, rem_sleep_min: 102, steps: 13146 },
  { date: "2025-05-14", member_id: "M0001", HRV_ms: 45.9, recovery_pct: 56, deep_sleep_min: 92, rem_sleep_min: 105, steps: 13283 },
  { date: "2025-05-15", member_id: "M0001", HRV_ms: 45.3, recovery_pct: 55, deep_sleep_min: 88, rem_sleep_min: 113, steps: 13498 },
  { date: "2025-05-16", member_id: "M0001", HRV_ms: 44.7, recovery_pct: 55, deep_sleep_min: 90, rem_sleep_min: 103, steps: 12972 },
  { date: "2025-05-17", member_id: "M0001", HRV_ms: 44.4, recovery_pct: 54, deep_sleep_min: 90, rem_sleep_min: 105, steps: 13185 },
  { date: "2025-05-18", member_id: "M0001", HRV_ms: 45.0, recovery_pct: 55, deep_sleep_min: 89, rem_sleep_min: 104, steps: 13288 },
  { date: "2025-05-19", member_id: "M0001", HRV_ms: 45.2, recovery_pct: 53, deep_sleep_min: 86, rem_sleep_min: 103, steps: 12203 },
  { date: "2025-05-20", member_id: "M0001", HRV_ms: 46.1, recovery_pct: 55, deep_sleep_min: 92, rem_sleep_min: 110, steps: 13350 },
  { date: "2025-05-21", member_id: "M0001", HRV_ms: 45.4, recovery_pct: 55, deep_sleep_min: 90, rem_sleep_min: 111, steps: 13355 },
  { date: "2025-05-22", member_id: "M0001", HRV_ms: 45.6, recovery_pct: 54, deep_sleep_min: 87, rem_sleep_min: 103, steps: 12434 },
  { date: "2025-05-23", member_id: "M0001", HRV_ms: 44.1, recovery_pct: 55, deep_sleep_min: 92, rem_sleep_min: 110, steps: 12977 },
  { date: "2025-05-24", member_id: "M0001", HRV_ms: 45.4, recovery_pct: 55, deep_sleep_min: 93, rem_sleep_min: 112, steps: 13378 },
  { date: "2025-05-25", member_id: "M0001", HRV_ms: 46.2, recovery_pct: 55, deep_sleep_min: 90, rem_sleep_min: 111, steps: 13459 },
  { date: "2025-05-26", member_id: "M0001", HRV_ms: 44.6, recovery_pct: 55, deep_sleep_min: 90, rem_sleep_min: 103, steps: 12683 },
  { date: "2025-05-27", member_id: "M0001", HRV_ms: 44.8, recovery_pct: 54, deep_sleep_min: 91, rem_sleep_min: 111, steps: 13152 },
  { date: "2025-05-28", member_id: "M0001", HRV_ms: 45.7, recovery_pct: 56, deep_sleep_min: 92, rem_sleep_min: 114, steps: 13440 },
  { date: "2025-05-29", member_id: "M0001", HRV_ms: 46.6, recovery_pct: 56, deep_sleep_min: 92, rem_sleep_min: 104, steps: 13067 },
  { date: "2025-05-30", member_id: "M0001", HRV_ms: 45.5, recovery_pct: 54, deep_sleep_min: 87, rem_sleep_min: 95, steps: 11166 },
  { date: "2025-05-31", member_id: "M0001", HRV_ms: 44.6, recovery_pct: 54, deep_sleep_min: 91, rem_sleep_min: 109, steps: 13164 },
  { date: "2025-06-01", member_id: "M0001", HRV_ms: 45.8, recovery_pct: 52, deep_sleep_min: 83, rem_sleep_min: 105, steps: 12561 },
  // Travel week: London, UK (2025-06-02 → 2025-06-08)
  { date: "2025-06-02", member_id: "M0001", HRV_ms: 42.0, recovery_pct: 45, deep_sleep_min: 73, rem_sleep_min: 90, steps: 7868 },
  { date: "2025-06-03", member_id: "M0001", HRV_ms: 42.8, recovery_pct: 46, deep_sleep_min: 80, rem_sleep_min: 91, steps: 10472 },
  { date: "2025-06-04", member_id: "M0001", HRV_ms: 42.5, recovery_pct: 48, deep_sleep_min: 84, rem_sleep_min: 92, steps: 11147 },
  { date: "2025-06-05", member_id: "M0001", HRV_ms: 41.6, recovery_pct: 46, deep_sleep_min: 79, rem_sleep_min: 90, steps: 10977 },
  { date: "2025-06-06", member_id: "M0001", HRV_ms: 43.2, recovery_pct: 48, deep_sleep_min: 84, rem_sleep_min: 100, steps: 10984 },
  { date: "2025-06-07", member_id: "M0001", HRV_ms: 42.0, recovery_pct: 47, deep_sleep_min: 77, rem_sleep_min: 97, steps: 11046 },
  { date: "2025-06-08", member_id: "M0001", HRV_ms: 41.3, recovery_pct: 45, deep_sleep_min: 77, rem_sleep_min: 96, steps: 6428 },
  { date: "2025-06-09", member_id: "M0001", HRV_ms: 46.1, recovery_pct: 57, deep_sleep_min: 93, rem_sleep_min: 114, steps: 13551 },
  { date: "2025-06-10", member_id: "M0001", HRV_ms: 44.6, recovery_pct: 53, deep_sleep_min: 86, rem_sleep_min: 103, steps: 12718 },
  { date: "2025-06-11", member_id: "M0001", HRV_ms: 46.1, recovery_pct: 55, deep_sleep_min: 91, rem_sleep_min: 105, steps: 13190 },
  { date: "2025-06-12", member_id: "M0001", HRV_ms: 47.0, recovery_pct: 56, deep_sleep_min: 92, rem_sleep_min: 108, steps: 13377 },
  { date: "2025-06-13", member_id: "M0001", HRV_ms: 46.1, recovery_pct: 55, deep_sleep_min: 90, rem_sleep_min: 111, steps: 13368 },
  { date: "2025-06-14", member_id: "M0001", HRV_ms: 46.3, recovery_pct: 56, deep_sleep_min: 93, rem_sleep_min: 110, steps: 13328 },
  { date: "2025-06-15", member_id: "M0001", HRV_ms: 46.2, recovery_pct: 56, deep_sleep_min: 92, rem_sleep_min: 108, steps: 13312 },
  { date: "2025-06-16", member_id: "M0001", HRV_ms: 44.8, recovery_pct: 55, deep_sleep_min: 92, rem_sleep_min: 109, steps: 13278 },
  { date: "2025-06-17", member_id: "M0001", HRV_ms: 45.6, recovery_pct: 54, deep_sleep_min: 87, rem_sleep_min: 108, steps: 13002 },
  { date: "2025-06-18", member_id: "M0001", HRV_ms: 46.9, recovery_pct: 57, deep_sleep_min: 93, rem_sleep_min: 113, steps: 13468 },
  { date: "2025-06-19", member_id: "M0001", HRV_ms: 44.7, recovery_pct: 54, deep_sleep_min: 88, rem_sleep_min: 108, steps: 13246 },
  { date: "2025-06-20", member_id: "M0001", HRV_ms: 45.3, recovery_pct: 56, deep_sleep_min: 90, rem_sleep_min: 111, steps: 13371 },
  { date: "2025-06-21", member_id: "M0001", HRV_ms: 46.5, recovery_pct: 55, deep_sleep_min: 91, rem_sleep_min: 109, steps: 13272 },
  { date: "2025-06-22", member_id: "M0001", HRV_ms: 46.8, recovery_pct: 57, deep_sleep_min: 93, rem_sleep_min: 112, steps: 13386 },
  { date: "2025-06-23", member_id: "M0001", HRV_ms: 46.6, recovery_pct: 55, deep_sleep_min: 89, rem_sleep_min: 109, steps: 13173 },
  { date: "2025-06-24", member_id: "M0001", HRV_ms: 46.2, recovery_pct: 56, deep_sleep_min: 92, rem_sleep_min: 112, steps: 13485 },
  { date: "2025-06-25", member_id: "M0001", HRV_ms: 46.3, recovery_pct: 56, deep_sleep_min: 93, rem_sleep_min: 107, steps: 13298 },
  { date: "2025-06-26", member_id: "M0001", HRV_ms: 46.8, recovery_pct: 56, deep_sleep_min: 92, rem_sleep_min: 104, steps: 12914 },
  { date: "2025-06-27", member_id: "M0001", HRV_ms: 45.6, recovery_pct: 55, deep_sleep_min: 91, rem_sleep_min: 111, steps: 13343 },
  { date: "2025-06-28", member_id: "M0001", HRV_ms: 46.0, recovery_pct: 55, deep_sleep_min: 91, rem_sleep_min: 113, steps: 13438 },
  { date: "2025-06-29", member_id: "M0001", HRV_ms: 46.2, recovery_pct: 55, deep_sleep_min: 90, rem_sleep_min: 106, steps: 13190 },
  { date: "2025-06-30", member_id: "M0001", HRV_ms: 45.5, recovery_pct: 55, deep_sleep_min: 90, rem_sleep_min: 106, steps: 13236 },
  { date: "2025-07-01", member_id: "M0001", HRV_ms: 45.5, recovery_pct: 55, deep_sleep_min: 89, rem_sleep_min: 103, steps: 13059 },
  { date: "2025-07-02", member_id: "M0001", HRV_ms: 46.6, recovery_pct: 55, deep_sleep_min: 90, rem_sleep_min: 105, steps: 13259 },
  { date: "2025-07-03", member_id: "M0001", HRV_ms: 45.8, recovery_pct: 57, deep_sleep_min: 92, rem_sleep_min: 112, steps: 13539 },
  { date: "2025-07-04", member_id: "M0001", HRV_ms: 47.8, recovery_pct: 56, deep_sleep_min: 92, rem_sleep_min: 112, steps: 13419 },
  { date: "2025-07-05", member_id: "M0001", HRV_ms: 46.9, recovery_pct: 55, deep_sleep_min: 89, rem_sleep_min: 109, steps: 13217 },
  { date: "2025-07-06", member_id: "M0001", HRV_ms: 46.2, recovery_pct: 56, deep_sleep_min: 92, rem_sleep_min: 109, steps: 13312 },
  // Travel week: New York, USA (2025-07-07 → 2025-07-13)
  { date: "2025-07-07", member_id: "M0001", HRV_ms: 44.0, recovery_pct: 47, deep_sleep_min: 80, rem_sleep_min: 97, steps: 8320 },
  { date: "2025-07-08", member_id: "M0001", HRV_ms: 44.8, recovery_pct: 49, deep_sleep_min: 86, rem_sleep_min: 97, steps: 11473 },
  { date: "2025-07-09", member_id: "M0001", HRV_ms: 43.4, recovery_pct: 48, deep_sleep_min: 82, rem_sleep_min: 94, steps: 11278 },
  { date: "2025-07-10", member_id: "M0001", HRV_ms: 43.5, recovery_pct: 48, deep_sleep_min: 80, rem_sleep_min: 102, steps: 11296 },
  { date: "2025-07-11", member_id: "M0001", HRV_ms: 44.5, recovery_pct: 49, deep_sleep_min: 86, rem_sleep_min: 104, steps: 11644 },
  { date: "2025-07-12", member_id: "M0001", HRV_ms: 43.6, recovery_pct: 48, deep_sleep_min: 83, rem_sleep_min: 102, steps: 10761 },
  { date: "2025-07-13", member_id: "M0001", HRV_ms: 44.0, recovery_pct: 48, deep_sleep_min: 82, rem_sleep_min: 100, steps: 6269 },
  { date: "2025-07-14", member_id: "M0001", HRV_ms: 47.1, recovery_pct: 58, deep_sleep_min: 93, rem_sleep_min: 110, steps: 13483 },
  { date: "2025-07-15", member_id: "M0001", HRV_ms: 45.8, recovery_pct: 57, deep_sleep_min: 91, rem_sleep_min: 108, steps: 13360 },
  { date: "2025-07-16", member_id: "M0001", HRV_ms: 48.0, recovery_pct: 59, deep_sleep_min: 93, rem_sleep_min: 111, steps: 13298 },
  { date: "2025-07-17", member_id: "M0001", HRV_ms: 46.6, recovery_pct: 55, deep_sleep_min: 88, rem_sleep_min: 100, steps: 12138 },
  { date: "2025-07-18", member_id: "M0001", HRV_ms: 47.6, recovery_pct: 57, deep_sleep_min: 90, rem_sleep_min: 108, steps: 13471 },
  { date: "2025-07-19", member_id: "M0001", HRV_ms: 46.1, recovery_pct: 55, deep_sleep_min: 88, rem_sleep_min: 106, steps: 13346 },
  { date: "2025-07-20", member_id: "M0001", HRV_ms: 48.0, recovery_pct: 59, deep_sleep_min: 92, rem_sleep_min: 114, steps: 13582 },
  { date: "2025-07-21", member_id: "M0001", HRV_ms: 46.2, recovery_pct: 55, deep_sleep_min: 89, rem_sleep_min: 110, steps: 13268 },
  { date: "2025-07-22", member_id: "M0001", HRV_ms: 46.1, recovery_pct: 56, deep_sleep_min: 92, rem_sleep_min: 111, steps: 13377 },
  { date: "2025-07-23", member_id: "M0001", HRV_ms: 48.0, recovery_pct: 58, deep_sleep_min: 92, rem_sleep_min: 104, steps: 12983 },
  { date: "2025-07-24", member_id: "M0001", HRV_ms: 47.2, recovery_pct: 58, deep_sleep_min: 93, rem_sleep_min: 111, steps: 13468 },
  { date: "2025-07-25", member_id: "M0001", HRV_ms: 45.5, recovery_pct: 57, deep_sleep_min: 93, rem_sleep_min: 111, steps: 13290 },
  { date: "2025-07-26", member_id: "M0001", HRV_ms: 46.1, recovery_pct: 55, deep_sleep_min: 91, rem_sleep_min: 108, steps: 13103 },
  { date: "2025-07-27", member_id: "M0001", HRV_ms: 46.8, recovery_pct: 57, deep_sleep_min: 92, rem_sleep_min: 113, steps: 13498 },
  { date: "2025-07-28", member_id: "M0001", HRV_ms: 46.8, recovery_pct: 57, deep_sleep_min: 91, rem_sleep_min: 112, steps: 13378 },
  { date: "2025-07-29", member_id: "M0001", HRV_ms: 45.7, recovery_pct: 55, deep_sleep_min: 90, rem_sleep_min: 108, steps: 13173 },
  { date: "2025-07-30", member_id: "M0001", HRV_ms: 47.1, recovery_pct: 57, deep_sleep_min: 93, rem_sleep_min: 115, steps: 13566 },
  { date: "2025-07-31", member_id: "M0001", HRV_ms: 45.9, recovery_pct: 55, deep_sleep_min: 91, rem_sleep_min: 114, steps: 13447 },
  { date: "2025-08-01", member_id: "M0001", HRV_ms: 46.7, recovery_pct: 58, deep_sleep_min: 93, rem_sleep_min: 114, steps: 13545 },
  { date: "2025-08-02", member_id: "M0001", HRV_ms: 46.0, recovery_pct: 56, deep_sleep_min: 92, rem_sleep_min: 113, steps: 13450 },
  // Travel week: Seoul, South Korea (2025-08-04 → 2025-08-10)
  { date: "2025-08-03", member_id: "M0001", HRV_ms: 46.6, recovery_pct: 56, deep_sleep_min: 92, rem_sleep_min: 112, steps: 13362 },
  { date: "2025-08-04", member_id: "M0001", HRV_ms: 44.5, recovery_pct: 49, deep_sleep_min: 81, rem_sleep_min: 96, steps: 8684 },
  { date: "2025-08-05", member_id: "M0001", HRV_ms: 45.0, recovery_pct: 52, deep_sleep_min: 86, rem_sleep_min: 98, steps: 11489 },
  { date: "2025-08-06", member_id: "M0001", HRV_ms: 43.4, recovery_pct: 50, deep_sleep_min: 83, rem_sleep_min: 100, steps: 11277 },
  { date: "2025-08-07", member_id: "M0001", HRV_ms: 45.2, recovery_pct: 52, deep_sleep_min: 88, rem_sleep_min: 104, steps: 11632 },
  { date: "2025-08-08", member_id: "M0001", HRV_ms: 45.2, recovery_pct: 51, deep_sleep_min: 84, rem_sleep_min: 105, steps: 11352 },
  { date: "2025-08-09", member_id: "M0001", HRV_ms: 44.1, recovery_pct: 51, deep_sleep_min: 83, rem_sleep_min: 100, steps: 11563 },
  { date: "2025-08-10", member_id: "M0001", HRV_ms: 44.9, recovery_pct: 51, deep_sleep_min: 84, rem_sleep_min: 105, steps: 6642 },
  { date: "2025-08-11", member_id: "M0001", HRV_ms: 47.0, recovery_pct: 58, deep_sleep_min: 92, rem_sleep_min: 114, steps: 13546 },
  { date: "2025-08-12", member_id: "M0001", HRV_ms: 47.3, recovery_pct: 58, deep_sleep_min: 92, rem_sleep_min: 113, steps: 13385 },
  { date: "2025-08-13", member_id: "M0001", HRV_ms: 46.4, recovery_pct: 56, deep_sleep_min: 90, rem_sleep_min: 112, steps: 13431 },
  { date: "2025-08-14", member_id: "M0001", HRV_ms: 47.9, recovery_pct: 58, deep_sleep_min: 92, rem_sleep_min: 103, steps: 13037 },
  { date: "2025-08-15", member_id: "M0001", HRV_ms: 48.0, recovery_pct: 58, deep_sleep_min: 92, rem_sleep_min: 110, steps: 13430 },
  { date: "2025-08-16", member_id: "M0001", HRV_ms: 47.6, recovery_pct: 58, deep_sleep_min: 92, rem_sleep_min: 114, steps: 13575 },
  { date: "2025-08-17", member_id: "M0001", HRV_ms: 47.0, recovery_pct: 57, deep_sleep_min: 92, rem_sleep_min: 111, steps: 13472 },
  { date: "2025-08-18", member_id: "M0001", HRV_ms: 48.1, recovery_pct: 58, deep_sleep_min: 92, rem_sleep_min: 109, steps: 13187 },
  { date: "2025-08-19", member_id: "M0001", HRV_ms: 48.5, recovery_pct: 58, deep_sleep_min: 93, rem_sleep_min: 111, steps: 13420 },
  { date: "2025-08-20", member_id: "M0001", HRV_ms: 47.6, recovery_pct: 57, deep_sleep_min: 91, rem_sleep_min: 110, steps: 13418 },
  { date: "2025-08-21", member_id: "M0001", HRV_ms: 47.0, recovery_pct: 56, deep_sleep_min: 92, rem_sleep_min: 110, steps: 13361 },
  { date: "2025-08-22", member_id: "M0001", HRV_ms: 47.3, recovery_pct: 56, deep_sleep_min: 90, rem_sleep_min: 112, steps: 13338 },
  { date: "2025-08-23", member_id: "M0001", HRV_ms: 47.5, recovery_pct: 57, deep_sleep_min: 93, rem_sleep_min: 115, steps: 13498 },
  { date: "2025-08-24", member_id: "M0001", HRV_ms: 47.0, recovery_pct: 57, deep_sleep_min: 92, rem_sleep_min: 110, steps: 13388 },
  { date: "2025-08-25", member_id: "M0001", HRV_ms: 47.8, recovery_pct: 58, deep_sleep_min: 93, rem_sleep_min: 112, steps: 13481 },
  { date: "2025-08-26", member_id: "M0001", HRV_ms: 46.9, recovery_pct: 58, deep_sleep_min: 93, rem_sleep_min: 111, steps: 13541 },
  { date: "2025-08-27", member_id: "M0001", HRV_ms: 48.0, recovery_pct: 59, deep_sleep_min: 93, rem_sleep_min: 114, steps: 13568 },
  { date: "2025-08-28", member_id: "M0001", HRV_ms: 46.8, recovery_pct: 56, deep_sleep_min: 90, rem_sleep_min: 111, steps: 13449 },
  { date: "2025-08-29", member_id: "M0001", HRV_ms: 47.4, recovery_pct: 58, deep_sleep_min: 93, rem_sleep_min: 112, steps: 13443 },
  { date: "2025-08-30", member_id: "M0001", HRV_ms: 47.9, recovery_pct: 58, deep_sleep_min: 92, rem_sleep_min: 111, steps: 13399 },
  { date: "2025-08-31", member_id: "M0001", HRV_ms: 47.2, recovery_pct: 58, deep_sleep_min: 93, rem_sleep_min: 111, steps: 13487 },
  // Travel week: Jakarta, Indonesia (2025-09-01 → 2025-09-07)
  { date: "2025-09-01", member_id: "M0001", HRV_ms: 45.1, recovery_pct: 50, deep_sleep_min: 85, rem_sleep_min: 100, steps: 8531 },
  { date: "2025-09-02", member_id: "M0001", HRV_ms: 45.2, recovery_pct: 51, deep_sleep_min: 88, rem_sleep_min: 97, steps: 11661 },
  { date: "2025-09-03", member_id: "M0001", HRV_ms: 44.3, recovery_pct: 53, deep_sleep_min: 89, rem_sleep_min: 101, steps: 11853 },
  { date: "2025-09-04", member_id: "M0001", HRV_ms: 44.8, recovery_pct: 51, deep_sleep_min: 86, rem_sleep_min: 98, steps: 11612 },
  { date: "2025-09-05", member_id: "M0001", HRV_ms: 44.8, recovery_pct: 51, deep_sleep_min: 87, rem_sleep_min: 102, steps: 11948 },
  { date: "2025-09-06", member_id: "M0001", HRV_ms: 45.7, recovery_pct: 52, deep_sleep_min: 89, rem_sleep_min: 104, steps: 11677 },
  { date: "2025-09-07", member_id: "M0001", HRV_ms: 45.8, recovery_pct: 52, deep_sleep_min: 90, rem_sleep_min: 109, steps: 6623 },
  { date: "2025-09-08", member_id: "M0001", HRV_ms: 49.2, recovery_pct: 60, deep_sleep_min: 93, rem_sleep_min: 113, steps: 13435 },
  { date: "2025-09-09", member_id: "M0001", HRV_ms: 49.7, recovery_pct: 58, deep_sleep_min: 93, rem_sleep_min: 111, steps: 13349 },
  { date: "2025-09-10", member_id: "M0001", HRV_ms: 50.4, recovery_pct: 60, deep_sleep_min: 93, rem_sleep_min: 114, steps: 13561 },
  { date: "2025-09-11", member_id: "M0001", HRV_ms: 48.6, recovery_pct: 57, deep_sleep_min: 90, rem_sleep_min: 111, steps: 13246 },
  { date: "2025-09-12", member_id: "M0001", HRV_ms: 49.8, recovery_pct: 59, deep_sleep_min: 92, rem_sleep_min: 114, steps: 13558 },
  { date: "2025-09-13", member_id: "M0001", HRV_ms: 49.6, recovery_pct: 60, deep_sleep_min: 93, rem_sleep_min: 113, steps: 13557 },
  { date: "2025-09-14", member_id: "M0001", HRV_ms: 49.6, recovery_pct: 60, deep_sleep_min: 94, rem_sleep_min: 114, steps: 13576 },
  { date: "2025-09-15", member_id: "M0001", HRV_ms: 49.2, recovery_pct: 59, deep_sleep_min: 93, rem_sleep_min: 112, steps: 13402 },
  { date: "2025-09-16", member_id: "M0001", HRV_ms: 49.7, recovery_pct: 59, deep_sleep_min: 92, rem_sleep_min: 114, steps: 13527 },
  { date: "2025-09-17", member_id: "M0001", HRV_ms: 50.3, recovery_pct: 59, deep_sleep_min: 93, rem_sleep_min: 111, steps: 13409 },
  { date: "2025-09-18", member_id: "M0001", HRV_ms: 49.2, recovery_pct: 59, deep_sleep_min: 93, rem_sleep_min: 114, steps: 13528 },
  { date: "2025-09-19", member_id: "M0001", HRV_ms: 48.6, recovery_pct: 57, deep_sleep_min: 91, rem_sleep_min: 110, steps: 13160 },
  { date: "2025-09-20", member_id: "M0001", HRV_ms: 48.8, recovery_pct: 58, deep_sleep_min: 92, rem_sleep_min: 112, steps: 13403 },
  { date: "2025-09-21", member_id: "M0001", HRV_ms: 49.4, recovery_pct: 60, deep_sleep_min: 93, rem_sleep_min: 112, steps: 13536 },
  { date: "2025-09-22", member_id: "M0001", HRV_ms: 49.6, recovery_pct: 59, deep_sleep_min: 93, rem_sleep_min: 112, steps: 13457 },
  { date: "2025-09-23", member_id: "M0001", HRV_ms: 50.7, recovery_pct: 60, deep_sleep_min: 92, rem_sleep_min: 114, steps: 13514 },
  { date: "2025-09-24", member_id: "M0001", HRV_ms: 49.4, recovery_pct: 59, deep_sleep_min: 93, rem_sleep_min: 114, steps: 13545 },
  { date: "2025-09-25", member_id: "M0001", HRV_ms: 51.6, recovery_pct: 60, deep_sleep_min: 93, rem_sleep_min: 114, steps: 13565 },
  { date: "2025-09-26", member_id: "M0001", HRV_ms: 49.5, recovery_pct: 59, deep_sleep_min: 92, rem_sleep_min: 110, steps: 13186 },
  { date: "2025-09-27", member_id: "M0001", HRV_ms: 49.6, recovery_pct: 58, deep_sleep_min: 91, rem_sleep_min: 111, steps: 13428 },
  { date: "2025-09-28", member_id: "M0001", HRV_ms: 50.0, recovery_pct: 59, deep_sleep_min: 92, rem_sleep_min: 110, steps: 13337 },
  { date: "2025-09-29", member_id: "M0001", HRV_ms: 49.3, recovery_pct: 60, deep_sleep_min: 93, rem_sleep_min: 113, steps: 13501 },
  { date: "2025-09-30", member_id: "M0001", HRV_ms: 50.0, recovery_pct: 60, deep_sleep_min: 93, rem_sleep_min: 112, steps: 13443 },
];




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
      { episode_id: "E01", title: "Onboarding & Data Consolidation", start_at: "2025-01-15T09:00:00+08:00", end_at: "2025-01-29T09:00:00+08:00", summary: "Kickoff; import Garmin, health history, meds; align goals and constraints with care team." },
      { episode_id: "E02", title: "Initial Plans & Wearable Calibration", start_at: "2025-01-30T09:00:00+08:00", end_at: "2025-02-20T09:00:00+08:00", summary: "Baseline Z2 + mobility (Rachel), omega-3 + caffeine cutoff (Carla); calibrate HRV/sleep tracking." },
      { episode_id: "E03", title: "Optimization v2.0 & First Wins", start_at: "2025-02-21T09:00:00+08:00", end_at: "2025-03-14T09:00:00+08:00", summary: "Resolve friction; morning training on non-travel days; first adherence coaching; London travel prep." },
      { episode_id: "E04", title: "Travel Adaptations & Sleep Hygiene", start_at: "2025-03-14T09:00:00+08:00", end_at: "2025-04-09T09:00:00+08:00", summary: "NY trip handling; jet-lag plan; wind-down routine; swap Z2↔mobility on red recovery days (Ruby/Advik)." },
      { episode_id: "E05", title: "Diagnostics & Course Correction", start_at: "2025-04-10T09:00:00+08:00", end_at: "2025-05-01T09:00:00+08:00", summary: "Quarterly panel review (D01); Seoul travel-proof Z2; tweak nutrition; confirm LDL/ApoB trend (Dr. Warren/Carla)." },
      { episode_id: "E06", title: "Progressive Load & Nutrition Iteration", start_at: "2025-05-01T09:00:00+08:00", end_at: "2025-05-31T09:00:00+08:00", summary: "Jakarta trip; step goals + protein scaffolding; losartan trial follow-through; end-May follow-up lab." },
      { episode_id: "E07", title: "Autonomic Resilience & Morning Blocks", start_at: "2025-05-31T09:00:00+08:00", end_at: "2025-06-30T09:00:00+08:00", summary: "London travel #2; reinforce AM training habit; breathwork on low-recovery; reduce HRV dips during travel." },
      { episode_id: "E08", title: "Mid-Year Diagnostics & Plan Refresh", start_at: "2025-06-30T09:00:00+08:00", end_at: "2025-07-21T09:00:00+08:00", summary: "NY trip; mid-year panel (D02); review lipids/inflammation; refine exercise split and caffeine window." },
      { episode_id: "E09", title: "Travel-Proofing v2 & Jet-Lag Mitigation", start_at: "2025-07-21T09:00:00+08:00", end_at: "2025-08-11T09:00:00+08:00", summary: "Seoul trip; heat/humidity strategy; RPE caps; maintain Z2 volume with hotel/streets circuits (Advik)." },
      { episode_id: "E10", title: "Strength-Endurance Blend & Recovery Focus", start_at: "2025-08-11T09:00:00+08:00", end_at: "2025-09-01T09:00:00+08:00", summary: "Add light strength to Z2 base; protect sleep consistency; iterate macros to support training weeks." },
      { episode_id: "E11", title: "Maintenance & Recheck Prep", start_at: "2025-09-01T09:00:00+08:00", end_at: "2025-09-22T09:00:00+08:00", summary: "Jakarta travel; stabilize routine; line up end-of-quarter labs; confirm adherence levers with concierge." },
      { episode_id: "E12", title: "Wrap-Up & Handover Planning", start_at: "2025-09-22T09:00:00+08:00", end_at: "2025-09-30T09:00:00+08:00", summary: "Summarize 8-month outcomes; finalize next-quarter targets; schedule October panel & follow-ups." }
    ],

    trips: [
      { member_id: "M0001", trip_id: "T01", location: "London, UK", start_at: "2025-02-03T08:00:00+08:00", end_at: "2025-02-10T08:00:00+08:00" },
      { member_id: "M0001", trip_id: "T02", location: "New York, USA", start_at: "2025-03-03T08:00:00+08:00", end_at: "2025-03-10T08:00:00+08:00" },
      { member_id: "M0001", trip_id: "T03", location: "Seoul, South Korea", start_at: "2025-04-07T08:00:00+08:00", end_at: "2025-04-14T08:00:00+08:00" },
      { member_id: "M0001", trip_id: "T04", location: "Jakarta, Indonesia", start_at: "2025-05-05T08:00:00+08:00", end_at: "2025-05-12T08:00:00+08:00" },
      { member_id: "M0001", trip_id: "T05", location: "London, UK", start_at: "2025-06-02T08:00:00+08:00", end_at: "2025-06-09T08:00:00+08:00" },
      { member_id: "M0001", trip_id: "T06", location: "New York, USA", start_at: "2025-07-07T08:00:00+08:00", end_at: "2025-07-14T08:00:00+08:00" },
      { member_id: "M0001", trip_id: "T07", location: "Seoul, South Korea", start_at: "2025-08-04T08:00:00+08:00", end_at: "2025-08-11T08:00:00+08:00" },
      { member_id: "M0001", trip_id: "T08", location: "Jakarta, Indonesia", start_at: "2025-09-01T08:00:00+08:00", end_at: "2025-09-08T08:00:00+08:00" }
    ],

    // ===== DIAGNOSTICS: full panels ~every 3 months =====
    diagnostics: [
      { member_id: "M0001", diagnostic_id: "D00", date: "2025-02-12", ApoB: 112, LDL_C: 132, HDL_C: 48, TG: 160, hsCRP: 2.1, Notes: "Baseline prior to plan" },
      { member_id: "M0001", diagnostic_id: "D01", date: "2025-04-15", ApoB: 99, LDL_C: 118, HDL_C: 50, TG: 145, hsCRP: 1.8, Notes: "Quarterly review panel after initial exercise + omega-3 + caffeine cutoff" },
      { member_id: "M0001", diagnostic_id: "D02", date: "2025-07-14", ApoB: 90, LDL_C: 106, HDL_C: 53, TG: 128, hsCRP: 1.4, Notes: "Quarterly review panel; additive effect of diet iteration + steps + dosage tweak" },
      { member_id: "M0001", diagnostic_id: "D03", date: "2025-09-29", ApoB: 86, LDL_C: 101, HDL_C: 54, TG: 124, hsCRP: 1.3, Notes: "Quarterly review panel; maintenance + alcohol moderation + sleep consistency" }
    ],

    // ===== INTERVENTIONS: 2-week cadence, linked to metrics & labs =====
    interventions: [
      // ————— FEB (onboarding tail + first month) —————
      {
        member_id: "M0001", intervention_id: "I0001", type: "Exercise",
        title: "Zone 2 + Mobility Block (kickoff)",
        start_at: "2025-01-30", end_at: "2025-02-12", adherence: "inconsistent", status: "completed",
        owner: "Rachel (Physiotherapist)",
        expected: { note: "Improve autonomic tone; build base", metrics: { HRV_ms: { delta: "+4 to +6", window: "14d" } } },
        actual: { metrics: { HRV_ms: { before: 41.5, after: 45.3, delta: +3.8, window: "14d" } }, note: "Partially achieved; needed cadence tweaks on travel prep." }
      },
      {
        member_id: "M0001", intervention_id: "I0002", type: "Nutrition",
        title: "Omega-3 (TG form) + caffeine cutoff 2PM",
        start_at: "2025-02-01", end_at: "2025-02-28", adherence: "good", status: "completed",
        owner: "Carla (Nutritionist)",
        expected: { note: "Lower LDL-C 5–10 mg/dL in ~6 weeks; support sleep", metrics: { LDL_C: { delta: "−8", window: "D00→D01" } } },
        actual: { metrics: { LDL_C: { before: 132, after: 118, delta: -14, window: "D00→D01" } }, note: "Better than expected; caffeine cutoff improved sleep latency." }
      },
      {
        member_id: "M0001", intervention_id: "I0003", type: "Sleep",
        title: "Sleep hygiene + evening light protocol",
        start_at: "2025-02-10", end_at: "2025-02-24", adherence: "moderate", status: "completed",
        owner: "Ruby (Concierge) & Rachel (Physiotherapist)",
        expected: { note: "Stabilize recovery; reduce late-night arousal", metrics: { HRV_ms: { delta: "+2", window: "14d" }, recovery_pct: { delta: "+2", window: "14d" } } },
        actual: { metrics: { HRV_ms: { before: 40.2, after: 42.6, delta: +2.4, window: "14d" }, recovery_pct: { before: 49, after: 51, delta: +2, window: "14d" } }, note: "Wins on non-dinner nights; travel still disruptive." }
      },
      {
        member_id: "M0001", intervention_id: "I0004", type: "Exercise",
        title: "London travel micro-plan (walk Z2 + hotel mobility)",
        start_at: "2025-02-03", end_at: "2025-02-10", adherence: "moderate", status: "completed",
        owner: "Advik (Performance Scientist)",
        expected: { note: "Maintain HRV during travel; cap RPE at 6", metrics: { HRV_ms: { delta: "≈0", window: "travel week" } } },
        actual: { metrics: { HRV_ms: { before: 42.0, after: 41.2, delta: -0.8, window: "travel week" } }, note: "Jet-lag dip contained vs. prior trips; mobility used 3/5 days." }
      },

      // ————— MAR (NY trip + early tuning) —————
      {
        member_id: "M0001", intervention_id: "I0006", type: "Sleep",
        title: "NY jet-lag plan (AM light, meal timing, melatonin micro-dose)",
        start_at: "2025-03-01", end_at: "2025-03-14", adherence: "moderate", status: "completed",
        owner: "Ruby (Concierge) & Advik (Performance Scientist)",
        expected: { note: "Improve deep sleep on east-coast time", metrics: { deep_sleep_min: { delta: "+8–12", window: "14d" } } },
        actual: { metrics: { deep_sleep_min: { before: 74, after: 82, delta: +8, window: "14d" } }, note: "2 nights late dinners blunted effect; otherwise good." }
      },
      {
        member_id: "M0001", intervention_id: "I0007", type: "Exercise",
        title: "Mobility + breathwork block (post-trip)",
        start_at: "2025-03-15", end_at: "2025-03-29", adherence: "moderate", status: "completed",
        owner: "Rachel (Physiotherapist)",
        expected: { note: "Restore parasympathetic tone post-travel", metrics: { HRV_ms: { delta: "+2", window: "14d" } } },
        actual: { metrics: { HRV_ms: { before: 43.0, after: 44.6, delta: +1.6, window: "14d" } }, note: "Missed 2 sessions during client week; still trended up." }
      },
      {
        member_id: "M0001", intervention_id: "I0005", type: "Medication",
        title: "Low-dose ARB trial (losartan 25mg nightly)",
        start_at: "2025-03-20", end_at: "2025-04-10", adherence: "good", status: "completed",
        owner: "Dr. Warren (Physician)",
        expected: { note: "Reduce orthostatic symptoms; modest recovery ↑", metrics: { recovery_pct: { delta: "+4 to +6", window: "3w" } } },
        actual: { metrics: { recovery_pct: { before: 48, after: 54, delta: +6, window: "trial" } }, note: "Orthostatic episodes ↓; sleep consolidation improved." }
      },

      // ————— APR (Seoul travel + diagnostics) —————
      {
        member_id: "M0001", intervention_id: "I0008", type: "Exercise",
        title: "Zone 2 + Mobility (travel-proof, Seoul)",
        start_at: "2025-04-10", end_at: "2025-04-23", adherence: "good", status: "completed",
        owner: "Advik (Performance Scientist)",
        expected: { note: "Contain HRV dips while abroad", metrics: { HRV_ms: { delta: "+2", window: "2w" } } },
        actual: { metrics: { HRV_ms: { before: 44.1, after: 46.0, delta: +1.9, window: "2w" } }, note: "Recovery variability smaller than Feb/Mar trips." }
      },

      // ————— MAY (iteration blocks) —————
      {
        member_id: "M0001", intervention_id: "I0009", type: "Nutrition",
        title: "Fiber 30g/day + plant sterols; alcohol ≤2/wk",
        start_at: "2025-04-20", end_at: "2025-05-04", adherence: "good", status: "completed",
        owner: "Carla (Nutritionist)",
        expected: { note: "Help LDL and TG ahead of Q2 labs", metrics: { LDL_C: { delta: "−4 to −6", window: "D01→D02" }, TG: { delta: "−8 to −12", window: "D01→D02" } } },
        actual: { metrics: { LDL_C: { before: 118, after: 112, delta: -6, window: "D01→D02 (partial)" }, TG: { before: 145, after: 136, delta: -9, window: "4w" } }, note: "Sustainable; minor slips on client dinners." }
      },
      {
        member_id: "M0001", intervention_id: "I0010", type: "Exercise",
        title: "Steps 10–12k + desk breaks (NEAT boost)",
        start_at: "2025-05-05", end_at: "2025-05-18", adherence: "good", status: "completed",
        owner: "Advik (Performance Scientist)",
        expected: { note: "Energy balance and glucose handling", metrics: { steps: { delta: "+2000/day", window: "14d" }, recovery_pct: { delta: "+2", window: "14d" } } },
        actual: { metrics: { steps: { before: 9200, after: 11200, delta: +2000, window: "14d" }, recovery_pct: { before: 53, after: 55, delta: +2, window: "14d" } }, note: "Standing calls helped; travel days still lower." }
      },
      {
        member_id: "M0001", intervention_id: "I0011", type: "Exercise",
        title: "Strength-endurance blend (intro)",
        start_at: "2025-05-19", end_at: "2025-06-02", adherence: "moderate", status: "completed",
        owner: "Rachel (Physiotherapist)",
        expected: { note: "Add 2× light strength without HRV dips", metrics: { HRV_ms: { delta: "≈0 to +1", window: "14d" }, recovery_pct: { delta: "+1–2", window: "14d" } } },
        actual: { metrics: { HRV_ms: { before: 47.0, after: 47.5, delta: +0.5, window: "14d" }, recovery_pct: { before: 55, after: 56, delta: +1, window: "14d" } }, note: "Kept RPE ≤7; one session skipped on travel prep." }
      },

      // ————— JUN (diet tweak + sleep window) —————
      {
        member_id: "M0001", intervention_id: "I0012", type: "Nutrition",
        title: "Omega-3 dose adjust + 5% sat-fat swap",
        start_at: "2025-06-03", end_at: "2025-06-16", adherence: "good", status: "completed",
        owner: "Carla (Nutritionist)",
        expected: { note: "Push LDL another 4–6 mg/dL by Q2 labs", metrics: { LDL_C: { delta: "−4 to −6", window: "D01→D02" } } },
        actual: { metrics: { LDL_C: { before: 112, after: 106, delta: -6, window: "D01→D02 (additive)" } }, note: "Worked well with travel snack plan." }
      },
      {
        member_id: "M0001", intervention_id: "I0013", type: "Sleep",
        title: "Caffeine window enforcement (AM-only) + wind-down",
        start_at: "2025-06-17", end_at: "2025-06-30", adherence: "moderate", status: "completed",
        owner: "Ruby (Concierge)",
        expected: { note: "Sleep efficiency ↑; HRV small uptick", metrics: { HRV_ms: { delta: "+1", window: "14d" }, deep_sleep_min: { delta: "+6", window: "14d" } } },
        actual: { metrics: { HRV_ms: { before: 46.8, after: 47.7, delta: +0.9, window: "14d" }, deep_sleep_min: { before: 82, after: 88, delta: +6, window: "14d" } }, note: "Two afternoons broke the rule; still net positive." }
      },

      // ————— JUL (heat/hydration + Q2 labs) —————
      {
        member_id: "M0001", intervention_id: "I0014", type: "Lifestyle",
        title: "Heat & hydration protocol for POTS (electrolytes, pre-cooling)",
        start_at: "2025-07-01", end_at: "2025-07-21", adherence: "good", status: "completed",
        owner: "Dr. Warren (Physician) & Ruby (Concierge)",
        expected: { note: "Reduce orthostatic episodes; support training in humidity", metrics: { recovery_pct: { delta: "+3", window: "3w" } } },
        actual: { metrics: { recovery_pct: { before: 52, after: 55, delta: +3, window: "3w" } }, note: "Notable improvement during hot days; fewer AM head-rushes." }
      },

      // ————— AUG (alcohol, Seoul trip, sleep consistency) —————
      {
        member_id: "M0001", intervention_id: "I0015", type: "Nutrition",
        title: "Alcohol moderation (≤2 drinks/week cap)",
        start_at: "2025-07-22", end_at: "2025-08-05", adherence: "moderate", status: "completed",
        owner: "Carla (Nutritionist)",
        expected: { note: "Lower inflammation; support sleep", metrics: { hsCRP: { delta: "−0.1 to −0.2", window: "to D03" } } },
        actual: { metrics: { hsCRP: { before: 1.4, after: 1.3, delta: -0.1, window: "D02→D03 (trend)" } }, note: "Client events increased variance; overall reduction." }
      },
      {
        member_id: "M0001", intervention_id: "I0016", type: "Sleep",
        title: "Seoul jet-lag mitigation v2 (earlier light, earlier dinner)",
        start_at: "2025-08-06", end_at: "2025-08-19", adherence: "good", status: "completed",
        owner: "Ruby (Concierge) & Advik (Performance Scientist)",
        expected: { note: "Deep sleep preservation on trip", metrics: { deep_sleep_min: { delta: "+6", window: "14d" }, HRV_ms: { delta: "≈0 to +1", window: "14d" } } },
        actual: { metrics: { deep_sleep_min: { before: 80, after: 87, delta: +7, window: "14d" }, HRV_ms: { before: 46.0, after: 46.8, delta: +0.8, window: "14d" } }, note: "Hotel gym limited; walking Z2 maintained volume." }
      },
      {
        member_id: "M0001", intervention_id: "I0017", type: "Sleep",
        title: "Sleep consistency challenge (same bedtime ±15m)",
        start_at: "2025-08-20", end_at: "2025-09-02", adherence: "good", status: "completed",
        owner: "Ruby (Concierge)",
        expected: { note: "REM/Deep balance; morning readiness", metrics: { rem_sleep_min: { delta: "+6–10", window: "14d" }, recovery_pct: { delta: "+2", window: "14d" } } },
        actual: { metrics: { rem_sleep_min: { before: 103, after: 112, delta: +9, window: "14d" }, recovery_pct: { before: 54, after: 56, delta: +2, window: "14d" } }, note: "Calendar holds helped; one late client dinner." }
      },

      // ————— SEP (maintenance into Q3 labs) —————
      {
        member_id: "M0001", intervention_id: "I0018", type: "Exercise",
        title: "Maintenance & taper into labs (RPE caps, recovery swaps)",
        start_at: "2025-09-03", end_at: "2025-09-16", adherence: "good", status: "completed",
        owner: "Advik (Performance Scientist) & Rachel (Physiotherapist)",
        expected: { note: "Avoid pre-lab fatigue; hold gains", metrics: { HRV_ms: { delta: "≈0", window: "2w" }, recovery_pct: { delta: "≈0 to +1", window: "2w" } } },
        actual: { metrics: { HRV_ms: { before: 47.5, after: 47.8, delta: +0.3, window: "2w" }, recovery_pct: { before: 55, after: 56, delta: +1, window: "2w" } }, note: "Stayed within caps; no red days before draw." }
      }
    ],

    "chat": [
      // =========================
      // FEBRUARY 2025 (Onboarding tail + first plans, London trip, Baseline D00)
      // =========================

      // I0002 (Omega-3 + caffeine cutoff)
      { message_id: "C101", timestamp: "2025-02-01T09:05:00+08:00", sender_id: "U_Carla", sender: "Carla", sender_role: "nutrition", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "I0002 • Omega-3 + caffeine cutoff", text: "Let’s start 2g EPA+DHA daily and stop caffeine after 2pm. Goal is LDL-C ↓ and better sleep." },
      { message_id: "C102", timestamp: "2025-02-01T09:08:00+08:00", sender_id: "M0001", sender: "Rohan Patel", sender_role: "member", receiver_id: "U_Carla", receiver: "Carla", receiver_role: "nutrition", topic: "I0002 • Omega-3 + caffeine cutoff", text: "On it. Any preferred brand and should I take it with meals?" },
      { message_id: "C103", timestamp: "2025-02-01T09:12:00+08:00", sender_id: "U_Carla", sender: "Carla", sender_role: "nutrition", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "I0002 • Omega-3 + caffeine cutoff", text: "TG form (Nordic/Carlson) with a main meal. I’ll monitor sleep + LDL for the April panel." },

      // I0001 (Zone 2 + Mobility kickoff — carries over, still in play)
      { message_id: "R101", timestamp: "2025-02-01T18:00:00+08:00", sender_id: "U_Rachel", sender: "Rachel", sender_role: "physio", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "I0001 • Zone 2 + mobility kickoff", text: "How did the first two Z2 sessions feel? Keep RPE 5–6 and add 5-min warmup." },
      { message_id: "R102", timestamp: "2025-02-01T18:03:00+08:00", sender_id: "M0001", sender: "Rohan Patel", sender_role: "member", receiver_id: "U_Rachel", receiver: "Rachel", receiver_role: "physio", topic: "I0001 • Zone 2 + mobility kickoff", text: "Good, but HR spikes at the start. Warmup should help. Will try tonight." },

      // I0004 (London travel micro-plan)
      { message_id: "A101", timestamp: "2025-02-02T16:10:00+08:00", sender_id: "U_Advik", sender: "Advik", sender_role: "performance", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "I0004 • London travel micro-plan", text: "For London: brisk walks for 25–30 min (Z2), bodyweight circuit if the gym is busy. Cap RPE at 6." },
      { message_id: "A102", timestamp: "2025-02-02T16:12:00+08:00", sender_id: "M0001", sender: "Rohan Patel", sender_role: "member", receiver_id: "U_Advik", receiver: "Advik", receiver_role: "performance", topic: "I0004 • London travel micro-plan", text: "Noted. I’ll share Garmin export on return." },

      // I0003 (Sleep hygiene + evening light)
      { message_id: "RB101", timestamp: "2025-02-10T21:05:00+08:00", sender_id: "U_Ruby", sender: "Ruby", sender_role: "concierge", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "I0003 • Sleep hygiene block", text: "Starting tonight: 9:30pm wind-down, warm light only, and phone to charge outside the bedroom." },
      { message_id: "RB102", timestamp: "2025-02-10T21:06:30+08:00", sender_id: "M0001", sender: "Rohan Patel", sender_role: "member", receiver_id: "U_Ruby", receiver: "Ruby", receiver_role: "concierge", topic: "I0003 • Sleep hygiene block", text: "Will try — late dinners this week though." },
      { message_id: "R103", timestamp: "2025-02-11T07:45:00+08:00", sender_id: "U_Rachel", sender: "Rachel", sender_role: "physio", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "I0003 • Sleep hygiene block", text: "Add 2×30s decompressions and nasal breathing before bed to drop arousal." },

      // D00 (Baseline diagnostics drawn & reviewed)
      { message_id: "RB103", timestamp: "2025-02-11T11:00:00+08:00", sender_id: "U_Ruby", sender: "Ruby", sender_role: "concierge", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "D00 • Phlebotomy logistics", text: "Phlebotomy 12 Feb 8:30am at Parkway Lab, confirmation sent." },
      { message_id: "D101", timestamp: "2025-02-13T10:15:00+08:00", sender_id: "U_Warren", sender: "Dr. Warren", sender_role: "physician", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "D00 • Results", text: "Baseline: LDL-C 132, ApoB 112, hs-CRP 2.1. Not alarming, but we’ll push diet + sleep first." },
      { message_id: "D102", timestamp: "2025-02-13T10:19:00+08:00", sender_id: "M0001", sender: "Rohan Patel", sender_role: "member", receiver_id: "U_Warren", receiver: "Dr. Warren", receiver_role: "physician", topic: "D00 • Results", text: "Understood. I’ll stay consistent on omega-3 and caffeine cutoff." },

      // Weekly check-in & member-initiated curiosity
      { message_id: "RB104", timestamp: "2025-02-16T18:00:00+08:00", sender_id: "U_Ruby", sender: "Ruby", sender_role: "concierge", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "Weekly report", text: "Wins: consistent Z2 3×, wind-down 4 nights. Watchouts: late dinners Tue/Thu; recovery red once." },
      { message_id: "C104", timestamp: "2025-02-18T08:20:00+08:00", sender_id: "M0001", sender: "Rohan Patel", sender_role: "member", receiver_id: "U_Carla", receiver: "Carla", receiver_role: "nutrition", topic: "Supplements question", text: "Read about algae oil — any reason to switch from fish oil?" },
      { message_id: "C105", timestamp: "2025-02-18T08:25:00+08:00", sender_id: "U_Carla", sender: "Carla", sender_role: "nutrition", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "Supplements question", text: "Fish oil TG form is fine. Algae is OK if preferred; keep EPA+DHA ~2g." },
      { message_id: "N101", timestamp: "2025-02-19T12:30:00+08:00", sender_id: "U_Neel", sender: "Neel", sender_role: "lead", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "Check-in", text: "Top blocker this week?" },
      { message_id: "N102", timestamp: "2025-02-19T12:33:00+08:00", sender_id: "M0001", sender: "Rohan Patel", sender_role: "member", receiver_id: "U_Neel", receiver: "Neel", receiver_role: "lead", topic: "Check-in", text: "Client dinners. Morning sessions help though." },

      // =========================
      // MARCH 2025 (NY trip, post-trip mobility block, ARB trial)
      // =========================

      // I0006 (NY jet-lag plan)
      { message_id: "RB201", timestamp: "2025-03-01T09:10:00+08:00", sender_id: "U_Ruby", sender: "Ruby", sender_role: "concierge", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "I0006 • NY jet-lag plan", text: "AM light exposure, earlier local dinners, optional 0.5mg melatonin 2 nights only." },
      { message_id: "RB202", timestamp: "2025-03-01T09:12:00+08:00", sender_id: "M0001", sender: "Rohan Patel", sender_role: "member", receiver_id: "U_Ruby", receiver: "Ruby", receiver_role: "concierge", topic: "I0006 • NY jet-lag plan", text: "Will follow. Meetings end late Mon/Tue; I’ll keep dinners light." },
      { message_id: "A201", timestamp: "2025-03-02T20:40:00+08:00", sender_id: "U_Advik", sender: "Advik", sender_role: "performance", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "I0006 • NY jet-lag plan", text: "If gym crowded, use 3-round bodyweight: 12 squats, 8 push-ups, 30s plank, brisk walk Z2 20 min." },
      { message_id: "A202", timestamp: "2025-03-02T20:42:00+08:00", sender_id: "M0001", sender: "Rohan Patel", sender_role: "member", receiver_id: "U_Advik", receiver: "Advik", receiver_role: "performance", topic: "I0006 • NY jet-lag plan", text: "Got it. I’ll cap RPE at 6." },

      // Member curiosity during trip
      { message_id: "W201", timestamp: "2025-03-05T07:50:00+08:00", sender_id: "M0001", sender: "Rohan Patel", sender_role: "member", receiver_id: "U_Warren", receiver: "Dr. Warren", receiver_role: "physician", topic: "Melatonin safety", text: "Is melatonin safe to use 2–3 nights in a row for jet-lag?" },
      { message_id: "W202", timestamp: "2025-03-05T08:05:00+08:00", sender_id: "U_Warren", sender: "Dr. Warren", sender_role: "physician", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "Melatonin safety", text: "Short stints at low dose are fine. Avoid if groggy the next morning." },

      // I0007 (Post-trip mobility + breathwork)
      { message_id: "R201", timestamp: "2025-03-15T09:10:00+08:00", sender_id: "U_Rachel", sender: "Rachel", sender_role: "physio", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "I0007 • Post-trip mobility + breathwork", text: "Let’s do 15-min mobility + 6-min breathwork after each Z2. Aim HRV +2 over 14d." },
      { message_id: "R202", timestamp: "2025-03-15T09:12:30+08:00", sender_id: "M0001", sender: "Rohan Patel", sender_role: "member", receiver_id: "U_Rachel", receiver: "Rachel", receiver_role: "physio", topic: "I0007 • Post-trip mobility + breathwork", text: "Yes — hips feel tight after flights. I’ll add these." },

      // I0005 (Losartan 25mg trial)
      { message_id: "W203", timestamp: "2025-03-20T08:40:00+08:00", sender_id: "U_Warren", sender: "Dr. Warren", sender_role: "physician", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "I0005 • Losartan trial", text: "AM logs show BP spikes. Suggest losartan 25mg nightly x3w. Track orthostatic symptoms daily." },
      { message_id: "W204", timestamp: "2025-03-20T08:42:00+08:00", sender_id: "M0001", sender: "Rohan Patel", sender_role: "member", receiver_id: "U_Warren", receiver: "Dr. Warren", receiver_role: "physician", topic: "I0005 • Losartan trial", text: "I’m open to it. What side effects?" },
      { message_id: "W205", timestamp: "2025-03-20T08:45:00+08:00", sender_id: "U_Warren", sender: "Dr. Warren", sender_role: "physician", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "I0005 • Losartan trial", text: "Possible dizziness. Hydrate, avoid NSAIDs; message me if standing SBP <100 consistently." },

      // Weekly report
      { message_id: "RB203", timestamp: "2025-03-24T19:00:00+08:00", sender_id: "U_Ruby", sender: "Ruby", sender_role: "concierge", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "Weekly report", text: "Progress: jet-lag plan mostly followed; mobility 4×. Watchouts: two red recovery days after client dinners." },

      // =========================
      // APRIL 2025 (Seoul travel-proof block, D01 quarterly labs)
      // =========================

      // I0008 (Travel-proof Z2 + mobility, Seoul)
      { message_id: "A301", timestamp: "2025-04-09T20:05:00+08:00", sender_id: "U_Advik", sender: "Advik", sender_role: "performance", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "I0008 • Seoul travel-proof plan", text: "Structure Z2 around flights. On red recovery days, do breathwork + mobility only." },
      { message_id: "A302", timestamp: "2025-04-09T20:07:00+08:00", sender_id: "M0001", sender: "Rohan Patel", sender_role: "member", receiver_id: "U_Advik", receiver: "Advik", receiver_role: "performance", topic: "I0008 • Seoul travel-proof plan", text: "Hotel gym might be limited. I’ll default to brisk walks if needed." },

      // D01 (Quarterly panel)
      { message_id: "RB301", timestamp: "2025-04-14T15:10:00+08:00", sender_id: "U_Ruby", sender: "Ruby", sender_role: "concierge", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "D01 • Phlebotomy logistics", text: "Lab booked 15 Apr 9:00am. Fasting 10–12h please." },
      { message_id: "D201", timestamp: "2025-04-15T10:00:00+08:00", sender_id: "U_Warren", sender: "Dr. Warren", sender_role: "physician", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "D01 • Results", text: "LDL-C 118 (↓ from 132), ApoB 99, hs-CRP 1.8. Good early response to plan." },
      { message_id: "D202", timestamp: "2025-04-15T10:04:00+08:00", sender_id: "M0001", sender: "Rohan Patel", sender_role: "member", receiver_id: "U_Warren", receiver: "Dr. Warren", receiver_role: "physician", topic: "D01 • Results", text: "Great — happy to keep the current nutrition + sleep changes." },

      // I0009 (Fiber + plant sterols; alcohol ≤2/wk)
      { message_id: "C301", timestamp: "2025-04-20T08:40:00+08:00", sender_id: "U_Carla", sender: "Carla", sender_role: "nutrition", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "I0009 • Fiber + sterols", text: "Let’s add 30g fiber/day + plant sterols. Alcohol cap ≤2/wk. Expect small LDL/TG drop." },
      { message_id: "C302", timestamp: "2025-04-20T08:43:00+08:00", sender_id: "M0001", sender: "Rohan Patel", sender_role: "member", receiver_id: "U_Carla", receiver: "Carla", receiver_role: "nutrition", topic: "I0009 • Fiber + sterols", text: "Understood. Travel week may be tricky; I’ll prep snacks." },

      // Weekly report
      { message_id: "RB302", timestamp: "2025-04-21T19:10:00+08:00", sender_id: "U_Ruby", sender: "Ruby", sender_role: "concierge", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "Weekly report", text: "Wins: Seoul plan executed; fewer dips. Watchouts: late dinners twice; steps dipped on flight days." },

      // =========================
      // MAY 2025 (NEAT block + strength-endurance intro)
      // =========================

      // I0010 (Steps/NEAT)
      { message_id: "A401", timestamp: "2025-05-05T07:55:00+08:00", sender_id: "U_Advik", sender: "Advik", sender_role: "performance", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "I0010 • Steps + desk breaks", text: "Aim 10–12k steps; break up 45-min sits with 2-min walks. Expect +2% recovery over 14d." },
      { message_id: "A402", timestamp: "2025-05-05T07:59:00+08:00", sender_id: "M0001", sender: "Rohan Patel", sender_role: "member", receiver_id: "U_Advik", receiver: "Advik", receiver_role: "performance", topic: "I0010 • Steps + desk breaks", text: "Standing calls will help. I’ll log averages." },

      // I0011 (Strength-endurance intro)
      { message_id: "R401", timestamp: "2025-05-19T08:20:00+08:00", sender_id: "U_Rachel", sender: "Rachel", sender_role: "physio", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "I0011 • Strength-endurance intro", text: "Add 2×/wk light strength (RPE ≤7). Monitor HRV — we want +0~+1 only." },
      { message_id: "R402", timestamp: "2025-05-19T08:23:30+08:00", sender_id: "M0001", sender: "Rohan Patel", sender_role: "member", receiver_id: "U_Rachel", receiver: "Rachel", receiver_role: "physio", topic: "I0011 • Strength-endurance intro", text: "Sounds good — travel next week, will keep it short." },

      // Weekly report & member curiosity
      { message_id: "RB401", timestamp: "2025-05-12T18:20:00+08:00", sender_id: "U_Ruby", sender: "Ruby", sender_role: "concierge", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "Weekly report", text: "Wins: steps avg +2k/day. Watchouts: two late nights; one missed mobility session." },
      { message_id: "W301", timestamp: "2025-05-22T07:35:00+08:00", sender_id: "M0001", sender: "Rohan Patel", sender_role: "member", receiver_id: "U_Warren", receiver: "Dr. Warren", receiver_role: "physician", topic: "Sauna & BP", text: "Is sauna OK with the ARB trial finishing last month?" },
      { message_id: "W302", timestamp: "2025-05-22T07:50:00+08:00", sender_id: "U_Warren", sender: "Dr. Warren", sender_role: "physician", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "Sauna & BP", text: "Short sessions, hydrate, and stand up slowly. Stop if lightheaded." },

      // =========================
      // JUNE 2025 (Nutrition tweak + caffeine window)
      // =========================

      // I0012 (Omega-3 dose adjust + sat-fat swap)
      { message_id: "C501", timestamp: "2025-06-03T08:35:00+08:00", sender_id: "U_Carla", sender: "Carla", sender_role: "nutrition", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "I0012 • Omega-3 dose + sat-fat swap", text: "Bump omega-3 slightly and swap 5% sat-fat for MUFA. Expect LDL-C −4~−6 by next panel." },
      { message_id: "C502", timestamp: "2025-06-03T08:38:00+08:00", sender_id: "M0001", sender: "Rohan Patel", sender_role: "member", receiver_id: "U_Carla", receiver: "Carla", receiver_role: "nutrition", topic: "I0012 • Omega-3 dose + sat-fat swap", text: "Can do. I’ll use olive oil and swap snacks." },

      // I0013 (Caffeine AM-only + wind-down)
      { message_id: "RB501", timestamp: "2025-06-17T09:00:00+08:00", sender_id: "U_Ruby", sender: "Ruby", sender_role: "concierge", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "I0013 • Caffeine window + wind-down", text: "AM-only coffee for 2 weeks. 9:30pm wind-down alarm set." },
      { message_id: "RB502", timestamp: "2025-06-17T09:02:00+08:00", sender_id: "M0001", sender: "Rohan Patel", sender_role: "member", receiver_id: "U_Ruby", receiver: "Ruby", receiver_role: "concierge", topic: "I0013 • Caffeine window + wind-down", text: "I’ll stick to mornings. If afternoon slump hits, I’ll walk." },

      // Weekly report & curiosity
      { message_id: "RB503", timestamp: "2025-06-24T18:25:00+08:00", sender_id: "U_Ruby", sender: "Ruby", sender_role: "concierge", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "Weekly report", text: "Wins: bedtime consistent 5 nights; deep sleep +6 min avg. Watchouts: travel Mon-Tue reduced steps." },
      { message_id: "A501", timestamp: "2025-06-28T10:15:00+08:00", sender_id: "M0001", sender: "Rohan Patel", sender_role: "member", receiver_id: "U_Advik", receiver: "Advik", receiver_role: "performance", topic: "Travel kit", text: "Worth packing a light resistance band for hotel rooms?" },
      { message_id: "A502", timestamp: "2025-06-28T10:22:00+08:00", sender_id: "U_Advik", sender: "Advik", sender_role: "performance", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "Travel kit", text: "Yes — great for rows and pull-aparts. I’ll send a 10-min circuit." },

      // =========================
      // JULY 2025 (Heat/hydration protocol + D02 labs)
      // =========================

      // I0014 (Heat & hydration protocol for POTS)
      { message_id: "RB601", timestamp: "2025-07-01T08:20:00+08:00", sender_id: "U_Ruby", sender: "Ruby", sender_role: "concierge", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "I0014 • Heat & hydration protocol", text: "Start electrolyte pack AM + pre-cooling with a cold towel before Z2 on hot days." },
      { message_id: "RB602", timestamp: "2025-07-01T08:22:00+08:00", sender_id: "M0001", sender: "Rohan Patel", sender_role: "member", receiver_id: "U_Ruby", receiver: "Ruby", receiver_role: "concierge", topic: "I0014 • Heat & hydration protocol", text: "Noted — Singapore humidity is brutal this week." },
      { message_id: "W401", timestamp: "2025-07-03T07:50:00+08:00", sender_id: "U_Warren", sender: "Dr. Warren", sender_role: "physician", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "I0014 • Heat & hydration protocol", text: "Hydration + electrolytes should reduce AM head-rushes. Keep logging symptoms." },

      // D02 (Quarterly panel)
      { message_id: "RB603", timestamp: "2025-07-13T15:15:00+08:00", sender_id: "U_Ruby", sender: "Ruby", sender_role: "concierge", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "D02 • Phlebotomy logistics", text: "Lab booked 14 Jul 8:30am, fasting. Car pickup at 7:50am." },
      { message_id: "D301", timestamp: "2025-07-14T11:05:00+08:00", sender_id: "U_Warren", sender: "Dr. Warren", sender_role: "physician", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "D02 • Results", text: "LDL-C 106, ApoB 90, hs-CRP 1.4. Trend continues in the right direction." },
      { message_id: "D302", timestamp: "2025-07-14T11:08:30+08:00", sender_id: "M0001", sender: "Rohan Patel", sender_role: "member", receiver_id: "U_Warren", receiver: "Dr. Warren", receiver_role: "physician", topic: "D02 • Results", text: "Fantastic. Let’s keep building on this." },

      // Weekly report & curiosity
      { message_id: "RB604", timestamp: "2025-07-21T18:40:00+08:00", sender_id: "U_Ruby", sender: "Ruby", sender_role: "concierge", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "Weekly report", text: "Wins: hydration protocol followed; recovery +3. Watchouts: two late client events." },
      { message_id: "C601", timestamp: "2025-07-22T08:10:00+08:00", sender_id: "U_Carla", sender: "Carla", sender_role: "nutrition", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "I0015 • Alcohol moderation", text: "Let’s cap alcohol at ≤2 drinks/week through early Aug; track sleep quality." },
      { message_id: "C602", timestamp: "2025-07-22T08:12:00+08:00", sender_id: "M0001", sender: "Rohan Patel", sender_role: "member", receiver_id: "U_Carla", receiver: "Carla", receiver_role: "nutrition", topic: "I0015 • Alcohol moderation", text: "Understood. Client dinners Thu/Fri — I’ll choose low-alcohol options." },

      // =========================
      // AUGUST 2025 (Seoul v2, sleep consistency)
      // =========================

      // I0016 (Seoul jet-lag mitigation v2)
      { message_id: "RB701", timestamp: "2025-08-05T19:05:00+08:00", sender_id: "U_Ruby", sender: "Ruby", sender_role: "concierge", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "I0016 • Seoul jet-lag v2", text: "Earlier light + earlier dinners this trip. I’ve blocked evening slots in your calendar." },
      { message_id: "RB702", timestamp: "2025-08-05T19:07:00+08:00", sender_id: "M0001", sender: "Rohan Patel", sender_role: "member", receiver_id: "U_Ruby", receiver: "Ruby", sender_role: "concierge", topic: "I0016 • Seoul jet-lag v2", text: "Thanks — meeting stack looks heavy but doable." },
      { message_id: "A701", timestamp: "2025-08-06T07:55:00+08:00", sender_id: "U_Advik", sender: "Advik", sender_role: "performance", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "I0016 • Seoul jet-lag v2", text: "Maintain Z2 volume via walks if gym is limited. Keep HR strap on; cap RPE at 6." },
      { message_id: "A702", timestamp: "2025-08-06T07:58:00+08:00", sender_id: "M0001", sender: "Rohan Patel", sender_role: "member", receiver_id: "U_Advik", receiver: "Advik", receiver_role: "performance", topic: "I0016 • Seoul jet-lag v2", text: "Copy. I’ll share 2–3 sessions mid-trip." },

      // I0017 (Sleep consistency challenge)
      { message_id: "RB703", timestamp: "2025-08-20T21:00:00+08:00", sender_id: "U_Ruby", sender: "Ruby", sender_role: "concierge", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "I0017 • Sleep consistency challenge", text: "Same bedtime ±15m for 2 weeks. I’ve added reminders." },
      { message_id: "RB704", timestamp: "2025-08-20T21:02:00+08:00", sender_id: "M0001", sender: "Rohan Patel", sender_role: "member", receiver_id: "U_Ruby", receiver: "Ruby", sender_role: "concierge", topic: "I0017 • Sleep consistency challenge", text: "Let’s do it. Wednesday may slip due to a dinner." },

      // Weekly report & curiosity
      { message_id: "RB705", timestamp: "2025-08-26T18:35:00+08:00", sender_id: "U_Ruby", sender: "Ruby", sender_role: "concierge", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "Weekly report", text: "Wins: bedtime consistency 6/7 nights; REM +9m avg. Watchouts: two late nights; one red recovery." },
      { message_id: "W501", timestamp: "2025-08-27T07:25:00+08:00", sender_id: "M0001", sender: "Rohan Patel", sender_role: "member", receiver_id: "U_Warren", receiver: "Dr. Warren", receiver_role: "physician", topic: "BP query", text: "AM head-rushes rarer now. Keep losartan off post-trial?" },
      { message_id: "W502", timestamp: "2025-08-27T07:30:00+08:00", sender_id: "U_Warren", sender: "Dr. Warren", sender_role: "physician", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "BP query", text: "Yes, continue off. Hydration protocol + travel plans seem sufficient; we can revisit if symptoms return." },

      // =========================
      // SEPTEMBER 2025 (Maintenance & taper into D03)
      // =========================

      // I0018 (Maintenance & taper)
      { message_id: "A801", timestamp: "2025-09-03T08:15:00+08:00", sender_id: "U_Advik", sender: "Advik", sender_role: "performance", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "I0018 • Maintenance & taper into labs", text: "Keep RPE caps, swap any red-recovery session to mobility. Goal is steady HRV before labs." },
      { message_id: "A802", timestamp: "2025-09-03T08:17:30+08:00", sender_id: "M0001", sender: "Rohan Patel", sender_role: "member", receiver_id: "U_Advik", receiver: "Advik", receiver_role: "performance", topic: "I0018 • Maintenance & taper into labs", text: "Got it. I’ll avoid pushing pace this fortnight." },

      // D03 (Quarterly panel)
      { message_id: "RB801", timestamp: "2025-09-28T15:00:00+08:00", sender_id: "U_Ruby", sender: "Ruby", sender_role: "concierge", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "D03 • Phlebotomy logistics", text: "Lab booked 29 Sep 8:30am, fasting; car at 7:50am as usual." },
      { message_id: "D401", timestamp: "2025-09-29T10:20:00+08:00", sender_id: "U_Warren", sender: "Dr. Warren", sender_role: "physician", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "D03 • Results", text: "LDL-C 101, ApoB 86, hs-CRP 1.3. Solid maintenance with modest incremental gains." },
      { message_id: "D402", timestamp: "2025-09-29T10:24:00+08:00", sender_id: "M0001", sender: "Rohan Patel", sender_role: "member", receiver_id: "U_Warren", receiver: "Dr. Warren", receiver_role: "physician", topic: "D03 • Results", text: "Great outcome. Let’s keep this template going into Q4." },

      // Lead wrap-up
      { message_id: "N201", timestamp: "2025-09-30T13:00:00+08:00", sender_id: "U_Neel", sender: "Neel", sender_role: "lead", receiver_id: "M0001", receiver: "Rohan Patel", receiver_role: "member", topic: "Quarter wrap-up", text: "Congrats — LDL/ApoB trend sustained, sleep consistency up. Any friction you want us to remove next?" },
      { message_id: "N202", timestamp: "2025-09-30T13:03:00+08:00", sender_id: "M0001", sender: "Rohan Patel", sender_role: "member", receiver_id: "U_Neel", receiver: "Neel", receiver_role: "lead", topic: "Quarter wrap-up", text: "Evening meetings are the big one. Calendar holds helped — let’s keep those." }
    ],

    rationales: [
      // ── Q1 ─────────────────────────────────────────────────────────────────
      {
        decision_type: "Exercise", decision_id: "I0001", date: "2025-01-30", member_id: "M0001",
        reason_summary: "Kickstart Zone 2 and mobility to build autonomic tone; control RPE and posture to reduce HR spikes.",
        evidence_message_ids: ["R101", "R102"]
      },
      {
        decision_type: "Nutrition", decision_id: "I0002", date: "2025-02-01", member_id: "M0001",
        reason_summary: "Add omega-3 (TG form) and move caffeine to AM to lower LDL-C and improve sleep/recovery.",
        evidence_message_ids: ["C101", "C102", "C103"]
      },
      {
        decision_type: "Sleep & Recovery", decision_id: "I0003", date: "2025-02-10", member_id: "M0001",
        reason_summary: "Evening wind-down, warm light, and pre-bed breathing to stabilize sleep and reduce arousal.",
        evidence_message_ids: ["RB101", "RB102", "R103"]
      },
      {
        decision_type: "Travel Plan", decision_id: "I0004", date: "2025-02-02", member_id: "M0001",
        reason_summary: "London micro-plan: Z2 via brisk walks/bodyweight with RPE cap to protect HRV during travel.",
        evidence_message_ids: ["A101", "A102"]
      },
      {
        decision_type: "Diagnostic", decision_id: "D00", date: "2025-02-12", member_id: "M0001",
        reason_summary: "Baseline panel to quantify LDL-C/ApoB/hs-CRP and anchor subsequent interventions.",
        evidence_message_ids: ["RB103", "D101", "D102"]
      },

      // ── Q2 (Mar–Apr) ──────────────────────────────────────────────────────
      {
        decision_type: "Travel Plan", decision_id: "I0006", date: "2025-03-01", member_id: "M0001",
        reason_summary: "NY jet-lag plan with AM light, earlier dinners, brief melatonin, and Z2 alternatives.",
        evidence_message_ids: ["RB201", "RB202", "A201", "A202"]
      },
      {
        decision_type: "Exercise", decision_id: "I0007", date: "2025-03-15", member_id: "M0001",
        reason_summary: "Post-trip mobility + 6-min breathwork after Z2 to offset stiffness and nudge HRV up.",
        evidence_message_ids: ["R201", "R202"]
      },
      {
        decision_type: "Medication", decision_id: "I0005", date: "2025-03-20", member_id: "M0001",
        reason_summary: "Short losartan 25mg nightly trial to blunt AM BP spikes and reduce orthostatic symptoms.",
        evidence_message_ids: ["W203", "W204", "W205"]
      },
      {
        decision_type: "Exercise", decision_id: "I0008", date: "2025-04-10", member_id: "M0001",
        reason_summary: "Seoul travel-proof Z2 with mobility/breathwork on red-recovery days to prevent dips.",
        evidence_message_ids: ["A301", "A302"]
      },
      {
        decision_type: "Diagnostic", decision_id: "D01", date: "2025-04-15", member_id: "M0001",
        reason_summary: "Quarterly panel to confirm LDL-C/ApoB response to omega-3 + sleep changes.",
        evidence_message_ids: ["RB301", "D201", "D202"]
      },
      {
        decision_type: "Nutrition", decision_id: "I0009", date: "2025-04-20", member_id: "M0001",
        reason_summary: "Increase fiber to 30g/day + plant sterols; moderate alcohol to support LDL/TG trend.",
        evidence_message_ids: ["C301", "C302"]
      },

      // ── May ────────────────────────────────────────────────────────────────
      {
        decision_type: "Exercise", decision_id: "I0010", date: "2025-05-05", member_id: "M0001",
        reason_summary: "Boost NEAT: 10–12k steps/day and break prolonged sitting to lift recovery.",
        evidence_message_ids: ["A401", "A402"]
      },
      {
        decision_type: "Exercise", decision_id: "I0011", date: "2025-05-19", member_id: "M0001",
        reason_summary: "Introduce 2×/week strength-endurance at RPE ≤7; protect HRV while building capacity.",
        evidence_message_ids: ["R401", "R402"]
      },

      // ── June ───────────────────────────────────────────────────────────────
      {
        decision_type: "Nutrition", decision_id: "I0012", date: "2025-06-03", member_id: "M0001",
        reason_summary: "Slight omega-3 bump and sat-fat→MUFA swap to continue LDL-C reduction.",
        evidence_message_ids: ["C501", "C502"]
      },
      {
        decision_type: "Sleep & Recovery", decision_id: "I0013", date: "2025-06-17", member_id: "M0001",
        reason_summary: "AM-only caffeine and consistent 9:30pm wind-down to improve deep sleep and recovery.",
        evidence_message_ids: ["RB501", "RB502"]
      },

      // ── July (Heat protocol + labs) ────────────────────────────────────────
      {
        decision_type: "Lifestyle Protocol", decision_id: "I0014", date: "2025-07-01", member_id: "M0001",
        reason_summary: "Heat/hydration protocol (electrolytes + pre-cool) to reduce POTS-related head-rushes.",
        evidence_message_ids: ["RB601", "RB602", "W401"]
      },
      {
        decision_type: "Diagnostic", decision_id: "D02", date: "2025-07-14", member_id: "M0001",
        reason_summary: "Quarterly panel to verify continued improvements in LDL-C/ApoB and inflammation.",
        evidence_message_ids: ["RB603", "D301", "D302"]
      },
      {
        decision_type: "Nutrition", decision_id: "I0015", date: "2025-07-22", member_id: "M0001",
        reason_summary: "Cap alcohol at ≤2/week to protect sleep quality and cardiometabolic markers.",
        evidence_message_ids: ["C601", "C602"]
      },

      // ── August (Seoul v2 + sleep consistency) ──────────────────────────────
      {
        decision_type: "Travel Plan", decision_id: "I0016", date: "2025-08-05", member_id: "M0001",
        reason_summary: "Seoul jet-lag v2: calendar holds for earlier dinners, AM light, Z2 via walks if needed.",
        evidence_message_ids: ["RB701", "RB702", "A701", "A702"]
      },
      {
        decision_type: "Sleep & Recovery", decision_id: "I0017", date: "2025-08-20", member_id: "M0001",
        reason_summary: "Bedtime consistency ±15 min for 2 weeks to stabilize REM and recovery.",
        evidence_message_ids: ["RB703", "RB704"]
      },

      // ── September (taper + quarterly labs) ────────────────────────────────
      {
        decision_type: "Exercise", decision_id: "I0018", date: "2025-09-03", member_id: "M0001",
        reason_summary: "Maintenance with RPE caps and mobility swaps on red days to keep HRV steady pre-labs.",
        evidence_message_ids: ["A801", "A802"]
      },
      {
        decision_type: "Diagnostic", decision_id: "D03", date: "2025-09-29", member_id: "M0001",
        reason_summary: "Quarterly panel to confirm sustained LDL/ApoB improvements and low inflammation.",
        evidence_message_ids: ["RB801", "D401", "D402"]
      }
    ],
    // Inside EMBED's base object (or assign to base.internal_metrics = [...] after base is declared)
    internal_metrics: [
      // ───────────────── April 2025 (kept exactly as your sample) ─────────────────
      // Week of 2025-04-07 (Seoul travel + prep)
      { week_start: "2025-04-07", member_id: "M0001", team_member: "Ruby", role: "Concierge/Orchestrator", hours: 5.3 },
      { week_start: "2025-04-07", member_id: "M0001", team_member: "Dr. Warren", role: "Medical Strategist", hours: 2.6 },
      { week_start: "2025-04-07", member_id: "M0001", team_member: "Advik", role: "Performance Scientist", hours: 3.1 },
      { week_start: "2025-04-07", member_id: "M0001", team_member: "Carla", role: "Nutritionist", hours: 2.2 },
      { week_start: "2025-04-07", member_id: "M0001", team_member: "Rachel", role: "Physiotherapist", hours: 2.0 },
      { week_start: "2025-04-07", member_id: "M0001", team_member: "Neel", role: "Concierge Lead", hours: 1.8 },

      // Week of 2025-04-14 (D01 labs 04-15)
      { week_start: "2025-04-14", member_id: "M0001", team_member: "Ruby", role: "Concierge/Orchestrator", hours: 4.7 },
      { week_start: "2025-04-14", member_id: "M0001", team_member: "Dr. Warren", role: "Medical Strategist", hours: 2.3 },
      { week_start: "2025-04-14", member_id: "M0001", team_member: "Advik", role: "Performance Scientist", hours: 2.7 },
      { week_start: "2025-04-14", member_id: "M0001", team_member: "Carla", role: "Nutritionist", hours: 1.9 },
      { week_start: "2025-04-14", member_id: "M0001", team_member: "Rachel", role: "Physiotherapist", hours: 1.6 },
      { week_start: "2025-04-14", member_id: "M0001", team_member: "Neel", role: "Concierge Lead", hours: 1.5 },

      // Week of 2025-04-21
      { week_start: "2025-04-21", member_id: "M0001", team_member: "Ruby", role: "Concierge/Orchestrator", hours: 4.4 },
      { week_start: "2025-04-21", member_id: "M0001", team_member: "Dr. Warren", role: "Medical Strategist", hours: 1.8 },
      { week_start: "2025-04-21", member_id: "M0001", team_member: "Advik", role: "Performance Scientist", hours: 2.1 },
      { week_start: "2025-04-21", member_id: "M0001", team_member: "Carla", role: "Nutritionist", hours: 1.4 },
      { week_start: "2025-04-21", member_id: "M0001", team_member: "Rachel", role: "Physiotherapist", hours: 1.2 },
      { week_start: "2025-04-21", member_id: "M0001", team_member: "Neel", role: "Concierge Lead", hours: 1.1 },

      // Week of 2025-04-28
      { week_start: "2025-04-28", member_id: "M0001", team_member: "Ruby", role: "Concierge/Orchestrator", hours: 4.9 },
      { week_start: "2025-04-28", member_id: "M0001", team_member: "Dr. Warren", role: "Medical Strategist", hours: 2.4 },
      { week_start: "2025-04-28", member_id: "M0001", team_member: "Advik", role: "Performance Scientist", hours: 2.8 },
      { week_start: "2025-04-28", member_id: "M0001", team_member: "Carla", role: "Nutritionist", hours: 1.7 },
      { week_start: "2025-04-28", member_id: "M0001", team_member: "Rachel", role: "Physiotherapist", hours: 1.6 },
      { week_start: "2025-04-28", member_id: "M0001", team_member: "Neel", role: "Concierge Lead", hours: 1.7 },

      // ───────────────── May 2025 ─────────────────
      // 05-05 Travel (London) + NEAT push (I0010 starts)
      { week_start: "2025-05-05", member_id: "M0001", team_member: "Ruby", role: "Concierge/Orchestrator", hours: 5.2 },
      { week_start: "2025-05-05", member_id: "M0001", team_member: "Dr. Warren", role: "Medical Strategist", hours: 2.5 },
      { week_start: "2025-05-05", member_id: "M0001", team_member: "Advik", role: "Performance Scientist", hours: 3.0 },
      { week_start: "2025-05-05", member_id: "M0001", team_member: "Carla", role: "Nutritionist", hours: 1.9 },
      { week_start: "2025-05-05", member_id: "M0001", team_member: "Rachel", role: "Physiotherapist", hours: 1.4 },
      { week_start: "2025-05-05", member_id: "M0001", team_member: "Neel", role: "Concierge Lead", hours: 1.7 },

      { week_start: "2025-05-12", member_id: "M0001", team_member: "Ruby", role: "Concierge/Orchestrator", hours: 4.8 },
      { week_start: "2025-05-12", member_id: "M0001", team_member: "Dr. Warren", role: "Medical Strategist", hours: 2.3 },
      { week_start: "2025-05-12", member_id: "M0001", team_member: "Advik", role: "Performance Scientist", hours: 2.6 },
      { week_start: "2025-05-12", member_id: "M0001", team_member: "Carla", role: "Nutritionist", hours: 1.6 },
      { week_start: "2025-05-12", member_id: "M0001", team_member: "Rachel", role: "Physiotherapist", hours: 1.3 },
      { week_start: "2025-05-12", member_id: "M0001", team_member: "Neel", role: "Concierge Lead", hours: 1.3 },

      // 05-19 Strength-endurance (I0011)
      { week_start: "2025-05-19", member_id: "M0001", team_member: "Ruby", role: "Concierge/Orchestrator", hours: 5.0 },
      { week_start: "2025-05-19", member_id: "M0001", team_member: "Dr. Warren", role: "Medical Strategist", hours: 2.1 },
      { week_start: "2025-05-19", member_id: "M0001", team_member: "Advik", role: "Performance Scientist", hours: 2.9 },
      { week_start: "2025-05-19", member_id: "M0001", team_member: "Carla", role: "Nutritionist", hours: 1.7 },
      { week_start: "2025-05-19", member_id: "M0001", team_member: "Rachel", role: "Physiotherapist", hours: 1.9 },
      { week_start: "2025-05-19", member_id: "M0001", team_member: "Neel", role: "Concierge Lead", hours: 1.4 },

      { week_start: "2025-05-26", member_id: "M0001", team_member: "Ruby", role: "Concierge/Orchestrator", hours: 4.6 },
      { week_start: "2025-05-26", member_id: "M0001", team_member: "Dr. Warren", role: "Medical Strategist", hours: 2.5 },
      { week_start: "2025-05-26", member_id: "M0001", team_member: "Advik", role: "Performance Scientist", hours: 2.5 },
      { week_start: "2025-05-26", member_id: "M0001", team_member: "Carla", role: "Nutritionist", hours: 1.5 },
      { week_start: "2025-05-26", member_id: "M0001", team_member: "Rachel", role: "Physiotherapist", hours: 1.4 },
      { week_start: "2025-05-26", member_id: "M0001", team_member: "Neel", role: "Concierge Lead", hours: 1.2 },

      // ───────────────── June 2025 ─────────────────
      // 06-02 Travel (New York) + Nutrition swap (I0012)
      { week_start: "2025-06-02", member_id: "M0001", team_member: "Ruby", role: "Concierge/Orchestrator", hours: 5.4 },
      { week_start: "2025-06-02", member_id: "M0001", team_member: "Dr. Warren", role: "Medical Strategist", hours: 2.6 },
      { week_start: "2025-06-02", member_id: "M0001", team_member: "Advik", role: "Performance Scientist", hours: 3.1 },
      { week_start: "2025-06-02", member_id: "M0001", team_member: "Carla", role: "Nutritionist", hours: 2.2 },
      { week_start: "2025-06-02", member_id: "M0001", team_member: "Rachel", role: "Physiotherapist", hours: 1.3 },
      { week_start: "2025-06-02", member_id: "M0001", team_member: "Neel", role: "Concierge Lead", hours: 1.8 },

      { week_start: "2025-06-09", member_id: "M0001", team_member: "Ruby", role: "Concierge/Orchestrator", hours: 4.7 },
      { week_start: "2025-06-09", member_id: "M0001", team_member: "Dr. Warren", role: "Medical Strategist", hours: 2.4 },
      { week_start: "2025-06-09", member_id: "M0001", team_member: "Advik", role: "Performance Scientist", hours: 2.6 },
      { week_start: "2025-06-09", member_id: "M0001", team_member: "Carla", role: "Nutritionist", hours: 1.8 },
      { week_start: "2025-06-09", member_id: "M0001", team_member: "Rachel", role: "Physiotherapist", hours: 1.5 },
      { week_start: "2025-06-09", member_id: "M0001", team_member: "Neel", role: "Concierge Lead", hours: 1.3 },

      // 06-16 Sleep/wind-down refresh (I0013)
      { week_start: "2025-06-16", member_id: "M0001", team_member: "Ruby", role: "Concierge/Orchestrator", hours: 5.1 },
      { week_start: "2025-06-16", member_id: "M0001", team_member: "Dr. Warren", role: "Medical Strategist", hours: 2.1 },
      { week_start: "2025-06-16", member_id: "M0001", team_member: "Advik", role: "Performance Scientist", hours: 2.7 },
      { week_start: "2025-06-16", member_id: "M0001", team_member: "Carla", role: "Nutritionist", hours: 1.7 },
      { week_start: "2025-06-16", member_id: "M0001", team_member: "Rachel", role: "Physiotherapist", hours: 1.6 },
      { week_start: "2025-06-16", member_id: "M0001", team_member: "Neel", role: "Concierge Lead", hours: 1.4 },

      { week_start: "2025-06-23", member_id: "M0001", team_member: "Ruby", role: "Concierge/Orchestrator", hours: 4.6 },
      { week_start: "2025-06-23", member_id: "M0001", team_member: "Dr. Warren", role: "Medical Strategist", hours: 2.3 },
      { week_start: "2025-06-23", member_id: "M0001", team_member: "Advik", role: "Performance Scientist", hours: 2.4 },
      { week_start: "2025-06-23", member_id: "M0001", team_member: "Carla", role: "Nutritionist", hours: 1.5 },
      { week_start: "2025-06-23", member_id: "M0001", team_member: "Rachel", role: "Physiotherapist", hours: 1.4 },
      { week_start: "2025-06-23", member_id: "M0001", team_member: "Neel", role: "Concierge Lead", hours: 1.2 },

      { week_start: "2025-06-30", member_id: "M0001", team_member: "Ruby", role: "Concierge/Orchestrator", hours: 5.0 },
      { week_start: "2025-06-30", member_id: "M0001", team_member: "Dr. Warren", role: "Medical Strategist", hours: 2.5 }, // heat protocol kickoff support
      { week_start: "2025-06-30", member_id: "M0001", team_member: "Advik", role: "Performance Scientist", hours: 2.8 },
      { week_start: "2025-06-30", member_id: "M0001", team_member: "Carla", role: "Nutritionist", hours: 1.7 },
      { week_start: "2025-06-30", member_id: "M0001", team_member: "Rachel", role: "Physiotherapist", hours: 1.5 },
      { week_start: "2025-06-30", member_id: "M0001", team_member: "Neel", role: "Concierge Lead", hours: 1.5 },

      // ───────────────── July 2025 ─────────────────
      { week_start: "2025-07-07", member_id: "M0001", team_member: "Ruby", role: "Concierge/Orchestrator", hours: 4.8 },
      { week_start: "2025-07-07", member_id: "M0001", team_member: "Dr. Warren", role: "Medical Strategist", hours: 2.6 }, // pre-labs
      { week_start: "2025-07-07", member_id: "M0001", team_member: "Advik", role: "Performance Scientist", hours: 2.5 },
      { week_start: "2025-07-07", member_id: "M0001", team_member: "Carla", role: "Nutritionist", hours: 1.8 },
      { week_start: "2025-07-07", member_id: "M0001", team_member: "Rachel", role: "Physiotherapist", hours: 1.4 },
      { week_start: "2025-07-07", member_id: "M0001", team_member: "Neel", role: "Concierge Lead", hours: 1.4 },

      // 07-14 D02 labs week
      { week_start: "2025-07-14", member_id: "M0001", team_member: "Ruby", role: "Concierge/Orchestrator", hours: 5.1 },
      { week_start: "2025-07-14", member_id: "M0001", team_member: "Dr. Warren", role: "Medical Strategist", hours: 3.2 },
      { week_start: "2025-07-14", member_id: "M0001", team_member: "Advik", role: "Performance Scientist", hours: 2.8 },
      { week_start: "2025-07-14", member_id: "M0001", team_member: "Carla", role: "Nutritionist", hours: 2.2 },
      { week_start: "2025-07-14", member_id: "M0001", team_member: "Rachel", role: "Physiotherapist", hours: 1.6 },
      { week_start: "2025-07-14", member_id: "M0001", team_member: "Neel", role: "Concierge Lead", hours: 1.7 },

      // 07-21 Travel + alcohol cap (I0015)
      { week_start: "2025-07-21", member_id: "M0001", team_member: "Ruby", role: "Concierge/Orchestrator", hours: 5.4 },
      { week_start: "2025-07-21", member_id: "M0001", team_member: "Dr. Warren", role: "Medical Strategist", hours: 2.7 },
      { week_start: "2025-07-21", member_id: "M0001", team_member: "Advik", role: "Performance Scientist", hours: 3.0 },
      { week_start: "2025-07-21", member_id: "M0001", team_member: "Carla", role: "Nutritionist", hours: 2.1 },
      { week_start: "2025-07-21", member_id: "M0001", team_member: "Rachel", role: "Physiotherapist", hours: 1.5 },
      { week_start: "2025-07-21", member_id: "M0001", team_member: "Neel", role: "Concierge Lead", hours: 1.8 },

      { week_start: "2025-07-28", member_id: "M0001", team_member: "Ruby", role: "Concierge/Orchestrator", hours: 4.6 },
      { week_start: "2025-07-28", member_id: "M0001", team_member: "Dr. Warren", role: "Medical Strategist", hours: 2.2 },
      { week_start: "2025-07-28", member_id: "M0001", team_member: "Advik", role: "Performance Scientist", hours: 2.4 },
      { week_start: "2025-07-28", member_id: "M0001", team_member: "Carla", role: "Nutritionist", hours: 1.6 },
      { week_start: "2025-07-28", member_id: "M0001", team_member: "Rachel", role: "Physiotherapist", hours: 1.3 },
      { week_start: "2025-07-28", member_id: "M0001", team_member: "Neel", role: "Concierge Lead", hours: 1.2 },

      // ───────────────── August 2025 ─────────────────
      // 08-04 Travel (Seoul v2) + travel plan (I0016)
      { week_start: "2025-08-04", member_id: "M0001", team_member: "Ruby", role: "Concierge/Orchestrator", hours: 5.5 },
      { week_start: "2025-08-04", member_id: "M0001", team_member: "Dr. Warren", role: "Medical Strategist", hours: 2.6 },
      { week_start: "2025-08-04", member_id: "M0001", team_member: "Advik", role: "Performance Scientist", hours: 3.2 },
      { week_start: "2025-08-04", member_id: "M0001", team_member: "Carla", role: "Nutritionist", hours: 1.9 },
      { week_start: "2025-08-04", member_id: "M0001", team_member: "Rachel", role: "Physiotherapist", hours: 1.4 },
      { week_start: "2025-08-04", member_id: "M0001", team_member: "Neel", role: "Concierge Lead", hours: 1.9 },

      { week_start: "2025-08-11", member_id: "M0001", team_member: "Ruby", role: "Concierge/Orchestrator", hours: 4.7 },
      { week_start: "2025-08-11", member_id: "M0001", team_member: "Dr. Warren", role: "Medical Strategist", hours: 2.2 },
      { week_start: "2025-08-11", member_id: "M0001", team_member: "Advik", role: "Performance Scientist", hours: 2.6 },
      { week_start: "2025-08-11", member_id: "M0001", team_member: "Carla", role: "Nutritionist", hours: 1.5 },
      { week_start: "2025-08-11", member_id: "M0001", team_member: "Rachel", role: "Physiotherapist", hours: 1.3 },
      { week_start: "2025-08-11", member_id: "M0001", team_member: "Neel", role: "Concierge Lead", hours: 1.2 },

      // 08-18 Sleep consistency (I0017)
      { week_start: "2025-08-18", member_id: "M0001", team_member: "Ruby", role: "Concierge/Orchestrator", hours: 5.0 },
      { week_start: "2025-08-18", member_id: "M0001", team_member: "Dr. Warren", role: "Medical Strategist", hours: 2.4 },
      { week_start: "2025-08-18", member_id: "M0001", team_member: "Advik", role: "Performance Scientist", hours: 2.5 },
      { week_start: "2025-08-18", member_id: "M0001", team_member: "Carla", role: "Nutritionist", hours: 1.6 },
      { week_start: "2025-08-18", member_id: "M0001", team_member: "Rachel", role: "Physiotherapist", hours: 1.5 },
      { week_start: "2025-08-18", member_id: "M0001", team_member: "Neel", role: "Concierge Lead", hours: 1.4 },

      { week_start: "2025-08-25", member_id: "M0001", team_member: "Ruby", role: "Concierge/Orchestrator", hours: 4.6 },
      { week_start: "2025-08-25", member_id: "M0001", team_member: "Dr. Warren", role: "Medical Strategist", hours: 2.1 },
      { week_start: "2025-08-25", member_id: "M0001", team_member: "Advik", role: "Performance Scientist", hours: 2.3 },
      { week_start: "2025-08-25", member_id: "M0001", team_member: "Carla", role: "Nutritionist", hours: 1.4 },
      { week_start: "2025-08-25", member_id: "M0001", team_member: "Rachel", role: "Physiotherapist", hours: 1.2 },
      { week_start: "2025-08-25", member_id: "M0001", team_member: "Neel", role: "Concierge Lead", hours: 1.1 },

      // ───────────────── September 2025 ─────────────────
      // 09-01 Maintenance (I0018) + pre-labs stabilization
      { week_start: "2025-09-01", member_id: "M0001", team_member: "Ruby", role: "Concierge/Orchestrator", hours: 4.9 },
      { week_start: "2025-09-01", member_id: "M0001", team_member: "Dr. Warren", role: "Medical Strategist", hours: 2.5 },
      { week_start: "2025-09-01", member_id: "M0001", team_member: "Advik", role: "Performance Scientist", hours: 2.9 },
      { week_start: "2025-09-01", member_id: "M0001", team_member: "Carla", role: "Nutritionist", hours: 1.6 },
      { week_start: "2025-09-01", member_id: "M0001", team_member: "Rachel", role: "Physiotherapist", hours: 1.8 },
      { week_start: "2025-09-01", member_id: "M0001", team_member: "Neel", role: "Concierge Lead", hours: 1.5 },

      // 09-08 Travel (London)
      { week_start: "2025-09-08", member_id: "M0001", team_member: "Ruby", role: "Concierge/Orchestrator", hours: 5.3 },
      { week_start: "2025-09-08", member_id: "M0001", team_member: "Dr. Warren", role: "Medical Strategist", hours: 2.6 },
      { week_start: "2025-09-08", member_id: "M0001", team_member: "Advik", role: "Performance Scientist", hours: 3.1 },
      { week_start: "2025-09-08", member_id: "M0001", team_member: "Carla", role: "Nutritionist", hours: 1.9 },
      { week_start: "2025-09-08", member_id: "M0001", team_member: "Rachel", role: "Physiotherapist", hours: 1.4 },
      { week_start: "2025-09-08", member_id: "M0001", team_member: "Neel", role: "Concierge Lead", hours: 1.8 },

      { week_start: "2025-09-15", member_id: "M0001", team_member: "Ruby", role: "Concierge/Orchestrator", hours: 4.7 },
      { week_start: "2025-09-15", member_id: "M0001", team_member: "Dr. Warren", role: "Medical Strategist", hours: 2.3 },
      { week_start: "2025-09-15", member_id: "M0001", team_member: "Advik", role: "Performance Scientist", hours: 2.5 },
      { week_start: "2025-09-15", member_id: "M0001", team_member: "Carla", role: "Nutritionist", hours: 1.6 },
      { week_start: "2025-09-15", member_id: "M0001", team_member: "Rachel", role: "Physiotherapist", hours: 1.4 },
      { week_start: "2025-09-15", member_id: "M0001", team_member: "Neel", role: "Concierge Lead", hours: 1.3 },

      { week_start: "2025-09-22", member_id: "M0001", team_member: "Ruby", role: "Concierge/Orchestrator", hours: 4.8 },
      { week_start: "2025-09-22", member_id: "M0001", team_member: "Dr. Warren", role: "Medical Strategist", hours: 2.4 },
      { week_start: "2025-09-22", member_id: "M0001", team_member: "Advik", role: "Performance Scientist", hours: 2.6 },
      { week_start: "2025-09-22", member_id: "M0001", team_member: "Carla", role: "Nutritionist", hours: 1.6 },
      { week_start: "2025-09-22", member_id: "M0001", team_member: "Rachel", role: "Physiotherapist", hours: 1.5 },
      { week_start: "2025-09-22", member_id: "M0001", team_member: "Neel", role: "Concierge Lead", hours: 1.4 },

      // 09-29 D03 labs week
      { week_start: "2025-09-29", member_id: "M0001", team_member: "Ruby", role: "Concierge/Orchestrator", hours: 5.2 },
      { week_start: "2025-09-29", member_id: "M0001", team_member: "Dr. Warren", role: "Medical Strategist", hours: 3.3 },
      { week_start: "2025-09-29", member_id: "M0001", team_member: "Advik", role: "Performance Scientist", hours: 2.9 },
      { week_start: "2025-09-29", member_id: "M0001", team_member: "Carla", role: "Nutritionist", hours: 2.3 },
      { week_start: "2025-09-29", member_id: "M0001", team_member: "Rachel", role: "Physiotherapist", hours: 1.6 },
      { week_start: "2025-09-29", member_id: "M0001", team_member: "Neel", role: "Concierge Lead", hours: 1.9 },

      // ───────────────── October 2025 ─────────────────
      // 10-06 Travel (New York)
      { week_start: "2025-02-06", member_id: "M0001", team_member: "Ruby", role: "Concierge/Orchestrator", hours: 5.4 },
      { week_start: "2025-02-06", member_id: "M0001", team_member: "Dr. Warren", role: "Medical Strategist", hours: 2.6 },
      { week_start: "2025-02-06", member_id: "M0001", team_member: "Advik", role: "Performance Scientist", hours: 3.1 },
      { week_start: "2025-02-06", member_id: "M0001", team_member: "Carla", role: "Nutritionist", hours: 2.0 },
      { week_start: "2025-02-06", member_id: "M0001", team_member: "Rachel", role: "Physiotherapist", hours: 1.4 },
      { week_start: "2025-02-06", member_id: "M0001", team_member: "Neel", role: "Concierge Lead", hours: 1.8 },

      { week_start: "2025-02-13", member_id: "M0001", team_member: "Ruby", role: "Concierge/Orchestrator", hours: 4.7 },
      { week_start: "2025-02-13", member_id: "M0001", team_member: "Dr. Warren", role: "Medical Strategist", hours: 2.4 },
      { week_start: "2025-02-13", member_id: "M0001", team_member: "Advik", role: "Performance Scientist", hours: 2.6 },
      { week_start: "2025-02-13", member_id: "M0001", team_member: "Carla", role: "Nutritionist", hours: 1.6 },
      { week_start: "2025-02-13", member_id: "M0001", team_member: "Rachel", role: "Physiotherapist", hours: 1.4 },
      { week_start: "2025-02-13", member_id: "M0001", team_member: "Neel", role: "Concierge Lead", hours: 1.3 },

      { week_start: "2025-02-20", member_id: "M0001", team_member: "Ruby", role: "Concierge/Orchestrator", hours: 4.5 },
      { week_start: "2025-02-20", member_id: "M0001", team_member: "Dr. Warren", role: "Medical Strategist", hours: 2.0 },
      { week_start: "2025-02-20", member_id: "M0001", team_member: "Advik", role: "Performance Scientist", hours: 2.3 },
      { week_start: "2025-02-20", member_id: "M0001", team_member: "Carla", role: "Nutritionist", hours: 1.5 },
      { week_start: "2025-02-20", member_id: "M0001", team_member: "Rachel", role: "Physiotherapist", hours: 1.2 },
      { week_start: "2025-02-20", member_id: "M0001", team_member: "Neel", role: "Concierge Lead", hours: 1.1 },

      { week_start: "2025-02-27", member_id: "M0001", team_member: "Ruby", role: "Concierge/Orchestrator", hours: 4.8 },
      { week_start: "2025-02-27", member_id: "M0001", team_member: "Dr. Warren", role: "Medical Strategist", hours: 2.5 },
      { week_start: "2025-02-27", member_id: "M0001", team_member: "Advik", role: "Performance Scientist", hours: 2.5 },
      { week_start: "2025-02-27", member_id: "M0001", team_member: "Carla", role: "Nutritionist", hours: 1.6 },
      { week_start: "2025-02-27", member_id: "M0001", team_member: "Rachel", role: "Physiotherapist", hours: 1.4 },
      { week_start: "2025-02-27", member_id: "M0001", team_member: "Neel", role: "Concierge Lead", hours: 1.3 },

      // ───────────────── November 2025 ─────────────────02     // 11-03 Travel (Jakarta)
      { week_start: "2025-03-03", member_id: "M0001", team_member: "Ruby", role: "Concierge/Orchestrator", hours: 5.3 },
      { week_start: "2025-03-03", member_id: "M0001", team_member: "Dr. Warren", role: "Medical Strategist", hours: 2.5 },
      { week_start: "2025-03-03", member_id: "M0001", team_member: "Advik", role: "Performance Scientist", hours: 3.0 },
      { week_start: "2025-03-03", member_id: "M0001", team_member: "Carla", role: "Nutritionist", hours: 1.9 },
      { week_start: "2025-03-03", member_id: "M0001", team_member: "Rachel", role: "Physiotherapist", hours: 1.3 },
      { week_start: "2025-03-03", member_id: "M0001", team_member: "Neel", role: "Concierge Lead", hours: 1.8 },

      { week_start: "2025-03-10", member_id: "M0001", team_member: "Ruby", role: "Concierge/Orchestrator", hours: 4.7 },
      { week_start: "2025-03-10", member_id: "M0001", team_member: "Dr. Warren", role: "Medical Strategist", hours: 2.3 },
      { week_start: "2025-03-10", member_id: "M0001", team_member: "Advik", role: "Performance Scientist", hours: 2.4 },
      { week_start: "2025-03-10", member_id: "M0001", team_member: "Carla", role: "Nutritionist", hours: 1.5 },
      { week_start: "2025-03-10", member_id: "M0001", team_member: "Rachel", role: "Physiotherapist", hours: 1.3 },
      { week_start: "2025-03-10", member_id: "M0001", team_member: "Neel", role: "Concierge Lead", hours: 1.2 },

      { week_start: "2025-03-17", member_id: "M0001", team_member: "Ruby", role: "Concierge/Orchestrator", hours: 4.6 },
      { week_start: "2025-03-17", member_id: "M0001", team_member: "Dr. Warren", role: "Medical Strategist", hours: 2.0 },
      { week_start: "2025-03-17", member_id: "M0001", team_member: "Advik", role: "Performance Scientist", hours: 2.2 },
      { week_start: "2025-03-17", member_id: "M0001", team_member: "Carla", role: "Nutritionist", hours: 1.4 },
      { week_start: "2025-03-17", member_id: "M0001", team_member: "Rachel", role: "Physiotherapist", hours: 1.2 },
      { week_start: "2025-03-17", member_id: "M0001", team_member: "Neel", role: "Concierge Lead", hours: 1.1 },

      { week_start: "2025-03-24", member_id: "M0001", team_member: "Ruby", role: "Concierge/Orchestrator", hours: 4.9 },
      { week_start: "2025-03-24", member_id: "M0001", team_member: "Dr. Warren", role: "Medical Strategist", hours: 2.4 },
      { week_start: "2025-03-24", member_id: "M0001", team_member: "Advik", role: "Performance Scientist", hours: 2.5 },
      { week_start: "2025-03-24", member_id: "M0001", team_member: "Carla", role: "Nutritionist", hours: 1.6 },
      { week_start: "2025-03-24", member_id: "M0001", team_member: "Rachel", role: "Physiotherapist", hours: 1.4 },
      { week_start: "2025-03-24", member_id: "M0001", team_member: "Neel", role: "Concierge Lead", hours: 1.3 }
    ]

  };

  base.wearable_daily = WEARABLE_HARDCODED;


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

const nameInitials = (full = "") =>
  full.trim().split(/\s+/).slice(0, 2).map(s => s[0]).join("").toUpperCase() || "M";

const fmtDateRange = (start, end) => `${fmtDate(start)} → ${fmtDate(end)}`;

const durationDays = (start, end) => {
  const s = new Date(start), e = new Date(end);
  if (isNaN(s) || isNaN(e)) return "—";
  const days = Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)));
  return `${days} day${days > 1 ? "s" : ""}`;
};



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

function rangeHRV(age, gender) { return [38, 65]; }         // ms
function rangeRecovery(age) { return [55, 90]; }         // %
function rangeDeepSleep(age) { return [75, 110]; }        // min
function rangeREM(age) { return [90, 140]; }        // min
function rangeSteps(age) { return [8000, 11000]; }    // steps
function rangeLDL(age) { return [60, 100]; }        // mg/dL (target band)
function rangeApoB(age) { return [60, 90]; }
function rangeHDL(age, gender) { return [gender === "Female" ? 50 : 40, 80]; }
function rangehsCRP(age) { return [0.2, 2.0]; }       // mg/L


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
// Which direction is "good" per metric
const METRIC_DIRECTION = {
  HRV_ms: "up",
  recovery_pct: "up",
  deep_sleep_min: "up",
  rem_sleep_min: "up",
  steps: "up",
  HRV_7d: "up",
  REC_7d: "up",
  HRV_30d: "up",
  HDL_C: "up",
  LDL_C: "down",
  ApoB: "down",
  hsCRP: "down",
};


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


function DeltaStatCard({ label, delta, unit, pct, direction = "up" }) {
  const d = Math.round(delta ?? 0);
  const pctNum = Math.round(pct ?? 0);
  const good = direction === "down" ? d <= 0 : d >= 0;

  const valueCls = good
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-rose-600 dark:text-rose-400";

  const badgeCls = good
    ? "text-emerald-700 border-emerald-300 bg-emerald-50/90 dark:text-emerald-200 dark:border-emerald-700 dark:bg-emerald-900/30"
    : "text-rose-700 border-rose-300 bg-rose-50/90 dark:text-rose-200 dark:border-rose-700 dark:bg-rose-900/30";

  return (
    <div className="relative rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white/80 dark:bg-zinc-900/70 overflow-hidden">
      {/* title can wrap; never overflow */}
      <div className="text-xs text-zinc-500 mb-2 break-words">{label}</div>

      {/* value on its own line (smaller, unit inline) */}
      <div className={`text-lg font-semibold tabular-nums ${valueCls}`}>
        {d > 0 ? "+" : ""}{d}{unit ? <span className="ml-1 text-sm opacity-85">{unit}</span> : null}
      </div>

      {/* badge ALWAYS below the value */}
      <div className="mt-1">
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border leading-none ${badgeCls}`}>
          {pctNum}% {good ? "improved" : "worse"}
        </span>
      </div>

      {/* footer text — wraps inside the card */}
      <div className="mt-2 flex items-start gap-2 text-xs text-zinc-500 leading-snug break-words">
        {good ? (
          <svg className="mt-0.5 w-4 h-4 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none">
            <path d="M7 17L17 7M17 7H9M17 7v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg className="mt-0.5 w-4 h-4 text-rose-500 shrink-0" viewBox="0 0 24 24" fill="none">
            <path d="M7 7l10 10M17 17H9M17 17V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        <span className="min-w-0">
          {good ? "Positive" : "Negative"} change vs first 14 days
        </span>
      </div>
    </div>
  );
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
// Segment with direction-aware good/bad out-of-range
function makeSegmented(series, lo, hi, direction = "up") {
  return series.map(p => {
    const v = p.value == null ? null : Number(p.value);
    if (v == null) return { date: p.date, inRange: null, goodOut: null, badOut: null };

    const inR = v >= lo && v <= hi;
    if (inR) return { date: p.date, inRange: v, goodOut: null, badOut: null };

    const above = v > hi;
    const below = v < lo;
    const good = direction === "up" ? above : below; // e.g., steps↑ is good
    return { date: p.date, inRange: null, goodOut: good ? v : null, badOut: !good ? v : null };
  });
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


function DecisionFlowSVG({ decisions, onSelect, onHover, height = 220, compact = false, fillWidth = false, leftContinuation = false }) {
  const n = decisions.length;
  const padX = 40;
  const gap = 180;
  const width = Math.max(padX * 2 + (n - 1) * gap, 420);
  const cy = Math.round(height * 0.5); // center vertically for both modes
  const xFirst = padX;


  return (
    <div className={`w-full ${fillWidth ? "overflow-hidden" : "overflow-x-auto"}`}>
      <svg
        {...(fillWidth
          ? { width: "100%", height, viewBox: `0 0 ${width} ${height}`, preserveAspectRatio: "xMidYMid meet" }
          : { width, height })}
        className="block"
      >
        {/* base line (dark-mode friendly) */}
        <line
          x1={padX} y1={cy} x2={width - padX} y2={cy}
          stroke="currentColor"
          className="text-zinc-200 dark:text-zinc-700"
          strokeWidth="2"
        />
        {/* left continuation (dotted) — preview only */}
        {leftContinuation && (
          <line
            x1={0}                 // start at the very left edge of the SVG/card content
            y1={cy}
            x2={xFirst - 14}       // stop just before the first node
            y2={cy}
            stroke="currentColor"
            className="text-zinc-300 dark:text-zinc-600"
            strokeWidth="2"
            strokeDasharray="4 6"
            strokeLinecap="round"
            opacity="0.9"
            style={{ pointerEvents: "none" }}
          />
        )}

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



function ChatBot({
  embed,
  dark,
  onOpenFlow,        // (id?: string) => void
  onOpenPersona,     // () => void
  onOpenMetric,      // (metricId: string) => void
}) {
  // ---------- UI state ----------
  const [msgs, setMsgs] = React.useState([
    {
      role: "assistant",
      kind: "text",
      content:
        "Hi! Ask me in plain English about this member’s data. Try: “open flow preview”, “HRV last 14 days”, “open LDL metric”, or “ApoB last month”."
    }
  ]);
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);

  // ---------- auto-scroll + auto-grow ----------
  const scrollRef = React.useRef(null);
  const firstPaint = React.useRef(true);

  React.useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;
    sc.scrollTo({
      top: sc.scrollHeight,
      behavior: firstPaint.current ? "auto" : "smooth",
    });
    firstPaint.current = false;
  }, [msgs, sending]);

  // Base 28rem, grow ~2rem per 4 messages up to +12rem
  const containerHeightRem = React.useMemo(() => {
    const extra = Math.min(12, Math.floor(msgs.length / 4) * 2);
    return 28 + extra;
  }, [msgs.length]);

  // ---------- local NLP resources ----------
  const STOP = new Set(("a an and the is are was were be been being to for in on at by with of from about as into over after before during while through between against without within near than then if else when whenever where wherever who whom whose which that this these those i you he she it we they me him her us them my your his her its our their mine yours hers ours theirs do does did done doing have has had having will would can could should may might must not no nor").split(/\s+/));

  const METRIC_NAME_TO_ID = {
    "hrv": "HRV_ms",
    "recovery": "recovery_pct",
    "deep": "deep_sleep_min", "deep sleep": "deep_sleep_min",
    "rem": "rem_sleep_min", "rem sleep": "rem_sleep_min",
    "steps": "steps",
    "ldl": "LDL_C", "ldl-c": "LDL_C",
    "apob": "ApoB",
    "hdl": "HDL_C",
    "hscrp": "hsCRP", "hs-crp": "hsCRP"
  };

  const synonyms = [
    [/^open\s+hrv(?:\s+metric|\s+card)?$/i, "OPEN_METRIC_ID:HRV_ms"],
    [/^open\s+recovery(?:\s+metric|\s+card)?$/i, "OPEN_METRIC_ID:recovery_pct"],
    [/^open\s+ldl(?:-c)?(?:\s+metric|\s+card)?$/i, "OPEN_METRIC_ID:LDL_C"],
    [/open (?:the )?(?:flow|decision flow|flow preview)/i, "OPEN_FLOW"],
    [/open (?:the )?(?:persona|member persona|snapshot)/i, "OPEN_PERSONA"],
    [/open ([a-z- ]+)(?: metric| card)?/i, "OPEN_METRIC:$1"],
    [/(?:show|plot|graph).*(ldl).*(hrv).*correl/i, "CORR_LDL_HRV"],
    [/(?:show|plot|graph).*(hrv).*(ldl).*correl/i, "CORR_LDL_HRV"],
    [/why.*\b(i\d{3,4}|d\d{2,3})\b/i, "RATIONALE:$1"],
    [/(?:latest|recent).*(diagnostic|panel|lipids)/i, "LATEST_DIAG"],
  ];

  function tokens(s) {
    return s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(/\s+/)
      .filter(t => t && !STOP.has(t));
  }

  // ---------- light semantic search (TF-IDF) over chat/notes ----------
  const searchIndex = React.useMemo(() => {
    const docs = [];

    // chat
    (embed.chat || []).forEach((m, i) => {
      docs.push({
        id: `msg:${m.message_id || i}`,
        type: "msg",
        text: `${m.sender}: ${m.text} (${m.topic || ""})`.trim(),
        payload: m
      });
    });

    // interventions
    (embed.interventions || []).forEach(iv => {
      docs.push({
        id: `iv:${iv.intervention_id}`,
        type: "intervention",
        text: `${iv.title || ""} ${iv.owner || ""} ${iv.type || ""} ${iv.expected?.note || ""} ${iv.actual?.note || ""}`.trim(),
        payload: iv
      });
    });

    // diagnostics summary
    (embed.diagnostics || []).forEach(dx => {
      docs.push({
        id: `dx:${dx.diagnostic_id}`,
        type: "diagnostic",
        text: `Diagnostic ${dx.date} ApoB ${dx.ApoB} LDL ${dx.LDL_C} hsCRP ${dx.hsCRP} ${dx.Notes || ""}`,
        payload: dx
      });
    });

    // Build vocab + tf
    const vocab = new Map();
    const rows = docs.map(d => {
      const toks = tokens(d.text);
      const tf = new Map();
      toks.forEach(t => tf.set(t, (tf.get(t) || 0) + 1));
      tf.forEach((_v, k) => vocab.set(k, (vocab.get(k) || 0) + 1));
      return { id: d.id, type: d.type, payload: d.payload, tf };
    });

    const N = rows.length || 1;
    const idf = new Map();
    vocab.forEach((df, term) => idf.set(term, Math.log((1 + N) / (1 + df)) + 1)); // smoothed

    // Precompute norms for cosine
    const norm = (vec) => Math.sqrt(Array.from(vec.entries()).reduce((s, [t, v]) => s + Math.pow(v * (idf.get(t) || 0), 2), 0)) || 1;

    const rowsWithNorm = rows.map(r => {
      const n = norm(r.tf);
      return { ...r, norm: n };
    });

    return { rows: rowsWithNorm, idf };
  }, [embed]);

  function tfidfSearch(q, k = 6) {
    const qtf = new Map();
    tokens(q).forEach(t => qtf.set(t, (qtf.get(t) || 0) + 1));
    const idf = searchIndex.idf;
    const qnorm = Math.sqrt(Array.from(qtf.entries()).reduce((s, [t, v]) => s + Math.pow(v * (idf.get(t) || 0), 2), 0)) || 1;

    const score = (row) => {
      let dot = 0;
      qtf.forEach((qv, t) => {
        if (row.tf.has(t)) {
          dot += (qv * (idf.get(t) || 0)) * (row.tf.get(t) * (idf.get(t) || 0));
        }
      });
      return dot / (row.norm * qnorm);
    };

    return searchIndex.rows
      .map(r => ({ ...r, score: score(r) }))
      .filter(r => r.score > 0.02)
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
  }

  // ---------- helpers already in your file we re-use ----------
  // buildLDLDaily (interpolator) and fmtDate are defined elsewhere in your file.

  // Pearson correlation + LDL↔HRV helper
  function pearson(xs, ys) {
    const n = Math.min(xs.length, ys.length);
    if (!n) return 0;
    let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0;
    for (let i = 0; i < n; i++) { const x = +xs[i], y = +ys[i]; sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y; }
    const cov = sxy - (sx * sy) / n;
    const vx = sxx - (sx * sx) / n;
    const vy = syy - (sy * sy) / n;
    const den = Math.sqrt(vx * vy);
    return (!den || !isFinite(den)) ? 0 : cov / den;
  }
  function ldlDaily60() {
    const wear = (embed.wearable_daily || []).slice(-60);
    if (!wear.length) return {};
    const startISO = wear[0].date, endISO = wear[wear.length - 1].date;
    return buildLDLDaily(embed.diagnostics || [], startISO, endISO);
  }

  // ---------- time window parsing ----------
  function parseWindow(text, fallbackEndISO) {
    const end = fallbackEndISO ? new Date(fallbackEndISO) : new Date();
    const m = text.toLowerCase().match(/last\s+(\d+)\s*(day|days|week|weeks|month|months)/);
    if (m) {
      const n = +m[1];
      const mult = m[2].startsWith("day") ? 1 : m[2].startsWith("week") ? 7 : 30;
      const start = new Date(end.getTime() - n * mult * 86400_000);
      return { start, end };
    }
    return null; // caller can default
  }

  // ---------- intent detection ----------
  function detectIntent(qRaw) {
    for (const [re, tag] of synonyms) {
      const m = qRaw.match(re);
      if (m) {
        if (tag.startsWith("OPEN_METRIC_ID")) {
          const id = tag.split(":")[1];
          return { type: "OPEN_METRIC", id };
        }

        if (tag.startsWith("OPEN_METRIC")) {
          const raw = tag.split(":")[1]?.trim() || m[1]?.trim() || "";
          const key = raw.toLowerCase();
          const id = METRIC_NAME_TO_ID[key] || METRIC_NAME_TO_ID[key.replace(/\s+/g, " ")] || null;
          return id ? { type: "OPEN_METRIC", id } : { type: "QA" };
        }
        if (tag.startsWith("RATIONALE")) {
          const id = (tag.split(":")[1] || m[1] || "").toUpperCase();
          return { type: "RATIONALE", id };
        }
        if (tag === "OPEN_FLOW") return { type: "OPEN_FLOW" };
        if (tag === "OPEN_PERSONA") return { type: "OPEN_PERSONA" };

        if (tag === "LATEST_DIAG") return { type: "LATEST_DIAG" };
      }
    }

    // metric open (looser)
    const openMetric = qRaw.match(/open\s+([a-z- ]+)(?:\s+metric|\s+card)?/i);
    if (openMetric) {
      const name = openMetric[1].trim().toLowerCase();
      const id = METRIC_NAME_TO_ID[name] || METRIC_NAME_TO_ID[name.replace(/\s+/g, " ")];
      if (id) return { type: "OPEN_METRIC", id };
    }

    // generic 'why ID'
    const why = qRaw.match(/\bwhy\b.*\b(i\d{3,4}|d\d{2,3})\b/i);
    if (why) return { type: "RATIONALE", id: why[1].toUpperCase() };

    // metric summary queries (e.g., “avg hrv last 14 days”)
    const metricAsk = qRaw.match(/\b(hrv|recovery|deep(?: sleep)?|rem(?: sleep)?|steps|ldl(?:-c)?|apob|hdl|hs-?crp)\b/i);
    if (metricAsk) {
      const id = METRIC_NAME_TO_ID[metricAsk[1].toLowerCase().replace(/\s+/g, " ")] || null;
      if (id) return { type: "METRIC_SUMMARY", id };
    }

    return { type: "QA" };
  }

  // ---------- NLG helpers ----------
  const say = {
    corr(r) {
      const s = (Math.round(r * 100) / 100).toFixed(2);
      const qual = r < -0.5 ? "strong inverse" :
        r < -0.2 ? "moderate inverse" :
          r > 0.5 ? "strong direct" :
            r > 0.2 ? "moderate direct" : "weak/none";
      return `LDL vs HRV correlation r = ${s} (${qual}).`;
    },
    latestDiag(dx) {
      return `Latest panel (${fmtDate(dx.date)}): ApoB ${dx.ApoB}, LDL-C ${dx.LDL_C}, HDL-C ${dx.HDL_C}, hs-CRP ${dx.hsCRP}.`;
    },
    metricSummary(id, start, end, avg) {
      const pretty = {
        HRV_ms: "HRV",
        recovery_pct: "Recovery",
        deep_sleep_min: "Deep sleep",
        rem_sleep_min: "REM sleep",
        steps: "Steps",
        LDL_C: "LDL-C",
        ApoB: "ApoB",
        HDL_C: "HDL-C",
        hsCRP: "hs-CRP"
      }[id] || id;
      const unit = {
        HRV_ms: "ms", recovery_pct: "%", deep_sleep_min: "min", rem_sleep_min: "min",
        steps: "", LDL_C: "mg/dL", ApoB: "", HDL_C: "", hsCRP: "mg/L"
      }[id] || "";
      const val = avg == null ? "—" : (id.includes("HRV") ? avg.toFixed(1) : Math.round(avg));
      return `${pretty} average ${val}${unit ? " " + unit : ""} from ${fmtDate(start)} to ${fmtDate(end)}.`;
    }
  };

  // ---------- actions ----------
  const pushAssistantText = (text) =>
    setMsgs(m => [...m, { role: "assistant", kind: "text", content: text }]);

  const pushAssistantChart = (title, rows) =>
    setMsgs(m => [...m, { role: "assistant", kind: "chart", title, rows }]);

  const pushAssistantList = (title, items) =>
    setMsgs(m => [...m, { role: "assistant", kind: "list", title, items }]);

  function handleQuick(cmd) {
    setInput(cmd);
    setTimeout(() => send(cmd), 0);
  }

  function avgOverWindow(id, start, end) {
    const wear = embed.wearable_daily || [];
    // diagnostics-derived stream for LDL/ApoB/HDL/hsCRP via buildDailyFromDiagnostics-like maps
    const diagMap = (() => {
      const map = {};
      const w = wear;
      if (!w.length) return map;
      const startISO = w[0].date, endISO = w[w.length - 1].date;
      const D = {
        ApoB: buildDailyFromDiagnostics(embed.diagnostics || [], "ApoB", startISO, endISO),
        HDL_C: buildDailyFromDiagnostics(embed.diagnostics || [], "HDL_C", startISO, endISO),
        hsCRP: buildDailyFromDiagnostics(embed.diagnostics || [], "hsCRP", startISO, endISO),
        LDL_C: buildLDLDaily(embed.diagnostics || [], startISO, endISO),
      };
      return D[id] || {};
    })();

    const arr = (embed.wearable_daily || []).filter(d => {
      const dt = new Date(d.date);
      return dt >= start && dt <= end;
    }).map(d => {
      if (["LDL_C", "ApoB", "HDL_C", "hsCRP"].includes(id)) {
        const v = diagMap[d.date];
        return v == null ? null : +v;
      }
      return +d[id.replace(/_.+$/, "")] || +d[id] || null;
    }).filter(v => v != null);

    if (!arr.length) return null;
    const sum = arr.reduce((s, v) => s + v, 0);
    return sum / arr.length;
  }

  async function send(forcedText) {
    const q = (forcedText ?? input).trim();
    if (!q || sending) return;

    const next = [...msgs, { role: "user", kind: "text", content: q }];
    setMsgs(next);
    setInput("");
    setSending(true);

    try {
      const intent = detectIntent(q);
      const wear = embed.wearable_daily || [];
      const lastISO = wear.length ? wear[wear.length - 1].date : new Date().toISOString().slice(0, 10);
      const win = parseWindow(q, lastISO) || { start: new Date(new Date(lastISO).getTime() - 30 * 86400_000), end: new Date(lastISO) };

      if (intent.type === "OPEN_FLOW") {
        onOpenFlow?.();
        pushAssistantText("Opening Decision Flow…");
      } else if (intent.type === "OPEN_PERSONA") {
        onOpenPersona?.();
        pushAssistantText("Opening Member Persona…");
      } else if (intent.type === "OPEN_METRIC" && intent.id) {
        onOpenMetric?.(intent.id);
        pushAssistantText(`Opening metric card: ${intent.id}…`);
      } else if (intent.type === "CORR_LDL_HRV") {
        const days = /last\s+(\d+)/i.test(q) ? Math.max(7, Math.min(90, +q.match(/last\s+(\d+)/i)[1])) : 60;
        const { r, rows } = correlationLDLvsHRV(days);
        pushAssistantText(say.corr(r));
        if (rows.length >= 4) pushAssistantChart(`LDL vs HRV (last ${rows.length}d)`, rows);
      } else if (intent.type === "LATEST_DIAG") {
        const dxs = embed.diagnostics || [];
        if (dxs.length) pushAssistantText(say.latestDiag(dxs[dxs.length - 1]));
        else pushAssistantText("I don’t have diagnostics in this EMBED.");
      } else if (intent.type === "RATIONALE" && intent.id) {
        const id = intent.id;
        const dec =
          (embed.interventions || []).find(x => (x.intervention_id || "").toUpperCase() === id) ||
          (embed.diagnostics || []).find(x => (x.diagnostic_id || "").toUpperCase() === id);
        const rat = (embed.rationales || []).find(r => (r.decision_id || "").toUpperCase() === id);
        if (!dec) pushAssistantText(`I couldn’t find a decision ${id}.`);
        else {
          const date = dec.date || dec.start_at || dec.end_at;
          pushAssistantText(`Decision ${id} on ${fmtDate(date)} — ${rat?.reason_summary || "No rationale available."}`);
          const evidenceIds = rat?.evidence_message_ids || [];
          if (evidenceIds.length) {
            const items = (embed.chat || []).filter(m => evidenceIds.includes(m.message_id)).map(m => `• ${m.sender}: ${m.text}`);
            pushAssistantList("Evidence messages", items);
          }
          onOpenFlow?.(id);
        }
      } else if (intent.type === "METRIC_SUMMARY" && intent.id) {
        const start = win.start, end = win.end;
        const avg = avgOverWindow(intent.id, start, end);
        pushAssistantText(say.metricSummary(intent.id, start, end, avg));
      } else {
        // “LLM-like” local QA: TF-IDF retrieval + stitched answer
        const hits = tfidfSearch(q, 6);
        if (hits.length) {
          const top = hits.slice(0, 3).map(h => {
            if (h.type === "msg") return `• ${h.payload.sender}: ${h.payload.text}`;
            if (h.type === "diagnostic") {
              const d = h.payload;
              return `• Dx ${fmtDate(d.date)} — ApoB ${d.ApoB}, LDL-C ${d.LDL_C}, hs-CRP ${d.hsCRP}`;
            }
            if (h.type === "intervention") {
              const iv = h.payload;
              return `• ${iv.title} (${iv.type}) — ${iv.owner || "Team"}: ${iv.expected?.note || iv.actual?.note || ""}`;
            }
            return `• ${h.id}`;
          });
          pushAssistantText("Here’s what I found in the embedded data:");
          pushAssistantList("Relevant items", top);
        } else {
          pushAssistantText("I couldn’t match that in the member's data. Try “open flow preview”, “latest diagnostics”, or “HRV last 14 days”.");
        }
      }
    } catch (e) {
      pushAssistantText(`⚠️ ${String(e.message || e)}`);
    } finally {
      setSending(false);
    }
  }

  // ---------- UI ----------
  const Quick = ({ label, onClick }) => (
    <button
      onClick={onClick}
      className="px-2.5 py-1 rounded-full text-xs border bg-white/80 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 transition"
    >
      {label}
    </button>
  );

  return (
    <Card className="p-0 overflow-hidden">
      <div className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <div className="font-semibold">AI Assistant</div>
        </div>
      </div>

      <div className="px-4 pt-3 pb-5 mb-2 flex items-center gap-2 gap-y-2 flex-wrap">
        <Quick label="Open Flow preview" onClick={() => handleQuick("open flow preview")} />
        <Quick label="Open Persona" onClick={() => handleQuick("open persona")} />
        {/* open metrics directly */}
        <Quick
          label="Open HRV metric"
          onClick={() => { onOpenMetric?.("HRV_ms"); pushAssistantText("Opening metric card: HRV_ms…"); }}
        />
        <Quick
          label="Open Recovery metric"
          onClick={() => { onOpenMetric?.("recovery_pct"); pushAssistantText("Opening metric card: recovery_pct…"); }}
        />
        <Quick
          label="Open LDL-C metric"
          onClick={() => { onOpenMetric?.("LDL_C"); pushAssistantText("Opening metric card: LDL_C…"); }}
        />
        <Quick label="Latest diagnostics" onClick={() => handleQuick("latest diagnostics")} />
      </div>

      <div className="flex flex-col" style={{ height: `${containerHeightRem}rem` }}>
        {/* messages */}
        <div ref={scrollRef} className="flex-1 overflow-auto p-4 space-y-3">
          {msgs.map((m, i) => {
            const isAssistant = m.role === "assistant";

            // Different bubble shades (light/dark)
            const sideCls = isAssistant
              ? "bg-gradient-to-tr from-sky-50/90 to-emerald-50/90 dark:from-sky-900/30 dark:to-emerald-900/30 border-sky-200/70 dark:border-sky-800/60"
              : "bg-white/90 dark:bg-zinc-900/70 border-zinc-200/60 dark:border-zinc-800/60 ml-auto";

            const baseCls = "max-w-[85%] rounded-2xl px-3 py-2 border shadow-sm";

            if (m.kind === "chart") {
              return (
                <div key={i} className={`${baseCls} ${sideCls}`}>
                  <div className="text-[11px] text-zinc-500 mb-1">{isAssistant ? "Assistant" : "You"}</div>
                  <div className="text-sm font-medium mb-2">{m.title}</div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={m.rows} margin={{ top: 6, right: 12, left: -6, bottom: 6 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickMargin={6} minTickGap={18} />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip
                          content={
                            <SeriesTooltip
                              dark={dark}
                              titleFmt={(l) => `Date: ${l}`}
                              valueFormatter={(v) => String(v)}
                            />
                          }
                        />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="LDL_C" name="LDL-C" stroke="#ef4444" dot={false} strokeWidth={2.25} />
                        <Line yAxisId="right" type="monotone" dataKey="HRV_ms" name="HRV (ms)" stroke="#10b981" dot={{ r: 1.6 }} strokeWidth={2.25} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            }

            if (m.kind === "list") {
              return (
                <div key={i} className={`${baseCls} ${sideCls}`}>
                  <div className="text-[11px] text-zinc-500 mb-1">{isAssistant ? "Assistant" : "You"}</div>
                  <div className="text-sm font-medium">{m.title}</div>
                  <ul className="mt-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
                    {m.items.map((t, idx) => <li key={idx}>{t}</li>)}
                  </ul>
                </div>
              );
            }

            return (
              <div key={i} className={`${baseCls} ${sideCls}`}>
                <div className="text-[11px] text-zinc-500 mb-1">{isAssistant ? "Assistant" : "You"}</div>
                <div className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</div>
              </div>
            );
          })}

          {sending && (
            <div className="inline-flex items-center gap-2 text-xs text-zinc-500">
              <Loader2 className="w-4 h-4 animate-spin" /> thinking…
            </div>
          )}
        </div>

        {/* input */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-3">
          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about the member."
              onKeyDown={(e) => (e.key === "Enter") && send()}
            />
            <Button onClick={() => send()} disabled={sending || !input.trim()}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">AI can make mistakes.</div>
        </div>
      </div>
    </Card>
  );
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
  const [personaOpen, setPersonaOpen] = useState(false);






  const ctx = useMemo(() => ({ ...bundle, chat, rationales }), [bundle, chat, rationales]);


  const handleOpenChatByMessageId = (mid) => {
    setFocusMsgId(mid);
    setChatOpen(true);
  };



  const lastUpdated = useMemo(() => {
    const w = bundle.wearable_daily || [];
    const dx = bundle.diagnostics || [];
    const dates = [];
    if (w.length) dates.push(new Date(w[w.length - 1].date));
    if (dx.length) dates.push(new Date(dx[dx.length - 1].date));
    return dates.length ? new Date(Math.max(...dates.map(d => d.getTime()))) : new Date();
  }, [bundle.wearable_daily, bundle.diagnostics]);



  // Unified Recharts tooltip styles (dark/light aware)
  const tooltipStyles = useMemo(() => ({
    contentStyle: {
      background: dark ? "rgba(24,24,27,0.98)" : "rgba(255,255,255,0.98)",
      border: `1px solid ${dark ? "#3f3f46" : "#e4e4e7"}`,
      borderRadius: 12,
      boxShadow: dark ? "0 6px 24px rgba(0,0,0,0.35)" : "0 8px 24px rgba(0,0,0,0.10)",
      color: dark ? "#e4e4e7" : "#111827",
    },
    labelStyle: { color: dark ? "#a1a1aa" : "#52525b" },
    itemStyle: { color: dark ? "#e4e4e7" : "#111827" },
    wrapperStyle: { outline: "none" },
  }), [dark]);



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



  function SeriesTooltip({ active, label, payload, dark, titleFmt, valueFormatter }) {
    if (!active || !payload || !payload.length) return null;

    const boxStyle = {
      background: dark ? "rgba(24,24,27,0.98)" : "rgba(255,255,255,0.98)",
      border: `1px solid ${dark ? "#3f3f46" : "#e4e4e7"}`,
      borderRadius: 12,
      boxShadow: dark ? "0 6px 24px rgba(0,0,0,0.35)" : "0 8px 24px rgba(0,0,0,0.10)",
      color: dark ? "#e4e4e7" : "#111827",
      padding: "10px 12px",
    };
    const labelStyle = { fontSize: 12, color: dark ? "#a1a1aa" : "#52525b" };

    return (
      <div style={boxStyle}>
        <div style={labelStyle}>{titleFmt ? titleFmt(label) : label}</div>
        <div className="mt-1 space-y-1">
          {payload.map((it) => (
            <div key={it.dataKey || it.name} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ background: it.color }}
                />
                <span>{it.name || it.dataKey}</span>
              </div>
              <div className="font-medium tabular-nums">
                {valueFormatter ? valueFormatter(it.value, it) : it.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }






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


  // ==== Internal Metrics (from EMBED) ====
  const internal = useMemo(() => bundle.internal_metrics || [], [bundle.internal_metrics]);

  // Unique, sorted weeks and member names
  const weeksIM = useMemo(
    () => Array.from(new Set(internal.map(r => r.week_start))).sort(),
    [internal]
  );
  const memberNamesIM = useMemo(
    () => Array.from(new Set(internal.map(r => r.team_member))),
    [internal]
  );

  // Color for a given teammate name (prefer roster color; fallback to ROLE_COLORS by known names)
  function memberColor(name) {
    const fromRoster = (roster || []).find(p => p.name === name);
    if (fromRoster) return fromRoster.color;
    const fallbackByName = {
      "Dr. Warren": ROLE_COLORS.Physician,
      "Rachel": ROLE_COLORS.Physio,
      "Carla": ROLE_COLORS.Nutrition,
      "Advik": ROLE_COLORS.Performance,
      "Ruby": ROLE_COLORS.Concierge,
      "Neel": ROLE_COLORS.Lead,
    };
    return fallbackByName[name] || ROLE_COLORS.Team;
  }

  // Pivot to recharts-friendly rows: one row per week, columns = each member's hours
  const internalChartData = useMemo(() => {
    return weeksIM.map(week => {
      const row = { week };
      memberNamesIM.forEach(n => {
        const rec = internal.find(r => r.week_start === week && r.team_member === n);
        row[n] = rec ? Number(rec.hours) : null;
      });
      return row;
    });
  }, [weeksIM, memberNamesIM, internal]);

  // Totals by member (right-hand panel)
  const totalsByMember = useMemo(() => {
    return memberNamesIM
      .map(n => {
        const all = internal.filter(r => r.team_member === n);
        const sum = all.reduce((s, r) => s + (Number(r.hours) || 0), 0);
        const role = all[0]?.role || "";
        return { name: n, role, hours: +sum.toFixed(1) };
      })
      .sort((a, b) => b.hours - a.hours);
  }, [memberNamesIM, internal]);
  const maxTotalIM = useMemo(
    () => Math.max(1, ...totalsByMember.map(t => t.hours)),
    [totalsByMember]
  );






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


  // --- Progress since joining Elyx (first 14 days vs last 14 days) ---
  const progress = useMemo(() => {
    const wear = bundle.wearable_daily || [];
    if (!wear.length) return null;

    const n = Math.min(14, wear.length);
    const first = wear.slice(0, n);
    const last = wear.slice(-n);

    const avg = (arr, sel) =>
      arr.length ? arr.reduce((s, a) => s + (+sel(a) || 0), 0) / arr.length : null;

    const before = {
      hrv: avg(first, d => d.HRV_ms),
      rec: avg(first, d => d.recovery_pct),
      deep: avg(first, d => d.deep_sleep_min),
      rem: avg(first, d => d.rem_sleep_min),
      steps: avg(first, d => d.steps),
    };
    const after = {
      hrv: avg(last, d => d.HRV_ms),
      rec: avg(last, d => d.recovery_pct),
      deep: avg(last, d => d.deep_sleep_min),
      rem: avg(last, d => d.rem_sleep_min),
      steps: avg(last, d => d.steps),
    };

    // diagnostics: baseline vs latest
    const diags = (bundle.diagnostics || []).slice()
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    const baseDx = diags[0] || {};
    const latestDx = diags[diags.length - 1] || {};

    const pctUp = (b, a) => (b == null || a == null || !isFinite(b) || b === 0)
      ? 0 : Math.max(0, Math.min(100, ((a - b) / Math.abs(b)) * 100));

    const pctDown = (b, a) => (b == null || a == null || !isFinite(b) || b === 0)
      ? 0 : Math.max(0, Math.min(100, ((b - a) / Math.abs(b)) * 100));

    const dims = {
      HRV: {
        pct: pctUp(before.hrv, after.hrv),
        delta: (after.hrv ?? 0) - (before.hrv ?? 0),
        unit: "ms", good: "up"
      },
      Recovery: {
        pct: pctUp(before.rec, after.rec),
        delta: (after.rec ?? 0) - (before.rec ?? 0),
        unit: "%", good: "up"
      },
      Sleep: {
        pct: (pctUp(before.deep, after.deep) + pctUp(before.rem, after.rem)) / 2,
        delta: ((after.deep ?? 0) - (before.deep ?? 0) + (after.rem ?? 0) - (before.rem ?? 0)) / 2,
        unit: "min", good: "up"
      },
      Activity: {
        pct: pctUp(before.steps, after.steps),
        delta: (after.steps ?? 0) - (before.steps ?? 0),
        unit: "steps", good: "up"
      },
      Lipids: {
        pct: ((pctDown(baseDx.LDL_C, latestDx.LDL_C) + pctDown(baseDx.ApoB, latestDx.ApoB)) / 2) || 0,
        deltaLDL: ((baseDx.LDL_C ?? 0) - (latestDx.LDL_C ?? 0)),
        deltaApoB: ((baseDx.ApoB ?? 0) - (latestDx.ApoB ?? 0)),
        unit: "mg/dL", good: "down"
      },
      Inflammation: {
        pct: pctDown(baseDx.hsCRP, latestDx.hsCRP),
        delta: ((baseDx.hsCRP ?? 0) - (latestDx.hsCRP ?? 0)),
        unit: "mg/L", good: "down"
      }
    };

    const radar = Object.entries(dims).map(([metric, v]) => ({
      metric,
      value: Math.round(v.pct)
    }));
    const overall = Math.round(radar.reduce((s, r) => s + r.value, 0) / radar.length);

    const since = bundle.episodes?.[0]?.start_at || wear[0].date;
    const until = wear[wear.length - 1].date;

    return { radar, dims, overall, since, until };
  }, [bundle.wearable_daily, bundle.diagnostics, bundle.episodes]);




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

  function MetricChart({ data, range, height = 180, legend = false, direction = "up" }) {
    const [lo, hi] = range;
    const values = data.map(d => d.value).filter(v => v != null);
    const hardMin = values.length ? Math.min(...values, lo) : lo;
    const hardMax = values.length ? Math.max(...values, hi) : hi;
    const yMin = Math.max(0, Math.floor((hardMin - 5) / 5) * 5);
    const yMax = Math.ceil((hardMax + 5) / 5) * 5;

    const seg = makeSegmented(data, lo, hi, direction);

    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={seg} margin={{ top: 8, right: 12, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickMargin={8}
            minTickGap={24}
            tickFormatter={(d) => new Date(d + "T00:00:00").toLocaleDateString()}
          />
          <YAxis domain={[yMin, yMax]} />
          <Tooltip
            content={
              <SeriesTooltip
                dark={dark}
                titleFmt={(l) => `Date: ${l}`}
                valueFormatter={(val) => String(val)}
              />
            }
          />
          {legend && <Legend />}

          {/* Visible green target band */}
          <ReferenceArea y1={lo} y2={hi} fill="#10b981" fillOpacity={0.18} />

          {/* in range (solid green), good-out (dashed green), bad-out (solid red) */}
          <Line type="monotone" dataKey="inRange" stroke="#10b981" strokeWidth={3} dot={{ r: 1.8 }} name="In range" />
          <Line type="monotone" dataKey="goodOut" stroke="#10b981" strokeDasharray="4 3" strokeWidth={3} dot={false} name="Good (out)" />
          <Line type="monotone" dataKey="badOut" stroke="#ef4444" strokeWidth={3} dot={false} name="Bad (out)" />
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

  function ChatModal({ open, onClose, peer, member, messages, focusMsgId, onClearFocus, dark }) {
    if (!open || !peer) return null;

    const memberId = member?.member_id || "M0001";
    const scrollerRef = React.useRef(null);
    const msgRefs = React.useRef(new Map());

    // capture whether we opened WITH a focus target (once per open)
    const initialFocusIdRef = React.useRef(null);

    const thread = React.useMemo(() => {
      return (messages || [])
        .filter(m =>
          (m.sender_id === memberId && m.receiver_id === peer.id) ||
          (m.receiver_id === memberId && m.sender_id === peer.id)
        )
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }, [messages, memberId, peer]);

    React.useEffect(() => {
      if (open && initialFocusIdRef.current === null) {
        initialFocusIdRef.current = focusMsgId ?? null;
      }
      if (!open) {
        initialFocusIdRef.current = null;
      }
    }, [open, focusMsgId]);

    // Auto-scroll to bottom ONLY if opened without a focus target
    React.useLayoutEffect(() => {
      if (!open) return;
      const sc = scrollerRef.current;
      if (!sc) return;
      if (!initialFocusIdRef.current) {
        sc.scrollTop = sc.scrollHeight;
      }
    }, [open]);

    // Scroll to focused message; after highlight ends, do NOT change scroll
    React.useEffect(() => {
      if (!open || !focusMsgId) return;
      const sc = scrollerRef.current;
      if (!sc) return;
      const el = msgRefs.current.get(focusMsgId);
      if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
      // const t = setTimeout(() => onClearFocus?.(), 1400);
      // return () => clearTimeout(t);
    }, [open, focusMsgId, onClearFocus]);

    const bubbleTint = peer.color || "#64748b";
    const bgAlpha = dark ? "22" : "33";
    const bdAlpha = dark ? "55" : "66";

    return createPortal(
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                Chat with {peer.name}
              </div>
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
              >
                Close
              </button>
            </div>

            <div
              ref={scrollerRef}
              className="h-[60vh] overflow-auto rounded-xl p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
            >
              {thread.length === 0 && (
                <div className="text-sm text-zinc-500">No messages in this thread.</div>
              )}

              {thread.map(m => {
                const me = m.sender_id === memberId;
                const isFocused = focusMsgId === m.message_id;

                return (
                  <div key={m.message_id} className={`flex ${me ? "justify-end" : "justify-start"} mb-2`}>
                    <div
                      ref={el => {
                        if (el) msgRefs.current.set(m.message_id, el);
                        else msgRefs.current.delete(m.message_id);
                      }}
                      className={`max-w-[75%] rounded-2xl px-3 py-2 shadow border relative
                      ${me
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "text-zinc-900 dark:text-zinc-100"
                        } ${isFocused ? "ring-4 ring-sky-500 shadow-[0_0_0_4px_rgba(14,165,233,0.25)]" : ""}`}
                      style={
                        me
                          ? undefined
                          : { backgroundColor: `${bubbleTint}${bgAlpha}`, borderColor: `${bubbleTint}${bdAlpha}` }
                      }
                    >
                      <div className={`text-xs opacity-70 mb-1 ${me ? "text-white" : "text-zinc-600 dark:text-zinc-300"}`}>
                        {m.sender}
                      </div>
                      <div className="text-sm leading-snug">{m.text}</div>
                      <div className={`text-[10px] mt-1 opacity-70 ${me ? "text-white" : "text-zinc-500"}`}>
                        {new Date(m.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>,
      document.body
    );
  }


  function PersonaModal({ open, onClose, member, episodes = [], trips = [] }) {
    if (!open) return null;

    const initials = nameInitials(member?.preferred_name);
    const chip = (text) => (
      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium
                    text-white border border-white/30 bg-white/15 backdrop-blur">
        {text}
      </span>
    );

    return createPortal(
      <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
          <Card className="p-0 overflow-hidden">
            {/* Rounded gradient header (light/dark aware) */}
            <div className="p-5">
              <div
                className="relative h-32 rounded-2xl bg-gradient-to-br
                         from-sky-400 via-violet-500 to-emerald-400
                         dark:from-sky-700 dark:via-violet-700 dark:to-emerald-700 shadow-inner"
              >
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-xl border border-white/40 bg-white/80 dark:bg-zinc-900/80 text-zinc-900 dark:text-zinc-100 hover:bg-white transition"
                >
                  Close
                </button>

                <div className="absolute inset-x-5 bottom-4 flex items-end gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-white/85 dark:bg-zinc-900/80 border border-white/40 dark:border-zinc-800/80 flex items-center justify-center shadow-md">
                    <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{initials}</span>
                  </div>
                  <div className="pb-1 text-white">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 opacity-90" />
                      <span className="text-xs font-semibold tracking-wide text-white">Member Persona</span>
                    </div>
                    <div className="text-2xl font-extrabold drop-shadow-[0_1px_0_rgba(0,0,0,0.25)]">
                      {member?.preferred_name || "Member"}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {member?.age != null && chip(`${member.age} yrs`)}
                      {member?.gender && chip(member.gender)}
                      {member?.primary_residence && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] border border-white/40 bg-white/20 backdrop-blur-sm inline-flex items-center gap-1 text-white">
                          <MapPin className="w-3.5 h-3.5 opacity-90" />
                          {member.primary_residence}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 pb-5 grid md:grid-cols-12 gap-5 text-zinc-900 dark:text-zinc-100">

              {/* Left facts */}
              <div className="md:col-span-5 space-y-3">
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white/80 dark:bg-zinc-900/60">
                  <div className="text-xs text-zinc-500 flex items-center gap-2"><Briefcase className="w-3.5 h-3.5" /> Occupation</div>
                  <div className="text-sm font-medium mt-1">{member?.occupation || "—"}</div>
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white/80 dark:bg-zinc-900/60">
                  <div className="text-xs text-zinc-500 flex items-center gap-2"><User className="w-3.5 h-3.5" /> Assistant</div>
                  <div className="text-sm font-medium mt-1">{member?.assistant || "—"}</div>
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white/80 dark:bg-zinc-900/60">
                  <div className="text-xs text-zinc-500 flex items-center gap-2"><Stethoscope className="w-3.5 h-3.5" /> Chronic Condition</div>
                  <div className="text-sm font-medium mt-1">{member?.chronic_condition || "—"}</div>
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white/80 dark:bg-zinc-900/60">
                  <div className="text-xs text-zinc-500">Wearables</div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {(member?.wearables || []).map(w => (
                      <span key={w} className="px-2 py-0.5 rounded-full text-[11px] border bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
                        {w}
                      </span>
                    ))}
                    {(member?.wearables || []).length === 0 && <span className="text-sm">—</span>}
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white/80 dark:bg-zinc-900/60">
                  <div className="text-xs text-zinc-500">Travel hubs</div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {(member?.travel_hubs || []).map(h => (
                      <span key={h} className="px-2 py-0.5 rounded-full text-[11px] border bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
                        {h}
                      </span>
                    ))}
                    {(member?.travel_hubs || []).length === 0 && <span className="text-sm">—</span>}
                  </div>
                </div>
              </div>

              {/* Right: episodes & trips */}
              <div className="md:col-span-7 space-y-4">
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white/80 dark:bg-zinc-900/60">
                  <div className="flex items-center gap-2 mb-2"><CalendarDays className="w-4 h-4" /><div className="font-semibold">Episodes</div></div>
                  {episodes?.length ? (
                    <div className="space-y-3 max-h-[18rem] overflow-auto pr-1">
                      {episodes.map((e) => (
                        <div key={e.episode_id} className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40">
                          <div className="text-xs text-zinc-500">{fmtDateRange(e.start_at, e.end_at)} • {durationDays(e.start_at, e.end_at)}</div>
                          <div className="font-medium mt-0.5">{e.title}</div>
                          {e.summary && <div className="text-sm text-zinc-600 dark:text-zinc-300 mt-0.5">{e.summary}</div>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-zinc-500">No episodes.</div>
                  )}
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white/80 dark:bg-zinc-900/60">
                  <div className="flex items-center gap-2 mb-2"><Plane className="w-4 h-4" /><div className="font-semibold">Trips</div></div>
                  {trips?.length ? (
                    <div className="space-y-3 max-h-[14rem] overflow-auto pr-1">
                      {trips.map((t) => (
                        <div key={t.trip_id} className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full mt-1.5 bg-sky-500" />
                          <div className="flex-1">
                            <div className="font-medium">{t.location}</div>
                            <div className="text-xs text-zinc-500">{fmtDateRange(t.start_at, t.end_at)} • {durationDays(t.start_at, t.end_at)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-zinc-500">No trips.</div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>,
      document.body
    );
  }














  const Badge = ({ children }) => <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">{children}</span>;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 text-zinc-900 dark:text-zinc-100">
      <div className="sticky top-0 z-10 backdrop-blur border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="text-xl font-bold">
            Elyx Member Journey
          </motion.div>
          <div className="flex items-center gap-3">
            <DataStatus updatedAt={lastUpdated} />
            <Button onClick={() => setDark(d => !d)} aria-label="Toggle theme">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap">

              <h1 className="text-3xl md:text-4xl font-bold">
                {bundle.member?.preferred_name || "Member"}
              </h1>
              <PremiumBadge />
            </div>
            <p className="text-zinc-500 mt-1">
              Trace decisions, see trends, and ask "why" — with evidence from the chat.
            </p>
          </div>

        </div>

        <div className="grid md:grid-cols-12 gap-4 mb-6">
          <Card
            variant="transparent"
            padding="p-0"
            className="md:col-span-4 relative overflow-hidden hover:shadow-xl transition cursor-pointer"
            role="button"
            tabIndex={0}
            title="Open member persona"
            onClick={() => setPersonaOpen(true)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setPersonaOpen(true)}
          >
            {/* FULL-CARD gradient (light/dark variants) */}
            <div
              className="absolute inset-0 z-0 bg-gradient-to-br
               from-sky-400 via-violet-500 to-emerald-400
               dark:from-sky-700 dark:via-violet-700 dark:to-emerald-700"
            />

            {/* Content on top of gradient (glass tiles) */}
            <div className="relative z-0 p-4 sm:p-5">

              <div className="flex items-end gap-3">
                {/* Avatar tile */}
                <div className="w-16 h-16 rounded-2xl bg-white/85 dark:bg-zinc-900/80 border border-white/40 dark:border-zinc-800/70 flex items-center justify-center shadow">
                  <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {nameInitials(bundle.member?.preferred_name)}
                  </span>
                </div>

                {/* Heading */}
                <div className="flex-1 pb-1">
                  <div className="flex items-center gap-2 justify-start text-white mb-3 dark:text-white mb-3 -ml-[4.75rem]">
                    <Users className="w-4 h-4 opacity-90" />
                    <h2 className="font-semibold">Member Snapshot</h2>
                  </div>
                  <div className="text-lg font-extrabold text-white mt-0.5 drop-shadow-[0_1px_0_rgba(0,0,0,0.25)]">
                    {bundle.member?.preferred_name || "(upload dataset)"}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {bundle.member?.age != null && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] border border-white/40 bg-white/20 backdrop-blur-sm text-white">
                        {bundle.member.age} yrs
                      </span>
                    )}
                    {bundle.member?.gender && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] border border-white/40 bg-white/20 backdrop-blur-sm text-white">
                        {bundle.member.gender}
                      </span>
                    )}
                    {bundle.member?.primary_residence && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] border border-white/40 bg-white/20 backdrop-blur-sm text-white inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 opacity-90" />
                        {bundle.member.primary_residence}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick facts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <div className="rounded-xl border border-white/40 bg-white/25 dark:bg-zinc-900/30 backdrop-blur-sm p-3 text-white">
                  <div className="text-xs text-white/80 flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5" /> Occupation
                  </div>
                  <div className="text-sm font-medium mt-1">{bundle.member?.occupation || "—"}</div>
                </div>
                <div className="rounded-xl border border-white/40 bg-white/25 dark:bg-zinc-900/30 backdrop-blur-sm p-3 text-white">
                  <div className="text-xs text-white/80 flex items-center gap-2">
                    <Stethoscope className="w-3.5 h-3.5" /> Chronic Condition
                  </div>
                  <div className="text-sm font-medium mt-1">{bundle.member?.chronic_condition || "—"}</div>
                </div>
                <div className="rounded-xl border border-white/40 bg-white/25 dark:bg-zinc-900/30 backdrop-blur-sm p-3 text-white">
                  <div className="text-xs text-white/80 flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> Assistant
                  </div>
                  <div className="text-sm font-medium mt-1">{bundle.member?.assistant || "—"}</div>
                </div>
                <div className="rounded-xl border border-white/40 bg-white/25 dark:bg-zinc-900/30 backdrop-blur-sm p-3 text-white">
                  <div className="text-xs text-white/80">Wearables</div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {(bundle.member?.wearables || []).map(w => (
                      <span key={w} className="px-2 py-0.5 rounded-full text-[11px] border border-white/40 bg-white/20 text-white">
                        {w}
                      </span>
                    ))}
                    {(bundle.member?.wearables || []).length === 0 && <span className="text-sm">—</span>}
                  </div>
                </div>
              </div>

              {/* Travel hubs */}
              <div className="mt-3">
                <div className="text-xs text-white/80">Travel hubs</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {(bundle.member?.travel_hubs || []).map(h => (
                    <span key={h} className="px-2 py-0.5 rounded-full text-[11px] border border-white/40 bg-white/20 text-white">
                      {h}
                    </span>
                  ))}
                  {(bundle.member?.travel_hubs || []).length === 0 && <span className="text-sm text-white">—</span>}
                </div>
              </div>
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
                    content={
                      <SeriesTooltip
                        dark={dark}
                        titleFmt={(l) => `Date: ${l}`}
                        valueFormatter={(val, item) => {
                          const name = item.name || item.dataKey || "";
                          const unit = name.includes("LDL") ? "mg/dL" : name.includes("Recovery") ? "%" : "ms";
                          return `${val} ${unit}`;
                        }}
                      />
                    }
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
                      <MetricChart data={series} range={[lo, hi]} height={160} direction={METRIC_DIRECTION[def.id] || "up"} />

                    </Card>
                  </div>
                )}
              </div>
            );
          })}
        </div>



        {/* Progress since joining Elyx */}
        {progress && (
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Progress since joining Elyx</h2>
              <div className="text-xs text-zinc-500">
                {fmtDate(progress.since)} → {fmtDate(progress.until)}
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-4 items-stretch">
              {/* LEFT: radar fills the column; improved grid/ticks and theme-aware tooltip */}
              <div className="lg:col-span-6 flex">
                <div className="flex-1 h-[24rem] sm:h-[26rem] lg:h-[30rem]">
                  <ResponsiveContainer>
                    <RadarChart data={progress.radar} outerRadius="85%">
                      <PolarGrid stroke={dark ? "rgba(63,63,70,0.5)" : "rgba(228,228,231,0.6)"} />
                      <PolarAngleAxis
                        dataKey="metric"
                        tick={{ fill: dark ? "#d4d4d8" : "#334155", fontSize: 12, letterSpacing: 0.2 }}
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tick={{ fill: dark ? "#a1a1aa" : "#475569", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Radar
                        name="Improvement"
                        dataKey="value"
                        stroke="#0ea5e9"
                        fill="#0ea5e9"
                        fillOpacity={0.28}
                      />
                      <Tooltip
                        {...tooltipStyles}               // <-- uses your memoized light/dark styles
                        formatter={(val) => [`${val}%`, "Improvement"]}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* RIGHT: ensure content fits; spacing from chart; prevent overflow */}
              <div className="lg:col-span-6 flex flex-col gap-3 lg:pl-6 min-w-0">
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-900/50">
                  <div className="text-sm text-zinc-500">Overall progress score</div>
                  <div className="text-3xl font-bold text-sky-600 dark:text-sky-400">{progress.overall}%</div>
                  <div className="text-xs text-zinc-500 mt-1">Average improvement across six domains</div>
                </div>

                {/* stat cards — now wrap cleanly without overflow on narrow widths */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <DeltaStatCard
                    label="HRV"
                    delta={progress.dims.HRV.delta}
                    unit={progress.dims.HRV.unit}
                    pct={progress.dims.HRV.pct}
                    direction="up"
                  />
                  <DeltaStatCard
                    label="Recovery"
                    delta={progress.dims.Recovery.delta}
                    unit={progress.dims.Recovery.unit}
                    pct={progress.dims.Recovery.pct}
                    direction="up"
                  />
                  <DeltaStatCard
                    label="Sleep (avg)"
                    delta={progress.dims.Sleep.delta}
                    unit={progress.dims.Sleep.unit}
                    pct={progress.dims.Sleep.pct}
                    direction="up"
                  />
                  <DeltaStatCard
                    label="Activity"
                    delta={progress.dims.Activity.delta}
                    unit={progress.dims.Activity.unit}
                    pct={progress.dims.Activity.pct}
                    direction="up"
                  />
                  <DeltaStatCard
                    label="Lipids (LDL/ApoB)"
                    delta={-Math.abs(progress.dims.Lipids.deltaLDL)}  // show negative when improved (down good)
                    unit={progress.dims.Lipids.unit}
                    pct={progress.dims.Lipids.pct}
                    direction="down"
                  />
                  <DeltaStatCard
                    label="Inflammation (hs-CRP)"
                    delta={-Math.abs(progress.dims.Inflammation.delta)} // show negative when improved (down good)
                    unit={progress.dims.Inflammation.unit}
                    pct={progress.dims.Inflammation.pct}
                    direction="down"
                  />
                </div>
              </div>
            </div>
          </Card>
        )}





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
              fillWidth
              leftContinuation={decisions.length > 5}
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
                    <div className="space-y-2 max-h-64 overflow-auto pr-1">
                      {evidenceMsgs.map(m => {
                        const memberId = bundle.member?.member_id || "M0001";
                        const nonMemberId = m.sender_id === memberId ? m.receiver_id : m.sender_id;

                        const peerForMsg =
                          (roster || []).find(r => r.id === nonMemberId) ||
                          (() => {
                            const isSenderPeer = m.sender_id !== memberId;
                            const name = isSenderPeer ? m.sender : m.receiver;
                            const role = (isSenderPeer ? m.sender_role : m.receiver_role) || "Team";
                            const color = ROLE_COLORS[role] || ROLE_COLORS.Team;
                            return { id: nonMemberId, name, role, color };
                          })();

                        // same badge inputs as the Decisions panel
                        const ownerForBadge = selDecision.owner || (selDecision.type === "Diagnostic" ? "Dr. Warren (Physician)" : "");
                        const typeForBadge = selDecision.type || "Diagnostic";

                        return (
                          <button
                            key={m.message_id}
                            onClick={() => {
                              setPeer(peerForMsg);
                              setChatOpen(true);
                              setFocusMsgId(m.message_id);
                            }}
                            className="w-full text-left"
                            title={`Open chat with ${peerForMsg.name}`}
                          >
                            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80 transition border border-zinc-200 dark:border-zinc-700">
                              <div className="flex items-center justify-between">
                                <div className="text-xs text-zinc-500">
                                  {new Date(m.timestamp).toLocaleString()} • {m.sender} → {m.receiver} • {m.topic}
                                </div>
                                <OwnerBadge owner={ownerForBadge} type={typeForBadge} />
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
          onClose={() => setChatOpen(false)}
          peer={peer}
          member={bundle.member}
          messages={chat}
          focusMsgId={focusMsgId}
          onClearFocus={() => setFocusMsgId(null)}
          dark={dark}
        />

        <PersonaModal
          open={personaOpen}
          onClose={() => setPersonaOpen(false)}
          member={bundle.member}
          episodes={bundle.episodes}
          trips={bundle.trips}
        />





        {/* Internal Metrics — Weekly Team Hours */}
        <div className="mt-6">
          <Card>
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Internal Metrics</div>
              <div className="text-xs text-zinc-500">
                Weekly time investment by care team
              </div>
            </div>

            {internal.length === 0 ? (
              <div className="text-sm text-zinc-500">
                No internal metrics embedded. Add <code>internal_metrics</code> to <code>EMBED</code>.
              </div>
            ) : (
              <div className="grid md:grid-cols-12 gap-4">
                {/* Left: big weekly multi-series chart */}
                <div className="md:col-span-8">
                  <div className="h-[24rem] md:h-[28rem]">

                    <ResponsiveContainer>
                      <LineChart
                        data={internalChartData}
                        margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="week"
                          tickMargin={8}
                          minTickGap={24}
                          tickFormatter={(d) =>
                            new Date(d + "T00:00:00").toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })
                          }
                        />
                        <YAxis domain={[0, "auto"]} />
                        <Tooltip
                          content={
                            <SeriesTooltip
                              dark={dark}
                              titleFmt={(label) =>
                                `Week of ${new Date(label + "T00:00:00").toLocaleDateString()}`
                              }
                              valueFormatter={(v) => `${v} h`}
                            />
                          }
                        />


                        <Legend />

                        {memberNamesIM.map((name) => (
                          <Line
                            key={name}
                            type="monotone"
                            dataKey={name}
                            name={name}
                            stroke={memberColor(name)}
                            strokeWidth={3}
                            dot={{ r: 3 }}
                            connectNulls
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Right: totals by team member */}
                <div className="md:col-span-4">
                  <div className="text-sm font-medium mb-2">
                    Total hours by team member
                  </div>
                  <div className="space-y-2">
                    {totalsByMember.map((t) => {
                      const color = memberColor(t.name);
                      const widthPct = Math.round((t.hours / maxTotalIM) * 100);
                      return (
                        <div
                          key={t.name}
                          className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className="inline-block w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: color }}
                              />
                              <div className="text-sm font-medium">{t.name}</div>
                              <div className="text-xs text-zinc-500">• {t.role}</div>
                            </div>
                            <div className="text-sm font-semibold">
                              {t.hours.toFixed(1)} h
                            </div>
                          </div>
                          <div className="mt-2 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${widthPct}%`,
                                backgroundColor: `${color}55`, // tinted bar
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        <Card className="mt-6" data-anchor="assistant">
          <ChatBot
            embed={bundle}
            dark={dark}
            onOpenFlow={(id) => { setFlowOpen(true); if (id) openDecisionById(id); }}
            onOpenPersona={() => setPersonaOpen(true)}
            onOpenMetric={(metricId) => setMetricOpen(metricId)}
          />
        </Card>






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
                  <MetricChart data={series} range={[lo, hi]} height={420} legend direction={METRIC_DIRECTION[def.id] || "up"} />

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

                {/* Selected decision details (FLOW) */}
                {flowSel && (() => {
                  const id = (flowSel.id || "").toUpperCase();
                  const type = flowSel.type || "Diagnostic";
                  const dateLabel = flowSel.dateLabel || "—"; // uses the same label as the list
                  const title = flowSel.label || `${type} plan`;

                  // keep the same owner/expected/actual logic you use elsewhere
                  const owner = flowSel.owner || (
                    type === "Nutrition" ? "Carla (Nutritionist)" :
                      type === "Medication" ? "Dr. Warren (Physician)" :
                        type === "Exercise" ? "Rachel (Physiotherapist)" :
                          "Dr. Warren (Physician)"
                  );

                  const expected = flowSel.expected || (type === "Diagnostic" ? {
                    note: "Quantify risk markers",
                    metrics: { ApoB: {}, LDL_C: {}, hsCRP: {} }
                  } : null);

                  const actual = flowSel.actual || (type === "Diagnostic" ? {
                    note: `ApoB ${flowSel.ApoB ?? "—"}, LDL-C ${flowSel.LDL_C ?? "—"}, hsCRP ${flowSel.hsCRP ?? "—"}`
                  } : null);

                  // Rationale + evidence directly from EMBED/state
                  const rationale = rationales.find(r => (r.decision_id || "").toUpperCase() === id);
                  const evidenceMsgs = (rationale?.evidence_message_ids || [])
                    .map(mid => chat.find(m => m.message_id === mid))
                    .filter(Boolean);

                  return (
                    <div className="mt-4 grid md:grid-cols-12 gap-4">
                      {/* Left: header + owner + outcomes (same UI) */}
                      <Card className="md:col-span-5">
                        <div className="text-sm text-zinc-500 mb-1">{type} • {dateLabel}</div>
                        <div className="text-lg font-semibold">{title}</div>
                        <div className="mt-1">
                          <OwnerBadge owner={owner} type={type} />
                        </div>

                        {(expected || actual) && (
                          <div className="mt-4 grid grid-cols-1 gap-3">
                            {/* Expected */}
                            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50 dark:bg-zinc-900/50">
                              <div className="flex items-center justify-between">
                                <div className="text-sm font-medium">Expected outcome</div>
                                <OutcomeBadge status="na" />
                              </div>
                              <div className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">{expected?.note || "—"}</div>
                              {expected?.metrics && (
                                <div className="mt-2 grid grid-cols-1 gap-2">
                                  {Object.entries(expected.metrics).map(([metricKey, v]) => (
                                    <div key={metricKey} className="flex items-center justify-between text-sm">
                                      <div className="text-zinc-500">{metricKey}</div>
                                      <div className="font-medium">
                                        {v.delta || "—"} {v.window ? <span className="text-xs text-zinc-500">({v.window})</span> : null}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Actual (with status) */}
                            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 bg-white dark:bg-zinc-900">
                              <div className="text-sm font-medium mb-1">Actual outcome</div>
                              <div className="text-sm text-zinc-600 dark:text-zinc-300">{actual?.note || "—"}</div>

                              {expected?.metrics && actual?.metrics && (
                                <div className="mt-3 grid grid-cols-1 gap-2">
                                  {Object.entries(expected.metrics).map(([metricKey, exp]) => {
                                    const act = actual.metrics[metricKey] || {};
                                    const { status } = scoreOutcome(metricKey, exp, act);
                                    const cardMap = {
                                      met: "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300",
                                      partial: "bg-amber-50 dark:bg-amber-900/30 border-amber-300",
                                      missed: "bg-rose-50 dark:bg-rose-900/30 border-rose-300",
                                      na: "bg-zinc-50 dark:bg-zinc-900/40 border-zinc-300",
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
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Card>

                      {/* Right: Rationale + Evidence (click → open same ChatModal and highlight) */}
                      <Card className="md:col-span-7">
                        <div className="text-sm font-medium mb-2">Why this decision?</div>
                        {rationale?.reason_summary ? (
                          <div className="text-sm">{rationale.reason_summary}</div>
                        ) : (
                          <div className="text-sm text-zinc-500">No rationale found for this decision.</div>
                        )}

                        <div className="text-sm font-medium mt-3 mb-1">Evidence (chat)</div>
                        {evidenceMsgs.length ? (
                          <div className="space-y-2 max-h-64 overflow-auto pr-1">
                            {evidenceMsgs.map(m => {
                              // find the non-member peer for this message
                              const memberId = bundle.member?.member_id || "M0001";
                              const nonMemberId = m.sender_id === memberId ? m.receiver_id : m.sender_id;

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
                                    setFocusMsgId(m.message_id);  // <-- same ChatModal, same focus behavior
                                  }}
                                  className="w-full text-left"
                                  title={`Open chat with ${peerForMsg.name}`}
                                >
                                  <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80 transition border border-zinc-200 dark:border-zinc-700">
                                    <div className="text-xs text-zinc-500">
                                      {new Date(m.timestamp).toLocaleString()} • {m.sender} → {m.receiver} • {m.topic}
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
                      </Card>
                    </div>
                  );
                })()}


              </Card>
            </div>
          </div>
        )}



      </div>
    </div>
  );
}
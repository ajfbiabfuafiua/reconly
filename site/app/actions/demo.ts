"use server";

import { headers } from "next/headers";
import { db } from "@/lib/supabase";
import { hasSupabase } from "@/lib/env";
import { getSetting } from "@/lib/profile";

const SIZES = ["1-10", "11-50", "51-200", "200+"] as const;
const PLANS = ["starter", "growth", "max", "unsure"] as const;

// naive per-IP rate limit (per server instance) — 5 submissions / 10 minutes
const hits = new Map<string, number[]>();

export type DemoResult = { ok: true } | { ok: false; error: string };

export async function submitDemoRequest(form: {
  name: string;
  email: string;
  company: string;
  phone?: string;
  companySize: string;
  interestedPlan: string;
  message: string;
  website?: string; // honeypot
}): Promise<DemoResult> {
  // honeypot: bots fill every field
  if (form.website) return { ok: true };

  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const now = Date.now();
  const windowHits = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  if (windowHits.length >= 5) {
    return { ok: false, error: "Too many requests — please try again later." };
  }
  hits.set(ip, [...windowHits, now]);

  const name = form.name?.trim();
  const email = form.email?.trim().toLowerCase();
  const company = form.company?.trim();
  if (!name || name.length > 200) return { ok: false, error: "Please enter your name." };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (!company || company.length > 200) return { ok: false, error: "Please enter your company." };
  if (!SIZES.includes(form.companySize as (typeof SIZES)[number])) {
    return { ok: false, error: "Please select a company size." };
  }
  const plan = PLANS.includes(form.interestedPlan as (typeof PLANS)[number])
    ? form.interestedPlan
    : "unsure";

  if (!hasSupabase) {
    return { ok: false, error: "Demo requests aren't configured yet — email hello@reconly.io instead." };
  }

  const { error } = await db().from("demo_requests").insert({
    name,
    email,
    company,
    phone: form.phone?.trim() || null,
    company_size: form.companySize,
    interested_plan: plan,
    message: (form.message ?? "").trim().slice(0, 4000),
  });
  if (error) return { ok: false, error: "Something went wrong — please try again." };

  // Notify admin (email integration placeholder — logs until wired up)
  const notify = await getSetting<string>("admin_notification_email", "");
  console.log(`[demo-request] ${name} <${email}> (${company}) → notify ${notify || "n/a"}`);

  return { ok: true };
}

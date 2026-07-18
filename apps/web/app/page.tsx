"use client";

import Link from "next/link";
import { ArrowRight, Clock, CloudLightning, Film, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@web/components/navigation/navbar";
import { Button } from "@web/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@web/components/ui/card";

const features = [
  { title: "Live-first metadata", description: "Connect to YouTube Live streams and inspect codecs, resolution, duration, and availability.", icon: CloudLightning },
  { title: "Precise clip ranges", description: "Use direct timestamps or a fast range timeline for short, export-ready moments.", icon: Clock },
  { title: "MP4 exports", description: "Generate clips with FFmpeg in practical quality presets for sharing and review.", icon: Film },
  { title: "Phase 2 ready", description: "Clean service boundaries prepare the app for users, cloud storage, teams, and AI highlights.", icon: ShieldCheck }
];

const steps = ["Paste a YouTube Live URL", "Load stream metadata", "Pick start and end", "Export and download"];

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="page-shell min-h-[calc(100vh-4rem)] pt-20">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="grid items-center gap-12 lg:grid-cols-[1fr_0.9fr]"
          >
            <div>
              <p className="mb-4 text-sm font-medium text-primary">YouTube Live clipping, without the capture ritual</p>
              <h1 className="max-w-4xl text-5xl font-semibold tracking-normal md:text-7xl">
                LiveClip
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                Generate polished MP4 clips from livestreams in a few focused steps. Built for creators,
                producers, and teams that need speed without turning clipping into video editing.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="default">
                  <Link href="/dashboard">
                    Open dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/history">View history</Link>
                </Button>
              </div>
            </div>
            <div className="glass-panel overflow-hidden rounded-2xl p-4 shadow-glow">
              <div className="rounded-xl border border-white/10 bg-black/30 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Export queue</span>
                  <span className="rounded-full bg-primary/15 px-3 py-1 text-xs text-primary">Ready</span>
                </div>
                <div className="aspect-video rounded-xl bg-[linear-gradient(135deg,rgba(39,224,193,.25),rgba(119,124,255,.16)),url('https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=1400&auto=format&fit=crop')] bg-cover bg-center" />
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {["00:12:04", "00:12:29", "720p"].map((item) => (
                    <div key={item} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center text-sm">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="page-shell">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title}>
                  <CardHeader>
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm leading-6 text-muted-foreground">{feature.description}</CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="page-shell grid gap-8 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-medium text-primary">How it works</p>
            <h2 className="text-3xl font-semibold">From livestream to clip in one clean pass.</h2>
          </div>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={step} className="glass-panel flex items-center gap-4 rounded-2xl p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-sm text-primary">
                  {index + 1}
                </span>
                <span className="font-medium">{step}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="page-shell">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["Is this a downloader?", "No. LiveClip is focused on short clips from livestream moments."],
              ["Does it use paid APIs?", "No. The MVP relies on free, local binaries and Turso SQLite."],
              ["Can it scale later?", "Yes. Providers, storage, and history are isolated behind replaceable modules."]
            ].map(([question, answer]) => (
              <Card key={question}>
                <CardHeader>
                  <CardTitle>{question}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-muted-foreground">{answer}</CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t border-white/10 py-8 text-center text-sm text-muted-foreground">
        LiveClip · Built for fast live production workflows
      </footer>
    </>
  );
}

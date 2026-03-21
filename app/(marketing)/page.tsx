import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Award,
  Upload,
  Users,
  Mail,
  Zap,
  Shield,
  FileSpreadsheet,
  Sparkles,
  Download,
  ArrowRight,
  CheckCircle2,
  MousePointerClick,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden grain-overlay">
        {/* Decorative geometric shapes */}
        <div className="absolute top-20 -left-16 w-64 h-64 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute bottom-10 right-0 w-80 h-80 rounded-full bg-secondary/8 blur-3xl" />
        <div className="absolute top-40 right-20 w-3 h-3 rounded-full bg-secondary" />
        <div className="absolute top-60 left-[15%] w-2 h-2 rounded-full bg-primary/30" />
        <div className="absolute bottom-32 left-[40%] w-2.5 h-2.5 rounded-full bg-secondary/60" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-28 md:pt-28 md:pb-36">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Copy */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border bg-card/60 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
                </span>
                Free &middot; No credit card required
              </div>

              <h1 className="animate-fade-up stagger-1 text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
                Certificates,{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">crafted</span>
                  <span className="absolute bottom-2 left-0 right-0 h-3 md:h-4 bg-secondary/30 -skew-x-3 -z-0" />
                </span>{" "}
                &amp; delivered at scale
              </h1>

              <p className="animate-fade-up stagger-2 text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
                Upload your template, import recipients, and generate hundreds
                of personalized certificates in minutes. Then distribute them
                via email — all from one dashboard.
              </p>

              <div className="animate-fade-up stagger-3 flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <Link href="/sign-up">
                    Start creating certificates
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/sign-in">Sign in</Link>
                </Button>
              </div>

              {/* Trust signals */}
              <div className="animate-fade-up stagger-4 flex flex-wrap gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                  No watermarks
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                  High-res PNG/JPEG
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                  ZIP download
                </span>
              </div>
            </div>

            {/* Right: Certificate mockup */}
            <div className="relative hidden lg:block">
              {/* Main certificate card */}
              <div className="animate-slide-right relative">
                <div className="animate-float rounded-2xl border-2 border-border bg-card p-8 shadow-[8px_8px_0px] shadow-primary/20">
                  {/* Certificate inner */}
                  <div className="border-2 border-dashed border-secondary/40 rounded-xl p-8 text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="h-14 w-14 rounded-full bg-secondary/20 flex items-center justify-center">
                        <Award className="h-7 w-7 text-secondary" />
                      </div>
                    </div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-medium">
                      Certificate of Completion
                    </p>
                    <p className="text-2xl font-bold">Maria Santos</p>
                    <div className="w-16 h-0.5 bg-secondary mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      has successfully completed the
                    </p>
                    <p className="font-semibold">
                      Web Development Bootcamp 2025
                    </p>
                    <p className="text-xs text-muted-foreground pt-4">
                      March 22, 2026
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating badge: batch count */}
              <div className="animate-float-delayed absolute -bottom-4 -left-6 rounded-xl border bg-card px-4 py-3 shadow-[4px_4px_0px] shadow-secondary/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Batch generated
                    </p>
                    <p className="font-bold text-lg leading-tight">
                      247 certs
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating badge: email sent */}
              <div className="animate-float absolute -top-2 -right-4 rounded-xl border bg-card px-4 py-3 shadow-[4px_4px_0px] shadow-secondary/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Emails sent
                    </p>
                    <p className="font-bold text-lg leading-tight text-green-600 dark:text-green-400">
                      All delivered
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Diagonal divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-muted/30 [clip-path:polygon(0_100%,100%_0,100%_100%)]" />
      </section>

      {/* ─── VALUE PROPOSITION STRIP ─── */}
      <section className="bg-muted/30 py-12 md:py-16 relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {valueProps.map((prop, i) => (
              <div
                key={prop.label}
                className={`animate-fade-up stagger-${i + 1} space-y-2`}
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/15 mx-auto">
                  <prop.icon className="h-6 w-6 text-secondary" />
                </div>
                <p className="font-bold text-sm">{prop.label}</p>
                <p className="text-xs text-muted-foreground">{prop.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-24 md:py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-20 space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">
              Features
            </p>
            <h2 className="text-3xl md:text-5xl font-extrabold">
              Everything you need,{" "}
              <br className="hidden md:block" />
              nothing you don&apos;t
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              From smart file parsing to batch generation and email delivery —
              AutoCert handles the entire certificate workflow.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border bg-card/50 backdrop-blur-sm p-8 transition-all duration-300 hover:shadow-[6px_6px_0px] hover:shadow-secondary/20 hover:-translate-y-1 hover:border-secondary/30"
              >
                {/* Icon */}
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0px_4px_0px] shadow-secondary group-hover:shadow-[0px_2px_0px] group-hover:translate-y-0.5 transition-all">
                  <feature.icon className="h-5 w-5" />
                </div>

                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Corner accent */}
                <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-secondary/0 group-hover:bg-secondary/40 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-24 md:py-32 px-6 bg-muted/30 relative grain-overlay overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-secondary/5 blur-3xl" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">
              How it works
            </p>
            <h2 className="text-3xl md:text-5xl font-extrabold">
              Three steps. That&apos;s it.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-secondary/0 via-secondary/40 to-secondary/0" />

            {steps.map((step, i) => (
              <div key={step.title} className="relative text-center space-y-6">
                {/* Step number */}
                <div className="inline-flex relative">
                  <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-extrabold shadow-[0px_6px_0px] shadow-secondary">
                    {i + 1}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-xl">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>

                {/* Step icon */}
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/15">
                  <step.icon className="h-5 w-5 text-secondary" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS / SOCIAL PROOF ─── */}
      <section className="py-20 md:py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl border-2 bg-card p-10 md:p-16 shadow-[8px_8px_0px] shadow-primary/10 relative overflow-hidden">
            {/* Corner decoration */}
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-secondary/10" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-secondary/8" />

            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
              {stats.map((stat) => (
                <div key={stat.label} className="space-y-2">
                  <p className="text-4xl md:text-5xl font-extrabold text-secondary">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TEMPLATE SHOWCASE ─── */}
      <section className="py-24 md:py-32 px-6 bg-muted/30 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <div className="space-y-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">
                Template Engine
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
                Your design.{" "}
                <span className="text-secondary">Your brand.</span>{" "}
                Perfectly rendered every time.
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Upload any certificate template and configure text placement
                with a live preview. Our engine handles auto text sizing,
                multi-line fallback, and percentage-based positioning so
                certificates look perfect at any resolution.
              </p>

              <ul className="space-y-3">
                {templateFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                    <span className="text-sm">{f}</span>
                  </li>
                ))}
              </ul>

              <Button asChild size="lg" className="mt-4">
                <Link href="/sign-up">
                  Try it free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Right: Visual mockup */}
            <div className="relative">
              {/* Editor mockup */}
              <div className="rounded-2xl border-2 bg-card overflow-hidden shadow-[6px_6px_0px] shadow-primary/15">
                {/* Toolbar */}
                <div className="border-b px-5 py-3 flex items-center justify-between bg-card">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-destructive/60" />
                    <div className="h-3 w-3 rounded-full bg-secondary/60" />
                    <div className="h-3 w-3 rounded-full bg-green-500/60" />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Certificate Editor
                  </p>
                  <div className="w-16" />
                </div>

                {/* Canvas area */}
                <div className="p-6 bg-muted/30">
                  <div className="aspect-[4/3] rounded-xl border-2 border-dashed border-border bg-background flex flex-col items-center justify-center gap-4 p-8">
                    <div className="h-12 w-12 rounded-full bg-secondary/15 flex items-center justify-center">
                      <MousePointerClick className="h-6 w-6 text-secondary" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="font-semibold text-sm">
                        Live Preview Area
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Position text fields by percentage — resolution independent
                      </p>
                    </div>

                    {/* Simulated text fields */}
                    <div className="w-full space-y-3 mt-4">
                      <div className="mx-auto w-3/4 h-6 rounded bg-secondary/10 flex items-center justify-center">
                        <span className="text-[10px] text-secondary font-medium">
                          {"{{firstName}} {{lastName}}"}
                        </span>
                      </div>
                      <div className="mx-auto w-1/2 h-4 rounded bg-primary/5" />
                      <div className="mx-auto w-2/3 h-4 rounded bg-primary/5" />
                    </div>
                  </div>
                </div>

                {/* Bottom controls mockup */}
                <div className="border-t px-5 py-3 flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="h-7 px-3 rounded-md bg-muted flex items-center">
                      <span className="text-[10px] font-medium text-muted-foreground">
                        Poppins
                      </span>
                    </div>
                    <div className="h-7 px-3 rounded-md bg-muted flex items-center">
                      <span className="text-[10px] font-medium text-muted-foreground">
                        48px
                      </span>
                    </div>
                  </div>
                  <div className="h-7 px-4 rounded-full bg-secondary text-secondary-foreground flex items-center">
                    <span className="text-[10px] font-bold">Generate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── EMAIL DISTRIBUTION ─── */}
      <section className="py-24 md:py-32 px-6 relative overflow-hidden">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-secondary/5 blur-3xl" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Email mockup */}
            <div className="relative order-2 lg:order-1">
              <div className="rounded-2xl border-2 bg-card overflow-hidden shadow-[6px_6px_0px] shadow-primary/15">
                {/* Email header */}
                <div className="border-b px-6 py-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">Certificate Delivery</p>
                      <p className="text-[10px] text-muted-foreground">
                        via Gmail OAuth
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex gap-2 text-[10px]">
                      <span className="text-muted-foreground font-medium">
                        To:
                      </span>
                      <span>maria.santos@email.com</span>
                    </div>
                    <div className="flex gap-2 text-[10px]">
                      <span className="text-muted-foreground font-medium">
                        Subject:
                      </span>
                      <span className="font-medium">
                        Your Certificate of Completion
                      </span>
                    </div>
                  </div>
                </div>

                {/* Email body */}
                <div className="p-6 space-y-4">
                  <p className="text-sm">
                    Hi{" "}
                    <span className="bg-secondary/15 px-1.5 py-0.5 rounded text-secondary font-medium text-xs">
                      {"{{firstName}}"}
                    </span>
                    ,
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Congratulations on completing the program! Please find your
                    certificate attached below.
                  </p>
                  {/* Attachment mockup */}
                  <div className="rounded-lg border bg-muted/50 p-3 flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-secondary/15 flex items-center justify-center shrink-0">
                      <Award className="h-5 w-5 text-secondary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">
                        certificate_maria_santos.png
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        245 KB
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status badge */}
              <div className="absolute -bottom-3 -right-3 rounded-xl border bg-card px-4 py-2.5 shadow-[4px_4px_0px] shadow-secondary/20 flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                <span className="text-xs font-bold">247/247 delivered</span>
              </div>
            </div>

            {/* Right: Text */}
            <div className="space-y-6 order-1 lg:order-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">
                Distribution
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
                Send certificates{" "}
                <span className="text-secondary">directly</span> to every
                recipient
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Connect your Gmail or Resend account and deliver certificates
                with personalized emails. Template variables, retry logic, and
                delivery tracking — all built in.
              </p>

              <ul className="space-y-3">
                {emailFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                    <span className="text-sm">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-24 md:py-32 px-6 relative grain-overlay overflow-hidden">
        {/* Background shapes */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-secondary/[0.06]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-secondary/5 blur-3xl" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0px_6px_0px] shadow-secondary mx-auto">
            <Sparkles className="h-8 w-8" />
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">
            Ready to automate your{" "}
            <span className="relative inline-block">
              <span className="relative z-10">certificates?</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 md:h-4 bg-secondary/30 -skew-x-3 -z-0" />
            </span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Create your organization, upload your first template, and generate
            certificates in under five minutes. No setup fees, no watermarks.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/sign-up">
                Create free account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/sign-in">I already have an account</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── DATA ─── */

const valueProps = [
  {
    icon: Zap,
    label: "Instant Generation",
    detail: "Client-side Canvas rendering at full resolution",
  },
  {
    icon: Sparkles,
    label: "AI Column Mapping",
    detail: "LLM-powered CSV/XLSX field detection",
  },
  {
    icon: Download,
    label: "Batch Download",
    detail: "ZIP export with progress tracking",
  },
  {
    icon: Mail,
    label: "Email Delivery",
    detail: "Gmail OAuth & Resend integration",
  },
];

const features = [
  {
    icon: Upload,
    title: "Smart file upload",
    description:
      "Upload attendee lists in CSV or XLSX format. Our AI automatically maps columns to the right fields using LLM-powered detection.",
  },
  {
    icon: Award,
    title: "Beautiful certificates",
    description:
      "Upload any template image and customize text placement, fonts, colors, and styling with an interactive live preview.",
  },
  {
    icon: Zap,
    title: "Auto text sizing",
    description:
      "Names are automatically sized to fit within the bounding box using binary search — no matter how long the text.",
  },
  {
    icon: Users,
    title: "Multi-org support",
    description:
      "Manage multiple organizations and events from one dashboard with role-based team collaboration.",
  },
  {
    icon: Mail,
    title: "Email distribution",
    description:
      "Send certificates directly to recipients via Gmail or Resend with customizable email templates and variables.",
  },
  {
    icon: Shield,
    title: "Batch generation",
    description:
      "Generate hundreds of certificates in seconds with real-time progress tracking and one-click ZIP download.",
  },
];

const steps = [
  {
    icon: FileSpreadsheet,
    title: "Upload & configure",
    description:
      "Upload your certificate template and recipient list. Our AI maps CSV/XLSX columns automatically.",
  },
  {
    icon: Sparkles,
    title: "Preview & generate",
    description:
      "Customize text positioning with live preview, then batch generate all certificates with one click.",
  },
  {
    icon: Mail,
    title: "Distribute",
    description:
      "Send personalized emails with certificates attached via Gmail or Resend. Track delivery status in real time.",
  },
];

const stats = [
  { value: "5,000", label: "Max recipients per upload" },
  { value: "10 MB", label: "Max template size" },
  { value: "2", label: "Email providers supported" },
  { value: "100%", label: "Client-side rendering" },
];

const templateFeatures = [
  "Percentage-based positioning — resolution independent",
  "Binary search auto-fit with multi-line fallback",
  "Multiple font families: Poppins, Roboto, Pacifico & more",
  "Real-time live preview before batch generation",
  "PNG and JPEG export with configurable quality",
];

const emailFeatures = [
  "Gmail OAuth 2.0 and Resend API key support",
  "Template variables: {{firstName}}, {{lastName}}",
  "Queue-based processing with automatic retry",
  "Real-time delivery status tracking per recipient",
];

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CertificateAnimation } from "@/components/marketing/certificate-animation";
import { CheckCircle2, FileSpreadsheet, Sparkles, MailCheck } from "lucide-react";

/* ─── Wave Dividers ─── */

function WaveTop({ fill }: { fill: string }) {
  return (
    <div className="wave-divider">
      <svg viewBox="0 0 1200 60" preserveAspectRatio="none">
        <path
          d="M0,60 C200,0 400,40 600,20 C800,0 1000,50 1200,10 L1200,60 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}

function WaveBottom({ fill }: { fill: string }) {
  return (
    <div className="wave-divider">
      <svg viewBox="0 0 1200 60" preserveAspectRatio="none">
        <path
          d="M0,0 C200,50 400,10 600,30 C800,50 1000,5 1200,40 L1200,0 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* ─── HERO ─── */}
      <section className="flex flex-col items-center justify-center py-24 md:py-32 px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold max-w-4xl leading-[1.1]">
          Generate &amp; Distribute Certificates at Scale
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mt-6 max-w-2xl">
          AutoCert helps event organizers create, customize, and send
          personalized certificates to hundreds of attendees in minutes.
        </p>
        <Button asChild size="lg" className="mt-10 text-base px-10">
          <Link href="/sign-up">Create a Certificate Now</Link>
        </Button>
        <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-secondary" />
          100% Free &mdash; Download in PNG or JPEG
        </p>
      </section>

      {/* ─── WAVE → SECONDARY SECTION ─── */}
      <WaveTop fill="hsl(var(--secondary))" />
      <section className="bg-secondary px-6 py-20 md:py-28">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-secondary-foreground leading-tight">
              Upload Templates &amp; Auto Generate Certificates
            </h2>
            <p className="mt-6 text-secondary-foreground/80 text-lg leading-relaxed">
              Upload your own certificate template, import a list of recipients
              via CSV or XLSX, and generate personalized certificates in one
              click. Our AI automatically maps your spreadsheet columns to the
              right fields.
            </p>
            <p className="mt-4 text-secondary-foreground/80 text-lg leading-relaxed">
              Each certificate is rendered client-side at full template
              resolution — no server processing, no quality loss.
            </p>
          </div>

          {/* Certificate preview card */}
          <div className="flex justify-center">
            <div className="cert-card rounded-xl border-2 border-secondary-foreground/20 bg-card p-6 shadow-[6px_6px_0px] shadow-secondary-foreground/15 max-w-sm w-full">
              <div className="border-2 border-dashed border-secondary/50 rounded-lg p-8 text-center space-y-3 bg-background">
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-medium">
                  Certificate of Completion
                </p>
                <p className="text-2xl font-bold">Maria Santos</p>
                <div className="w-12 h-0.5 bg-secondary mx-auto" />
                <p className="text-xs text-muted-foreground">
                  has successfully completed the
                </p>
                <p className="text-sm font-semibold">
                  Web Development Bootcamp 2025
                </p>
                <p className="text-[10px] text-muted-foreground pt-3">
                  March 22, 2026
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <WaveBottom fill="hsl(var(--secondary))" />

      {/* ─── WHITE SECTIONS: Bold headings + descriptions ─── */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-3xl mx-auto space-y-20 text-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold">
              Auto Text Sizing
            </h2>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
              Names are automatically sized to fit within the certificate
              bounding box using a binary search algorithm. Long names get
              smaller text, short names get bigger — no manual adjustment
              needed. Multi-line fallback splits text at the nearest space.
            </p>
          </div>

          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold">
              No Design Skills Needed
            </h2>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
              Upload any certificate template image and use the visual editor
              to position text fields with a live preview. Choose from multiple
              fonts including Poppins, Roboto, and Pacifico. Percentage-based
              positioning means your layout works at any resolution.
            </p>
          </div>

          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold">
              Download &amp; Distribute for Free
            </h2>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
              Generate certificates and download them individually or as a ZIP
              file. Or connect your Gmail or Resend account and deliver
              certificates directly to each recipient via personalized email —
              with template variables, retry logic, and delivery tracking.
            </p>
          </div>
        </div>
      </section>

      {/* ─── WAVE → ACCENT SECTION: Feature cards ─── */}
      <WaveTop fill="hsl(var(--accent))" />
      <section className="bg-accent px-6 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <div className="border-2 border-accent-foreground/15 rounded-2xl bg-card overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-accent-foreground/10">
              {features.map((feature) => (
                <div key={feature.title} className="px-6 py-10 text-center space-y-4">
                  <div className="flex justify-center" dangerouslySetInnerHTML={{ __html: feature.svg }} />
                  <h3 className="font-extrabold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <WaveBottom fill="hsl(var(--accent))" />

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold text-center mb-16">
            How It Works
          </h2>

          <div className="space-y-12">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="flex gap-6 items-start"
              >
                <div className="shrink-0 h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-xl font-extrabold shadow-[0px_4px_0px] shadow-secondary">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-extrabold text-xl">{step.title}</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WAVE → SECONDARY SECTION: CTA ─── */}
      <WaveTop fill="hsl(var(--secondary))" />
      <section className="bg-secondary px-6 py-20 md:py-28">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-secondary-foreground leading-tight">
              Ready to Start Generating Certificates?
            </h2>
            <p className="mt-4 text-secondary-foreground/80 text-lg">
              Create your organization, upload your first template, and
              generate certificates in under five minutes.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 bg-card text-card-foreground hover:bg-card/90 shadow-[0px_6px_0px] shadow-secondary-foreground/20 hover:shadow-[0px_4px_0px] hover:translate-y-0.5 transition-all text-base px-10"
            >
              <Link href="/sign-up">Get Started for Free</Link>
            </Button>
          </div>

          <div className="flex justify-center">
            <CertificateAnimation />
          </div>
        </div>
      </section>
      <WaveBottom fill="hsl(var(--secondary))" />

      {/* ─── BOTTOM SPACER ─── */}
      <div className="py-8" />
    </div>
  );
}

/* ─── DATA ─── */

const features = [
  {
    // Checkbox with checkmark — "instant / done"
    svg: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="6" width="32" height="36" rx="4" /><path d="M16 24l5 5 10-12" stroke-width="2.5" /></svg>`,
    title: "Instant Download",
    description:
      "Generate certificates and download instantly — no signup or payment required.",
  },
  {
    // Four arrows expanding outward — "resize"
    svg: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 8h-6v6" /><path d="M34 8h6v6" /><path d="M14 40h-6v-6" /><path d="M34 40h6v-6" /><path d="M8 8l10 10" /><path d="M40 8l-10 10" /><path d="M8 40l10-10" /><path d="M40 40l-10-10" /></svg>`,
    title: "Auto Resizing",
    description:
      "Text auto-sizes to fit so you don't have to worry about long names.",
  },
  {
    // Sliders — "customization"
    svg: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="12" x2="12" y2="36" /><line x1="24" y1="12" x2="24" y2="36" /><line x1="36" y1="12" x2="36" y2="36" /><circle cx="12" cy="20" r="3" fill="currentColor" /><circle cx="24" cy="30" r="3" fill="currentColor" /><circle cx="36" cy="16" r="3" fill="currentColor" /></svg>`,
    title: "Customization",
    description:
      "Change fonts, colors, and positioning with a live preview editor.",
  },
  {
    // Envelope with heart/check — "delivery"
    svg: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="12" width="36" height="26" rx="4" /><path d="M6 16l18 12 18-12" /><circle cx="38" cy="14" r="7" fill="currentColor" stroke="none" /><path d="M34 14l2.5 2.5L41 11" stroke="white" stroke-width="2" /></svg>`,
    title: "Email Delivery",
    description:
      "Send via Gmail or Resend with template variables and delivery tracking.",
  },
];

const steps = [
  {
    icon: FileSpreadsheet,
    title: "Upload your template and recipient list",
    description:
      "Upload a certificate template image and a CSV/XLSX file with your recipient data. Our AI maps columns like name, email, and course automatically.",
  },
  {
    icon: Sparkles,
    title: "Customize and preview",
    description:
      "Position text fields on your template with percentage-based placement. Preview how each certificate will look with live rendering before generating the full batch.",
  },
  {
    icon: MailCheck,
    title: "Generate and distribute",
    description:
      "Batch generate all certificates with one click, then download as a ZIP or send personalized emails to every recipient. Track delivery status in real time.",
  },
];

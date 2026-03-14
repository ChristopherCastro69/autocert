import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Award, Upload, Users, Mail, Zap, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl">
          Generate & distribute certificates at scale
        </h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-xl">
          AutoCert helps event organizers create, customize, and send
          personalized certificates to hundreds of attendees in minutes.
        </p>
        <div className="flex gap-3 mt-8">
          <Button asChild size="lg">
            <Link href="/sign-up">Get started free</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 border-t bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">
            Everything you need for certificate management
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="space-y-2">
                <feature.icon className="h-8 w-8 text-primary" />
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
        <h2 className="text-2xl font-bold">Ready to get started?</h2>
        <p className="text-muted-foreground mt-2">
          Create your organization and start generating certificates today.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/sign-up">Create free account</Link>
        </Button>
      </section>
    </div>
  );
}

const features = [
  {
    icon: Upload,
    title: "Smart file upload",
    description:
      "Upload attendee lists in CSV or XLSX format. Our AI automatically maps columns to the right fields.",
  },
  {
    icon: Award,
    title: "Beautiful certificates",
    description:
      "Upload any template image and customize text placement, fonts, and styling with a live preview.",
  },
  {
    icon: Zap,
    title: "Auto text sizing",
    description:
      "Names are automatically sized to fit within the certificate bounding box, no matter how long.",
  },
  {
    icon: Users,
    title: "Multi-org support",
    description:
      "Manage multiple organizations and events from a single dashboard with team collaboration.",
  },
  {
    icon: Mail,
    title: "Email distribution",
    description:
      "Send certificates directly to recipients via Gmail or Resend with customizable email templates.",
  },
  {
    icon: Shield,
    title: "Batch generation",
    description:
      "Generate hundreds of certificates in seconds with progress tracking and ZIP download.",
  },
];

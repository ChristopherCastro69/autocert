import { redirect } from "next/navigation";

export default async function EventOverviewPage({
  params,
}: {
  params: Promise<{ orgSlug: string; eventId: string }>;
}) {
  const { orgSlug, eventId } = await params;
  redirect(`/dashboard/${orgSlug}/events/${eventId}/templates`);
}

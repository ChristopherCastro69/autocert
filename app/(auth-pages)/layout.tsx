export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full px-4 py-12">{children}</div>
  );
}

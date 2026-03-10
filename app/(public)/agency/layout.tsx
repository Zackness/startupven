/**
 * Layout del área Agency (creación de sitios web).
 * Login y registro viven bajo /agency. No añade Header/Footer: ya los da (public).
 */
export default function AgencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
      {children}
    </div>
  );
}

import { EditorialCalendar } from "@/app/(protected)/escritorio/calendario-editorial/_components/editorial-calendar";

export default function ParaCalendarioEditorialPage() {
  return (
    <div className="h-[calc(100vh-10rem)] min-h-[680px]">
      <EditorialCalendar className="h-full" canEdit />
    </div>
  );
}

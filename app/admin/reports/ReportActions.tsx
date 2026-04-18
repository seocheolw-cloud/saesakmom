"use client";

import { resolveReport, dismissReport, deleteReport } from "@/lib/actions/admin-report";

export function ReportActions({ reportId }: { reportId: string }) {
  return (
    <div className="flex flex-col gap-1 shrink-0">
      <form action={resolveReport.bind(null, reportId)}>
        <button type="submit" className="w-full h-7 px-3 rounded text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 transition-colors">처리</button>
      </form>
      <form action={dismissReport.bind(null, reportId)}>
        <button type="submit" className="w-full h-7 px-3 rounded text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors">기각</button>
      </form>
      <form action={deleteReport.bind(null, reportId)} onSubmit={(e) => { if (!confirm("삭제하시겠습니까?")) e.preventDefault(); }}>
        <button type="submit" className="w-full h-7 px-3 rounded text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 transition-colors">삭제</button>
      </form>
    </div>
  );
}

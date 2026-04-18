import { prisma } from "@/lib/prisma";

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    include: {
      reporter: { select: { nickname: true } },
      post: { select: { title: true } },
      comment: { select: { content: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <h2 className="text-base font-bold text-foreground mb-4">신고 관리</h2>
      <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border bg-[#f8fafc]">
          <span className="text-xs text-muted">총 {reports.length}건</span>
        </div>
        {reports.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">신고 내역이 없습니다.</div>
        ) : (
          <div className="divide-y divide-border">
            {reports.map((r) => (
              <div key={r.id} className="px-4 py-3 hover:bg-[#f8faff] transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${r.status === "PENDING" ? "text-amber-700 bg-amber-50" : r.status === "RESOLVED" ? "text-green-700 bg-green-50" : "text-gray-500 bg-gray-100"}`}>
                    {r.status === "PENDING" ? "대기" : r.status === "RESOLVED" ? "처리됨" : "기각"}
                  </span>
                  <span className="text-xs text-muted">신고자: {r.reporter.nickname}</span>
                  <span className="text-[11px] text-muted">{new Date(r.createdAt).toLocaleDateString("ko-KR")}</span>
                </div>
                <p className="text-sm text-foreground mb-1">사유: {r.reason}</p>
                {r.detail && <p className="text-xs text-muted mb-1">{r.detail}</p>}
                {r.post && <p className="text-[11px] text-muted">게시글: {r.post.title}</p>}
                {r.comment && <p className="text-[11px] text-muted">댓글: {r.comment.content.slice(0, 50)}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ReportActions } from "./ReportActions";

export default async function AdminReportsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const params = await searchParams;
  const statusFilter = params.status;
  const query = (params.q?.trim() || "").slice(0, 100);

  const where = {
    ...(statusFilter && { status: statusFilter as "PENDING" | "RESOLVED" | "DISMISSED" }),
    ...(query && {
      OR: [
        { reason: { contains: query, mode: "insensitive" as const } },
        { detail: { contains: query, mode: "insensitive" as const } },
        { reporter: { nickname: { contains: query, mode: "insensitive" as const } } },
      ],
    }),
  };

  const [reports, counts] = await Promise.all([
    prisma.report.findMany({
      where,
      include: {
        reporter: { select: { nickname: true } },
        post: { select: { id: true, title: true } },
        comment: { select: { id: true, content: true, postId: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    Promise.all([
      prisma.report.count(),
      prisma.report.count({ where: { status: "PENDING" } }),
      prisma.report.count({ where: { status: "RESOLVED" } }),
      prisma.report.count({ where: { status: "DISMISSED" } }),
    ]),
  ]);

  const [totalCount, pendingCount, resolvedCount, dismissedCount] = counts;

  // 같은 대상끼리 그룹화
  type Report = typeof reports[number];
  type GroupedReport = {
    key: string;
    reports: Report[];
    latestReport: Report;
    count: number;
    reporters: string[];
    reasons: string[];
    hasPending: boolean;
  };

  const groupMap = new Map<string, GroupedReport>();
  for (const r of reports) {
    const key = r.postId || r.commentId || r.detail || r.id;
    const group = groupMap.get(key);
    if (group) {
      group.reports.push(r);
      group.count++;
      if (!group.reporters.includes(r.reporter.nickname)) group.reporters.push(r.reporter.nickname);
      if (!group.reasons.includes(r.reason)) group.reasons.push(r.reason);
      if (r.status === "PENDING") group.hasPending = true;
    } else {
      groupMap.set(key, {
        key,
        reports: [r],
        latestReport: r,
        count: 1,
        reporters: [r.reporter.nickname],
        reasons: [r.reason],
        hasPending: r.status === "PENDING",
      });
    }
  }

  const grouped = Array.from(groupMap.values()).sort((a, b) => {
    if (a.hasPending !== b.hasPending) return a.hasPending ? -1 : 1;
    if (a.count !== b.count) return b.count - a.count;
    return new Date(b.latestReport.createdAt).getTime() - new Date(a.latestReport.createdAt).getTime();
  });

  function buildHref(overrides: Record<string, string | undefined>) {
    const p: Record<string, string> = {};
    const s = "status" in overrides ? overrides.status : statusFilter;
    const q = "q" in overrides ? overrides.q : query;
    if (s) p.status = s;
    if (q) p.q = q;
    const qs = new URLSearchParams(p).toString();
    return qs ? `/admin/reports?${qs}` : "/admin/reports";
  }

  function renderDetail(r: Report) {
    if (r.detail) {
      const compMatch = r.detail.match(/비교ID:\s*([a-zA-Z0-9_-]+)/);
      const productMatch = r.detail.match(/상품ID:\s*([a-zA-Z0-9_-]+)/);
      if (compMatch) return <Link href={`/admin/compare/${compMatch[1]}`} className="text-xs text-primary hover:underline">비교 댓글 보기</Link>;
      if (productMatch) return <Link href={`/products/${productMatch[1]}`} className="text-xs text-primary hover:underline">상품 댓글 보기</Link>;
      return <p className="text-xs text-muted">{r.detail}</p>;
    }
    if (r.post) return <Link href={`/community/${r.post.id}`} className="text-xs text-primary hover:underline">게시글: {r.post.title}</Link>;
    if (r.comment) return <Link href={r.comment.postId ? `/community/${r.comment.postId}` : "#"} className="text-xs text-primary hover:underline">댓글: {r.comment.content.slice(0, 50)}</Link>;
    return null;
  }

  return (
    <div>
      <h2 className="text-base font-bold text-foreground mb-4">신고 관리</h2>

      <div className="grid grid-cols-4 gap-3 mb-4">
        <Link href="/admin/reports" className={`bg-white rounded-xl border p-3 text-center transition-all ${!statusFilter ? "border-primary" : "border-[#d4d4d4] hover:border-primary/40"}`}>
          <p className="text-lg font-bold text-foreground">{totalCount}</p>
          <p className="text-[11px] text-muted">전체</p>
        </Link>
        <Link href={buildHref({ status: "PENDING" })} className={`bg-white rounded-xl border p-3 text-center transition-all ${statusFilter === "PENDING" ? "border-amber-400" : "border-[#d4d4d4] hover:border-amber-300"}`}>
          <p className="text-lg font-bold text-amber-600">{pendingCount}</p>
          <p className="text-[11px] text-muted">대기</p>
        </Link>
        <Link href={buildHref({ status: "RESOLVED" })} className={`bg-white rounded-xl border p-3 text-center transition-all ${statusFilter === "RESOLVED" ? "border-green-400" : "border-[#d4d4d4] hover:border-green-300"}`}>
          <p className="text-lg font-bold text-green-600">{resolvedCount}</p>
          <p className="text-[11px] text-muted">처리됨</p>
        </Link>
        <Link href={buildHref({ status: "DISMISSED" })} className={`bg-white rounded-xl border p-3 text-center transition-all ${statusFilter === "DISMISSED" ? "border-gray-400" : "border-[#d4d4d4] hover:border-gray-300"}`}>
          <p className="text-lg font-bold text-gray-500">{dismissedCount}</p>
          <p className="text-[11px] text-muted">기각</p>
        </Link>
      </div>

      <form action="/admin/reports" className="bg-white rounded-xl border border-[#d4d4d4] p-4 mb-4">
        {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
        <div className="flex gap-2">
          <input name="q" defaultValue={query} placeholder="신고 사유, 닉네임 검색" className="h-9 flex-1 px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary" />
          <button type="submit" className="h-9 px-4 rounded-lg bg-foreground text-sm font-medium text-white">검색</button>
        </div>
      </form>

      <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border bg-[#f8fafc]">
          <span className="text-xs text-muted">{grouped.length}건 (총 {reports.length}개 신고)</span>
        </div>
        {grouped.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">{query || statusFilter ? "검색 결과가 없습니다." : "신고 내역이 없습니다."}</div>
        ) : (
          <div className="divide-y divide-border">
            {grouped.map((g) => {
              const r = g.latestReport;
              return (
                <div key={g.key} className="px-4 py-4 hover:bg-[#f8faff] transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        {g.hasPending ? (
                          <span className="text-[11px] font-medium px-1.5 py-0.5 rounded text-amber-700 bg-amber-50">대기</span>
                        ) : r.status === "RESOLVED" ? (
                          <span className="text-[11px] font-medium px-1.5 py-0.5 rounded text-green-700 bg-green-50">처리됨</span>
                        ) : (
                          <span className="text-[11px] font-medium px-1.5 py-0.5 rounded text-gray-500 bg-gray-100">기각</span>
                        )}
                        {g.count > 1 && (
                          <span className="text-[11px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">{g.count}건 신고</span>
                        )}
                        <span className="text-[11px] text-muted">{new Date(r.createdAt).toLocaleDateString("ko-KR")}</span>
                      </div>

                      {/* 대상 링크 */}
                      <div className="mb-1.5">{renderDetail(r)}</div>

                      {/* 신고 사유 목록 */}
                      <div className="space-y-1 mb-1.5">
                        {g.reasons.map((reason, i) => (
                          <p key={i} className="text-sm text-foreground">
                            {g.reasons.length > 1 && <span className="text-xs text-muted mr-1">·</span>}
                            {reason}
                          </p>
                        ))}
                      </div>

                      {/* 신고자 */}
                      <p className="text-[11px] text-muted">
                        신고자: {g.reporters.slice(0, 3).join(", ")}
                        {g.reporters.length > 3 && ` 외 ${g.reporters.length - 3}명`}
                      </p>
                    </div>

                    {g.hasPending && (
                      <div className="shrink-0">
                        <ReportActions reportId={g.reports.find((rr) => rr.status === "PENDING")!.id} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

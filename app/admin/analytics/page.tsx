import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AnalyticsCharts } from "./AnalyticsCharts";

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ range?: string; from?: string; to?: string }> }) {
  const params = await searchParams;
  const range = params.range || "7d";
  const now = new Date();

  let fromDate: Date;
  let toDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  let customFrom = params.from || "";
  let customTo = params.to || "";

  if (range === "custom" && customFrom && customTo) {
    fromDate = new Date(customFrom);
    toDate = new Date(customTo + "T23:59:59");
  } else if (range === "30d") {
    fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else if (range === "90d") {
    fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  } else {
    fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  // 요약 통계
  const [totalViews, totalUsers, totalPosts, totalComments, todayViews, todayRegistrations] = await Promise.all([
    prisma.pageView.count({ where: { createdAt: { gte: fromDate, lte: toDate } } }),
    prisma.user.count({ where: { role: "USER", createdAt: { gte: fromDate, lte: toDate } } }),
    prisma.post.count({ where: { createdAt: { gte: fromDate, lte: toDate } } }),
    prisma.comment.count({ where: { createdAt: { gte: fromDate, lte: toDate } } }),
    prisma.pageView.count({ where: { createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) } } }),
    prisma.user.count({ where: { role: "USER", createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) } } }),
  ]);

  // 일별 데이터
  const dailyViews = await prisma.$queryRaw`
    SELECT DATE("createdAt") as date, COUNT(*)::int as count
    FROM page_views
    WHERE "createdAt" >= ${fromDate} AND "createdAt" <= ${toDate}
    GROUP BY DATE("createdAt")
    ORDER BY date ASC
  ` as { date: Date; count: number }[];

  const dailyRegistrations = await prisma.$queryRaw`
    SELECT DATE("createdAt") as date, COUNT(*)::int as count
    FROM users
    WHERE role = 'USER' AND "createdAt" >= ${fromDate} AND "createdAt" <= ${toDate}
    GROUP BY DATE("createdAt")
    ORDER BY date ASC
  ` as { date: Date; count: number }[];

  const dailyPosts = await prisma.$queryRaw`
    SELECT DATE("createdAt") as date, COUNT(*)::int as count
    FROM posts
    WHERE "createdAt" >= ${fromDate} AND "createdAt" <= ${toDate}
    GROUP BY DATE("createdAt")
    ORDER BY date ASC
  ` as { date: Date; count: number }[];

  // 페이지별 방문 수 (상위 10개)
  const topPages = await prisma.$queryRaw`
    SELECT path, COUNT(*)::int as count
    FROM page_views
    WHERE "createdAt" >= ${fromDate} AND "createdAt" <= ${toDate}
    GROUP BY path
    ORDER BY count DESC
    LIMIT 10
  ` as { path: string; count: number }[];

  // 활성 유저 (기간 내 글 또는 댓글 작성한 유저 수)
  const activeUsers = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT author_id)::int as count
    FROM (
      SELECT "authorId" as author_id FROM posts WHERE "createdAt" >= ${fromDate} AND "createdAt" <= ${toDate}
      UNION
      SELECT "authorId" as author_id FROM comments WHERE "createdAt" >= ${fromDate} AND "createdAt" <= ${toDate}
    ) sub
  ` as { count: number }[];

  const pageLabels: Record<string, string> = {
    "/": "홈",
    "/community": "커뮤니티",
    "/products": "육아용품",
    "/compare": "비교",
    "/login": "로그인",
    "/register": "회원가입",
    "/mypage": "마이페이지",
    "/notifications": "알림",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-foreground">로그분석</h2>
      </div>

      {/* 기간 선택 */}
      <div className="bg-white rounded-xl border border-[#d4d4d4] p-4 mb-4">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted mr-1">기간:</span>
          {[
            { value: "7d", label: "7일" },
            { value: "30d", label: "30일" },
            { value: "90d", label: "90일" },
          ].map((r) => (
            <Link key={r.value} href={`/admin/analytics?range=${r.value}`} className={`h-8 px-3 rounded-lg text-xs font-medium inline-flex items-center ${range === r.value ? "bg-primary text-white" : "bg-gray-100 text-[#5F6B7C] hover:bg-gray-200"}`}>
              {r.label}
            </Link>
          ))}
          <span className="text-xs text-muted mx-1">|</span>
          <form action="/admin/analytics" className="flex items-center gap-1.5">
            <input type="hidden" name="range" value="custom" />
            <input type="date" name="from" defaultValue={customFrom} className="h-8 px-2 border border-[#d4d4d4] rounded-lg text-xs focus:outline-none focus:border-primary" />
            <span className="text-xs text-muted">~</span>
            <input type="date" name="to" defaultValue={customTo} className="h-8 px-2 border border-[#d4d4d4] rounded-lg text-xs focus:outline-none focus:border-primary" />
            <button type="submit" className="h-8 px-3 rounded-lg bg-foreground text-xs font-medium text-white">조회</button>
          </form>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-[#d4d4d4] p-4">
          <p className="text-xs text-muted mb-1">총 방문</p>
          <p className="text-xl font-bold text-foreground">{totalViews.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#d4d4d4] p-4">
          <p className="text-xs text-muted mb-1">오늘 방문</p>
          <p className="text-xl font-bold text-blue-600">{todayViews.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#d4d4d4] p-4">
          <p className="text-xs text-muted mb-1">신규 가입</p>
          <p className="text-xl font-bold text-green-600">{totalUsers.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#d4d4d4] p-4">
          <p className="text-xs text-muted mb-1">오늘 가입</p>
          <p className="text-xl font-bold text-green-500">{todayRegistrations}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#d4d4d4] p-4">
          <p className="text-xs text-muted mb-1">게시글</p>
          <p className="text-xl font-bold text-purple-600">{totalPosts.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#d4d4d4] p-4">
          <p className="text-xs text-muted mb-1">활성 유저</p>
          <p className="text-xl font-bold text-orange-600">{activeUsers[0]?.count || 0}</p>
        </div>
      </div>

      {/* 차트 */}
      <AnalyticsCharts
        dailyViews={dailyViews.map((d) => ({ date: new Date(d.date).toISOString().slice(0, 10), count: d.count }))}
        dailyRegistrations={dailyRegistrations.map((d) => ({ date: new Date(d.date).toISOString().slice(0, 10), count: d.count }))}
        dailyPosts={dailyPosts.map((d) => ({ date: new Date(d.date).toISOString().slice(0, 10), count: d.count }))}
      />

      {/* 페이지별 방문 */}
      <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden mt-6">
        <div className="px-5 py-3 border-b border-border bg-[#f8fafc]">
          <h3 className="text-sm font-bold text-foreground">페이지별 방문 TOP 10</h3>
        </div>
        {topPages.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">방문 데이터가 없습니다.</div>
        ) : (
          <div className="p-5">
            {topPages.map((p, i) => {
              const maxCount = topPages[0]?.count || 1;
              const pct = Math.round((p.count / maxCount) * 100);
              const label = pageLabels[p.path] || p.path;
              return (
                <div key={p.path} className="flex items-center gap-3 mb-3 last:mb-0">
                  <span className={`w-5 text-center text-xs font-bold ${i < 3 ? "text-primary" : "text-muted"}`}>{i + 1}</span>
                  <span className="text-sm text-foreground w-36 shrink-0 truncate" title={p.path}>{label}</span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary/20 rounded-full flex items-center" style={{ width: `${Math.max(pct, 3)}%` }}>
                      <span className="text-[10px] font-bold text-primary ml-2">{p.count.toLocaleString()}</span>
                    </div>
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

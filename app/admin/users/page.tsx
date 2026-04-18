import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { UserStatusSelect } from "./UserActions";

const PAGE_SIZE = 20;

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const params = await searchParams;
  const query = (params.q?.trim() || "").slice(0, 100);
  const statusFilter = params.status;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const session = await auth();

  const where = {
    role: "USER" as const,
    ...(statusFilter && { status: statusFilter as "ACTIVE" | "WARNED" | "SUSPENDED" | "BANNED" }),
    ...(query && {
      OR: [
        { nickname: { contains: query, mode: "insensitive" as const } },
        { email: { contains: query, mode: "insensitive" as const } },
      ],
    }),
  };

  const [users, totalCount, statusCounts] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, email: true, nickname: true, role: true, status: true, level: true, exp: true, suspendedUntil: true, createdAt: true,
        _count: { select: { posts: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where }),
    Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.user.count({ where: { role: "USER", status: "ACTIVE" } }),
      prisma.user.count({ where: { role: "USER", status: { not: "ACTIVE" } } }),
    ]),
  ]);

  const [total, activeCount, inactiveCount] = statusCounts;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  function buildHref(overrides: Record<string, string | undefined>) {
    const p: Record<string, string> = {};
    const s = "status" in overrides ? overrides.status : statusFilter;
    const q = "q" in overrides ? overrides.q : query;
    if (s) p.status = s;
    if (q) p.q = q;
    if (overrides.page) p.page = overrides.page;
    const qs = new URLSearchParams(p).toString();
    return qs ? `/admin/users?${qs}` : "/admin/users";
  }

  return (
    <div>
      <h2 className="text-base font-bold text-foreground mb-4">회원 관리</h2>

      {/* 상태 요약 */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Link href="/admin/users" className={`bg-white rounded-xl border p-3 text-center transition-all ${!statusFilter ? "border-primary" : "border-[#d4d4d4] hover:border-primary/40"}`}>
          <p className="text-lg font-bold text-foreground">{total}</p>
          <p className="text-[11px] text-muted">전체</p>
        </Link>
        <Link href={buildHref({ status: "ACTIVE" })} className={`bg-white rounded-xl border p-3 text-center transition-all ${statusFilter === "ACTIVE" ? "border-green-400" : "border-[#d4d4d4] hover:border-green-300"}`}>
          <p className="text-lg font-bold text-green-600">{activeCount}</p>
          <p className="text-[11px] text-muted">활성</p>
        </Link>
        <Link href={buildHref({ status: "SUSPENDED" })} className={`bg-white rounded-xl border p-3 text-center transition-all ${statusFilter && statusFilter !== "ACTIVE" ? "border-red-400" : "border-[#d4d4d4] hover:border-red-300"}`}>
          <p className="text-lg font-bold text-red-600">{inactiveCount}</p>
          <p className="text-[11px] text-muted">비활성</p>
        </Link>
      </div>

      {/* 검색 + 필터 */}
      <div className="bg-white rounded-xl border border-[#d4d4d4] p-4 mb-4 space-y-3">
        <form action="/admin/users" className="flex gap-2">
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          <input name="q" defaultValue={query} placeholder="닉네임, 이메일 검색" className="h-9 flex-1 px-3 border border-[#d4d4d4] rounded-lg text-sm focus:outline-none focus:border-primary" />
          <button type="submit" className="h-9 px-4 rounded-lg bg-foreground text-sm font-medium text-white">검색</button>
        </form>
        <div className="flex flex-wrap gap-1.5">
          <Link href={buildHref({ status: undefined })} className={`h-7 px-2.5 rounded-full text-[12px] font-medium inline-flex items-center ${!statusFilter ? "bg-foreground text-white" : "bg-gray-100 text-[#5F6B7C] hover:bg-gray-200"}`}>전체</Link>
          {[
            { value: "ACTIVE", label: "활성" },
            { value: "SUSPENDED", label: "정지" },
            { value: "BANNED", label: "차단" },
          ].map((s) => (
            <Link key={s.value} href={buildHref({ status: s.value })} className={`h-7 px-2.5 rounded-full text-[12px] font-medium inline-flex items-center ${statusFilter === s.value ? "bg-foreground text-white" : "bg-gray-100 text-[#5F6B7C] hover:bg-gray-200"}`}>{s.label}</Link>
          ))}
        </div>
      </div>

      {/* 회원 목록 */}
      <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border bg-[#f8fafc]">
          <span className="text-xs text-muted">총 {totalCount}명</span>
        </div>
        {users.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">{query || statusFilter ? "검색 결과가 없습니다." : "회원이 없습니다."}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f8fafc] border-b border-border text-xs font-semibold text-muted">
                <tr>
                  <th className="px-4 py-2.5 text-left">닉네임</th>
                  <th className="px-4 py-2.5 text-left">이메일</th>
                  <th className="px-4 py-2.5 text-center w-14">Lv</th>
                  <th className="px-4 py-2.5 text-center w-14">글</th>
                  <th className="px-4 py-2.5 text-center w-14">댓글</th>
                  <th className="px-4 py-2.5 text-center w-20">가입일</th>
                  <th className="px-4 py-2.5 text-center w-20">상태</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                    <tr key={u.id} className="border-b border-border last:border-b-0 hover:bg-[#f8faff]">
                      <td className="px-4 py-3 font-medium">{u.nickname}</td>
                      <td className="px-4 py-3 text-muted text-xs">{u.email}</td>
                      <td className="px-4 py-3 text-center text-xs">{u.level}</td>
                      <td className="px-4 py-3 text-center text-xs text-muted">{u._count.posts}</td>
                      <td className="px-4 py-3 text-center text-xs text-muted">{u._count.comments}</td>
                      <td className="px-4 py-3 text-center text-xs text-muted">{new Date(u.createdAt).toLocaleDateString("ko-KR", { year: "2-digit", month: "numeric", day: "numeric" })}</td>
                      <td className="px-4 py-3 text-center">
                        <UserStatusSelect userId={u.id} currentStatus={u.status} />
                        {u.status === "SUSPENDED" && u.suspendedUntil && (
                          <p className="text-[10px] text-orange-500 mt-0.5">{new Date(u.suspendedUntil).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}까지</p>
                        )}
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-4 flex-wrap">
          {page > 1 && <Link href={buildHref({ page: String(page - 1) })} className="h-8 px-3 rounded-lg border border-[#d4d4d4] text-xs text-muted hover:border-primary inline-flex items-center">이전</Link>}
          {Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => p === 1 || p === totalPages || (p >= page - 2 && p <= page + 2)).map((p, i, arr) => {
            const prev = arr[i - 1];
            return (
              <span key={p}>
                {prev && p - prev > 1 && <span className="w-8 h-8 inline-flex items-center justify-center text-xs text-muted">...</span>}
                <Link href={buildHref({ page: String(p) })} className={`h-8 w-8 rounded-lg text-xs font-medium inline-flex items-center justify-center ${p === page ? "bg-primary text-white" : "border border-[#d4d4d4] text-muted hover:border-primary"}`}>{p}</Link>
              </span>
            );
          })}
          {page < totalPages && <Link href={buildHref({ page: String(page + 1) })} className="h-8 px-3 rounded-lg border border-[#d4d4d4] text-xs text-muted hover:border-primary inline-flex items-center">다음</Link>}
        </div>
      )}
    </div>
  );
}

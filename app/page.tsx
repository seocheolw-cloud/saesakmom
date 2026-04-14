import Link from "next/link";
import { auth } from "@/lib/auth";
import { LogoutButton } from "@/app/components/AuthButton";

const CATEGORIES = [
  { name: "임신", slug: "pregnancy" },
  { name: "출산", slug: "birth" },
  { name: "육아일상", slug: "daily" },
  { name: "수유/이유식", slug: "feeding" },
  { name: "건강", slug: "health" },
  { name: "자유게시판", slug: "free" },
];

const POPULAR_POSTS = [
  {
    id: 1,
    title: "출산가방 리스트 정리해봤어요 (38주차)",
    preview: "곧 출산인데 출산가방 싸면서 정리한 리스트 공유합니다. 빠진 거 있으면 알려주세요!",
    author: "D-day임박",
    category: "출산",
    createdAt: "6시간 전",
    viewCount: 876,
    likeCount: 92,
    commentCount: 37,
  },
  {
    id: 2,
    title: "이유식 초기 쌀미음 만드는 꿀팁 공유합니다",
    preview: "처음 이유식 시작하시는 분들 참고하세요! 쌀미음 만들 때 불린 쌀을 믹서에 갈고...",
    author: "이유식장인",
    category: "수유/이유식",
    createdAt: "3시간 전",
    viewCount: 521,
    likeCount: 45,
    commentCount: 23,
  },
  {
    id: 3,
    title: "임신 12주 입덧이 너무 심해요 ㅠㅠ",
    preview: "아무것도 못 먹겠고 물만 마셔도 토할것 같은데 다들 어떻게 버티셨어요?",
    author: "예비맘콩",
    category: "임신",
    createdAt: "4시간 전",
    viewCount: 289,
    likeCount: 32,
    commentCount: 41,
  },
];

const RECENT_POSTS = [
  {
    id: 4,
    title: "첫째 100일 지났는데 수면교육 언제 시작하셨나요?",
    preview: "아기가 100일 지났는데 아직 밤에 3번은 깨요. 수면교육 시작하려는데 너무 울까봐 걱정이네요...",
    author: "졸린맘",
    category: "육아일상",
    createdAt: "2시간 전",
    viewCount: 342,
    likeCount: 28,
    commentCount: 15,
  },
  {
    id: 5,
    title: "신생아 목욕 매일 시키시나요?",
    preview: "소아과에서는 격일로 해도 된다는데 시어머니는 매일 시켜야 한다고...",
    author: "초보맘이에요",
    category: "육아일상",
    createdAt: "5시간 전",
    viewCount: 198,
    likeCount: 14,
    commentCount: 19,
  },
  {
    id: 6,
    title: "아기 열 38도인데 응급실 가야하나요?",
    preview: "6개월 아기인데 갑자기 열이 38도까지 올랐어요. 해열제 먹였는데 안 떨어지면 응급실 가야할까요?",
    author: "걱정맘",
    category: "건강",
    createdAt: "7시간 전",
    viewCount: 445,
    likeCount: 18,
    commentCount: 28,
  },
  {
    id: 7,
    title: "분유에서 우유로 전환 시기 언제가 좋을까요?",
    preview: "12개월 됐는데 분유를 끊고 우유로 바꿔야 하나요? 아직 분유를 잘 먹어서 고민이에요",
    author: "우유vs분유",
    category: "수유/이유식",
    createdAt: "8시간 전",
    viewCount: 231,
    likeCount: 11,
    commentCount: 22,
  },
];

const CATEGORY_POSTS: Record<string, { id: number; title: string; commentCount: number }[]> = {
  임신: [
    { id: 10, title: "임신 초기 엽산 어떤 거 드시나요?", commentCount: 18 },
    { id: 11, title: "12주 NT검사 결과 공유해요", commentCount: 9 },
    { id: 12, title: "입덧에 좋은 음식 추천해주세요", commentCount: 31 },
  ],
  출산: [
    { id: 13, title: "자연분만 vs 제왕절개 경험담", commentCount: 44 },
    { id: 14, title: "산후조리원 선택 기준이 뭐였나요?", commentCount: 27 },
    { id: 15, title: "출산 후 회복 기간 어땠나요?", commentCount: 15 },
  ],
  육아일상: [
    { id: 16, title: "100일 사진 셀프로 찍는 팁", commentCount: 22 },
    { id: 17, title: "아기랑 첫 외출 후기", commentCount: 13 },
    { id: 18, title: "육아 번아웃 올 때 어떻게 하세요?", commentCount: 56 },
  ],
  건강: [
    { id: 19, title: "영유아 검진 일정 정리", commentCount: 8 },
    { id: 20, title: "아기 아토피 관리법 공유", commentCount: 35 },
    { id: 21, title: "소아과 선택 기준이 뭐예요?", commentCount: 19 },
  ],
};

const TRENDING_KEYWORDS = [
  "수면교육", "이유식", "출산가방", "입덧", "신생아 목욕",
  "분유 추천", "기저귀 발진", "태교 음악", "산후조리원", "아기띠 추천",
];

function PostCard({ post }: { post: typeof POPULAR_POSTS[number] }) {
  return (
    <article className="p-4 hover:bg-[#f8faff] transition-colors cursor-pointer border-b border-border last:border-b-0">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-xs font-semibold text-primary">{post.category}</span>
        <span className="text-xs text-muted">{post.createdAt}</span>
      </div>
      <h3 className="text-[15px] font-semibold text-foreground mb-1 line-clamp-1">{post.title}</h3>
      <p className="text-sm text-muted line-clamp-1 mb-2.5">{post.preview}</p>
      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="font-medium text-foreground">{post.author}</span>
        <span>조회 {post.viewCount}</span>
        <span>좋아요 {post.likeCount}</span>
        <span>댓글 {post.commentCount}</span>
      </div>
    </article>
  );
}

export default async function Home() {
  const session = await auth();
  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#d4d4d4]">
        <div className="max-w-[1100px] mx-auto flex items-center h-[52px] md:h-16 px-4">
          {/* 로고 */}
          <Link href="/" className="text-xl font-bold text-primary shrink-0">
            새싹맘
          </Link>

          {/* 메인 네비 */}
          <nav className="flex items-center ml-6 md:ml-10 gap-1 md:gap-2 h-full">
            {[
              { name: "홈", href: "/", active: true },
              { name: "커뮤니티", href: "/community" },
              { name: "육아용품", href: "/products" },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`h-full px-3 md:px-4 text-sm md:text-[16px] font-semibold inline-flex items-center transition-colors ${
                  item.active
                    ? "text-[#18202A] border-b-2 border-[#18202A]"
                    : "text-[#5F6B7C] hover:text-[#18202A]"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* 우측: 검색 + 로그인/유저 */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="hidden md:block relative">
              <input
                type="text"
                placeholder="검색어를 입력하세요"
                className="w-[260px] h-10 rounded-full border border-[#d4d4d4] pl-10 pr-4 text-sm bg-white focus:outline-none focus:border-[#bbc0c5] transition-colors"
              />
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94969b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {session?.user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">
                  {session.user.nickname}님
                </span>
                <Link
                  href="/mypage"
                  className="h-10 px-4 rounded-lg border border-[#d4d4d4] text-sm font-semibold text-[#5F6B7C] hover:bg-gray-50 transition-colors inline-flex items-center"
                >
                  마이페이지
                </Link>
                <LogoutButton />
              </div>
            ) : (
              <Link
                href="/login"
                className="h-10 px-5 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover transition-colors inline-flex items-center"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-[1100px] mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* 좌측: 메인 피드 */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* 모바일 검색 */}
            <div className="md:hidden relative">
              <input
                type="text"
                placeholder="검색어를 입력하세요"
                className="w-full h-10 rounded-full border border-[#d4d4d4] pl-10 pr-4 text-sm bg-white focus:outline-none focus:border-primary transition-colors"
              />
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94969b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* 인기글 */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-foreground">인기글</h2>
                <Link href="/community?sort=popular" className="text-xs text-muted hover:text-primary transition-colors">
                  더보기
                </Link>
              </div>
              <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
                {POPULAR_POSTS.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>

            {/* 최신글 */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-foreground">최신글</h2>
                <Link href="/community?sort=latest" className="text-xs text-muted hover:text-primary transition-colors">
                  더보기
                </Link>
              </div>
              <div className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
                {RECENT_POSTS.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>

            {/* 카테고리별 글 */}
            <section>
              <h2 className="text-base font-bold text-foreground mb-3">카테고리별</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(CATEGORY_POSTS).map(([category, posts]) => (
                  <div key={category} className="bg-white rounded-xl border border-[#d4d4d4] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <h3 className="text-sm font-bold text-foreground">{category}</h3>
                      <Link href={`/community/${category}`} className="text-xs text-muted hover:text-primary transition-colors">
                        더보기
                      </Link>
                    </div>
                    <ul>
                      {posts.map((post, i) => (
                        <li
                          key={post.id}
                          className={`px-4 py-2.5 hover:bg-[#f8faff] cursor-pointer transition-colors flex items-center justify-between ${
                            i < posts.length - 1 ? "border-b border-border" : ""
                          }`}
                        >
                          <span className="text-sm text-foreground line-clamp-1 flex-1 mr-3">{post.title}</span>
                          <span className="text-xs text-muted shrink-0">댓글 {post.commentCount}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* 우측: 사이드바 */}
          <aside className="hidden lg:block w-[280px] shrink-0 space-y-6">
            {/* 실시간 인기 검색어 */}
            <div className="bg-white rounded-xl border border-[#d4d4d4] p-5 sticky top-[88px]">
              <h2 className="text-sm font-bold text-foreground mb-4">실시간 인기 검색어</h2>
              <ol className="space-y-2">
                {TRENDING_KEYWORDS.map((keyword, i) => (
                  <li
                    key={keyword}
                    className="flex items-center gap-3 text-sm cursor-pointer hover:text-primary transition-colors"
                  >
                    <span className={`w-5 text-center text-xs font-bold ${i < 3 ? "text-primary" : "text-muted"}`}>
                      {i + 1}
                    </span>
                    <span className="text-foreground">{keyword}</span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

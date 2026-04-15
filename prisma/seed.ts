import dotenv from "dotenv";
import path from "node:path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL!;
const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString),
});

const categories = [
  { name: "인기글", slug: "popular", sortOrder: 1 },
  { name: "임신", slug: "pregnancy", sortOrder: 2 },
  { name: "출산", slug: "birth", sortOrder: 3 },
  { name: "산후조리", slug: "postpartum", sortOrder: 4 },
  { name: "육아", slug: "parenting", sortOrder: 5 },
  { name: "수유/이유식", slug: "feeding", sortOrder: 6 },
  { name: "뷰티/다이어트", slug: "beauty", sortOrder: 7 },
  { name: "자유게시판", slug: "free", sortOrder: 8 },
];

const dummyUsers = [
  { email: "sunny@example.com", nickname: "햇살맘", password: "test1234" },
  { email: "cloud@example.com", nickname: "구름이맘", password: "test1234" },
  { email: "star@example.com", nickname: "별이엄마", password: "test1234" },
  { email: "moon@example.com", nickname: "달빛맘", password: "test1234" },
  { email: "rain@example.com", nickname: "비오는날", password: "test1234" },
];

const dummyPosts: { category: string; title: string; content: string; likeCount: number; viewCount: number }[] = [
  // 임신
  { category: "pregnancy", title: "임신 초기 엽산 어떤 거 드시나요?", content: "임신 5주차인데 엽산 고르기가 너무 어렵네요. 다들 어떤 브랜드 드시나요? 가격대도 천차만별이라 고민됩니다. 추천 부탁드려요!", likeCount: 45, viewCount: 523 },
  { category: "pregnancy", title: "입덧이 너무 심해요 ㅠㅠ 언제 끝나나요", content: "12주차인데 아무것도 못 먹겠어요. 물만 마셔도 올라오고... 다들 입덧 언제쯤 나아지셨어요? 입덧에 좋은 음식이나 방법 있으면 알려주세요.", likeCount: 67, viewCount: 891 },
  { category: "pregnancy", title: "임신 중 운동 어디까지 괜찮을까요?", content: "임신 전에 필라테스 다녔는데 계속 해도 되는지 궁금해요. 의사 선생님은 괜찮다고 하시는데 주변에서 걱정을 많이 하시네요.", likeCount: 32, viewCount: 412 },
  { category: "pregnancy", title: "NT검사 결과 나왔는데 걱정돼요", content: "12주에 NT검사 했는데 수치가 약간 높다고 하네요. 정밀검사 받으라고 하는데 너무 불안합니다. 비슷한 경험 있으신 분 계신가요?", likeCount: 28, viewCount: 678 },

  // 출산
  { category: "birth", title: "출산가방 리스트 정리해봤어요 (38주차)", content: "곧 출산인데 출산가방 싸면서 정리한 리스트 공유합니다!\n\n필수:\n- 산모패드, 수유브라, 산모복\n- 아기 배냇저고리, 기저귀\n- 세면도구, 수건\n\n빠진 거 있으면 알려주세요!", likeCount: 128, viewCount: 2341 },
  { category: "birth", title: "자연분만 vs 제왕절개 경험담 공유해요", content: "첫째는 자연분만, 둘째는 제왕절개로 출산했어요. 둘 다 경험해보니 각각 장단점이 있더라고요. 자연분만은 회복이 빠르고, 제왕은 출산 과정이 짧지만 회복이 좀 걸려요.", likeCount: 89, viewCount: 1567 },
  { category: "birth", title: "무통분만 후기입니다", content: "무통 맞고 출산했는데 정말 다른 세상이더라고요. 진통 없이 출산할 수 있다니... 물론 사람마다 효과가 다르다고 하지만 저는 강추합니다.", likeCount: 56, viewCount: 834 },

  // 산후조리
  { category: "postpartum", title: "산후조리원 선택 기준이 뭐였나요?", content: "출산 예정일이 다가오는데 산후조리원 고르기가 너무 어렵네요. 가격, 위치, 시설, 식사... 다들 어떤 기준으로 선택하셨어요?", likeCount: 73, viewCount: 1123 },
  { category: "postpartum", title: "산후조리 집에서 하시는 분 계신가요?", content: "산후조리원 비용이 부담되서 집에서 하려고 하는데 가능할까요? 친정엄마가 와주신다고 하시긴 하는데 걱정이 돼요.", likeCount: 41, viewCount: 567 },
  { category: "postpartum", title: "산후우울증 겪고 계신 분 있으신가요", content: "출산 후 한 달 됐는데 자꾸 눈물이 나고 우울해요. 아기는 예쁜데 왜 이러는지 모르겠어요. 혹시 비슷한 경험 있으신 분 조언 부탁드려요.", likeCount: 95, viewCount: 1890 },

  // 육아
  { category: "parenting", title: "수면교육 언제 시작하셨나요?", content: "100일 지났는데 아직 밤에 3번은 깨요. 수면교육 시작하려는데 너무 울까봐 걱정이네요. 다들 언제쯤 시작하셨어요?", likeCount: 52, viewCount: 743 },
  { category: "parenting", title: "신생아 목욕 매일 시키시나요?", content: "소아과에서는 격일로 해도 된다는데 시어머니는 매일 시켜야 한다고 하시네요. 다들 어떻게 하시나요?", likeCount: 38, viewCount: 456 },
  { category: "parenting", title: "100일 사진 셀프로 찍는 팁", content: "스튜디오 비용이 부담되서 집에서 셀프로 찍으려고 해요. 배경지랑 소품 추천해주세요! 조명은 자연광이 제일 좋다고 하더라고요.", likeCount: 64, viewCount: 987 },
  { category: "parenting", title: "아기 열 38도인데 응급실 가야하나요?", content: "6개월 아기인데 갑자기 열이 38도까지 올랐어요. 해열제 먹였는데 안 떨어지면 응급실 가야할까요? 너무 걱정돼요 ㅠㅠ", likeCount: 29, viewCount: 534 },
  { category: "parenting", title: "육아 번아웃 올 때 어떻게 하세요?", content: "하루 종일 아기랑 둘이 있으니까 미칠 것 같아요. 남편은 야근이 많고... 다들 번아웃 올 때 어떻게 극복하시나요?", likeCount: 112, viewCount: 2156 },

  // 수유/이유식
  { category: "feeding", title: "이유식 초기 쌀미음 만드는 꿀팁", content: "처음 이유식 시작하시는 분들 참고하세요! 쌀미음 만들 때 불린 쌀을 믹서에 곱게 갈고, 물 비율은 쌀 1: 물 10으로 시작하면 좋아요. 체에 꼭 걸러주세요!", likeCount: 87, viewCount: 1432 },
  { category: "feeding", title: "분유에서 우유로 전환 시기", content: "12개월 됐는데 분유 끊고 우유로 바꿔야 하나요? 아직 분유를 잘 먹어서 고민이에요. 전환 시기랑 방법 알려주세요.", likeCount: 34, viewCount: 567 },
  { category: "feeding", title: "모유수유 중 유선염 걸렸어요 ㅠ", content: "갑자기 가슴이 딱딱해지고 열이 나기 시작했어요. 유선염인 것 같은데 병원 가기 전에 할 수 있는 응급처치가 있을까요?", likeCount: 43, viewCount: 678 },

  // 뷰티/다이어트
  { category: "beauty", title: "산후 다이어트 언제부터 시작하셨어요?", content: "출산 후 3개월 됐는데 임신 전 체중으로 돌아갈 수 있을까요? 모유수유 중이라 무리한 다이어트는 안 될 것 같고... 다들 언제부터 시작하셨어요?", likeCount: 58, viewCount: 890 },
  { category: "beauty", title: "임산부 스킨케어 추천해주세요", content: "임신하고 나서 피부가 완전 달라졌어요. 트러블도 나고 건조하기도 하고... 임산부용 스킨케어 제품 추천 부탁드려요!", likeCount: 41, viewCount: 623 },
  { category: "beauty", title: "튼살크림 효과 있는 거 있나요?", content: "배가 커지면서 튼살이 생기기 시작했어요. 튼살크림 발라도 소용없다는 분도 있고, 효과 봤다는 분도 있고... 실제로 효과 본 제품 있으면 추천해주세요.", likeCount: 36, viewCount: 512 },

  // 자유게시판
  { category: "free", title: "육아하면서 제일 뿌듯했던 순간", content: "아기가 처음으로 '엄마' 했을 때 눈물 나더라고요 ㅠㅠ 다들 제일 뿌듯했던 순간이 언제인가요? 힘들지만 이런 순간들이 있어서 버티는 것 같아요.", likeCount: 156, viewCount: 3241 },
  { category: "free", title: "남편한테 바라는 것 딱 하나", content: "퇴근하고 와서 '오늘 힘들었지?' 이 한마디만 해줘도 힘이 날 것 같은데... 다들 남편분들 육아 참여 어떠세요?", likeCount: 203, viewCount: 4521 },
  { category: "free", title: "워킹맘 vs 전업맘 어떤 게 더 힘든가요", content: "전 전업맘인데 워킹맘 친구는 전업이 부럽다고 하고, 전 워킹맘이 부럽고... 결국 엄마는 다 힘든 거 아닐까요?", likeCount: 178, viewCount: 3890 },
  { category: "free", title: "요즘 아기 이름 트렌드가 뭔가요?", content: "둘째 이름 짓고 있는데 요즘 유행하는 이름이 뭔지 궁금해요. 첫째 때는 한글 이름으로 지었는데 둘째도 한글로 할지 고민 중이에요.", likeCount: 47, viewCount: 789 },
];

async function main() {
  // 기존 카테고리 중 새 목록에 없는 것 삭제
  const oldSlugs = ["daily", "health"];
  for (const slug of oldSlugs) {
    await prisma.category.deleteMany({ where: { slug } });
  }

  // 카테고리 시드
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, sortOrder: category.sortOrder },
      create: category,
    });
  }
  console.log("Categories seeded");

  // 더미 유저 시드
  const hashedPassword = await bcrypt.hash("test1234", 10);
  const userIds: string[] = [];

  for (const user of dummyUsers) {
    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        nickname: user.nickname,
        password: hashedPassword,
      },
    });
    userIds.push(created.id);
  }
  console.log(`Users seeded (${userIds.length})`);

  // 더미 게시글 시드
  const categoryMap = await prisma.category.findMany();
  const slugToId: Record<string, string> = {};
  for (const cat of categoryMap) {
    slugToId[cat.slug] = cat.id;
  }

  let postCount = 0;
  const postIds: string[] = [];
  for (let i = 0; i < dummyPosts.length; i++) {
    const post = dummyPosts[i];
    const authorId = userIds[i % userIds.length];
    const categoryId = slugToId[post.category];

    if (!categoryId) continue;

    // 중복 방지: 같은 제목이 있으면 스킵
    const existing = await prisma.post.findFirst({
      where: { title: post.title },
    });
    if (existing) {
      postIds.push(existing.id);
      continue;
    }

    const created = await prisma.post.create({
      data: {
        title: post.title,
        content: post.content,
        authorId,
        categoryId,
        likeCount: post.likeCount,
        viewCount: post.viewCount,
        createdAt: new Date(Date.now() - (dummyPosts.length - i) * 3600000),
      },
    });
    postIds.push(created.id);
    postCount++;
  }
  console.log(`Posts seeded (${postCount})`);

  // 더미 댓글 시드
  const dummyComments = [
    "저도 같은 고민이에요! 좋은 정보 감사합니다 😊",
    "우와 정말 도움이 많이 되네요~ 감사해요!",
    "공감합니다 ㅠㅠ 힘내세요!",
    "오 이건 몰랐던 정보네요! 메모해둡니다",
    "저는 이렇게 했더니 효과 봤어요~ 참고해보세요",
    "좋은 글이네요 북마크 해둡니다!",
    "비슷한 경험이 있어서 댓글 남겨요. 저도 처음엔 막막했는데 시간이 지나니 괜찮아지더라고요.",
    "정말요? 저도 한번 시도해봐야겠어요",
    "맞아요 맞아요~ 저도 완전 공감!",
    "이 글 보고 용기 얻었어요. 감사합니다 ❤️",
    "혹시 구체적으로 어떤 제품 쓰셨어요?",
    "저도 궁금했던 건데 마침 글이 올라왔네요",
    "경험담 공유 감사합니다! 참고할게요~",
    "ㅋㅋㅋ 너무 공감돼서 웃었어요",
    "아이고 고생 많으셨네요. 힘내세요!",
    "저희 아이도 비슷했는데 지금은 많이 나아졌어요",
    "좋은 팁이네요! 저도 해봐야겠어요",
    "와 대박 이런 방법이 있었군요",
    "첫째 때 이 글 봤으면 좋았을 텐데 ㅠ",
    "댓글 보고 더 많이 배워갑니다~",
  ];

  let commentCount = 0;
  for (let i = 0; i < postIds.length; i++) {
    const postId = postIds[i];
    const numComments = (i % 5) + 1; // 1~5개 댓글

    for (let j = 0; j < numComments; j++) {
      const authorId = userIds[(i + j + 1) % userIds.length];
      const commentText = dummyComments[(i * 3 + j) % dummyComments.length];

      const existing = await prisma.comment.findFirst({
        where: { postId, content: commentText },
      });
      if (existing) continue;

      const parent = await prisma.comment.create({
        data: {
          content: commentText,
          authorId,
          postId,
          createdAt: new Date(Date.now() - (dummyPosts.length - i) * 3600000 + (j + 1) * 600000),
        },
      });
      commentCount++;

      // 일부 댓글에 답글 추가
      if (j === 0 && numComments >= 3) {
        const replyAuthorId = userIds[(i + j + 2) % userIds.length];
        const replyText = dummyComments[(i * 3 + j + 7) % dummyComments.length];

        const existingReply = await prisma.comment.findFirst({
          where: { postId, parentId: parent.id },
        });
        if (!existingReply) {
          await prisma.comment.create({
            data: {
              content: replyText,
              authorId: replyAuthorId,
              postId,
              parentId: parent.id,
              createdAt: new Date(Date.now() - (dummyPosts.length - i) * 3600000 + (j + 2) * 600000),
            },
          });
          commentCount++;
        }
      }
    }
  }
  console.log(`Comments seeded (${commentCount})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

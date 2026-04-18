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

const adminUser = { email: "admin@saesakmom.com", nickname: "admin", password: "7856pass!!" };

const dummyUsers = [
  { email: "sunny@example.com", nickname: "햇살맘", password: "test1234" },
  { email: "cloud@example.com", nickname: "구름이맘", password: "test1234" },
  { email: "star@example.com", nickname: "별이엄마", password: "test1234" },
  { email: "moon@example.com", nickname: "달빛맘", password: "test1234" },
  { email: "rain@example.com", nickname: "비오는날", password: "test1234" },
];

// daysAgo: 며칠 전 작성, likeCount/dislikeCount 차이가 >= 20이면 인기글
const dummyPosts: { category: string; title: string; content: string; likeCount: number; dislikeCount: number; viewCount: number; daysAgo: number }[] = [
  // 임신
  // 인기글 O (45-3=42 ≥ 20)
  { category: "pregnancy", title: "임신 초기 엽산 어떤 거 드시나요?", content: "임신 5주차인데 엽산 고르기가 너무 어렵네요. 다들 어떤 브랜드 드시나요? 가격대도 천차만별이라 고민됩니다. 추천 부탁드려요!", likeCount: 45, dislikeCount: 3, viewCount: 523, daysAgo: 12 },
  // 인기글 O (67-5=62 ≥ 20)
  { category: "pregnancy", title: "입덧이 너무 심해요 ㅠㅠ 언제 끝나나요", content: "12주차인데 아무것도 못 먹겠어요. 물만 마셔도 올라오고... 다들 입덧 언제쯤 나아지셨어요? 입덧에 좋은 음식이나 방법 있으면 알려주세요.", likeCount: 67, dislikeCount: 5, viewCount: 891, daysAgo: 25 },
  // 인기글 X (18-2=16 < 20)
  { category: "pregnancy", title: "임신 중 운동 어디까지 괜찮을까요?", content: "임신 전에 필라테스 다녔는데 계속 해도 되는지 궁금해요. 의사 선생님은 괜찮다고 하시는데 주변에서 걱정을 많이 하시네요.", likeCount: 18, dislikeCount: 2, viewCount: 412, daysAgo: 3 },
  // 인기글 X (12-4=8 < 20)
  { category: "pregnancy", title: "NT검사 결과 나왔는데 걱정돼요", content: "12주에 NT검사 했는데 수치가 약간 높다고 하네요. 정밀검사 받으라고 하는데 너무 불안합니다. 비슷한 경험 있으신 분 계신가요?", likeCount: 12, dislikeCount: 4, viewCount: 678, daysAgo: 1 },

  // 출산
  // 인기글 O (128-8=120 ≥ 20)
  { category: "birth", title: "출산가방 리스트 정리해봤어요 (38주차)", content: "곧 출산인데 출산가방 싸면서 정리한 리스트 공유합니다!\n\n필수:\n- 산모패드, 수유브라, 산모복\n- 아기 배냇저고리, 기저귀\n- 세면도구, 수건\n\n빠진 거 있으면 알려주세요!", likeCount: 128, dislikeCount: 8, viewCount: 2341, daysAgo: 45 },
  // 인기글 O (89-12=77 ≥ 20)
  { category: "birth", title: "자연분만 vs 제왕절개 경험담 공유해요", content: "첫째는 자연분만, 둘째는 제왕절개로 출산했어요. 둘 다 경험해보니 각각 장단점이 있더라고요. 자연분만은 회복이 빠르고, 제왕은 출산 과정이 짧지만 회복이 좀 걸려요.", likeCount: 89, dislikeCount: 12, viewCount: 1567, daysAgo: 30 },
  // 인기글 X (15-1=14 < 20)
  { category: "birth", title: "무통분만 후기입니다", content: "무통 맞고 출산했는데 정말 다른 세상이더라고요. 진통 없이 출산할 수 있다니... 물론 사람마다 효과가 다르다고 하지만 저는 강추합니다.", likeCount: 15, dislikeCount: 1, viewCount: 834, daysAgo: 5 },

  // 산후조리
  // 인기글 O (73-6=67 ≥ 20)
  { category: "postpartum", title: "산후조리원 선택 기준이 뭐였나요?", content: "출산 예정일이 다가오는데 산후조리원 고르기가 너무 어렵네요. 가격, 위치, 시설, 식사... 다들 어떤 기준으로 선택하셨어요?", likeCount: 73, dislikeCount: 6, viewCount: 1123, daysAgo: 20 },
  // 인기글 X (10-3=7 < 20)
  { category: "postpartum", title: "산후조리 집에서 하시는 분 계신가요?", content: "산후조리원 비용이 부담되서 집에서 하려고 하는데 가능할까요? 친정엄마가 와주신다고 하시긴 하는데 걱정이 돼요.", likeCount: 10, dislikeCount: 3, viewCount: 567, daysAgo: 2 },
  // 인기글 O (95-7=88 ≥ 20)
  { category: "postpartum", title: "산후우울증 겪고 계신 분 있으신가요", content: "출산 후 한 달 됐는데 자꾸 눈물이 나고 우울해요. 아기는 예쁜데 왜 이러는지 모르겠어요. 혹시 비슷한 경험 있으신 분 조언 부탁드려요.", likeCount: 95, dislikeCount: 7, viewCount: 1890, daysAgo: 14 },

  // 육아
  // 인기글 O (52-4=48 ≥ 20)
  { category: "parenting", title: "수면교육 언제 시작하셨나요?", content: "100일 지났는데 아직 밤에 3번은 깨요. 수면교육 시작하려는데 너무 울까봐 걱정이네요. 다들 언제쯤 시작하셨어요?", likeCount: 52, dislikeCount: 4, viewCount: 743, daysAgo: 18 },
  // 인기글 X (8-1=7 < 20)
  { category: "parenting", title: "신생아 목욕 매일 시키시나요?", content: "소아과에서는 격일로 해도 된다는데 시어머니는 매일 시켜야 한다고 하시네요. 다들 어떻게 하시나요?", likeCount: 8, dislikeCount: 1, viewCount: 456, daysAgo: 4 },
  // 인기글 O (64-2=62 ≥ 20)
  { category: "parenting", title: "100일 사진 셀프로 찍는 팁", content: "스튜디오 비용이 부담되서 집에서 셀프로 찍으려고 해요. 배경지랑 소품 추천해주세요! 조명은 자연광이 제일 좋다고 하더라고요.", likeCount: 64, dislikeCount: 2, viewCount: 987, daysAgo: 10 },
  // 인기글 X (6-0=6 < 20)
  { category: "parenting", title: "아기 열 38도인데 응급실 가야하나요?", content: "6개월 아기인데 갑자기 열이 38도까지 올랐어요. 해열제 먹였는데 안 떨어지면 응급실 가야할까요? 너무 걱정돼요 ㅠㅠ", likeCount: 6, dislikeCount: 0, viewCount: 534, daysAgo: 0 },
  // 인기글 O (112-9=103 ≥ 20)
  { category: "parenting", title: "육아 번아웃 올 때 어떻게 하세요?", content: "하루 종일 아기랑 둘이 있으니까 미칠 것 같아요. 남편은 야근이 많고... 다들 번아웃 올 때 어떻게 극복하시나요?", likeCount: 112, dislikeCount: 9, viewCount: 2156, daysAgo: 35 },

  // 수유/이유식
  // 인기글 O (87-5=82 ≥ 20)
  { category: "feeding", title: "이유식 초기 쌀미음 만드는 꿀팁", content: "처음 이유식 시작하시는 분들 참고하세요! 쌀미음 만들 때 불린 쌀을 믹서에 곱게 갈고, 물 비율은 쌀 1: 물 10으로 시작하면 좋아요. 체에 꼭 걸러주세요!", likeCount: 87, dislikeCount: 5, viewCount: 1432, daysAgo: 22 },
  // 인기글 X (14-2=12 < 20)
  { category: "feeding", title: "분유에서 우유로 전환 시기", content: "12개월 됐는데 분유 끊고 우유로 바꿔야 하나요? 아직 분유를 잘 먹어서 고민이에요. 전환 시기랑 방법 알려주세요.", likeCount: 14, dislikeCount: 2, viewCount: 567, daysAgo: 6 },
  // 인기글 경계 (25-5=20 = 20, 딱 맞음)
  { category: "feeding", title: "모유수유 중 유선염 걸렸어요 ㅠ", content: "갑자기 가슴이 딱딱해지고 열이 나기 시작했어요. 유선염인 것 같은데 병원 가기 전에 할 수 있는 응급처치가 있을까요?", likeCount: 25, dislikeCount: 5, viewCount: 678, daysAgo: 8 },

  // 뷰티/다이어트
  // 인기글 O (58-3=55 ≥ 20)
  { category: "beauty", title: "산후 다이어트 언제부터 시작하셨어요?", content: "출산 후 3개월 됐는데 임신 전 체중으로 돌아갈 수 있을까요? 모유수유 중이라 무리한 다이어트는 안 될 것 같고... 다들 언제부터 시작하셨어요?", likeCount: 58, dislikeCount: 3, viewCount: 890, daysAgo: 15 },
  // 인기글 X (19-18=1 < 20, 좋아요 많지만 싫어요도 많음)
  { category: "beauty", title: "임산부 스킨케어 추천해주세요", content: "임신하고 나서 피부가 완전 달라졌어요. 트러블도 나고 건조하기도 하고... 임산부용 스킨케어 제품 추천 부탁드려요!", likeCount: 19, dislikeCount: 18, viewCount: 623, daysAgo: 7 },
  // 인기글 X (5-0=5 < 20)
  { category: "beauty", title: "튼살크림 효과 있는 거 있나요?", content: "배가 커지면서 튼살이 생기기 시작했어요. 튼살크림 발라도 소용없다는 분도 있고, 효과 봤다는 분도 있고... 실제로 효과 본 제품 있으면 추천해주세요.", likeCount: 5, dislikeCount: 0, viewCount: 512, daysAgo: 1 },

  // 자유게시판
  // 인기글 O (156-11=145 ≥ 20)
  { category: "free", title: "육아하면서 제일 뿌듯했던 순간", content: "아기가 처음으로 '엄마' 했을 때 눈물 나더라고요 ㅠㅠ 다들 제일 뿌듯했던 순간이 언제인가요? 힘들지만 이런 순간들이 있어서 버티는 것 같아요.", likeCount: 156, dislikeCount: 11, viewCount: 3241, daysAgo: 40 },
  // 인기글 O (203-15=188 ≥ 20)
  { category: "free", title: "남편한테 바라는 것 딱 하나", content: "퇴근하고 와서 '오늘 힘들었지?' 이 한마디만 해줘도 힘이 날 것 같은데... 다들 남편분들 육아 참여 어떠세요?", likeCount: 203, dislikeCount: 15, viewCount: 4521, daysAgo: 60 },
  // 인기글 O (178-20=158 ≥ 20)
  { category: "free", title: "워킹맘 vs 전업맘 어떤 게 더 힘든가요", content: "전 전업맘인데 워킹맘 친구는 전업이 부럽다고 하고, 전 워킹맘이 부럽고... 결국 엄마는 다 힘든 거 아닐까요?", likeCount: 178, dislikeCount: 20, viewCount: 3890, daysAgo: 50 },
  // 인기글 X (9-1=8 < 20)
  { category: "free", title: "요즘 아기 이름 트렌드가 뭔가요?", content: "둘째 이름 짓고 있는데 요즘 유행하는 이름이 뭔지 궁금해요. 첫째 때는 한글 이름으로 지었는데 둘째도 한글로 할지 고민 중이에요.", likeCount: 9, dislikeCount: 1, viewCount: 789, daysAgo: 2 },
];

const productTypes = [
  { name: "카시트", slug: "carseat", sortOrder: 1 },
  { name: "유모차", slug: "stroller", sortOrder: 2 },
  { name: "아기침대", slug: "crib", sortOrder: 3 },
  { name: "젖병", slug: "bottle", sortOrder: 4 },
  { name: "젖병소독기", slug: "sterilizer", sortOrder: 5 },
  { name: "분유쉐이커", slug: "formula-shaker", sortOrder: 6 },
  { name: "아기비데", slug: "baby-bidet", sortOrder: 7 },
  { name: "기저귀 갈이대", slug: "changing-table", sortOrder: 8 },
  { name: "기저귀", slug: "diaper", sortOrder: 9 },
];

const productBrands: Record<string, string[]> = {
  carseat: ["사이벡스", "맥시코시", "다이치", "순성"],
  stroller: ["부가부", "스토케", "잉글레시나", "실버크로스"],
  crib: ["스토케", "이케아", "그라코", "치코"],
  bottle: ["닥터브라운", "아벤트", "헤겐", "보네스"],
  sterilizer: ["유팡", "파세코", "필립스아벤트", "코멧"],
  "formula-shaker": ["베이비브레짜", "버니", "톰티피", "하겐"],
  "baby-bidet": ["노비타", "룰루비데", "크린비데", "위닉스"],
  "changing-table": ["이케아", "스토케", "팔랑", "쁘띠라뺑"],
  diaper: ["하기스", "팸퍼스", "마미포코", "보솜이"],
};

const productSpecFields: Record<string, { name: string; unit?: string }[]> = {
  carseat: [
    { name: "최대허용하중", unit: "kg" },
    { name: "ISOFIX여부" },
    { name: "무게", unit: "kg" },
    { name: "사용연령" },
    { name: "회전여부" },
  ],
  stroller: [
    { name: "무게", unit: "kg" },
    { name: "폴딩방식" },
    { name: "시트높이", unit: "cm" },
    { name: "바퀴크기", unit: "인치" },
    { name: "양대면여부" },
  ],
  crib: [
    { name: "크기", unit: "cm" },
    { name: "높이조절단수" },
    { name: "소재" },
    { name: "범퍼포함여부" },
  ],
  bottle: [
    { name: "용량", unit: "ml" },
    { name: "소재" },
    { name: "꼭지단계" },
    { name: "세척편의성" },
  ],
  sterilizer: [
    { name: "소독방식" },
    { name: "용량", unit: "개" },
    { name: "건조기능" },
    { name: "소독시간", unit: "분" },
  ],
  "formula-shaker": [
    { name: "용량", unit: "ml" },
    { name: "전원방식" },
    { name: "온도조절" },
    { name: "소음" },
  ],
  "baby-bidet": [
    { name: "수압조절" },
    { name: "온수기능" },
    { name: "설치방식" },
    { name: "노즐세척" },
  ],
  "changing-table": [
    { name: "높이", unit: "cm" },
    { name: "접이식여부" },
    { name: "수납공간" },
    { name: "최대하중", unit: "kg" },
  ],
  diaper: [
    { name: "사이즈범위" },
    { name: "매수" },
    { name: "소재" },
    { name: "흡수력등급" },
  ],
};

// [typeSlug, brandName, productName, price, description, specValues (in field order)]
const productData: [string, string, string, number, string, string[]][] = [
  ["carseat", "사이벡스", "시로나 T i-Size", 890000, "360도 회전형 신생아~4세 카시트. ISOFIX 설치로 안전하고 편리합니다.", ["18", "O", "15.4", "신생아~4세", "360도"]],
  ["carseat", "사이벡스", "솔루션 T i-Fix", 450000, "주니어 카시트. 3세~12세까지 사용 가능한 경량 모델.", ["36", "O", "7.2", "3~12세", "X"]],
  ["carseat", "맥시코시", "마이카 360 프로", 750000, "360도 회전 ISOFIX 카시트. 신생아부터 사용 가능.", ["18", "O", "14.5", "신생아~4세", "360도"]],
  ["carseat", "다이치", "원 FIX 360 i", 590000, "국산 회전형 카시트. 가성비 좋은 선택.", ["18", "O", "12.8", "신생아~4세", "360도"]],
  ["carseat", "순성", "듀클 헤로", 320000, "경제적인 가격의 주니어 카시트.", ["36", "O", "6.5", "3~12세", "X"]],
  ["stroller", "부가부", "폭스5", 1690000, "부가부 대표 풀사이즈 유모차. 안정적인 주행감과 넉넉한 수납.", ["9.4", "원터치 폴딩", "52", "12", "O"]],
  ["stroller", "스토케", "익스플로리 X", 1890000, "하이시트 유모차. 아이와 눈높이를 맞출 수 있는 디자인.", ["13.2", "투터치 폴딩", "63", "12", "O"]],
  ["stroller", "잉글레시나", "퀴드2", 490000, "가볍고 컴팩트한 휴대용 유모차.", ["6.9", "원터치 폴딩", "48", "6", "X"]],
  ["stroller", "실버크로스", "리프2", 890000, "영국 프리미엄 유모차. 서스펜션이 뛰어남.", ["10.5", "원터치 폴딩", "55", "10", "O"]],
  ["bottle", "닥터브라운", "옵션즈+ 와이드넥", 15000, "배앓이 방지 특허 내부 환기 시스템.", ["270", "PP", "1~4단계", "보통"]],
  ["bottle", "아벤트", "내추럴 3.0", 14000, "자연스러운 수유감. 넓은 젖꼭지로 모유수유 병행 가능.", ["260", "PP", "1~6단계", "쉬움"]],
  ["bottle", "헤겐", "PCTO", 28000, "혁신적 오프센터 디자인. 세척이 매우 편리.", ["240", "PPSU", "1~4단계", "매우쉬움"]],
  ["diaper", "하기스", "매직컴포트", 35000, "부드러운 착용감과 뛰어난 흡수력.", ["3~8kg (2단계)", "44매", "순면커버", "A+"]],
  ["diaper", "팸퍼스", "베이비드라이", 32000, "최대 12시간 보송함. 새지 않는 3중 흡수층.", ["4~8kg (2단계)", "46매", "코튼소프트", "A"]],
  ["diaper", "마미포코", "에어핏 팬티", 25000, "가성비 좋은 팬티형 기저귀.", ["7~11kg (3단계)", "40매", "통기성시트", "B+"]],
  // 아기침대
  ["crib", "스토케", "슬리피 V3", 1290000, "성장에 맞춰 확장 가능한 프리미엄 아기침대.", ["120x60", "3단", "너도밤나무 원목", "X"]],
  ["crib", "이케아", "스니글라르", 89000, "심플한 디자인의 가성비 아기침대.", ["120x60", "2단", "너도밤나무", "X"]],
  ["crib", "그라코", "솔라노 4in1", 350000, "4단계 변환 가능한 다기능 침대.", ["140x70", "4단", "소나무 원목", "O"]],
  ["crib", "치코", "넥스트투미 매직", 450000, "부모 침대에 밀착 가능한 사이드 오픈형.", ["100x50", "6단", "메시+원목", "O"]],
  // 젖병소독기
  ["sterilizer", "유팡", "젖병소독기 PLUS", 189000, "UV+열풍 건조 방식의 대용량 소독기.", ["UV+열풍", "16", "O", "10"]],
  ["sterilizer", "파세코", "UV소독기", 159000, "99.9% 살균력의 UV-C LED 소독기.", ["UV", "12", "O", "8"]],
  ["sterilizer", "필립스아벤트", "스팀소독기", 79000, "전자레인지 없이 간편한 스팀 소독.", ["스팀", "6", "X", "6"]],
  ["sterilizer", "코멧", "올인원 소독기", 129000, "소독+건조+보관 올인원.", ["UV+스팀", "10", "O", "12"]],
  // 분유쉐이커
  ["formula-shaker", "베이비브레짜", "포뮬라 프로", 290000, "원터치 자동 분유 제조기. 온도 자동 조절.", ["240", "전기", "37~70도", "저소음"]],
  ["formula-shaker", "버니", "쉐이커 미니", 59000, "휴대용 보틀 쉐이커. USB 충전.", ["300", "USB충전", "X", "보통"]],
  ["formula-shaker", "톰티피", "퍼펙트프렙", 250000, "2분만에 체온 분유 완성.", ["200", "전기", "37도 고정", "저소음"]],
  // 아기비데
  ["baby-bidet", "노비타", "베이비케어", 189000, "아기 전용 비데. 부드러운 수압.", ["3단", "O", "변기 장착", "자동"]],
  ["baby-bidet", "룰루비데", "키즈워시", 149000, "이동식 아기 비데. 어디서든 사용.", ["2단", "O", "이동식", "수동"]],
  ["baby-bidet", "크린비데", "베이비", 129000, "컴팩트한 설계의 아기 비데.", ["3단", "X", "변기 장착", "자동"]],
  // 기저귀 갈이대
  ["changing-table", "이케아", "스뇌글", 79000, "벽걸이형 접이식 기저귀 교환대.", ["87", "O", "2칸", "15"]],
  ["changing-table", "스토케", "케어 체인징테이블", 890000, "높이 조절 가능한 프리미엄 갈이대.", ["조절가능", "X", "대형수납", "25"]],
  ["changing-table", "팔랑", "접이식 갈이대", 129000, "간편한 접이식 기저귀 갈이대.", ["95", "O", "하단선반", "15"]],
  ["changing-table", "쁘띠라뺑", "이동형 갈이대", 169000, "바퀴 달린 이동형 갈이대.", ["100", "X", "3단수납", "20"]],
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

  // 관리자 유저 시드
  const adminHashedPassword = await bcrypt.hash(adminUser.password, 10);
  await prisma.user.upsert({
    where: { email: adminUser.email },
    update: { role: "ADMIN", nickname: adminUser.nickname, password: adminHashedPassword },
    create: {
      email: adminUser.email,
      nickname: adminUser.nickname,
      password: adminHashedPassword,
      role: "ADMIN",
    },
  });
  console.log("Admin user seeded (ID: admin)");

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

  // 더미 게시글 시드 (기존 더미 유저의 게시글 삭제 후 재생성)
  const dummyTitles = dummyPosts.map((p) => p.title);
  await prisma.post.deleteMany({ where: { title: { in: dummyTitles } } });

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

    const created = await prisma.post.create({
      data: {
        title: post.title,
        content: post.content,
        authorId,
        categoryId,
        likeCount: post.likeCount,
        dislikeCount: post.dislikeCount,
        viewCount: post.viewCount,
        createdAt: new Date(Date.now() - post.daysAgo * 86400000),
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

  // 육아용품 시드
  for (const pt of productTypes) {
    await prisma.productType.upsert({
      where: { slug: pt.slug },
      update: { name: pt.name, sortOrder: pt.sortOrder },
      create: pt,
    });
  }

  const typeMap = await prisma.productType.findMany();
  const typeSlugToId: Record<string, string> = {};
  for (const t of typeMap) typeSlugToId[t.slug] = t.id;

  for (const [slug, brands] of Object.entries(productBrands)) {
    const typeId = typeSlugToId[slug];
    for (const name of brands) {
      await prisma.productBrand.upsert({
        where: { typeId_name: { typeId, name } },
        update: {},
        create: { name, typeId },
      });
    }
  }

  for (const [slug, fields] of Object.entries(productSpecFields)) {
    const typeId = typeSlugToId[slug];
    for (let i = 0; i < fields.length; i++) {
      const f = fields[i];
      await prisma.productSpecField.upsert({
        where: { typeId_name: { typeId, name: f.name } },
        update: { unit: f.unit ?? null, sortOrder: i },
        create: { name: f.name, unit: f.unit, sortOrder: i, typeId },
      });
    }
  }

  const brandMap = await prisma.productBrand.findMany();
  const brandKey = (typeId: string, name: string) => `${typeId}:${name}`;
  const brandLookup: Record<string, string> = {};
  for (const b of brandMap) brandLookup[brandKey(b.typeId, b.name)] = b.id;

  const specFieldMap = await prisma.productSpecField.findMany({ orderBy: { sortOrder: "asc" } });
  const specFieldsByType: Record<string, typeof specFieldMap> = {};
  for (const sf of specFieldMap) {
    (specFieldsByType[sf.typeId] ??= []).push(sf);
  }

  let productSeedCount = 0;
  for (const [typeSlug, brandName, name, price, description, specValues] of productData) {
    const typeId = typeSlugToId[typeSlug];
    const brandId = brandLookup[brandKey(typeId, brandName)];
    if (!typeId || !brandId) continue;

    const existing = await prisma.product.findFirst({ where: { name, brandId } });
    if (existing) continue;

    const product = await prisma.product.create({
      data: { name, price, description, typeId, brandId },
    });

    const fields = specFieldsByType[typeId] || [];
    for (let i = 0; i < fields.length && i < specValues.length; i++) {
      await prisma.productSpecValue.create({
        data: { value: specValues[i], productId: product.id, fieldId: fields[i].id },
      });
    }
    productSeedCount++;
  }
  console.log(`Products seeded (${productSeedCount})`);

  // 비교 시드 (카시트 2개)
  const carseatType = typeMap.find((t) => t.slug === "carseat");
  if (carseatType) {
    const carseatProducts = await prisma.product.findMany({
      where: { typeId: carseatType.id },
      take: 2,
      orderBy: { createdAt: "asc" },
    });
    if (carseatProducts.length === 2) {
      const [pA, pB] = carseatProducts[0].id < carseatProducts[1].id
        ? [carseatProducts[0], carseatProducts[1]]
        : [carseatProducts[1], carseatProducts[0]];

      await prisma.productComparison.upsert({
        where: { productAId_productBId: { productAId: pA.id, productBId: pB.id } },
        update: {},
        create: {
          productAId: pA.id,
          productBId: pB.id,
          creatorId: userIds[0],
          voteACount: 15,
          voteBCount: 8,
        },
      });
      console.log("Comparison seeded");
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

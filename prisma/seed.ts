// prisma/seed.ts

import { PrismaClient, SettingValueType } from "@prisma/client";

const prisma = new PrismaClient();

const keywordRules = [
  // TOB / MBO
  { keyword: "公開買付け", category: "TOB", score: 6, priority: 100 },
  { keyword: "TOB", category: "TOB", score: 6, priority: 100 },
  { keyword: "MBO", category: "MBO", score: 6, priority: 100 },
  { keyword: "マネジメント・バイアウト", category: "MBO", score: 6, priority: 100 },

  // 業績修正
  { keyword: "上方修正", category: "上方修正", score: 5, priority: 90 },
  { keyword: "下方修正", category: "下方修正", score: -5, priority: 90 },
  { keyword: "業績予想の修正", category: "業績修正要確認", score: 0, priority: 60 },
  { keyword: "通期業績予想", category: "業績修正要確認", score: 0, priority: 60 },

  // 黒字化・赤字リスク
  { keyword: "黒字転換", category: "黒字転換", score: 5, priority: 85 },
  { keyword: "営業利益黒字", category: "黒字転換", score: 5, priority: 85 },
  { keyword: "継続企業の前提", category: "継続企業リスク", score: -6, priority: 85 },
  { keyword: "重要な疑義", category: "継続企業リスク", score: -6, priority: 85 },

  // 受注・契約
  { keyword: "大口受注", category: "大口受注", score: 4, priority: 80 },
  { keyword: "受注", category: "大口受注", score: 4, priority: 80 },
  { keyword: "契約締結", category: "大口受注", score: 4, priority: 80 },

  // 株主還元
  { keyword: "自己株式取得", category: "自社株買い", score: 4, priority: 75 },
  { keyword: "自社株買い", category: "自社株買い", score: 4, priority: 75 },
  { keyword: "増配", category: "増配", score: 3, priority: 70 },
  { keyword: "配当予想の修正", category: "増配", score: 3, priority: 70 },

  // 希薄化・資金調達
  { keyword: "新株予約権", category: "希薄化", score: -4, priority: 70 },
  { keyword: "MSワラント", category: "希薄化", score: -4, priority: 70 },
  { keyword: "希薄化", category: "希薄化", score: -4, priority: 70 },
  { keyword: "第三者割当", category: "第三者割当要確認", score: -1, priority: 45 },

  // 提携・共同開発
  { keyword: "資本提携", category: "資本提携", score: 2, priority: 55 },
  { keyword: "業務提携", category: "業務提携", score: 2, priority: 50 },
  { keyword: "協業", category: "業務提携", score: 2, priority: 50 },
  { keyword: "共同開発", category: "業務提携", score: 2, priority: 50 },
];

const appSettings = [
  {
    settingKey: "default_trading_unit",
    settingValue: "100",
    valueType: SettingValueType.NUMBER,
  },
  {
    settingKey: "default_risk_percent",
    settingValue: "1",
    valueType: SettingValueType.NUMBER,
  },
  {
    settingKey: "max_risk_percent",
    settingValue: "2",
    valueType: SettingValueType.NUMBER,
  },
];

async function seedKeywordRules() {
  for (const rule of keywordRules) {
    await prisma.keywordRule.upsert({
      where: {
        keyword_category: {
          keyword: rule.keyword,
          category: rule.category,
        },
      },
      update: {
        score: rule.score,
        priority: rule.priority,
        isActive: true,
      },
      create: {
        keyword: rule.keyword,
        category: rule.category,
        score: rule.score,
        priority: rule.priority,
        isActive: true,
      },
    });
  }
}

async function seedAppSettings() {
  for (const setting of appSettings) {
    await prisma.appSetting.upsert({
      where: {
        settingKey: setting.settingKey,
      },
      update: {
        settingValue: setting.settingValue,
        valueType: setting.valueType,
      },
      create: {
        settingKey: setting.settingKey,
        settingValue: setting.settingValue,
        valueType: setting.valueType,
      },
    });
  }
}

async function main() {
  console.log("Start seeding...");

  await seedKeywordRules();
  await seedAppSettings();

  console.log("Seeding completed.");
}

main()
  .catch((error) => {
    console.error("Seeding failed.");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

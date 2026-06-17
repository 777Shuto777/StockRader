# 株式材料監視ダッシュボード Codex依頼プロンプト v0.1

## 1. 目的

あなたは、株式材料監視ダッシュボードの実装担当です。

このプロジェクトは、日本株の材料・注目開示・監視リスト・取引計画・検証ログを管理する個人用Webアプリです。

目的は、銘柄を自動で売買判断することではありません。
目的は、材料を整理し、取引前に仮説・損切・利確・最大保有日数・許容リスクを固定し、後から検証できるようにすることです。

このアプリで最も重要なのは、以下の3点です。

```text
出口未定のBUY計画を確定できないこと
```

```text
許容損失から逆算した推奨株数を超えてBUY計画を確定できないこと
```

```text
COMMITTED後に事前計画を書き換えられないこと
```

画面の見た目より、まずこの3つの業務ルールを確実に守ってください。

---

## 2. 技術スタック

以下の技術構成で実装してください。

```text
Next.js App Router
TypeScript
Prisma
Supabase PostgreSQL
Tailwind CSS
shadcn/ui
Vitest
GitHub Actions
```

---

## 3. 参照すべき設計書

実装前に、必ず以下の設計書を確認してください。

```text
docs/requirement.md
docs/databasedesign.md
docs/businessrules.md
docs/apidesign.md
docs/screenmock.md
docs/screendesign.md
docs/directorystructure.md
docs/testdesign.md
docs/testoperation.md
docs/implementationtasks.md
```

特に重要なのは以下です。

```text
docs/businessrules.md
docs/apidesign.md
docs/testdesign.md
docs/testoperation.md
docs/implementationtasks.md
```

設計書と矛盾する実装をしないでください。

---

## 4. 実装の基本方針

## 4.1 画面から先に作らない

実装順は以下を守ってください。

```text
DB
  ↓
Domainロジック
  ↓
Domainテスト
  ↓
API
  ↓
APIテスト
  ↓
画面
  ↓
CI・テスト運用
```

画面を先に作って、後から業務ルールを入れる進め方は禁止です。

---

## 4.2 業務ロジックはAPI Routeに直書きしない

以下の重要ロジックは、必ず `src/lib/domain/` に分離してください。

```text
normalizeStockCode
validateStockCode
generateDisclosureUniqueKey
classifyDisclosureTitle
calculateRiskSizing
validateBuyCommit
validateNoTradeCommit
validateWatchCommit
createLockedPlanHash
assertTradePlanEditable
```

API Routeは薄く保ち、以下の流れにしてください。

```text
Request取得
  ↓
Validatorで入力検証
  ↓
Domainロジック実行
  ↓
Repository経由でDB操作
  ↓
共通レスポンスで返却
```

---

## 4.3 DBアクセスはRepositoryに分離する

PrismaのDB操作は、なるべく `src/lib/repositories/` に分離してください。

対象は以下です。

```text
src/lib/repositories/stocks.ts
src/lib/repositories/disclosures.ts
src/lib/repositories/watchlist.ts
src/lib/repositories/trade-plans.ts
src/lib/repositories/verification-logs.ts
src/lib/repositories/keyword-rules.ts
src/lib/repositories/app-settings.ts
```

---

## 5. 絶対に崩してはいけない業務ルール

以下は、このアプリの中核仕様です。
テストも削除・緩和してはいけません。

```text
BUY計画で損切価格が未入力なら確定できない。
```

```text
BUY計画で利確目標価格が未入力なら確定できない。
```

```text
BUY計画で最大保有日数が未入力なら確定できない。
```

```text
BUY計画で予定株数が推奨株数を超えたら確定できない。
```

```text
BUY計画で推奨株数0なら確定できない。
```

```text
COMMITTED後に損切価格を変更できない。
```

```text
COMMITTED後に予定株数を変更できない。
```

```text
commit時にサーバー側でリスク再計算する。
```

```text
lockedPlanHashを保存する。
```

---

## 6. 最重要実装対象

特に重要なファイルは以下です。

```text
src/lib/domain/risk-sizing.ts
src/lib/domain/trade-plan-validation.ts
src/lib/domain/trade-plan-lock.ts
src/app/api/trade-plans/[id]/commit/route.ts
src/app/(dashboard)/trade-plans/[id]/page.tsx
```

この5つが正しく実装されていれば、MVPとしての中核価値は成立します。

---

## 7. リスク逆算サイジング仕様

`calculateRiskSizing` は、以下の式で実装してください。

```text
plannedRiskAmount = accountSizeSnapshot × riskPercent ÷ 100
plannedLossPerShare = plannedEntryPrice − plannedStopPrice
rawQuantity = plannedRiskAmount ÷ plannedLossPerShare
recommendedQuantity = floor(rawQuantity ÷ tradingUnit) × tradingUnit
```

必須ルール：

```text
plannedEntryPrice > 0
plannedStopPrice > 0
plannedStopPrice < plannedEntryPrice
accountSizeSnapshot > 0
riskPercent > 0
tradingUnit > 0
```

推奨株数が0の場合は、BUY計画を確定不可にしてください。

---

## 8. TradePlan commit API の最重要仕様

`POST /api/trade-plans/[id]/commit` は、このアプリで最も重要なAPIです。

必ず以下を実装してください。

```text
対象の取引計画を取得する
```

```text
DRAFT以外はcommit不可にする
```

```text
planTypeごとに確定条件を検証する
```

```text
BUYの場合は、サーバー側でリスク逆算サイジングを必ず再計算する
```

```text
recommendedQuantity = 0 の場合は確定不可にする
```

```text
plannedQuantity > recommendedQuantity の場合は確定不可にする
```

```text
plannedQuantity が tradingUnit の倍数でない場合は確定不可にする
```

```text
COMMITTEDに更新する
```

```text
isLocked = true にする
```

```text
lockedAt を保存する
```

```text
lockedPlanHash を保存する
```

---

## 9. ロック仕様

COMMITTED後は、以下の事前計画項目を編集不可にしてください。

```text
stockCode
stockNameSnapshot
disclosureId
watchlistId
planType
thesis
noTradeReason
plannedEntryPrice
plannedStopPrice
plannedTakeProfitPrice
maxHoldingDays
accountSizeSnapshot
riskPercent
plannedRiskAmount
plannedLossPerShare
tradingUnit
recommendedQuantity
plannedQuantity
```

COMMITTED後も更新可能な項目は以下です。

```text
planStatus
actualEntryPrice
actualQuantity
executedAt
closedAt
```

`PATCH /api/trade-plans/[id]` では、ロック対象項目を更新しようとした場合、`423 LOCKED` を返してください。

---

## 10. 実装フェーズ

`docs/implementation-tasks.md` に従って、以下の順に進めてください。

```text
Phase 0: プロジェクト初期化・基礎設定
Phase 1: Prisma schema / seed / DB基盤
Phase 2: Domainロジック + Unit Test
Phase 3: API共通基盤 + Repository
Phase 4: API実装 + API Test
Phase 5: 画面共通レイアウト・共通UI
Phase 6: 各画面実装
Phase 7: テスト運用・CI・成果物保存
Phase 8: 受入確認・README整備
```

一括ですべてを雑に実装しないでください。
Phaseごとに完了条件を満たし、テストを実行してください。

---

## 11. 今回の実装依頼範囲

今回の依頼では、まず以下を実装してください。

```text
Phase 0: プロジェクト初期化・基礎設定
Phase 1: Prisma schema / seed / DB基盤
Phase 2: Domainロジック + Unit Test
```

つまり、最初の実装対象は以下です。

```text
package.json
tsconfig.json
next.config.ts
.env.example
.gitignore

prisma/schema.prisma
prisma/seed.ts

src/lib/prisma.ts
src/lib/env.ts
src/lib/constants.ts

src/lib/domain/stock-code.ts
src/lib/domain/disclosure-unique-key.ts
src/lib/domain/disclosure-classifier.ts
src/lib/domain/risk-sizing.ts
src/lib/domain/trade-plan-validation.ts
src/lib/domain/trade-plan-lock.ts
src/lib/domain/settings.ts
src/lib/domain/date-time.ts

tests/domain/stock-code.test.ts
tests/domain/disclosure-unique-key.test.ts
tests/domain/disclosure-classifier.test.ts
tests/domain/risk-sizing.test.ts
tests/domain/trade-plan-validation.test.ts
tests/domain/trade-plan-lock.test.ts
tests/domain/settings.test.ts
```

API Routeと画面は、今回の依頼ではまだ実装しなくてよいです。

---

## 12. Prisma schema 実装対象

`prisma/schema.prisma` には、以下を実装してください。

### Models

```text
Stock
Disclosure
WatchlistItem
TradePlan
VerificationLog
KeywordRule
AppSetting
```

### Enums

```text
WatchStatus
PlanType
PlanStatus
FollowedPlan
SettingValueType
```

DBテーブル・カラムは snake_case にしてください。
Prisma側のfieldは camelCase で構いません。
`@@map` / `@map` を適切に使ってください。

---

## 13. seed.ts 実装対象

`prisma/seed.ts` では、以下を投入してください。

```text
keyword_rules
app_settings
```

重要方針：

```text
deleteManyで全削除しない
```

```text
upsertで何度実行しても安全にする
```

```text
サンプル取引データや実取引データは投入しない
```

---

## 14. Domainテストの最重要項目

以下のテストは必ず実装してください。

```text
risk-sizing.test.ts
trade-plan-validation.test.ts
trade-plan-lock.test.ts
```

特に以下は削除・緩和禁止です。

```text
BUY計画で損切価格が未入力なら確定できない
```

```text
BUY計画で利確目標価格が未入力なら確定できない
```

```text
BUY計画で最大保有日数が未入力なら確定できない
```

```text
予定株数が推奨株数を超えたら確定できない
```

```text
推奨株数0なら確定できない
```

```text
COMMITTED後に損切価格を変更できない
```

```text
COMMITTED後に予定株数を変更できない
```

---

## 15. テスト実行ルール

実装後、必ず以下を実行してください。

```bash
npx prisma validate
npx prisma generate
npm run typecheck
npm run lint
npm run test:run
```

可能であれば以下も実行してください。

```bash
npm run build
```

---

## 16. テスト結果の保存

テスト結果は、チャット上の報告だけで終わらせないでください。

以下に成果物として保存してください。

```text
docs/test-runs/YYYYMMDD-HHMM-test-run.md
artifacts/test-results/latest/summary.md
```

必要に応じて、以下にもコマンド結果を保存してください。

```text
artifacts/test-results/latest/prisma-validate.txt
artifacts/test-results/latest/prisma-generate.txt
artifacts/test-results/latest/typecheck.txt
artifacts/test-results/latest/lint.txt
artifacts/test-results/latest/unit-test.txt
artifacts/test-results/latest/build.txt
```

---

## 17. テスト失敗時の対応

テストが失敗した場合は、以下を行ってください。

```text
失敗ログを保存する
```

```text
失敗原因を分析する
```

```text
原因仮説を docs/test-runs に記録する
```

```text
修正方針を記録する
```

```text
実装コードを修正する
```

```text
再度テストする
```

修正ループは最大3回まで行ってください。

3回修正しても解決しない場合は、無理に通そうとせず、未解決事項として記録して停止してください。

---

## 18. テスト改変禁止ルール

テストを通すために、以下をしてはいけません。

```text
失敗したテストを削除する
```

```text
期待値を実装結果に合わせて安易に変更する
```

```text
重要テストに skip / todo を付ける
```

```text
BUY計画確定条件を緩める
```

```text
サイズ超過ブロックを外す
```

```text
ロック後編集不可制御を外す
```

```text
サーバー側再計算を省略する
```

```text
失敗ログを残さずに修正する
```

---

## 19. 今回作らないもの

今回の依頼では、以下は作らないでください。

```text
API Route
画面コンポーネント
外部株価取得
適時開示自動取得
AI要約
自動売買
証券会社API連携
複数ユーザー認証
deviation_events
税・手数料計算
本格損益管理
スマホ最適化
```

---

## 20. 作業完了条件

以下を満たしたら、作業完了としてください。

```text
Phase 0〜2の対象ファイルが作成・更新されている
```

```text
schema.prisma が validate / generate に成功している
```

```text
seed.ts が設計通り upsert で実装されている
```

```text
Domainロジックが src/lib/domain に分離されている
```

```text
Domainテストが tests/domain に実装されている
```

```text
npm run typecheck が成功している
```

```text
npm run lint が成功している
```

```text
npm run test:run が成功している
```

```text
テスト結果が docs/test-runs に記録されている
```

```text
最新テスト結果が artifacts/test-results/latest/summary.md に記録されている
```

```text
未解決事項がある場合は明示されている
```

---

## 21. 作業完了報告フォーマット

作業完了時は、以下の形式で報告してください。

```markdown
## 実装完了報告

### 実装範囲

- Phase 0:
- Phase 1:
- Phase 2:

### 作成・更新した主なファイル

- 

### 実行したテスト

| コマンド | 結果 |
|---|---|
| npx prisma validate | PASS / FAIL |
| npx prisma generate | PASS / FAIL |
| npm run typecheck | PASS / FAIL |
| npm run lint | PASS / FAIL |
| npm run test:run | PASS / FAIL |
| npm run build | PASS / FAIL / SKIP |

### テスト結果成果物

- docs/test-runs/YYYYMMDD-HHMM-test-run.md
- artifacts/test-results/latest/summary.md

### 修正ループ

- なし
- または 1回 / 2回 / 3回

### 未解決事項

- なし
```

---

## 22. 最重要メッセージ

この実装で最も重要なのは、以下です。

```text
画面を急いで作ることではなく、BUY計画のリスク管理ルールをDomainロジックとテストで固定すること。
```

```text
Codexは、テスト失敗を隠さず、失敗原因・修正内容・再実行結果を成果物として残すこと。
```

```text
テストを通すために、業務ルールを弱めてはいけないこと。
```

以上に従って、まず Phase 0〜2 を実装してください。

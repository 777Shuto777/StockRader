# 株式材料監視ダッシュボード 実装タスク分解書 v0.1.1

## 1. ドキュメント情報

| 項目         | 内容                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------- |
| ドキュメント名    | 株式材料監視ダッシュボード 実装タスク分解書                                                                                              |
| バージョン      | 0.1.1                                                                                                               |
| 対応要件定義     | 株式材料監視ダッシュボード v0.1.3                                                                                                |
| 対応DB設計     | DB設計書 v0.1                                                                                                          |
| 対応業務ルール    | 業務ルール設計書 v0.1                                                                                                       |
| 対応API設計    | API設計書 v0.1                                                                                                         |
| 対応画面設計     | 画面設計書 v0.1                                                                                                          |
| 対応テスト計画    | テスト計画書 v0.1.1                                                                                                       |
| 対応テスト運用    | テスト運用設計書 v0.1                                                                                                       |
| 対応ディレクトリ構成 | ディレクトリ構成案 v0.1.1 完全版                                                                                                |
| 技術構成       | Next.js App Router / TypeScript / Prisma / Supabase PostgreSQL / Tailwind CSS / shadcn/ui / Vitest / GitHub Actions |
| 目的         | Codexへ実装依頼するために、実装タスクを安全な順序で分解する                                                                                    |

---

## 2. v0.1.1での変更点

v0.1から以下を変更する。

| 変更点             | 内容                                      |
| --------------- | --------------------------------------- |
| 設計書ファイル配置タスクを除外 | この会話内で設計書作成・配置対象は整理済みのため、実装タスクから外す      |
| Phase 0を整理      | プロジェクト初期化、ディレクトリ作成、package scripts整備に絞る |
| テスト運用を維持        | Codexのテスト実行・ログ保存・修正ループは引き続き必須           |
| 実装順を明確化         | DomainロジックとテストをAPI・画面より先に実装する           |

---

## 3. 実装方針

## 3.1 最重要方針

本アプリの価値は、画面の見た目ではなく以下にある。

```text
出口未定のBUY計画を確定できないこと
```

```text
許容損失から逆算した推奨株数を超えて確定できないこと
```

```text
COMMITTED後に事前計画を書き換えられないこと
```

そのため、実装順は以下を優先する。

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

画面から先に作らない。

---

## 3.2 Codexへの基本ルール

Codexは、各タスク完了時に以下を実行する。

```bash
npm run typecheck
npm run lint
npm run test:run
```

Prisma関連を変更した場合は、以下も実行する。

```bash
npx prisma validate
npx prisma generate
```

作業完了時は、テスト結果を以下に保存する。

```text
docs/test-runs/YYYYMMDD-HHMM-test-run.md
artifacts/test-results/latest/summary.md
```

テスト失敗時は、失敗ログ・原因仮説・修正内容・再実行結果を記録する。

---

# 4. 実装フェーズ一覧

|   Phase | 内容                          | 優先度 |
| ------: | --------------------------- | --: |
| Phase 0 | プロジェクト初期化・基礎設定              | 最重要 |
| Phase 1 | Prisma schema / seed / DB基盤 | 最重要 |
| Phase 2 | Domainロジック + Unit Test      | 最重要 |
| Phase 3 | API共通基盤 + Repository        |   高 |
| Phase 4 | API実装 + API Test            |   高 |
| Phase 5 | 画面共通レイアウト・共通UI              |   中 |
| Phase 6 | 各画面実装                       |   中 |
| Phase 7 | テスト運用・CI・成果物保存              |   高 |
| Phase 8 | 受入確認・README整備               |   中 |

---

# 5. Phase 0：プロジェクト初期化・基礎設定

## T0-01 Next.jsプロジェクト作成

### 内容

Next.js App Router + TypeScript のプロジェクトを作成する。

### 作成・確認対象

```text
package.json
tsconfig.json
next.config.ts
src/app/layout.tsx
src/app/page.tsx
src/app/globals.css
```

### 完了条件

* Next.jsが起動できる
* TypeScriptが有効
* App Router構成になっている

### 実行コマンド

```bash
npm run dev
npm run typecheck
```

---

## T0-02 基本ディレクトリ作成

### 内容

ディレクトリ構成案 v0.1.1 に従って、必要なディレクトリを作成する。

### 作成対象

```text
.github/workflows/
docs/test-runs/
artifacts/test-results/latest/
prisma/
src/app/
src/components/
src/lib/
src/types/
tests/domain/
tests/api/
tests/e2e/
```

### 完了条件

* ディレクトリ構成が `directory-structure.md` と一致している
* 空ディレクトリには `.gitkeep` を配置している
* `docs/` 配下の設計書ファイル配置は既存成果物として扱い、実装タスクには含めない

---

## T0-03 package.json scripts整備

### 内容

開発・検証用scriptを追加する。

### 必須scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "typecheck": "tsc --noEmit",
  "test": "vitest",
  "test:watch": "vitest --watch",
  "test:run": "vitest run",
  "prisma:validate": "prisma validate",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev",
  "prisma:studio": "prisma studio",
  "db:seed": "prisma db seed",
  "verify": "npm run typecheck && npm run lint && npm run test:run",
  "verify:prisma": "npm run prisma:validate && npm run prisma:generate",
  "verify:all": "npm run verify:prisma && npm run typecheck && npm run lint && npm run test:run && npm run build"
}
```

### 完了条件

* `npm run typecheck` が実行できる
* `npm run lint` が実行できる
* `npm run test:run` が実行できる
* `npm run verify:all` が実行できる

---

# 6. Phase 1：Prisma / DB基盤

## T1-01 Prisma導入

### 内容

Prismaを導入し、PostgreSQL接続を設定する。

### 作成対象

```text
prisma/schema.prisma
src/lib/prisma.ts
.env.example
```

### 完了条件

* `npx prisma validate` が成功する
* `npx prisma generate` が成功する
* PrismaClientをアプリ側から利用できる

---

## T1-02 schema.prisma実装

### 内容

DB設計書 v0.1 に従って `schema.prisma` を実装する。

### 実装対象モデル

```text
Stock
Disclosure
WatchlistItem
TradePlan
VerificationLog
KeywordRule
AppSetting
```

### 実装対象Enum

```text
WatchStatus
PlanType
PlanStatus
FollowedPlan
SettingValueType
```

### 完了条件

* Prisma schemaがDB設計書と一致している
* `@@map` / `@map` によりDBテーブル・カラム名がsnake_caseになっている
* Decimal型が適切に使われている
* Relationが正しく設定されている

### 実行コマンド

```bash
npx prisma validate
npx prisma generate
```

---

## T1-03 seed.ts実装

### 内容

初期データ投入用の `seed.ts` を実装する。

### 投入対象

```text
keyword_rules
app_settings
```

### 重要方針

* `deleteMany` で全削除しない
* `upsert` を使う
* 何度実行しても安全にする
* 実取引データやサンプル取引データは投入しない

### 完了条件

* `keyword_rules` が投入される
* `app_settings` が投入される
* 何度実行しても重複登録されない

---

## T1-04 環境変数整備

### 内容

`.env.example` を作成する。

### 内容

```env
DATABASE_URL=""
DIRECT_URL=""

NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""

APP_BASIC_AUTH_USER=""
APP_BASIC_AUTH_PASSWORD=""
```

### 完了条件

* `.env` はGit管理されない
* `.env.example` のみGit管理される

---

# 7. Phase 2：Domainロジック + Unit Test

## T2-01 銘柄コードDomain実装

### 対象

```text
src/lib/domain/stock-code.ts
tests/domain/stock-code.test.ts
```

### 実装関数

```text
normalizeStockCode
validateStockCode
```

### テスト観点

* 前後空白除去
* 英字大文字化
* 4〜5文字半角英数字
* 全角不可
* 記号不可
* 空文字不可

### 完了条件

* `stock-code.test.ts` が成功する

---

## T2-02 開示重複キーDomain実装

### 対象

```text
src/lib/domain/disclosure-unique-key.ts
tests/domain/disclosure-unique-key.test.ts
```

### 実装関数

```text
generateDisclosureUniqueKey
```

### テスト観点

* 同じ日時・銘柄・タイトル・URLなら同じキー
* URL違いなら別キー
* URLなしでもキー生成可能
* 銘柄コード正規化後に同じキーになる

### 完了条件

* `disclosure-unique-key.test.ts` が成功する

---

## T2-03 キーワード分類Domain実装

### 対象

```text
src/lib/domain/disclosure-classifier.ts
tests/domain/disclosure-classifier.test.ts
```

### 実装関数

```text
classifyDisclosureTitle
```

### 実装ルール

* titleのみ対象
* 部分一致
* 大文字小文字を区別しない
* 複数ヒット時は全カテゴリ保持
* 主カテゴリは優先度最大
* 同優先度ならスコア絶対値が大きいもの
* さらに同順位ならキーワード文字数が長いもの

### 完了条件

* 大口受注、上方修正、下方修正、希薄化、TOB等が分類できる
* 複数ヒット時に主カテゴリが正しく決まる
* `disclosure-classifier.test.ts` が成功する

---

## T2-04 リスク逆算サイジングDomain実装

### 対象

```text
src/lib/domain/risk-sizing.ts
tests/domain/risk-sizing.test.ts
```

### 実装関数

```text
calculateRiskSizing
```

### 計算式

```text
plannedRiskAmount = accountSizeSnapshot × riskPercent ÷ 100
plannedLossPerShare = plannedEntryPrice − plannedStopPrice
rawQuantity = plannedRiskAmount ÷ plannedLossPerShare
recommendedQuantity = floor(rawQuantity ÷ tradingUnit) × tradingUnit
```

### 必須テスト

* 口座資産300,000円、リスク1%、Entry126、Stop115、単位100 → 推奨株数200
* Stop >= Entry はエラー
* 推奨株数0なら `isTradable = false`

### 完了条件

* `risk-sizing.test.ts` が成功する
* 金額計算で不自然な丸めが起きない

---

## T2-05 取引計画確定バリデーション実装

### 対象

```text
src/lib/domain/trade-plan-validation.ts
tests/domain/trade-plan-validation.test.ts
```

### 実装関数

```text
validateBuyCommit
validateNoTradeCommit
validateWatchCommit
```

### BUY必須条件

* 仮説あり
* エントリー予定価格あり
* 損切価格あり
* 利確目標価格あり
* 最大保有日数あり
* 口座資産あり
* 許容リスク%あり
* 推奨株数が1単元以上
* 予定株数が推奨株数以下
* 予定株数が取引単位の倍数

### 削除・緩和禁止テスト

* 損切未入力なら確定不可
* 利確未入力なら確定不可
* 最大保有日数未入力なら確定不可
* 予定株数 > 推奨株数なら確定不可
* 推奨株数0なら確定不可

### 完了条件

* `trade-plan-validation.test.ts` が成功する

---

## T2-06 取引計画ロックDomain実装

### 対象

```text
src/lib/domain/trade-plan-lock.ts
tests/domain/trade-plan-lock.test.ts
```

### 実装関数

```text
createLockedPlanHash
assertTradePlanEditable
getLockedFields
```

### 実装ルール

COMMITTED後は以下を編集不可にする。

* `stockCode`
* `stockNameSnapshot`
* `disclosureId`
* `watchlistId`
* `planType`
* `thesis`
* `noTradeReason`
* `plannedEntryPrice`
* `plannedStopPrice`
* `plannedTakeProfitPrice`
* `maxHoldingDays`
* `accountSizeSnapshot`
* `riskPercent`
* `plannedRiskAmount`
* `plannedLossPerShare`
* `tradingUnit`
* `recommendedQuantity`
* `plannedQuantity`

### 編集可能

* `planStatus`
* `actualEntryPrice`
* `actualQuantity`
* `executedAt`
* `closedAt`

### 完了条件

* COMMITTED後に損切価格を変更できない
* COMMITTED後に予定株数を変更できない
* actualEntryPriceは更新できる
* lockedPlanHashが安定して生成される
* `trade-plan-lock.test.ts` が成功する

---

## T2-07 settings Domain実装

### 対象

```text
src/lib/domain/settings.ts
tests/domain/settings.test.ts
```

### 実装内容

* app_settings取得
* デフォルト値フォールバック

### フォールバック値

```text
default_trading_unit = 100
default_risk_percent = 1
max_risk_percent = 2
```

### 完了条件

* 設定未登録時もアプリが動く
* `settings.test.ts` が成功する

---

# 8. Phase 3：API共通基盤 + Repository

## T3-01 共通APIレスポンス実装

### 対象

```text
src/lib/api-response.ts
src/lib/errors.ts
```

### 実装内容

* success response
* error response
* 共通エラークラス
* HTTP status mapping

### 完了条件

* APIレスポンス形式がAPI設計書と一致する

---

## T3-02 validators実装

### 対象

```text
src/lib/validators/
```

### 作成対象

```text
common.ts
disclosure.ts
watchlist.ts
trade-plan.ts
verification-log.ts
```

### 完了条件

* API入力値をzod等で検証できる
* 複雑な業務ルールはdomain側に分離されている

---

## T3-03 repositories実装

### 対象

```text
src/lib/repositories/
```

### 作成対象

```text
stocks.ts
disclosures.ts
watchlist.ts
trade-plans.ts
verification-logs.ts
keyword-rules.ts
app-settings.ts
```

### 完了条件

* API Routeから直接Prismaを大量に書かない
* DB操作がrepositoryにまとまっている

---

# 9. Phase 4：API実装 + API Test

## T4-01 Health API

### API

```text
GET /api/health
```

### 完了条件

* アプリとDB接続確認ができる

---

## T4-02 Stocks API

### API

```text
GET /api/stocks
PATCH /api/stocks/[code]
```

### 完了条件

* 銘柄一覧取得
* 銘柄メモ更新

---

## T4-03 Disclosures API

### API

```text
GET /api/disclosures
POST /api/disclosures
PATCH /api/disclosures/[id]
DELETE /api/disclosures/[id]
```

### 必須処理

* 銘柄コード正規化
* 未登録銘柄ならstocks作成
* uniqueKey生成
* 重複チェック
* キーワード分類
* title更新時は再分類

### テスト

```text
tests/api/disclosures.test.ts
```

### 完了条件

* 注目開示登録ができる
* 重複開示は409
* キーワード分類される

---

## T4-04 Disclosure起点のWatchlist / TradePlan API

### API

```text
POST /api/disclosures/[id]/watchlist
POST /api/disclosures/[id]/trade-plans
```

### 完了条件

* 開示情報を引き継いで監視リスト作成
* 開示情報を引き継いで取引計画DRAFT作成

---

## T4-05 Watchlist API

### API

```text
GET /api/watchlist
POST /api/watchlist
PATCH /api/watchlist/[id]
DELETE /api/watchlist/[id]
POST /api/watchlist/[id]/trade-plans
```

### 完了条件

* 監視リスト登録・更新
* 監視リストからBUY / NO_TRADE / WATCH計画作成
* 関連取引計画がある場合は削除不可

---

## T4-06 TradePlans API

### API

```text
GET /api/trade-plans
POST /api/trade-plans
GET /api/trade-plans/[id]
PATCH /api/trade-plans/[id]
DELETE /api/trade-plans/[id]
POST /api/trade-plans/calculate-risk
```

### 完了条件

* 取引計画一覧取得
* DRAFT作成
* DRAFT更新時にリスク再計算
* DRAFTのみ削除可能
* calculate-riskがDB保存なしで計算できる

---

## T4-07 TradePlan commit API

### API

```text
POST /api/trade-plans/[id]/commit
```

### 最重要処理

* DRAFTのみcommit可能
* planType別にバリデーション
* BUYの場合はサーバー側でリスク再計算
* 推奨株数0なら確定不可
* 予定株数超過なら確定不可
* `isLocked = true`
* `lockedAt` 保存
* `lockedPlanHash` 保存

### テスト

```text
tests/api/trade-plans.test.ts
```

### 完了条件

* 出口未定のBUY計画を確定できない
* サイズ超過のBUY計画を確定できない
* 確定後にロックされる
* lockedPlanHashが保存される

---

## T4-08 TradePlan execute / close API

### API

```text
POST /api/trade-plans/[id]/execute
POST /api/trade-plans/[id]/close
```

### 完了条件

* COMMITTEDからEXECUTEDにできる
* 実績入力必須
* COMMITTED / EXECUTEDからCLOSEDにできる

---

## T4-09 VerificationLogs API

### API

```text
GET /api/verification-logs
POST /api/verification-logs
PATCH /api/verification-logs/[id]
```

### 完了条件

* tradePlanId必須
* stockCode / stockNameSnapshotをtradePlanから引き継ぐ
* followedPlan未指定時はUNKNOWN

---

## T4-10 KeywordRules / AppSettings API

### API

```text
GET /api/keyword-rules
GET /api/app-settings
```

### 完了条件

* seedデータが取得できる
* app_settingsは画面表示用に整形される

---

# 10. Phase 5：共通UI・レイアウト

## T5-01 shadcn/ui導入

### 対象

```text
src/components/ui/
```

### 必要部品

* Button
* Input
* Textarea
* Select
* Dialog
* Table
* Badge
* Alert
* Card
* Form

### 完了条件

* 画面実装に必要なUI部品が揃っている

---

## T5-02 共通レイアウト実装

### 対象

```text
src/components/layout/
src/app/(dashboard)/layout.tsx
```

### 作成対象

```text
AppHeader.tsx
AppSidebar.tsx
DashboardShell.tsx
```

### 完了条件

* Header / Sidebar / Mainの共通レイアウトができる
* 各画面へ遷移できる

---

## T5-03 共通コンポーネント実装

### 対象

```text
src/components/common/
```

### 作成対象

```text
EmptyState.tsx
ErrorAlert.tsx
LoadingState.tsx
PageHeader.tsx
StatusBadge.tsx
```

### 完了条件

* Loading / Empty / Error状態を共通表示できる

---

# 11. Phase 6：画面実装

## T6-01 ホーム画面

### ルート

```text
/
```

### 完了条件

以下を表示できる。

* 未確認開示
* 監視中銘柄
* 確定済み計画
* 要レビュー
* クイック操作

---

## T6-02 注目開示画面

### ルート

```text
/disclosures
```

### 作成対象

```text
DisclosureFormDialog.tsx
DisclosureTable.tsx
DisclosureFilters.tsx
```

### 完了条件

* 注目開示一覧表示
* 注目開示登録
* 確認済み更新
* 監視リスト追加
* 取引計画作成

---

## T6-03 監視リスト画面

### ルート

```text
/watchlist
```

### 作成対象

```text
WatchlistFormDialog.tsx
WatchlistTable.tsx
CreateTradePlanDialog.tsx
```

### 完了条件

* 監視リスト一覧表示
* 監視銘柄追加
* ステータス更新
* BUY / NO_TRADE / WATCH計画作成

---

## T6-04 取引計画一覧画面

### ルート

```text
/trade-plans
```

### 作成対象

```text
TradePlanTable.tsx
TradePlanFilters.tsx
```

### 完了条件

* 取引計画一覧表示
* DRAFT / COMMITTED / EXECUTED / CLOSED表示
* BUY計画の損切・利確・推奨株数・予定株数表示
* 詳細画面へ遷移

---

## T6-05 取引計画詳細画面

### ルート

```text
/trade-plans/[id]
```

### 作成対象

```text
BuyPlanForm.tsx
NoTradePlanForm.tsx
WatchPlanForm.tsx
RiskSizingCard.tsx
LockedPlanAlert.tsx
ExecutePlanForm.tsx
```

### 最重要完了条件

* BUY / DRAFTで出口条件を入力できる
* リスク計算結果を表示できる
* 推奨株数0なら警告
* 予定株数超過なら警告
* 条件未達なら確定ボタン無効
* COMMITTED後は事前計画を編集フォームとして表示しない
* ロックAlertを表示する
* 実行情報を入力できる
* 検証ログへ進める

---

## T6-06 検証ログ画面

### ルート

```text
/logs
```

### 作成対象

```text
VerificationLogDialog.tsx
VerificationLogTable.tsx
VerificationLogFilters.tsx
```

### 完了条件

* 検証ログ一覧表示
* 検証ログ作成
* followedPlan表示
* deviationSummary表示
* 次回ルールを記録できる

---

## T6-07 設定画面

### ルート

```text
/settings
```

### 作成対象

```text
AppSettingsCard.tsx
KeywordRulesTable.tsx
```

### 完了条件

* app_settings表示
* keyword_rules表示
* v0.1では編集不要

---

# 12. Phase 7：テスト運用・CI

## T7-01 テスト結果保存ディレクトリ作成

### 作成対象

```text
docs/test-runs/.gitkeep
artifacts/test-results/latest/.gitkeep
artifacts/test-results/latest/summary.md
```

### 完了条件

* Codexがテスト結果を保存できる

---

## T7-02 テスト実行結果テンプレート作成

### 作成対象

```text
docs/test-runs/YYYYMMDD-HHMM-test-run.md
artifacts/test-results/latest/summary.md
```

### 完了条件

* テスト成功/失敗を記録できる
* 原因仮説・修正内容・再実行結果を記録できる

---

## T7-03 GitHub Actions CI作成

### 作成対象

```text
.github/workflows/ci.yml
```

### 実行内容

```bash
npm ci
npx prisma generate
npm run typecheck
npm run lint
npm run test:run
npm run build
```

### 完了条件

* push / pull_requestでCIが動く

---

## T7-04 .gitignore更新

### 内容

* `.env` を除外
* `.next/` を除外
* `coverage/` を除外
* `artifacts/test-results/latest/*.txt` を除外
* `summary.md` と `.gitkeep` は管理対象

### 完了条件

* 機密情報がGit管理されない
* テストsummaryは残る

---

# 13. Phase 8：受入確認・README

## T8-01 README作成

### 内容

以下をREADMEに記載する。

* アプリ概要
* 技術構成
* セットアップ手順
* 環境変数
* Prisma migration
* seed実行
* テスト実行
* Codexテスト運用方針

### 完了条件

* READMEだけでローカル起動手順が分かる

---

## T8-02 受入確認

### 必須確認

* 注目開示登録できる
* 監視リスト追加できる
* BUY計画作成できる
* 損切未入力では確定できない
* 予定株数超過では確定できない
* BUY計画を確定するとロックされる
* COMMITTED後に損切価格を変更できない
* 検証ログを書ける
* `npm run verify:all` が成功する

---

# 14. Codexへの推奨実装順

Codexには、以下の順で依頼する。

```text
1. プロジェクト初期化・ディレクトリ作成
2. Prisma schema / seed
3. Domainロジック + Unit Test
4. API共通基盤
5. Repository
6. API実装 + API Test
7. 共通UI・レイアウト
8. 各画面実装
9. テスト運用成果物
10. GitHub Actions
11. README
12. 最終受入確認
```

---

# 15. Codexへの作業単位

Codexへ一括で全部投げるのではなく、以下の単位で依頼する。

## 15.1 第1依頼

```text
プロジェクト初期化、ディレクトリ作成、Prisma schema、seed.tsを作成してください。
```

### 成果物

* ディレクトリ
* `schema.prisma`
* `seed.ts`
* `.env.example`
* `src/lib/prisma.ts`
* `package.json scripts`

### テスト

```bash
npx prisma validate
npx prisma generate
npm run typecheck
```

---

## 15.2 第2依頼

```text
src/lib/domain と tests/domain を実装してください。
```

### 成果物

* `stock-code.ts`
* `disclosure-unique-key.ts`
* `disclosure-classifier.ts`
* `risk-sizing.ts`
* `trade-plan-validation.ts`
* `trade-plan-lock.ts`
* `settings.ts`
* domain test

### テスト

```bash
npm run test:run
npm run typecheck
npm run lint
```

---

## 15.3 第3依頼

```text
API共通基盤、validators、repositoriesを実装してください。
```

### 成果物

* `api-response.ts`
* `errors.ts`
* `validators/`
* `repositories/`

---

## 15.4 第4依頼

```text
API RouteとAPI Testを実装してください。
```

### 最重要

```text
POST /api/trade-plans/[id]/commit
PATCH /api/trade-plans/[id]
POST /api/trade-plans/calculate-risk
```

---

## 15.5 第5依頼

```text
共通UI・レイアウト・各画面を実装してください。
```

### 最重要

```text
/trade-plans/[id]
BuyPlanForm
RiskSizingCard
LockedPlanAlert
```

---

## 15.6 第6依頼

```text
テスト運用成果物、GitHub Actions、README、最終受入確認を実装してください。
```

---

# 16. 作業完了条件

Codexは、各依頼完了時に以下を満たすこと。

| No | 条件                                                   |
| -: | ---------------------------------------------------- |
|  1 | 対象ファイルが作成・更新されている                                    |
|  2 | 設計書の該当内容に沿っている                                       |
|  3 | `npm run typecheck` が成功                              |
|  4 | `npm run lint` が成功                                   |
|  5 | `npm run test:run` が成功                               |
|  6 | Prisma変更時は `npx prisma validate` / `generate` が成功    |
|  7 | テスト結果を `docs/test-runs` に記録                          |
|  8 | 最新結果を `artifacts/test-results/latest/summary.md` に記録 |
|  9 | 未解決事項があれば明記                                          |

---

# 17. 絶対に崩してはいけない実装

以下は仕様として守る。

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

これらのテストは削除・緩和禁止。

---

# 18. v0.1で作らないもの

以下は実装対象外。

| 対象               | 理由     |
| ---------------- | ------ |
| 自動売買             | 対象外    |
| 証券会社API連携        | 対象外    |
| リアルタイム株価取得       | v0.3以降 |
| 適時開示自動取得         | v0.2以降 |
| AI要約             | v0.4以降 |
| deviation_events | v0.2以降 |
| 税・手数料計算          | v0.3以降 |
| 本格損益管理           | v0.3以降 |
| 複数ユーザー           | v0.2以降 |
| スマホ最適化           | v0.2以降 |

---

# 19. 最重要タスク

この実装で最重要なのは以下。

```text
T2-04 リスク逆算サイジングDomain実装
```

```text
T2-05 取引計画確定バリデーション実装
```

```text
T2-06 取引計画ロックDomain実装
```

```text
T4-07 TradePlan commit API実装
```

```text
T6-05 取引計画詳細画面実装
```

この5つが正しくできていれば、MVPとしての中核価値は成立する。

---

# 株式材料監視ダッシュボード ディレクトリ構成案 v0.1.1 完全版

## 1. ドキュメント情報

| 項目      | 内容                                                                                                                  |
| ------- | ------------------------------------------------------------------------------------------------------------------- |
| ドキュメント名 | 株式材料監視ダッシュボード ディレクトリ構成案                                                                                             |
| バージョン   | 0.1.1                                                                                                               |
| 対応要件定義  | 株式材料監視ダッシュボード v0.1.3                                                                                                |
| 対応DB設計  | DB設計書 v0.1                                                                                                          |
| 対応業務ルール | 業務ルール設計書 v0.1                                                                                                       |
| 対応API設計 | API設計書 v0.1                                                                                                         |
| 対応画面設計  | 画面設計書 v0.1                                                                                                          |
| 対応テスト計画 | テスト計画書 v0.1.1                                                                                                       |
| 対応テスト運用 | テスト運用設計書 v0.1                                                                                                       |
| 技術構成    | Next.js App Router / TypeScript / Prisma / Supabase PostgreSQL / Tailwind CSS / shadcn/ui / Vitest / GitHub Actions |
| 目的      | Codexに実装依頼する際のファイル配置・責務分担・テスト運用成果物の保存場所を明確にする                                                                       |

---

## 2. v0.1.1での更新内容

v0.1.1では、v0.1のディレクトリ構成を維持したうえで、Codexにテスト実行・失敗記録・修正ループを行わせるための構成を追加する。

| 追加対象                             | 目的                        |
| -------------------------------- | ------------------------- |
| `docs/test-operation.md`         | Codexのテスト運用ルールを管理する       |
| `docs/test-runs/`                | テスト実行履歴をMarkdownで残す       |
| `artifacts/test-results/latest/` | 最新テスト結果ログを保存する            |
| `.github/workflows/ci.yml`       | GitHub Actionsで自動テストを実行する |
| `tests/e2e/`                     | 重要導線のE2Eテストを将来的に置く        |
| `package.json` の検証系script        | Codexが同じコマンドで検証できるようにする   |
| `.gitignore` のテストログ方針            | rawログとsummaryの管理方針を分ける    |

---

## 3. 基本方針

### 3.1 App Router前提

Next.js App Routerを前提とする。

画面は `src/app` 配下に配置する。
APIは `src/app/api` 配下に配置する。

---

### 3.2 業務ロジックは画面やAPIに直書きしない

以下の重要ロジックは、画面コンポーネントやAPI Route内に直接書きすぎない。

* 銘柄コード正規化
* 銘柄コードバリデーション
* 開示重複キー生成
* キーワード分類
* リスク逆算サイジング
* BUY計画確定バリデーション
* NO_TRADE / WATCH 計画確定バリデーション
* 取引計画ロック
* lockedPlanHash生成
* ロック後編集可否判定
* app_settings取得・フォールバック

これらは `src/lib/domain` 配下に分離する。

---

### 3.3 画面・API・業務ルール・DB操作を分離する

| 種類                   | 配置                       |
| -------------------- | ------------------------ |
| 画面                   | `src/app/(dashboard)`    |
| API                  | `src/app/api`            |
| DB接続                 | `src/lib/prisma.ts`      |
| 業務ロジック               | `src/lib/domain`         |
| 入力バリデーション            | `src/lib/validators`     |
| DBアクセス               | `src/lib/repositories`   |
| UI部品                 | `src/components`         |
| Prisma schema / seed | `prisma`                 |
| テスト                  | `tests`                  |
| 設計書                  | `docs`                   |
| テスト結果成果物             | `artifacts/test-results` |
| CI                   | `.github/workflows`      |

---

### 3.4 Codexにテスト実行ループを持たせる

v0.1.1では、Codexに以下を必ず行わせる。

```text
実装
  ↓
テスト実行
  ↓
失敗ログ保存
  ↓
原因分析
  ↓
修正
  ↓
再テスト
  ↓
成功または未解決事項として記録
```

テスト結果はチャット上の報告だけでなく、リポジトリ内の成果物として保存する。

---

## 4. 全体ディレクトリ構成

```text
stock-material-dashboard/
├─ .github/
│  └─ workflows/
│     └─ ci.yml
│
├─ docs/
│  ├─ requirements.md
│  ├─ databasedesign.md
│  ├─ businessrules.md
│  ├─ apidesign.md
│  ├─ screenmock.md
│  ├─ screendesign.md
│  ├─ directorystructure.md
│  ├─ testdesign.md
│  ├─ testoperation.md
│  ├─ implementationtasks.md
│  ├─ prompt/
│     └─ prompt_1.md
│  └─ test-runs/
│     └─ .gitkeep
│
├─ artifacts/
│  └─ test-results/
│     └─ latest/
│        ├─ .gitkeep
│        ├─ summary.md
│        ├─ prisma-validate.txt
│        ├─ prisma-generate.txt
│        ├─ typecheck.txt
│        ├─ lint.txt
│        ├─ unit-test.txt
│        └─ build.txt
│
├─ prisma/
│  ├─ schema.prisma
│  ├─ seed.ts
│  └─ migrations/
│
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  ├─ globals.css
│  │  │
│  │  ├─ (dashboard)/
│  │  │  ├─ layout.tsx
│  │  │  ├─ disclosures/
│  │  │  │  └─ page.tsx
│  │  │  ├─ watchlist/
│  │  │  │  └─ page.tsx
│  │  │  ├─ trade-plans/
│  │  │  │  ├─ page.tsx
│  │  │  │  └─ [id]/
│  │  │  │     └─ page.tsx
│  │  │  ├─ logs/
│  │  │  │  └─ page.tsx
│  │  │  └─ settings/
│  │  │     └─ page.tsx
│  │  │
│  │  └─ api/
│  │     ├─ health/
│  │     │  └─ route.ts
│  │     ├─ stocks/
│  │     │  ├─ route.ts
│  │     │  └─ [code]/
│  │     │     └─ route.ts
│  │     ├─ disclosures/
│  │     │  ├─ route.ts
│  │     │  └─ [id]/
│  │     │     ├─ route.ts
│  │     │     ├─ watchlist/
│  │     │     │  └─ route.ts
│  │     │     └─ trade-plans/
│  │     │        └─ route.ts
│  │     ├─ watchlist/
│  │     │  ├─ route.ts
│  │     │  └─ [id]/
│  │     │     ├─ route.ts
│  │     │     └─ trade-plans/
│  │     │        └─ route.ts
│  │     ├─ trade-plans/
│  │     │  ├─ route.ts
│  │     │  ├─ calculate-risk/
│  │     │  │  └─ route.ts
│  │     │  └─ [id]/
│  │     │     ├─ route.ts
│  │     │     ├─ commit/
│  │     │     │  └─ route.ts
│  │     │     ├─ execute/
│  │     │     │  └─ route.ts
│  │     │     └─ close/
│  │     │        └─ route.ts
│  │     ├─ verification-logs/
│  │     │  ├─ route.ts
│  │     │  └─ [id]/
│  │     │     └─ route.ts
│  │     ├─ keyword-rules/
│  │     │  └─ route.ts
│  │     └─ app-settings/
│  │        └─ route.ts
│  │
│  ├─ components/
│  │  ├─ ui/
│  │  ├─ layout/
│  │  │  ├─ AppHeader.tsx
│  │  │  ├─ AppSidebar.tsx
│  │  │  └─ DashboardShell.tsx
│  │  ├─ common/
│  │  │  ├─ EmptyState.tsx
│  │  │  ├─ ErrorAlert.tsx
│  │  │  ├─ LoadingState.tsx
│  │  │  ├─ PageHeader.tsx
│  │  │  └─ StatusBadge.tsx
│  │  ├─ disclosures/
│  │  │  ├─ DisclosureFormDialog.tsx
│  │  │  ├─ DisclosureTable.tsx
│  │  │  └─ DisclosureFilters.tsx
│  │  ├─ watchlist/
│  │  │  ├─ WatchlistFormDialog.tsx
│  │  │  ├─ WatchlistTable.tsx
│  │  │  └─ CreateTradePlanDialog.tsx
│  │  ├─ trade-plans/
│  │  │  ├─ TradePlanTable.tsx
│  │  │  ├─ TradePlanFilters.tsx
│  │  │  ├─ BuyPlanForm.tsx
│  │  │  ├─ NoTradePlanForm.tsx
│  │  │  ├─ WatchPlanForm.tsx
│  │  │  ├─ RiskSizingCard.tsx
│  │  │  ├─ LockedPlanAlert.tsx
│  │  │  ├─ PlanStatusBadge.tsx
│  │  │  └─ ExecutePlanForm.tsx
│  │  ├─ logs/
│  │  │  ├─ VerificationLogDialog.tsx
│  │  │  ├─ VerificationLogTable.tsx
│  │  │  └─ VerificationLogFilters.tsx
│  │  └─ settings/
│  │     ├─ AppSettingsCard.tsx
│  │     └─ KeywordRulesTable.tsx
│  │
│  ├─ lib/
│  │  ├─ prisma.ts
│  │  ├─ env.ts
│  │  ├─ api-response.ts
│  │  ├─ errors.ts
│  │  ├─ constants.ts
│  │  │
│  │  ├─ domain/
│  │  │  ├─ stock-code.ts
│  │  │  ├─ disclosure-classifier.ts
│  │  │  ├─ disclosure-unique-key.ts
│  │  │  ├─ risk-sizing.ts
│  │  │  ├─ trade-plan-validation.ts
│  │  │  ├─ trade-plan-lock.ts
│  │  │  ├─ settings.ts
│  │  │  └─ date-time.ts
│  │  │
│  │  ├─ validators/
│  │  │  ├─ disclosure.ts
│  │  │  ├─ watchlist.ts
│  │  │  ├─ trade-plan.ts
│  │  │  ├─ verification-log.ts
│  │  │  └─ common.ts
│  │  │
│  │  └─ repositories/
│  │     ├─ stocks.ts
│  │     ├─ disclosures.ts
│  │     ├─ watchlist.ts
│  │     ├─ trade-plans.ts
│  │     ├─ verification-logs.ts
│  │     ├─ keyword-rules.ts
│  │     └─ app-settings.ts
│  │
│  ├─ types/
│  │  ├─ api.ts
│  │  ├─ disclosure.ts
│  │  ├─ watchlist.ts
│  │  ├─ trade-plan.ts
│  │  ├─ verification-log.ts
│  │  └─ settings.ts
│  │
│  └─ middleware.ts
│
├─ tests/
│  ├─ domain/
│  │  ├─ stock-code.test.ts
│  │  ├─ disclosure-unique-key.test.ts
│  │  ├─ disclosure-classifier.test.ts
│  │  ├─ risk-sizing.test.ts
│  │  ├─ trade-plan-validation.test.ts
│  │  ├─ trade-plan-lock.test.ts
│  │  └─ settings.test.ts
│  │
│  ├─ api/
│  │  ├─ disclosures.test.ts
│  │  ├─ watchlist.test.ts
│  │  ├─ trade-plans.test.ts
│  │  └─ verification-logs.test.ts
│  │
│  └─ e2e/
│     └─ critical-flow.test.ts
│
├─ .env.example
├─ .gitignore
├─ package.json
├─ tsconfig.json
├─ tailwind.config.ts
├─ postcss.config.js
├─ next.config.ts
└─ README.md
```

---

# 5. `docs/` 配下

## 5.1 構成

```text
docs/
├─ requirements.md
├─ databasedesign.md
├─ businessrules.md
├─ apidesign.md
├─ screenmock.md
├─ screendesign.md
├─ directorystructure.md
├─ testdesign.md
├─ testoperation.md
├─ implementation-tasks.md
├─ codex-prompt.md
└─ test-runs/
   └─ .gitkeep
```

---

## 5.2 各ファイルの役割

| ファイル                      | 内容           |
| ------------------------- | ------------ |
| `requirements.md`         | 要件定義書        |
| `databasedesign.md`            | DB設計書        |
| `businessrules.md`       | 業務ルール設計書     |
| `apidesign.md`           | API設計書       |
| `screenmock.md`          | 画面モック        |
| `screendesign.md`        | 画面設計書        |
| `directorystructure.md`  | ディレクトリ構成案    |
| `testdesign.md`          | テスト計画書       |
| `testoperation.md`       | テスト運用設計書     |
| `implementationtasks.md` | 実装タスク分解書     |
| `codex-prompt.md`         | Codex依頼プロンプト |
| `test-runs/`              | テスト実行履歴      |

---

## 5.3 `docs/test-runs/`

Codexがテストを実行した結果を、Markdown形式で保存する。

```text
docs/test-runs/
├─ .gitkeep
├─ 20260617-1030-test-run.md
├─ 20260617-1115-test-run.md
└─ 20260617-1240-test-run.md
```

---

## 5.4 `docs/test-runs/` の役割

| 役割     | 内容                 |
| ------ | ------------------ |
| テスト履歴  | 実行したテストと結果を残す      |
| 失敗ログ要約 | どのコマンド・テストが失敗したか残す |
| 原因仮説   | Codexが考えた原因を残す     |
| 修正方針   | どう直すかを残す           |
| 修正内容   | 実際に直した内容を残す        |
| 再実行結果  | 修正後に成功したかを残す       |
| 未解決事項  | 解決できない場合に人間へ引き継ぐ   |

---

## 5.5 テスト実行記録ファイル命名規則

```text
YYYYMMDD-HHMM-test-run.md
```

例：

```text
20260617-1030-test-run.md
```

---

# 6. `artifacts/` 配下

## 6.1 目的

`artifacts/` は、Codexやテスト実行が生成する一時的・半永続的な成果物を置く。

v0.1.1では、テスト結果ログの保存に使用する。

---

## 6.2 構成

```text
artifacts/
└─ test-results/
   └─ latest/
      ├─ .gitkeep
      ├─ summary.md
      ├─ prisma-validate.txt
      ├─ prisma-generate.txt
      ├─ typecheck.txt
      ├─ lint.txt
      ├─ unit-test.txt
      └─ build.txt
```

---

## 6.3 各ファイルの役割

| ファイル                  | 内容                        |
| --------------------- | ------------------------- |
| `summary.md`          | 最新テスト結果の要約                |
| `prisma-validate.txt` | `npx prisma validate` の結果 |
| `prisma-generate.txt` | `npx prisma generate` の結果 |
| `typecheck.txt`       | `npm run typecheck` の結果   |
| `lint.txt`            | `npm run lint` の結果        |
| `unit-test.txt`       | `npm run test:run` の結果    |
| `build.txt`           | `npm run build` の結果       |
| `.gitkeep`            | 空ディレクトリ維持用                |

---

## 6.4 `summary.md` の役割

`artifacts/test-results/latest/summary.md` は、Codexが作業完了時に必ず更新する。

目的は以下。

* 最新のテスト状態をひと目で分かるようにする
* 失敗中のテストを明確にする
* 修正ループの回数を残す
* 未解決事項を残す
* Codexが「テスト済み」と言える根拠を残す

---

## 6.5 rawログの扱い

`*.txt` のrawログは量が増えやすいため、Git管理するかどうかは運用で決める。

v0.1.1では以下を推奨する。

| ファイル         | Git管理                     |
| ------------ | ------------------------- |
| `summary.md` | する                        |
| `.gitkeep`   | する                        |
| `*.txt`      | 原則しない。ただし直近確認用としてローカルには残す |

---

# 7. `prisma/` 配下

## 7.1 構成

```text
prisma/
├─ schema.prisma
├─ seed.ts
└─ migrations/
```

---

## 7.2 各ファイルの役割

| ファイル            | 内容               |
| --------------- | ---------------- |
| `schema.prisma` | DB構造定義           |
| `seed.ts`       | 初期データ投入          |
| `migrations/`   | Prisma migration |

---

## 7.3 `schema.prisma`

DB設計書 v0.1 をPrisma形式に落とし込む。

対象テーブル：

* `stocks`
* `disclosures`
* `watchlist_items`
* `trade_plans`
* `verification_logs`
* `keyword_rules`
* `app_settings`

---

## 7.4 `seed.ts`

初期投入対象は以下。

* `keyword_rules`
* `app_settings`

v0.1では、サンプル取引データや実在銘柄の大量投入はしない。

---

## 7.5 Prisma変更時に必要な確認

`schema.prisma` または `seed.ts` を変更した場合、Codexは以下を実行する。

```bash
npx prisma validate
npx prisma generate
```

必要に応じて以下も実行する。

```bash
npx prisma migrate dev
npm run db:seed
```

---

# 8. `src/app/` 配下

Next.js App Routerの画面とAPIを配置する。

---

## 8.1 画面ルート

```text
src/app/
├─ layout.tsx
├─ page.tsx
├─ globals.css
└─ (dashboard)/
   ├─ layout.tsx
   ├─ disclosures/
   │  └─ page.tsx
   ├─ watchlist/
   │  └─ page.tsx
   ├─ trade-plans/
   │  ├─ page.tsx
   │  └─ [id]/
   │     └─ page.tsx
   ├─ logs/
   │  └─ page.tsx
   └─ settings/
      └─ page.tsx
```

---

## 8.2 画面対応表

| パス                  | ファイル                                            | 画面       |
| ------------------- | ----------------------------------------------- | -------- |
| `/`                 | `src/app/page.tsx`                              | ホーム画面    |
| `/disclosures`      | `src/app/(dashboard)/disclosures/page.tsx`      | 注目開示画面   |
| `/watchlist`        | `src/app/(dashboard)/watchlist/page.tsx`        | 監視リスト画面  |
| `/trade-plans`      | `src/app/(dashboard)/trade-plans/page.tsx`      | 取引計画一覧画面 |
| `/trade-plans/[id]` | `src/app/(dashboard)/trade-plans/[id]/page.tsx` | 取引計画詳細画面 |
| `/logs`             | `src/app/(dashboard)/logs/page.tsx`             | 検証ログ画面   |
| `/settings`         | `src/app/(dashboard)/settings/page.tsx`         | 設定画面     |

---

## 8.3 画面実装方針

| 方針       | 内容                                            |
| -------- | --------------------------------------------- |
| PC優先     | v0.1ではPCブラウザ利用を優先                             |
| テーブル中心   | 注目開示・監視リスト・取引計画・検証ログはTable中心                  |
| Dialog活用 | 登録・編集・検証ログ作成はDialogでもよい                       |
| 取引計画詳細重視 | BUY計画の出口・リスク・株数を最重要表示                         |
| 状態別UI    | DRAFT / COMMITTED / EXECUTED / CLOSED で表示を分ける |
| ロック表示    | COMMITTED後は編集フォームを出さず、読み取り専用にする               |

---

# 9. `src/app/api/` 配下

## 9.1 APIルート構成

```text
src/app/api/
├─ health/
│  └─ route.ts
├─ stocks/
│  ├─ route.ts
│  └─ [code]/
│     └─ route.ts
├─ disclosures/
│  ├─ route.ts
│  └─ [id]/
│     ├─ route.ts
│     ├─ watchlist/
│     │  └─ route.ts
│     └─ trade-plans/
│        └─ route.ts
├─ watchlist/
│  ├─ route.ts
│  └─ [id]/
│     ├─ route.ts
│     └─ trade-plans/
│        └─ route.ts
├─ trade-plans/
│  ├─ route.ts
│  ├─ calculate-risk/
│  │  └─ route.ts
│  └─ [id]/
│     ├─ route.ts
│     ├─ commit/
│     │  └─ route.ts
│     ├─ execute/
│     │  └─ route.ts
│     └─ close/
│        └─ route.ts
├─ verification-logs/
│  ├─ route.ts
│  └─ [id]/
│     └─ route.ts
├─ keyword-rules/
│  └─ route.ts
└─ app-settings/
   └─ route.ts
```

---

## 9.2 API対応表

| API                                      | ファイル                                                |
| ---------------------------------------- | --------------------------------------------------- |
| `GET /api/health`                        | `src/app/api/health/route.ts`                       |
| `GET /api/stocks`                        | `src/app/api/stocks/route.ts`                       |
| `PATCH /api/stocks/[code]`               | `src/app/api/stocks/[code]/route.ts`                |
| `GET /api/disclosures`                   | `src/app/api/disclosures/route.ts`                  |
| `POST /api/disclosures`                  | `src/app/api/disclosures/route.ts`                  |
| `PATCH /api/disclosures/[id]`            | `src/app/api/disclosures/[id]/route.ts`             |
| `DELETE /api/disclosures/[id]`           | `src/app/api/disclosures/[id]/route.ts`             |
| `POST /api/disclosures/[id]/watchlist`   | `src/app/api/disclosures/[id]/watchlist/route.ts`   |
| `POST /api/disclosures/[id]/trade-plans` | `src/app/api/disclosures/[id]/trade-plans/route.ts` |
| `GET /api/watchlist`                     | `src/app/api/watchlist/route.ts`                    |
| `POST /api/watchlist`                    | `src/app/api/watchlist/route.ts`                    |
| `PATCH /api/watchlist/[id]`              | `src/app/api/watchlist/[id]/route.ts`               |
| `DELETE /api/watchlist/[id]`             | `src/app/api/watchlist/[id]/route.ts`               |
| `POST /api/watchlist/[id]/trade-plans`   | `src/app/api/watchlist/[id]/trade-plans/route.ts`   |
| `GET /api/trade-plans`                   | `src/app/api/trade-plans/route.ts`                  |
| `POST /api/trade-plans`                  | `src/app/api/trade-plans/route.ts`                  |
| `POST /api/trade-plans/calculate-risk`   | `src/app/api/trade-plans/calculate-risk/route.ts`   |
| `GET /api/trade-plans/[id]`              | `src/app/api/trade-plans/[id]/route.ts`             |
| `PATCH /api/trade-plans/[id]`            | `src/app/api/trade-plans/[id]/route.ts`             |
| `DELETE /api/trade-plans/[id]`           | `src/app/api/trade-plans/[id]/route.ts`             |
| `POST /api/trade-plans/[id]/commit`      | `src/app/api/trade-plans/[id]/commit/route.ts`      |
| `POST /api/trade-plans/[id]/execute`     | `src/app/api/trade-plans/[id]/execute/route.ts`     |
| `POST /api/trade-plans/[id]/close`       | `src/app/api/trade-plans/[id]/close/route.ts`       |
| `GET /api/verification-logs`             | `src/app/api/verification-logs/route.ts`            |
| `POST /api/verification-logs`            | `src/app/api/verification-logs/route.ts`            |
| `PATCH /api/verification-logs/[id]`      | `src/app/api/verification-logs/[id]/route.ts`       |
| `GET /api/keyword-rules`                 | `src/app/api/keyword-rules/route.ts`                |
| `GET /api/app-settings`                  | `src/app/api/app-settings/route.ts`                 |

---

## 9.3 API実装方針

API Routeでは、以下を行う。

1. 認証・アクセス制御の確認
2. リクエスト値の取得
3. zod等による入力検証
4. `src/lib/domain` の業務ロジック呼び出し
5. `src/lib/repositories` 経由でDB操作
6. 共通レスポンス形式で返却
7. エラー時は共通エラー形式で返却

---

## 9.4 最重要API

最も重要なAPIは以下。

```text
POST /api/trade-plans/[id]/commit
```

このAPIでは必ず以下を行う。

* 対象計画取得
* DRAFTであることの確認
* planType別の確定条件チェック
* BUYの場合、リスク逆算サイジングをサーバー側で再計算
* 推奨株数0ブロック
* 予定株数超過ブロック
* 取引計画ロック
* `lockedAt` 保存
* `lockedPlanHash` 保存

---

# 10. `src/components/` 配下

画面用コンポーネントを配置する。

```text
src/components/
├─ ui/
├─ layout/
├─ common/
├─ disclosures/
├─ watchlist/
├─ trade-plans/
├─ logs/
└─ settings/
```

---

## 10.1 `components/ui/`

shadcn/uiで生成されるコンポーネントを配置する。

例：

```text
src/components/ui/
├─ button.tsx
├─ input.tsx
├─ textarea.tsx
├─ select.tsx
├─ dialog.tsx
├─ table.tsx
├─ badge.tsx
├─ alert.tsx
├─ card.tsx
└─ form.tsx
```

### 方針

* 原則としてshadcn/uiの生成ファイルを置く
* 直接大幅改造しすぎない
* アプリ固有の見た目は別コンポーネントでラップする
* 画面ごとの業務ロジックはここに入れない

---

## 10.2 `components/layout/`

共通レイアウト部品を配置する。

```text
src/components/layout/
├─ AppHeader.tsx
├─ AppSidebar.tsx
└─ DashboardShell.tsx
```

| ファイル                 | 役割                               |
| -------------------- | -------------------------------- |
| `AppHeader.tsx`      | ヘッダー                             |
| `AppSidebar.tsx`     | サイドメニュー                          |
| `DashboardShell.tsx` | Header + Sidebar + Main の共通レイアウト |

---

## 10.3 `components/common/`

複数画面で使う共通部品を配置する。

```text
src/components/common/
├─ EmptyState.tsx
├─ ErrorAlert.tsx
├─ LoadingState.tsx
├─ PageHeader.tsx
└─ StatusBadge.tsx
```

| ファイル               | 役割             |
| ------------------ | -------------- |
| `EmptyState.tsx`   | データ0件表示        |
| `ErrorAlert.tsx`   | APIエラー表示       |
| `LoadingState.tsx` | 読み込み中表示        |
| `PageHeader.tsx`   | ページタイトル・説明・ボタン |
| `StatusBadge.tsx`  | ステータス表示        |

---

## 10.4 `components/disclosures/`

注目開示画面用。

```text
src/components/disclosures/
├─ DisclosureFormDialog.tsx
├─ DisclosureTable.tsx
└─ DisclosureFilters.tsx
```

| ファイル                       | 役割           |
| -------------------------- | ------------ |
| `DisclosureFormDialog.tsx` | 注目開示登録Dialog |
| `DisclosureTable.tsx`      | 注目開示一覧Table  |
| `DisclosureFilters.tsx`    | 検索・絞り込み      |

---

## 10.5 `components/watchlist/`

監視リスト画面用。

```text
src/components/watchlist/
├─ WatchlistFormDialog.tsx
├─ WatchlistTable.tsx
└─ CreateTradePlanDialog.tsx
```

| ファイル                        | 役割                              |
| --------------------------- | ------------------------------- |
| `WatchlistFormDialog.tsx`   | 監視銘柄登録・編集Dialog                 |
| `WatchlistTable.tsx`        | 監視リストTable                      |
| `CreateTradePlanDialog.tsx` | BUY / NO_TRADE / WATCH 選択Dialog |

---

## 10.6 `components/trade-plans/`

取引計画画面用。
このアプリで最重要のコンポーネント群。

```text
src/components/trade-plans/
├─ TradePlanTable.tsx
├─ TradePlanFilters.tsx
├─ BuyPlanForm.tsx
├─ NoTradePlanForm.tsx
├─ WatchPlanForm.tsx
├─ RiskSizingCard.tsx
├─ LockedPlanAlert.tsx
├─ PlanStatusBadge.tsx
└─ ExecutePlanForm.tsx
```

| ファイル                   | 役割                     |
| ---------------------- | ---------------------- |
| `TradePlanTable.tsx`   | 取引計画一覧                 |
| `TradePlanFilters.tsx` | 検索・絞り込み                |
| `BuyPlanForm.tsx`      | BUY計画入力フォーム            |
| `NoTradePlanForm.tsx`  | 見送り計画フォーム              |
| `WatchPlanForm.tsx`    | 監視継続計画フォーム             |
| `RiskSizingCard.tsx`   | リスク計算結果表示              |
| `LockedPlanAlert.tsx`  | 確定済み・編集不可警告            |
| `PlanStatusBadge.tsx`  | DRAFT / COMMITTED 等の表示 |
| `ExecutePlanForm.tsx`  | 実行情報入力フォーム             |

### 重要方針

`BuyPlanForm.tsx` では、フロント側でも以下を表示・制御する。

* 損切未入力エラー
* 利確未入力エラー
* 最大保有日数未入力エラー
* 推奨株数0警告
* 予定株数超過警告
* 確定ボタンの無効化

ただし、最終判定は必ずAPI側で行う。

---

## 10.7 `components/logs/`

検証ログ画面用。

```text
src/components/logs/
├─ VerificationLogDialog.tsx
├─ VerificationLogTable.tsx
└─ VerificationLogFilters.tsx
```

| ファイル                         | 役割              |
| ---------------------------- | --------------- |
| `VerificationLogDialog.tsx`  | 検証ログ作成・編集Dialog |
| `VerificationLogTable.tsx`   | 検証ログ一覧          |
| `VerificationLogFilters.tsx` | 検証ログ検索・絞り込み     |

---

## 10.8 `components/settings/`

設定画面用。

```text
src/components/settings/
├─ AppSettingsCard.tsx
└─ KeywordRulesTable.tsx
```

| ファイル                    | 役割         |
| ----------------------- | ---------- |
| `AppSettingsCard.tsx`   | アプリ設定表示    |
| `KeywordRulesTable.tsx` | キーワードルール一覧 |

---

# 11. `src/lib/` 配下

アプリ共通ロジックを配置する。

```text
src/lib/
├─ prisma.ts
├─ env.ts
├─ api-response.ts
├─ errors.ts
├─ constants.ts
├─ domain/
├─ validators/
└─ repositories/
```

---

## 11.1 共通ファイル

| ファイル              | 役割                  |
| ----------------- | ------------------- |
| `prisma.ts`       | PrismaClientのシングルトン |
| `env.ts`          | 環境変数チェック            |
| `api-response.ts` | APIレスポンス共通整形        |
| `errors.ts`       | アプリ共通エラー定義          |
| `constants.ts`    | 共通定数                |

---

## 11.2 `lib/prisma.ts`

PrismaClientを安全に使うための共通ファイル。

開発環境でホットリロードによりPrismaClientが増えすぎないようにする。

---

## 11.3 `lib/env.ts`

環境変数の存在チェックを行う。

対象例：

* `DATABASE_URL`
* `DIRECT_URL`
* `NEXT_PUBLIC_SUPABASE_URL`
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`
* `SUPABASE_SERVICE_ROLE_KEY`
* `APP_BASIC_AUTH_USER`
* `APP_BASIC_AUTH_PASSWORD`

---

## 11.4 `lib/api-response.ts`

APIレスポンス形式を統一する。

成功時：

```json
{
  "success": true,
  "data": {}
}
```

エラー時：

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "損切価格はエントリー予定価格より低く入力してください。",
    "details": {}
  }
}
```

---

## 11.5 `lib/errors.ts`

アプリ共通エラーを定義する。

例：

* `ValidationError`
* `NotFoundError`
* `ConflictError`
* `LockedError`
* `UnauthorizedError`

---

## 11.6 `lib/constants.ts`

共通定数を配置する。

例：

* デフォルト取引単位
* デフォルト許容リスク%
* 最大許容リスク%
* ロック対象フィールド一覧
* deviationSummary候補

---

# 12. `src/lib/domain/` 配下

業務ロジックを配置する。
API Routeから呼び出す。

```text
src/lib/domain/
├─ stock-code.ts
├─ disclosure-classifier.ts
├─ disclosure-unique-key.ts
├─ risk-sizing.ts
├─ trade-plan-validation.ts
├─ trade-plan-lock.ts
├─ settings.ts
└─ date-time.ts
```

---

## 12.1 各ファイルの役割

| ファイル                       | 役割                            |
| -------------------------- | ----------------------------- |
| `stock-code.ts`            | 銘柄コード正規化・検証                   |
| `disclosure-classifier.ts` | 開示タイトルのキーワード分類                |
| `disclosure-unique-key.ts` | 開示重複キー生成                      |
| `risk-sizing.ts`           | リスク逆算サイジング                    |
| `trade-plan-validation.ts` | BUY / NO_TRADE / WATCH 確定条件   |
| `trade-plan-lock.ts`       | ロック処理・lockedPlanHash生成・編集可否判定 |
| `settings.ts`              | app_settings取得・フォールバック        |
| `date-time.ts`             | JST / UTC変換補助                 |

---

## 12.2 必ず分離する重要関数

以下は必ず `src/lib/domain` 配下に実装し、API Routeに直書きしない。

| 関数                            | 配置                         |
| ----------------------------- | -------------------------- |
| `normalizeStockCode`          | `stock-code.ts`            |
| `validateStockCode`           | `stock-code.ts`            |
| `generateDisclosureUniqueKey` | `disclosure-unique-key.ts` |
| `classifyDisclosureTitle`     | `disclosure-classifier.ts` |
| `calculateRiskSizing`         | `risk-sizing.ts`           |
| `validateBuyCommit`           | `trade-plan-validation.ts` |
| `validateNoTradeCommit`       | `trade-plan-validation.ts` |
| `validateWatchCommit`         | `trade-plan-validation.ts` |
| `createLockedPlanHash`        | `trade-plan-lock.ts`       |
| `assertTradePlanEditable`     | `trade-plan-lock.ts`       |

---

## 12.3 最重要ファイル

このアプリの価値を決める最重要ファイルは以下。

```text
src/lib/domain/risk-sizing.ts
src/lib/domain/trade-plan-validation.ts
src/lib/domain/trade-plan-lock.ts
```

この3つは必ずUnit Testを作成する。

---

# 13. `src/lib/validators/` 配下

リクエスト入力の検証スキーマを配置する。

```text
src/lib/validators/
├─ disclosure.ts
├─ watchlist.ts
├─ trade-plan.ts
├─ verification-log.ts
└─ common.ts
```

---

## 13.1 想定ライブラリ

`zod` を使用する想定。

---

## 13.2 各ファイルの役割

| ファイル                  | 役割            |
| --------------------- | ------------- |
| `disclosure.ts`       | 注目開示APIの入力検証  |
| `watchlist.ts`        | 監視リストAPIの入力検証 |
| `trade-plan.ts`       | 取引計画APIの入力検証  |
| `verification-log.ts` | 検証ログAPIの入力検証  |
| `common.ts`           | 共通バリデーション     |

---

## 13.3 方針

* 型チェックだけではなく、業務上不正な入力も検証する
* ただし複雑な業務ルールは `domain` に置く
* API Routeでは validator と domain を両方使う

---

# 14. `src/lib/repositories/` 配下

Prismaを使ったDBアクセス処理を配置する。

```text
src/lib/repositories/
├─ stocks.ts
├─ disclosures.ts
├─ watchlist.ts
├─ trade-plans.ts
├─ verification-logs.ts
├─ keyword-rules.ts
└─ app-settings.ts
```

---

## 14.1 各ファイルの役割

| ファイル                   | 役割           |
| ---------------------- | ------------ |
| `stocks.ts`            | 銘柄マスタDB操作    |
| `disclosures.ts`       | 注目開示DB操作     |
| `watchlist.ts`         | 監視リストDB操作    |
| `trade-plans.ts`       | 取引計画DB操作     |
| `verification-logs.ts` | 検証ログDB操作     |
| `keyword-rules.ts`     | キーワードルールDB操作 |
| `app-settings.ts`      | アプリ設定DB操作    |

---

## 14.2 Repositoryを分ける理由

API Routeから直接Prismaを呼んでも実装は可能だが、v0.1.1では以下の理由でrepositoryを分ける。

* API Routeを薄くできる
* DB操作の見通しが良くなる
* テストしやすくなる
* Codexが機能単位で修正しやすい
* 画面や業務ロジックとDB操作が混ざるのを防ぐ

---

# 15. `src/types/` 配下

アプリ固有の型を配置する。

```text
src/types/
├─ api.ts
├─ disclosure.ts
├─ watchlist.ts
├─ trade-plan.ts
├─ verification-log.ts
└─ settings.ts
```

---

## 15.1 各ファイルの役割

| ファイル                  | 役割              |
| --------------------- | --------------- |
| `api.ts`              | 共通APIレスポンス型     |
| `disclosure.ts`       | 注目開示関連型         |
| `watchlist.ts`        | 監視リスト関連型        |
| `trade-plan.ts`       | 取引計画関連型         |
| `verification-log.ts` | 検証ログ関連型         |
| `settings.ts`         | app_settings関連型 |

---

## 15.2 方針

Prismaの型で足りる場合は、無理に独自型を増やさない。

ただし、以下は必要に応じて独自型を定義する。

* APIレスポンス用
* 画面表示用
* Form入力用
* リスク計算結果用
* キーワード分類結果用

---

# 16. `src/middleware.ts`

簡易アクセス制御を実装する。

```text
src/middleware.ts
```

---

## 16.1 役割

* Basic認証または簡易アクセス制御
* 未認証アクセスのブロック
* APIと画面の保護

---

## 16.2 保護対象

v0.1では、以下を保護対象にする。

* `/`
* `/disclosures`
* `/watchlist`
* `/trade-plans`
* `/logs`
* `/settings`
* `/api/*`

---

## 16.3 除外候補

必要に応じて以下は除外する。

* Next.js内部ファイル
* 静的ファイル
* favicon
* `/api/health`

---

## 16.4 注意

v0.1では本格的なユーザー管理は行わない。
Supabase Authなどの本格認証はv0.2以降で検討する。

---

# 17. `tests/` 配下

## 17.1 構成

```text
tests/
├─ domain/
│  ├─ stock-code.test.ts
│  ├─ disclosure-unique-key.test.ts
│  ├─ disclosure-classifier.test.ts
│  ├─ risk-sizing.test.ts
│  ├─ trade-plan-validation.test.ts
│  ├─ trade-plan-lock.test.ts
│  └─ settings.test.ts
│
├─ api/
│  ├─ disclosures.test.ts
│  ├─ watchlist.test.ts
│  ├─ trade-plans.test.ts
│  └─ verification-logs.test.ts
│
└─ e2e/
   └─ critical-flow.test.ts
```

---

## 17.2 `tests/domain/`

最優先で作成するテスト。

| ファイル                            | 重要度 | 内容                          |
| ------------------------------- | --: | --------------------------- |
| `risk-sizing.test.ts`           | 最重要 | リスク逆算サイジング                  |
| `trade-plan-validation.test.ts` | 最重要 | BUY / NO_TRADE / WATCH 確定条件 |
| `trade-plan-lock.test.ts`       | 最重要 | ロック・編集不可・hash               |
| `disclosure-classifier.test.ts` |   高 | キーワード分類                     |
| `stock-code.test.ts`            |   高 | 銘柄コード正規化・検証                 |
| `disclosure-unique-key.test.ts` |   中 | 開示重複キー生成                    |
| `settings.test.ts`              |   中 | app_settingsフォールバック         |

---

## 17.3 `tests/api/`

API Routeの業務ルール適用を確認する。

| ファイル                        | 主な対象               |
| --------------------------- | ------------------ |
| `disclosures.test.ts`       | 注目開示登録、重複判定、分類     |
| `watchlist.test.ts`         | 監視リスト作成、取引計画作成     |
| `trade-plans.test.ts`       | リスク計算、確定、ロック、実行、終了 |
| `verification-logs.test.ts` | 検証ログ作成、取引計画との紐づけ   |

---

## 17.4 `tests/e2e/`

v0.1では任意。
余力があれば、重要導線を1本だけ作成する。

```text
注目開示登録
  ↓
監視リスト追加
  ↓
BUY計画作成
  ↓
リスク計算
  ↓
BUY計画確定
  ↓
COMMITTED後のロック確認
```

---

## 17.5 最重要テスト

以下は削除・緩和禁止。

* BUY計画で損切価格が未入力なら確定できない
* BUY計画で利確目標価格が未入力なら確定できない
* BUY計画で最大保有日数が未入力なら確定できない
* BUY計画で予定株数が推奨株数を超えたら確定できない
* BUY計画で推奨株数0なら確定できない
* COMMITTED後に損切価格を変更できない
* COMMITTED後に予定株数を変更できない
* commit時にサーバー側でリスク再計算する
* lockedPlanHashを保存する

---

# 18. `.github/workflows/` 配下

## 18.1 構成

```text
.github/
└─ workflows/
   └─ ci.yml
```

---

## 18.2 目的

GitHub Actionsで、push / pull request 時に最低限の品質チェックを実行する。

目的は以下。

* 型エラーを検知する
* Lintエラーを検知する
* テスト未実行のまま進むことを防ぐ
* Codex実装後の品質を確認する
* 業務ルールの回帰を防ぐ

---

## 18.3 CIで実行するコマンド

```bash
npm ci
npx prisma generate
npm run typecheck
npm run lint
npm run test:run
npm run build
```

---

## 18.4 `ci.yml` 案

```yaml
name: CI

on:
  push:
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest

    env:
      DATABASE_URL: ${{ secrets.DATABASE_URL }}
      DIRECT_URL: ${{ secrets.DIRECT_URL }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Prisma generate
        run: npx prisma generate

      - name: Typecheck
        run: npm run typecheck

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm run test:run

      - name: Build
        run: npm run build
```

---

## 18.5 CI失敗時の扱い

CIが失敗した場合、Codexは以下を行う。

1. CIログを確認する
2. 失敗内容を `docs/test-runs` に記録する
3. 原因仮説を書く
4. 実装コードを修正する
5. ローカルで該当コマンドを再実行する
6. 修正内容を記録する
7. 再度CIを通す

---

# 19. `.env.example`

## 19.1 目的

必要な環境変数のサンプルを配置する。

```text
.env.example
```

---

## 19.2 内容案

```env
DATABASE_URL=""
DIRECT_URL=""

NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""

APP_BASIC_AUTH_USER=""
APP_BASIC_AUTH_PASSWORD=""
```

---

## 19.3 注意

`.env` は絶対にGitHubへコミットしない。
`.env.example` のみコミットする。

---

# 20. `.gitignore`

## 20.1 基本方針

`.env` や機密情報は絶対にGit管理しない。

テスト結果ログは、保存目的に応じて一部のみGit管理する。

---

## 20.2 `.gitignore` 案

```gitignore
# env
.env
.env.local
.env.*.local

# dependencies
node_modules/

# next
.next/
out/

# prisma
prisma/dev.db

# test output
coverage/

# test result raw logs
artifacts/test-results/latest/*.txt

# keep summary and directory
!artifacts/test-results/latest/summary.md
!artifacts/test-results/latest/.gitkeep
!docs/test-runs/.gitkeep
```

---

## 20.3 Git管理するもの

| 対象                                         | 理由           |
| ------------------------------------------ | ------------ |
| `docs/test-runs/*.md`                      | テスト実行履歴として残す |
| `artifacts/test-results/latest/summary.md` | 最新状態を確認するため  |
| `artifacts/test-results/latest/.gitkeep`   | ディレクトリ維持     |
| `docs/test-runs/.gitkeep`                  | ディレクトリ維持     |
| `.github/workflows/ci.yml`                 | CI設定         |

---

## 20.4 Git管理しないもの

| 対象                                    | 理由           |
| ------------------------------------- | ------------ |
| `.env`                                | 機密情報         |
| `node_modules/`                       | 依存パッケージ      |
| `.next/`                              | ビルド成果物       |
| `coverage/`                           | 自動生成物        |
| `artifacts/test-results/latest/*.txt` | ログ量が大きくなりやすい |

---

# 21. `package.json` scripts

## 21.1 推奨scripts

```json
{
  "scripts": {
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
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

---

## 21.2 Codexが使う主なコマンド

| コマンド                 | 用途                                       |
| -------------------- | ---------------------------------------- |
| `npm run typecheck`  | 型チェック                                    |
| `npm run lint`       | Lint                                     |
| `npm run test:run`   | テスト実行                                    |
| `npm run build`      | ビルド確認                                    |
| `npm run verify`     | typecheck + lint + test                  |
| `npm run verify:all` | Prisma + typecheck + lint + test + build |

---

# 22. 実装時の優先順位

## 22.1 最初に作る

```text
prisma/schema.prisma
prisma/seed.ts
src/lib/prisma.ts
src/lib/env.ts
src/lib/domain/
tests/domain/
```

理由：

* DBと業務ロジックが先に固まる
* 画面より先に中核ルールをテストできる
* リスク管理ロジックがアプリの価値を決める
* Codexに最重要テストを先に通させる

---

## 22.2 次に作る

```text
src/lib/validators/
src/lib/repositories/
src/app/api/
tests/api/
```

理由：

* API側で業務ルールを再検証する必要がある
* 特に `POST /api/trade-plans/[id]/commit` が中核
* サーバー側でリスク再計算・サイズ超過ブロック・ロックを行う

---

## 22.3 次に作る

```text
src/components/
src/app/(dashboard)/
```

理由：

* 画面はAPIとDomainロジックが安定してから作る
* 見た目より業務ルール優先
* BUY計画詳細画面では、リスク計算とロック状態の表示を重視する

---

## 22.4 最後に整える

```text
.github/workflows/ci.yml
docs/test-runs/
artifacts/test-results/latest/
README.md
```

理由：

* CIとテスト成果物保存により、Codex実装後の品質確認ループを完成させる
* READMEでセットアップ手順を残す

---

# 23. Codexへの実装指示で強調すべきこと

Codexに依頼する際は、以下を必ず強調する。

```text
業務ロジックをAPI Routeに直書きしすぎないこと。
```

```text
リスク逆算サイジング、BUY計画確定バリデーション、取引計画ロックは src/lib/domain に分離すること。
```

```text
POST /api/trade-plans/[id]/commit では、必ずサーバー側でリスク計算を再実行すること。
```

```text
COMMITTED後のロック対象項目は PATCH /api/trade-plans/[id] で更新不可にすること。
```

```text
.env はコミットせず、.env.example のみ作成すること。
```

```text
Domainロジックのテスト、特に risk-sizing / trade-plan-validation / trade-plan-lock を最優先で実装すること。
```

```text
テスト結果は docs/test-runs と artifacts/test-results/latest に保存すること。
```

```text
テスト失敗時は、失敗ログ、原因仮説、修正内容、再実行結果を docs/test-runs/YYYYMMDD-HHMM-test-run.md に記録すること。
```

```text
最新のテスト結果は artifacts/test-results/latest/summary.md に要約すること。
```

```text
テストを通すために、重要テストを削除・緩和してはいけないこと。
```

```text
GitHub Actions用に .github/workflows/ci.yml を作成すること。
```

---

# 24. v0.1.1で作らないもの

以下はv0.1.1ではディレクトリを作らなくてよい。

| ディレクトリ候補                        | 理由                      |
| ------------------------------- | ----------------------- |
| `src/app/auth/`                 | 本格認証はv0.2以降             |
| `src/app/api/price-data/`       | 株価連携はv0.3以降             |
| `src/app/api/ai/`               | AI要約はv0.4以降             |
| `src/app/api/deviation-events/` | deviation_eventsはv0.2以降 |
| `src/app/api/users/`            | 複数ユーザー未対応               |
| `src/lib/ai/`                   | AI機能未実装                 |
| `src/lib/external-api/`         | 外部API連携未実装              |
| `src/lib/notifications/`        | 通知未実装                   |
| `src/lib/broker-api/`           | 証券会社API連携は対象外           |
| `src/app/api/orders/`           | 自動売買は対象外                |
| `src/app/api/taxes/`            | 税・手数料計算はv0.3以降          |
| `src/app/api/performance/`      | 本格成績管理はv0.3以降           |

---

# 25. v0.1.1で最も重要な更新点

v0.1.1で最も重要なのは、以下である。

```text
取引計画の中核ルールを src/lib/domain に分離すること。
```

```text
risk-sizing / trade-plan-validation / trade-plan-lock のテストを最優先で作ること。
```

```text
Codexがテスト結果を成果物として残せるディレクトリを用意すること。
```

```text
Codexが失敗ログ・原因仮説・修正内容・再実行結果を記録できる場所を用意すること。
```

```text
GitHub Actionsで、push / pull request 時に自動テストを回せる構成にすること。
```

---

# 26. 最重要ポイント

このディレクトリ構成で最も重要なのは、以下である。

```text
src/lib/domain/risk-sizing.ts
src/lib/domain/trade-plan-validation.ts
src/lib/domain/trade-plan-lock.ts
```

この3つが正しく実装され、かつテストで守られていれば、画面が多少荒くても、リスク管理ツールとして成立する。

逆に、この3つが曖昧なまま画面だけ作ると、単なる銘柄メモアプリになってしまう。

v0.1.1では、さらに以下を追加で重視する。

```text
Codexは、テスト失敗を隠してはいけない。
```

```text
Codexは、テストを弱めて通してはいけない。
```

```text
Codexは、失敗原因・修正内容・再実行結果を成果物として残さなければならない。
```

---

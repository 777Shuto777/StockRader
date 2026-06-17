# 株式材料監視ダッシュボード テスト運用設計書 v0.1

## 1. ドキュメント情報

| 項目      | 内容                                                                                       |
| ------- | ---------------------------------------------------------------------------------------- |
| ドキュメント名 | 株式材料監視ダッシュボード テスト運用設計書                                                                   |
| バージョン   | 0.1                                                                                      |
| 対応テスト計画 | テスト計画書 v0.1.1                                                                            |
| 技術想定    | Next.js App Router / TypeScript / Prisma / Supabase PostgreSQL / Vitest / GitHub Actions |
| 目的      | Codexが実装後にテストを実行し、失敗ログを残し、原因分析・修正・再テストを行う運用ループを定義する                                      |

---

# 2. 基本方針

## 2.1 Codexは「実装して終わり」にしない

Codexはコードを生成した後、必ず以下を行う。

1. テストを実行する
2. 結果を保存する
3. 失敗した場合は原因を分析する
4. 実装コードを修正する
5. 再度テストする
6. 成功または未解決事項として記録する

---

## 2.2 テスト結果は成果物として残す

テスト結果は、チャット上の報告だけで終わらせない。

必ずリポジトリ内に保存する。

保存対象は以下。

* 実行したコマンド
* 成功 / 失敗結果
* 失敗ログ
* 原因仮説
* 修正方針
* 修正内容
* 再実行結果
* 未解決事項

---

## 2.3 テストを弱めて通すことは禁止

Codexは、テストを通すために以下をしてはいけない。

* テストケースを削除する
* 期待値を実装に合わせて安易に変える
* `skip` や `todo` で失敗テストを無効化する
* 業務ルールを緩める
* BUY計画確定条件を緩める
* サイズ超過ブロックを外す
* ロック後編集不可ルールを外す

---

# 3. テスト実行タイミング

## 3.1 必ずテストするタイミング

Codexは以下のタイミングでテストを実行する。

| タイミング            | 実行内容                                  |
| ---------------- | ------------------------------------- |
| Domainロジック実装後    | Unit Test                             |
| API実装後           | Unit Test + API Test                  |
| Prisma schema変更後 | Prisma validate / generate            |
| 画面実装後            | Typecheck / Lint / 可能ならComponent Test |
| 実装タスク完了時         | 全体テスト                                 |
| 修正後              | 失敗したテスト + 関連テスト                       |
| Codex作業完了前       | typecheck / lint / test / build       |

---

## 3.2 最低限の完了前チェック

Codexは作業完了前に以下を必ず実行する。

```bash
npm run typecheck
npm run lint
npm run test:run
```

可能であれば以下も実行する。

```bash
npm run build
```

Prisma関連を変更した場合は以下も必須とする。

```bash
npx prisma validate
npx prisma generate
```

---

# 4. テスト実行コマンド

## 4.1 基本コマンド

```bash
npm run typecheck
npm run lint
npm run test:run
npm run build
```

---

## 4.2 Prisma関連コマンド

```bash
npx prisma validate
npx prisma generate
```

---

## 4.3 推奨 package.json scripts

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
    "verify": "npm run typecheck && npm run lint && npm run test:run"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

---

# 5. 実行順序

## 5.1 通常実行順序

```text
1. npm run typecheck
2. npm run lint
3. npm run test:run
4. npm run build
```

---

## 5.2 Prisma変更ありの場合

`prisma/schema.prisma` または `prisma/seed.ts` を変更した場合は、以下の順序で実行する。

```text
1. npx prisma validate
2. npx prisma generate
3. npm run typecheck
4. npm run lint
5. npm run test:run
6. npm run build
```

---

## 5.3 Domainロジック変更時

以下を変更した場合：

* `src/lib/domain/risk-sizing.ts`
* `src/lib/domain/trade-plan-validation.ts`
* `src/lib/domain/trade-plan-lock.ts`
* `src/lib/domain/disclosure-classifier.ts`
* `src/lib/domain/stock-code.ts`

以下を優先実行する。

```bash
npm run test:run
```

その後、全体確認として以下を実行する。

```bash
npm run typecheck
npm run lint
```

---

# 6. テスト結果保存ルール

## 6.1 保存先ディレクトリ

以下のディレクトリを作成する。

```text
docs/
  test-runs/

artifacts/
  test-results/
    latest/
```

---

## 6.2 保存するファイル

```text
docs/
  test-runs/
    YYYYMMDD-HHMM-test-run.md

artifacts/
  test-results/
    latest/
      prisma-validate.txt
      prisma-generate.txt
      typecheck.txt
      lint.txt
      unit-test.txt
      build.txt
      summary.md
```

---

## 6.3 ファイルの役割

| ファイル                                                | 役割                |
| --------------------------------------------------- | ----------------- |
| `docs/test-runs/YYYYMMDD-HHMM-test-run.md`          | 人間が読むテスト実行記録      |
| `artifacts/test-results/latest/prisma-validate.txt` | Prisma schema検証結果 |
| `artifacts/test-results/latest/prisma-generate.txt` | Prisma Client生成結果 |
| `artifacts/test-results/latest/typecheck.txt`       | TypeScript型チェック結果 |
| `artifacts/test-results/latest/lint.txt`            | Lint結果            |
| `artifacts/test-results/latest/unit-test.txt`       | Unit/API Test結果   |
| `artifacts/test-results/latest/build.txt`           | Build結果           |
| `artifacts/test-results/latest/summary.md`          | 最新テスト結果サマリー       |

---

# 7. テスト実行記録フォーマット

Codexは、テスト実行後に以下の形式で記録する。

```markdown
# Test Run: YYYY-MM-DD HH:mm

## 1. 実行対象

| 項目 | 内容 |
|---|---|
| 対象ブランチ |  |
| 対象コミット |  |
| 対象タスク |  |
| 実行者 | Codex |

---

## 2. 実行コマンド

| コマンド | 実行有無 | 結果 |
|---|---:|---|
| npx prisma validate | Yes / No | PASS / FAIL / SKIP |
| npx prisma generate | Yes / No | PASS / FAIL / SKIP |
| npm run typecheck | Yes | PASS / FAIL |
| npm run lint | Yes | PASS / FAIL |
| npm run test:run | Yes | PASS / FAIL |
| npm run build | Yes / No | PASS / FAIL / SKIP |

---

## 3. 結果サマリー

PASS / FAIL

---

## 4. 失敗内容

### 失敗したコマンド

- 

### 失敗したテスト

- 

### エラーメッセージ要約

- 

---

## 5. 原因仮説

- 

---

## 6. 修正方針

- 

---

## 7. 修正内容

- 

---

## 8. 再実行結果

| コマンド | 結果 |
|---|---|
| npm run typecheck | PASS / FAIL |
| npm run lint | PASS / FAIL |
| npm run test:run | PASS / FAIL |
| npm run build | PASS / FAIL / SKIP |

---

## 9. 残課題

- なし
```

---

# 8. 最新テストサマリー形式

`artifacts/test-results/latest/summary.md` は以下の形式とする。

```markdown
# Latest Test Summary

## Status

PASS / FAIL

## Last Run

YYYY-MM-DD HH:mm

## Target

- Branch:
- Commit:
- Task:

## Commands

| Command | Result |
|---|---|
| prisma validate | PASS / FAIL / SKIP |
| prisma generate | PASS / FAIL / SKIP |
| typecheck | PASS / FAIL |
| lint | PASS / FAIL |
| test:run | PASS / FAIL |
| build | PASS / FAIL / SKIP |

## Failed Items

- 

## Fix Attempts

| Attempt | Summary | Result |
|---:|---|---|
| 1 |  | PASS / FAIL |
| 2 |  | PASS / FAIL |
| 3 |  | PASS / FAIL |

## Unresolved Issues

- なし
```

---

# 9. 失敗時の修正ループ

## 9.1 基本ループ

```text
テスト実行
  ↓
失敗ログ保存
  ↓
失敗原因を分類
  ↓
原因仮説を記録
  ↓
修正方針を決める
  ↓
実装コードを修正する
  ↓
再テストする
  ↓
成功なら完了
  ↓
失敗なら最大3回まで繰り返す
```

---

## 9.2 最大修正回数

Codexによる自動修正は最大3回までとする。

|    回数 | 対応                  |
| ----: | ------------------- |
|   1回目 | 直接原因を修正             |
|   2回目 | 原因仮説を見直して修正         |
|   3回目 | 影響範囲を確認して修正         |
| 4回目以降 | 自動修正を停止し、未解決事項として記録 |

---

## 9.3 未解決時の記録

3回修正しても解決しない場合、Codexは以下を記録して停止する。

```markdown
## 未解決事項

### 失敗しているコマンド

- 

### 失敗しているテスト

- 

### エラー内容

- 

### 試した修正

1. 
2. 
3. 

### 現時点の原因仮説

- 

### 人間に確認してほしいこと

- 
```

---

# 10. 失敗原因の分類

Codexは、テスト失敗時に原因を以下のカテゴリに分類する。

| 分類                   | 内容                               |
| -------------------- | -------------------------------- |
| Type Error           | TypeScript型エラー                   |
| Lint Error           | Lint違反                           |
| Test Assertion Error | テスト期待値不一致                        |
| Business Rule Error  | 業務ルール違反                          |
| Prisma Error         | schema / migration / client生成エラー |
| API Contract Error   | API仕様不一致                         |
| UI State Error       | 画面状態制御の不備                        |
| Environment Error    | 環境変数・DB接続など                      |
| Unknown              | 原因未特定                            |

---

## 10.1 Business Rule Error の例

以下は重大な業務ルール違反として扱う。

| 失敗内容                      | 重大度      |
| ------------------------- | -------- |
| BUY計画で損切未入力でも確定できる        | Critical |
| BUY計画で利確未入力でも確定できる        | Critical |
| BUY計画で最大保有日数未入力でも確定できる    | Critical |
| 推奨株数超過でも確定できる             | Critical |
| COMMITTED後に損切価格を変更できる     | Critical |
| commit時にサーバー側でリスク再計算していない | Critical |
| lockedPlanHashが保存されない     | High     |

---

# 11. 修正方針ルール

## 11.1 原則

テスト失敗時は、まず実装コードを修正する。

テストコードの修正は、テストコード自体に明確な誤りがある場合のみ許可する。

---

## 11.2 修正対象の優先順位

| 優先順位 | 修正対象       |
| ---: | ---------- |
|    1 | 業務ロジック     |
|    2 | API Route  |
|    3 | Validator  |
|    4 | Repository |
|    5 | UIコンポーネント  |
|    6 | テストコード     |

---

## 11.3 テストコードを修正してよい条件

以下の場合のみテストコードを修正してよい。

| 条件            | 例                                           |
| ------------- | ------------------------------------------- |
| テストが仕様と矛盾している | 要件上は100株単位なのにテストが1株単位前提                     |
| 型名・関数名変更に追従する | `calculateRiskSize` → `calculateRiskSizing` |
| テストデータが不正     | 銘柄コードが3文字など                                 |
| モックの作りが誤っている  | APIレスポンス形式が設計書と違う                           |

ただし、業務ルールの期待値は勝手に緩めてはいけない。

---

# 12. テスト改変禁止ルール

## 12.1 禁止事項

Codexは以下をしてはいけない。

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

## 12.2 削除・緩和禁止の重要テスト

以下のテストは削除・緩和禁止。

| テスト                     | 理由          |
| ----------------------- | ----------- |
| 損切価格未入力ならBUY計画を確定できない   | 出口未定防止      |
| 利確目標価格未入力ならBUY計画を確定できない | 出口未定防止      |
| 最大保有日数未入力ならBUY計画を確定できない | 握りっぱなし防止    |
| 予定株数が推奨株数超過なら確定できない     | サイズ超過防止     |
| 推奨株数0なら確定できない           | 最小単元リスク超過防止 |
| COMMITTED後に損切価格を変更できない  | 後知恵修正防止     |
| COMMITTED後に予定株数を変更できない  | 後知恵修正防止     |
| commit時にサーバー側でリスク再計算する  | フロント改ざん防止   |
| lockedPlanHashを保存する     | 計画確定の証跡保持   |

---

# 13. Codex作業完了条件

## 13.1 完了条件

Codexは、以下を満たすまで作業完了としてはならない。

| No | 条件                                                          |
| -: | ----------------------------------------------------------- |
|  1 | 実装対象のコードが作成・修正されている                                         |
|  2 | `npm run typecheck` がPASS                                   |
|  3 | `npm run lint` がPASS                                        |
|  4 | `npm run test:run` がPASS                                    |
|  5 | Prisma変更時は `npx prisma validate` がPASS                      |
|  6 | Prisma変更時は `npx prisma generate` がPASS                      |
|  7 | テスト結果が `docs/test-runs` に保存されている                            |
|  8 | 最新サマリーが `artifacts/test-results/latest/summary.md` に保存されている |
|  9 | 失敗があった場合、原因と修正内容が記録されている                                    |
| 10 | 未解決事項がある場合、明示されている                                          |

---

## 13.2 完了報告フォーマット

Codexは作業完了時に、以下を報告する。

```markdown
## 実装完了報告

### 実装内容

- 

### 実行したテスト

| コマンド | 結果 |
|---|---|
| npx prisma validate | PASS / FAIL / SKIP |
| npx prisma generate | PASS / FAIL / SKIP |
| npm run typecheck | PASS / FAIL |
| npm run lint | PASS / FAIL |
| npm run test:run | PASS / FAIL |
| npm run build | PASS / FAIL / SKIP |

### 保存した成果物

- docs/test-runs/YYYYMMDD-HHMM-test-run.md
- artifacts/test-results/latest/summary.md

### 修正ループ

- なし
- または 1回 / 2回 / 3回

### 未解決事項

- なし
```

---

# 14. GitHub Actions 方針

## 14.1 CI導入方針

v0.1では、最低限のGitHub Actionsを導入する。

目的は以下。

* push時に型エラーを検知する
* テスト未実行のまま進むことを防ぐ
* Codex実装後の品質を確認する
* 業務ルールの回帰を防ぐ

---

## 14.2 CI実行タイミング

| タイミング        | 実行  |
| ------------ | --- |
| push         | Yes |
| pull_request | Yes |

---

## 14.3 CIで実行するコマンド

```bash
npm ci
npx prisma generate
npm run typecheck
npm run lint
npm run test:run
npm run build
```

---

## 14.4 GitHub Actions設定案

ファイル：

```text
.github/workflows/ci.yml
```

内容案：

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

## 14.5 CI失敗時のCodex対応

CIが失敗した場合、Codexは以下を行う。

1. CIログを確認する
2. 失敗内容を `docs/test-runs` に記録する
3. 原因仮説を書く
4. 実装コードを修正する
5. ローカルで該当コマンドを再実行する
6. 修正内容を記録する
7. 再度CIを通す

---

# 15. テスト運用ディレクトリ更新案

ディレクトリ構成案に以下を追加する。

```text
docs/
  test-operation.md
  test-runs/
    .gitkeep

artifacts/
  test-results/
    latest/
      .gitkeep
```

---

## 15.1 Git管理方針

### Git管理する

```text
docs/test-operation.md
docs/test-runs/
artifacts/test-results/latest/summary.md
```

### Git管理しない候補

以下はログ量が多くなる場合、`.gitignore` 対象としてもよい。

```text
artifacts/test-results/latest/*.txt
```

ただし、Codexに失敗ログを確認させる目的では、少なくとも最新ログは残すことを推奨する。

---

# 16. Codexへの実装指示に入れる文言

Codex依頼プロンプトには、以下を必ず含める。

```text
実装後、必ず npm run typecheck / npm run lint / npm run test:run を実行してください。
```

```text
Prisma schema を変更した場合は、npx prisma validate / npx prisma generate も実行してください。
```

```text
テスト失敗時は、失敗ログを docs/test-runs と artifacts/test-results/latest に保存し、原因仮説・修正方針・修正内容・再実行結果を記録してください。
```

```text
テストを通すために、業務ルールテストを削除・緩和してはいけません。
```

```text
特に risk-sizing、trade-plan-validation、trade-plan-lock、POST /api/trade-plans/[id]/commit のテストは削除・緩和禁止です。
```

```text
修正ループは最大3回まで行い、解決できない場合は未解決事項として記録して停止してください。
```

---

# 17. 最重要運用ルール

このテスト運用で最も重要なルールは以下である。

```text
Codexは、テスト失敗を隠してはいけない。
```

```text
Codexは、テストを弱めて通してはいけない。
```

```text
Codexは、失敗原因・修正内容・再実行結果を成果物として残さなければならない。
```

この3点が守られていれば、Codexによる実装は「一発生成」ではなく、**検証と修正のループを持つ開発プロセス**になる。

---

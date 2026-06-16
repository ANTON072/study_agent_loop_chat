# 実装タスクリスト

## タスク一覧

| # | タスク | 状態 |
|---|---|---|
| 1 | プロジェクトセットアップ | [ ] |
| 2 | tools.ts：ダミーデータ・型定義 | [ ] |
| 3 | tools.ts：ツール関数・スキーマ定義 | [ ] |
| 4 | chat.ts：会話ループ | [ ] |
| 5 | chat.ts：エージェントループ | [ ] |
| 6 | 動作確認 | [ ] |

---

## 詳細フロー

### 1. プロジェクトセットアップ

- `package.json` を作成し、以下の依存関係を追加
  - `@anthropic-ai/sdk`
  - `typescript`
  - `ts-node`
  - `@types/node`
- `tsconfig.json` を作成（`module: commonjs`、`strict: true` 推奨）
- `.env` を作成し `ANTHROPIC_API_KEY` を設定
- `dotenv` を使うか、`process.env` で直接読み込むか決める

---

### 2. tools.ts：ダミーデータ・型定義

- `Customer` 型を定義（`customer_id`, `name`, `email`）
- `Order` 型を定義（`order_id`, `customer_id`, `item`, `status`, `amount`）
- `customers` のダミーデータをハードコード（CUST-001, CUST-002）
- `orders` のダミーデータをハードコード（ORD-001, ORD-002）

---

### 3. tools.ts：ツール関数・スキーマ定義

#### ツール関数

- `getCustomer(customer_id: string)` を実装
  - `customers` から該当 ID を検索して返す
  - 見つからない場合はエラーオブジェクトを返す
- `lookupOrder(order_id: string)` を実装
  - `orders` から該当 ID を検索して返す
  - 見つからない場合はエラーオブジェクトを返す

#### スキーマ定義

- Claude API に渡す `tools` 配列を定義
  - `get_customer`：`customer_id`（string, required）
  - `lookup_order`：`order_id`（string, required）
- ツール名 → 関数のディスパッチャー `executeTool(name, input)` を実装

---

### 4. chat.ts：会話ループ

- `readline` で標準入力を受け付けるループを作成
- `messages: MessageParam[]` 配列を初期化（空配列）
- ユーザーの入力を `{ role: "user", content: 入力文字列 }` として `messages` に追加
- `exit` または `quit` が入力されたらプロセスを終了

---

### 5. chat.ts：エージェントループ

ユーザー入力を `messages` に追加した後、以下のループを回す。

```
while (true) {
  1. Claude API を呼び出す（model, messages, tools を渡す）
  2. レスポンスを messages に追加（role: "assistant", content: response.content）

  3. stop_reason === "end_turn" なら：
     - content からテキストブロックを取り出して表示
     - ループを抜けて次のユーザー入力を待つ

  4. stop_reason === "tool_use" なら：
     - content から tool_use ブロックをすべて抽出（複数ある場合も考慮）
     - 各 tool_use ブロックに対して executeTool を順番に実行
     - 結果を tool_result ブロックとして配列にまとめる
     - { role: "user", content: [tool_result, tool_result, ...] } を messages に追加
     - ループの先頭に戻る（再度 API を呼び出す）
}
```

> **ポイント**：複数の `tool_result` は **1 つの `user` メッセージの `content` 配列** にまとめる。別々のメッセージにするとエラーになる。

---

### 6. 動作確認

以下のシナリオを順番に試して動作を確認する。

| シナリオ | 入力例 | 期待する動作 |
|---|---|---|
| ツール未使用 | 「こんにちは」 | 通常の返答、tool_use なし |
| 単一ツール呼び出し | 「CUST-001 の情報を教えて」 | `get_customer` が 1 回呼ばれる |
| 別ツール呼び出し | 「ORD-002 の注文を確認して」 | `lookup_order` が 1 回呼ばれる |
| 並列 tool_use | 「田中さんと鈴木さんの情報を教えて」 | `get_customer` が 2 つ同時に返ってくる |
| 連続会話 | 上記の後に別の質問 | 会話履歴が引き継がれた返答になる |

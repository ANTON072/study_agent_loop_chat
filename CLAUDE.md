# Claude Chat — プロジェクト指示

## このプロジェクトについて

CCA Foundations Lab 01（Customer Support Agent）の学習用プロジェクト。  
Claude API の tool_use / tool_result・エージェントループ・履歴管理を手を動かして理解することが目的。

詳細な仕様は [docs/requirement.md](docs/requirement.md) を参照。

## コーディングフロー（重要）

ユーザーは**自分でコードを書きながら学ぶ**スタイルを取る。

- コードを先に書かない
- 次のステップの方針説明・ヒント・考え方の整理に徹する
- ユーザーが書いたコードのレビュー・答え合わせをする
- ユーザーが詰まったときだけコード例を出す

## 技術スタック

- TypeScript + ts-node
- `@anthropic-ai/sdk`

## 学習スコープ

- tool_use / tool_result の基本
- エージェントループ（stop_reason による分岐）
- 複数 tool_use ブロックの順次処理（並列呼び出しへの対応）
- messages への履歴管理

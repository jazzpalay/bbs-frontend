# 作業ログアプリ（Frontend）
作業ログをMarkdown形式で記録・管理できるアプリのフロントエンドです

## 技術スタック
- Vue 3
- TypeScript
- Vite
- Pinia（状態管理）
- Axios（API通信）

## 主な機能

- ユーザー認証（サインアップ / サインイン）
- ログ作成・編集（Markdown対応）
- タグ管理機能
- ログ一覧のタイトル、日付、タグでのフィルタリング

## フロントエンドの工夫

- Markdown編集補助（選択範囲に対して記法を挿入）
- リアルタイムプレビュー機能
- API通信時のローディング状態をスケルトンUIで表現
- axios interceptorによる認証エラー時の自動リフレッシュ処理
- CSRF対策として、トークンをinterceptorで自動付与

## セットアップ
bash
npm install
npm run dev

## Backend
[https://github.com/xxx/backend](https://github.com/jazzpalay/bbs-backend)

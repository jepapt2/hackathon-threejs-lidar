# iPad LiDAR + Three.js + Amplify プロジェクト手順書

## 目的

iPad の LiDAR でスキャンした 3D データ (GLB / PLY) を Web 上にアップロード・表示し、以下の拡張機能を備えたアプリを構築する。

基本機能:

- モデル表示
- 視点操作 (OrbitControls)

拡張機能:

- 計測機能 (2 点間距離)
- ピン機能 (コメント付き 3D 注釈)
- モデル比較 (過去との差分可視化)
- オブジェクト呼び出し (人間・家具などプリセット挿入)

技術スタック: Vite/Three.js

---

## 推奨開発ステップ チェックリスト


## 大粒度タスク一覧

1. 環境/基盤セットアップ
	- Vite + TypeScript + three.js 初期化 / 最小シーン (OrbitControls, ライト, GLB読み込み)
	- リポジトリ初期コミット

2. バックエンド方式確定と初期構築
	- Amplify (Auth + GraphQL + S3 + DynamoDB) か Hono(Lambda/Node) を選択
	- 最小 API: /api/ping /api/models /api/pins /api/measurements

3. 3Dモデルパイプライン整備
	- iPad スキャン → GLB/PLY エクスポート → Draco 圧縮
	- S3 署名付き URL 取得 or ローカル配置 → three.js loader 読み込み

4. 基本機能実装
	- モデル表示 / 視点操作
	- ピン CRUD（コメント表示）
	- 計測 (2 点距離ライン)
	- オブジェクト挿入 (人間・家具プリセット)

5. 差分比較機能
	- 過去モデルとの距離ベース差分計算 (閾値色付け)
	- UI: モード切替 + 閾値スライダ

6. パフォーマンス最適化
	- Draco / 点群間引き / Lazy Load / テクスチャ圧縮(KTX2)
	- 差分計算高速化 (サンプリング + グリッドハッシュ)

7. デプロイとドキュメント
	- Amplify Hosting or alternative
	- README 更新 / 構成図 / 利用手順

8. 拡張・将来機能検討
	- リアルタイム同期 (AppSync Subscriptions)
	- オフライン対応 (DataStore)
	- 差分ジョブ化 (非同期 Lambda + ステータス管理)
	- WebXR / セグメンテーション


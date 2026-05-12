# Instant Design — CMS 管理画面ガイド

Decap CMS によるノーコード コンテンツ編集機能です。

## 何ができる?

- トップページ Hero のキャッチコピー・説明文の書き換え
- 価格表の追加 / 削除 / 値段変更
- About ページ本文の書き換え
- 画像のアップロード

すべて WordPress 風のフォーム UI で完結し、保存すると即サイトに反映されます。

---

## 試し方(ローカル / 5秒で起動)

ターミナルを2つ用意してください。

### ターミナル1:HP を起動

```bash
cd "/Users/sugiyamahitoshihiko/Downloads/業務委託、就職/instant-design-site"
python3 -m http.server 8001
```

### ターミナル2:CMS のローカルブリッジを起動

```bash
npx decap-server
```

(初回のみパッケージのダウンロードが入ります。Yで承認してください)

### ブラウザで開く

```
http://localhost:8001/admin/
```

→ 認証なしで管理画面が開きます。フォーム編集 → 「Publish」を押すと、
リポジトリ内の `content/site.json` などが直接書き換わります。
HP 側を開き直すと反映を確認できます。

---

## 本番運用に切り替える(後日タスク)

公開URL `https://sugiyama-yoshihiko.github.io/instant-design-preview/admin/` から
誰でも編集できる状態にするには、以下が必要です。

1. GitHub OAuth App を登録(GitHubの設定画面で5分)
2. OAuth プロキシを Cloudflare Worker に1つだけデプロイ(無料)
3. `admin/config.yml` の `local_backend: true` を `false` に変更

設定したいタイミングで Claude に「本番OAuth設定して」とお伝えください。

---

## 編集できる範囲

| 編集対象 | ファイル | 反映先 |
|---|---|---|
| ブランド名 / Hero テキスト / Coming Soon | `content/site.json` | `index.html`(自動) |
| 価格表(キャッチコピー/チラシ/ロゴ等) | `content/pricing.json` | `index.html` 中央 + フッター(自動) |
| About 本文 | `content/about.md` | `about.html`(後日 wire-up 予定) |

※ デザイン(色・フォント・レイアウト)の変更には CMS 編集では対応できません。Claude にご相談ください。

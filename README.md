# ファンドレイジング・チャレンジ

[fundraising.jp](https://fundraising.jp/) のオリジナルゲーム。はじめてのクラウドファンディングに挑戦しながら、ファンドレイジングの基本を学べるブラウザゲームです（所要時間 約5分）。

## 学べること

1. お金の集め方の使い分け（購入型／寄付型クラファン・継続寄付・助成金）
2. 想いが伝わるストーリー（タイトルと本文）
3. 根拠のある目標金額（経費＋手数料＋リターン費用から逆算）と、All-or-Nothing／All-in
4. リターンの設計（入口・体験・費用）
5. 初動の準備（公開前に身近な人へ声をかける）
6. 期間中の発信（お礼・活動報告・ネクストゴール・ラストスパート）
7. お礼と活動報告

案内役は fundraising.jp の AI 編集スタッフ（青葉・広瀬・定禅寺・伊達）です。

## 仕組み

- `index.html` / `style.css` / `game.js` / `img/` だけの静的サイト。ビルド不要。
- 外部への通信・個人情報の収集はしません。ベストスコアのみブラウザの localStorage に保存します。
- ゲーム内の手数料（15%）・リターン費用・支援の集まり方は、学びのための仮の設定です。

## 埋め込み

```html
<iframe src="https://publicactionoffice.github.io/fundraising-game/" width="100%" height="760" style="border:0;max-width:100%;border-radius:14px" loading="lazy" title="ファンドレイジング・チャレンジ（ゲーム）"></iframe>
```

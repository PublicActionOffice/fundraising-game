# ファンドレイジング・チャレンジ

[ファンドレイジングジャパン](https://fundraising.jp/) のオリジナルゲーム。はじめてのクラウドファンディングに挑戦しながら、ファンドレイジングの基本を学べるブラウザゲームです（所要時間 約5分）。

## 学べること

1. お金の集め方の使い分け（購入型／寄付型クラファン・継続寄付・助成金）
2. 想いが伝わるストーリー（タイトルと本文）
3. 根拠のある目標金額（経費＋手数料＋リターン費用から逆算）と、All-or-Nothing／All-in
4. リターンの設計（入口・体験・費用）
5. 初動の準備（公開前に身近な人へ声をかける）
6. 期間中の発信（お礼・活動報告・ネクストゴール・ラストスパート）
7. お礼と活動報告

案内役はファンドレイジングジャパンの AI 編集スタッフ（青葉・広瀬・定禅寺・伊達）です。

## 仕組み

- `index.html` / `style.css` / `game.js` / `img/` だけの静的サイト。ビルド不要。
- 外部への通信・個人情報の収集はしません。ベストスコアのみブラウザの localStorage に保存します。
- ゲーム内の手数料（15%）・リターン費用・支援の集まり方は、学びのための仮の設定です。

## 埋め込み

ゲームは iframe の中から親ページへ自分の高さを postMessage で送ります（送るのは高さと「先頭へ」の合図だけ）。親ページに下のスクリプトを置くと、iframe の高さが中身に合わせて自動で変わり、画面が切り替わったときにゲームの先頭が見える位置へスクロールします。スクリプトがない場合は、高さ 760px の中でスクロールして遊べます。

```html
<iframe id="frc-game" src="https://publicactionoffice.github.io/fundraising-game/?v=8" width="100%" height="760" style="border:0;max-width:100%;border-radius:14px;display:block" title="ファンドレイジング・チャレンジ（ゲーム）"></iframe>
<script>
(function () {
	/* ゲームから届く高さに合わせて iframe の高さを変える。WordPress がスクリプト内の & や < を変換してしまうため、それらを使わずに書いている */
	var f = document.getElementById('frc-game');
	if (!f) return;
	window.addEventListener('message', function (e) {
		if (e.source !== f.contentWindow) return;
		if (e.origin !== 'https://publicactionoffice.github.io') return;
		var d = e.data;
		if (!d || typeof d !== 'object') return;
		if (d.type === 'frc-height') {
			var h = parseInt(d.height, 10);
			if (isNaN(h) || h > 20000 || 200 > h) return;
			f.style.height = h + 'px';
		} else if (d.type === 'frc-top') {
			var hd = document.querySelector('header'), off = 12;
			if (hd) {
				var p = getComputedStyle(hd).position;
				if (p === 'sticky' || p === 'fixed') off += Math.max(0, hd.getBoundingClientRect().bottom);
			}
			var top = f.getBoundingClientRect().top;
			if (top - off >= 0) return;
			window.scrollBy({ top: top - off, behavior: 'smooth' });
		}
	});
})();
</script>
```

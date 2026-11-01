/* ファンドレイジング・チャレンジ — 静的ファイルのみ・外部通信なし */
(function () {
	'use strict';

	/* ===== ゲーム内の前提（フィクション） ===== */
	var FEE = 0.15;      // このゲームでの手数料（仮定）
	var RET_EST = 0.20;  // 目標金額を考えるときの、リターン費用の見積もり（目安）
	var POTENTIAL = 2.35; // 支援の集まりやすさの係数（ゲームバランス用）
	var TICKET = 8000;   // 1人あたりの平均支援額（ゲーム内の仮定）

	var STAFF = {
		aoba:    { name: '青葉 港', role: '調査・リサーチ', img: 'img/aoba.jpg' },
		hirose:  { name: '広瀬 ソフィー', role: '執筆・伝え方', img: 'img/hirose.jpg' },
		jozenji: { name: '定禅寺 真子', role: '校正・信頼', img: 'img/jozenji.jpg' },
		date:    { name: '伊達 蓮', role: '編集長', img: 'img/date.jpg' }
	};

	var PROJECTS = [
		{
			id: 'kitchen', icon: '🍛', short: '子ども食堂',
			name: '子ども食堂のキッチンを新しくしたい',
			intro: 'あなたは、地域で子ども食堂を開いています。古いキッチンを新しくして、もっとたくさんの子どもに温かいごはんを届けたい。',
			cost: 600000, costItems: [['業務用コンロと冷蔵庫', 420000], ['設置の工事費', 180000]],
			titles: [
				{ t: '子ども食堂キッチン改修プロジェクトへのご支援のお願い', g: 'good' },
				{ t: '「おかわり！」の声を、もっと。子ども食堂のキッチンを新しくしたい', g: 'best' },
				{ t: '【拡散希望】助けてください！！キッチンがピンチです！！', g: 'bad' }
			],
			scene: 'コンロが1口しか使えず、ごはんを待つ子どもたちの列ができる日のこと',
			exp: '子ども食堂で、子どもたちと一緒にカレーづくり',
			plate: '新しいキッチンの壁の記念プレートにお名前を',
			report: '新しいキッチンで料理する様子', done: '新しいキッチン、いよいよ実現です！',
			comments: ['子どもの頃の自分を思い出しました', '地元の子どもたちのために！', 'おかわりの声、楽しみにしています']
		},
		{
			id: 'cafe', icon: '📚', short: 'ブックカフェ',
			name: '商店街に、本と出会えるブックカフェをひらきたい',
			intro: 'あなたは、シャッターが目立ってきた地元の商店街に、世代をこえて人が集まるブックカフェをひらこうとしています。',
			cost: 1000000, costItems: [['本棚・家具', 450000], ['内装の工事費', 400000], ['最初の本の仕入れ', 150000]],
			titles: [
				{ t: 'ブックカフェ開業資金のクラウドファンディング', g: 'good' },
				{ t: 'シャッター通りに、本の灯りを。商店街にみんなのブックカフェをひらきたい', g: 'best' },
				{ t: '【拡散希望】最後のチャンス！とにかく応援してください！！', g: 'bad' }
			],
			scene: '学校帰りの中学生と、近所のおじいさんが、閉まった本屋の前で立ち止まっていた日のこと',
			exp: 'ブックカフェの「1日店長」体験',
			plate: '本棚の記念プレートにお名前を',
			report: 'オープンしたカフェで本を読む人たちの様子', done: 'みんなのブックカフェ、いよいよオープンです！',
			comments: ['商店街に灯りがともりますように', 'オープンしたら必ず行きます', '本好きとして応援しています']
		},
		{
			id: 'cat', icon: '🐈', short: '保護猫シェルター',
			name: '保護猫シェルターに、医療ケアの部屋をつくりたい',
			intro: 'あなたは、保護猫シェルターの運営メンバーです。病気やけがをした猫を落ち着いてケアできる部屋をつくり、新しい家族へつなぎたい。',
			cost: 800000, costItems: [['ケア用ケージと医療機器', 500000], ['部屋の改装費', 300000]],
			titles: [
				{ t: '保護猫シェルター医療ケア室設置のためのご支援のお願い', g: 'good' },
				{ t: 'ちいさな命を、次の家族へ。保護猫のための「ケアの部屋」をつくりたい', g: 'best' },
				{ t: '【拡散希望】猫たちが大ピンチ！！今すぐ助けて！！', g: 'bad' }
			],
			scene: '雨の夜に保護した子猫を、ケアする場所がなく段ボールで見守った日のこと',
			exp: 'シェルター見学とお世話体験',
			plate: 'ケアの部屋の記念プレートにお名前を',
			report: 'ケアの部屋で元気になった猫たちの様子', done: '保護猫のケアの部屋、いよいよ完成です！',
			comments: ['うちの子も保護猫です', '小さな命を応援します', '新しい家族が見つかりますように']
		}
	];

	var GENERIC_COMMENTS = ['応援しています！', '少しですが力になれたら', '友だちにもシェアしました', '完成を楽しみにしています', 'がんばってください！', '想いに共感しました', '活動報告、読みました'];

	var METHOD_OPTS = ['購入型クラファン', '寄付型クラファン', '継続寄付（マンスリーサポーター）', '助成金'];
	var METHOD_QS = [
		{ q: '地域の農家と新しいジャムを作りたい。支援してくれた人には、完成したジャムを届けたい。', a: 0,
			fb: '支援のお礼に、モノやサービス（リターン）を届けるのが「購入型」。新しい商品づくりや、先に応援してくれる人を集めたいときに向いています。' },
		{ q: '毎月かかる家賃やスタッフの人件費を、長く安定して支えてほしい。', a: 2,
			fb: '毎月決まった額を寄付してもらう「継続寄付」は、運営を安定させる力になります。一度きりのクラファンだけに頼らない仕組みづくりが大切です。' },
		{ q: '財団の公募に、事業計画と予算書を出して応募したい。審査に通ればまとまった資金が得られる。', a: 3,
			fb: '財団・企業・行政などが募集する「助成金」は、審査があり、採択されるとは限りません。原則として返済は不要ですが、使い道のルールや報告が求められます。' },
		{ q: '災害で被害を受けた地域を支える活動の資金。モノのお返しより、活動報告で応えたい。', a: 1,
			fb: 'モノのお返しを前提にしない「寄付型」。お礼のメッセージや活動報告で応えます。団体や条件によっては、寄付が税の控除の対象になることもあります。' },
		{ q: '自分たちで作った絵本を、まず予約してくれる人を集めて印刷代にあてたい。', a: 0,
			fb: '完成品をリターンとして届ける「購入型」がぴったり。予約販売のように、先に支援を集めて製作できるのが強みです。' }
	];

	var STORY_CARDS = [
		{ k: 'why', label: 'なぜ自分がやるのか（きっかけになった出来事）', g: 'best', fx: { kyo: 12 },
			fb: 'あなた自身の言葉で語る「きっかけ」は、いちばん心に届きます。' },
		{ k: 'scene', label: '困っている場面を、具体的なエピソードで', g: 'best', fx: { kyo: 12 },
			fb: '「{scene}」のような具体的な場面は、読む人が思い浮かべやすくなります。' },
		{ k: 'use', label: '集まったお金の使い道と内訳', g: 'best', fx: { shin: 12 },
			fb: 'お金の使い道がはっきりしていると、安心して支援できます。' },
		{ k: 'future', label: '実現したあとの、うれしい未来の風景', g: 'good', fx: { kyo: 8 },
			fb: '未来の姿を見せると、応援したくなる気持ちが高まります。' },
		{ k: 'history', label: '団体の設立年や沿革を、くわしく長く', g: 'bad', fx: { shin: 2 },
			fb: '信頼の材料にはなりますが、長すぎると肝心の想いが埋もれてしまいます。' },
		{ k: 'please', label: '「とにかく助けてください！」と何度も強調', g: 'bad', fx: {},
			fb: '必死さだけでは、何に使われるのかが伝わりません。' }
	];

	/* ===== 状態 ===== */
	var S;
	function reset(project) {
		S = {
			p: project,
			st: { kyo: 30, nin: 30, shin: 30 },
			pts: [], // [{key, pts, max}]
			lessons: {},
			goal: 0, plan: 'aon', returns: [], costRatio: 0.2,
			seg: [1, 1, 1, 1, 1],
			raised: 0, supporters: 0, day: 0, goalHit: false, media: false,
			camp: []
		};
	}

	/* ===== ユーティリティ ===== */
	var app = document.getElementById('app');
	var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	function yen(n) { return Math.round(n).toLocaleString('ja-JP') + '円'; }
	function man(n) { var m = n / 10000; return (m % 1 === 0 ? m : m.toFixed(1)) + '万円'; }
	function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
	function fill(s) { return s.replace('{scene}', S ? S.p.scene : ''); }
	function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
	function rand(a, b) { return a + Math.random() * (b - a); }
	function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
	function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
	function gpts(g) { return g === 'best' ? 2 : g === 'good' ? 1 : 0; }
	function addPts(key, pts, max) { S.pts.push({ key: key, pts: pts, max: max }); }
	function top() {
		try { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); } catch (e) { window.scrollTo(0, 0); }
		toParent({ type: 'frc-top' });
	}

	/* iframe 埋め込み時：親ページに高さを伝える（高さ以外の情報は送らない） */
	var embedded = window.parent !== window;
	function toParent(msg) { if (embedded) { try { window.parent.postMessage(msg, '*'); } catch (e) {} } }
	var lastH = 0;
	function sendHeight() {
		var de = document.documentElement;
		var hgt = Math.ceil(app.getBoundingClientRect().height + app.offsetTop) + 2;
		if (de.scrollHeight > de.clientHeight) hgt = Math.max(hgt, de.scrollHeight + 2); // はみ出している分も含める
		if (Math.abs(hgt - lastH) < 2) return;
		lastH = hgt;
		toParent({ type: 'frc-height', height: hgt });
	}
	if (embedded) {
		if (window.ResizeObserver) new ResizeObserver(sendHeight).observe(app);
		window.addEventListener('load', sendHeight);
		setInterval(sendHeight, 400); // ResizeObserver が動かない環境の保険
		window.addEventListener('resize', function () { lastH = 0; sendHeight(); });
	}
	function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

	var STAT_LABEL = { kyo: '共感', nin: '認知', shin: '信頼' };
	function applyFx(fx) {
		var out = [];
		Object.keys(fx || {}).forEach(function (k) {
			if (!STAT_LABEL[k]) return;
			S.st[k] = Math.max(0, Math.min(100, S.st[k] + fx[k]));
			out.push(STAT_LABEL[k] + (fx[k] >= 0 ? '+' : '') + fx[k]);
		});
		updateMeters(fx);
		return out;
	}
	function quality() { return (S.st.kyo * 0.4 + S.st.nin * 0.3 + S.st.shin * 0.3) / 100; }

	/* ===== 画面の骨組み ===== */
	var STEPS = ['手段', '伝え方', '目標', 'リターン', '初動', '30日間', 'お礼'];
	function frame(stepIdx) {
		app.innerHTML = '';
		var bar = h('div', 'hud');
		var steps = h('ol', 'steps');
		STEPS.forEach(function (s, i) {
			var li = h('li', i < stepIdx ? 'done' : i === stepIdx ? 'now' : '', '<span>' + (i + 1) + '</span><em>' + s + '</em>');
			steps.appendChild(li);
		});
		bar.appendChild(steps);
		if (S) {
			var m = h('div', 'meters');
			['kyo', 'nin', 'shin'].forEach(function (k) {
				m.appendChild(h('div', 'meter meter--' + k, '<b>' + STAT_LABEL[k] + '</b><i><u style="width:' + S.st[k] + '%"></u></i><small data-d="' + k + '"></small>'));
			});
			bar.appendChild(m);
		}
		app.appendChild(bar);
		var main = h('div', 'stage');
		app.appendChild(main);
		top();
		return main;
	}
	function updateMeters(fx) {
		['kyo', 'nin', 'shin'].forEach(function (k) {
			var u = app.querySelector('.meter--' + k + ' u');
			if (u) u.style.width = S.st[k] + '%';
			var d = app.querySelector('[data-d="' + k + '"]');
			if (d && fx && fx[k]) {
				d.textContent = (fx[k] > 0 ? '+' : '') + fx[k];
				d.className = 'pop ' + (fx[k] > 0 ? 'up' : 'down');
				setTimeout(function () { d.className = ''; d.textContent = ''; }, 1600);
			}
		});
	}
	function talk(who, html, extra) {
		var s = STAFF[who];
		var b = h('div', 'talk' + (extra ? ' ' + extra : ''));
		b.innerHTML = '<img src="' + s.img + '" alt="" width="64" height="64"><div class="bubble"><p class="who">' + s.name + '<span>' + s.role + '</span></p><div class="say">' + html + '</div></div>';
		return b;
	}
	var MARK = { best: '◎', good: '○', bad: '△' };
	var GRADE_WORD = { best: 'すばらしい！', good: 'いいね！', bad: 'もう一歩' };

	/* 1つ選ぶ問題 */
	function single(main, o) {
		// o: {choices:[{label, sub, g, fb, fx}], key, onNext(choice)}
		var list = h('div', 'choices');
		var done = false;
		o.choices.forEach(function (c, i) {
			var b = h('button', 'choice', '<span class="choice__l">' + c.label + '</span>' + (c.sub ? '<span class="choice__s">' + c.sub + '</span>' : ''));
			b.type = 'button';
			b.addEventListener('click', function () {
				if (done) return; done = true;
				var gained = applyFx(c.fx);
				if (o.key) addPts(o.key, gpts(c.g), 2);
				Array.prototype.forEach.call(list.children, function (x, j) {
					x.disabled = true;
					var g = o.choices[j].g;
					x.classList.add('g-' + g);
					if (j === i) x.classList.add('picked');
					x.insertAdjacentHTML('afterbegin', '<span class="mark">' + MARK[g] + '</span>');
				});
				var best = o.choices.filter(function (x) { return x.g === 'best'; })[0];
				var fb = h('div', 'feedback g-' + c.g, '<p class="feedback__h">' + MARK[c.g] + ' ' + GRADE_WORD[c.g] + (gained.length ? '<span class="gain">' + gained.join('　') + '</span>' : '') + '</p><p>' + fill(c.fb) + '</p>' +
					(c.g !== 'best' && !o.noBest && best && best.fb ? '<p class="feedback__best"><b>◎のポイント：</b>' + fill(best.fb) + '</p>' : ''));
				list.after(fb);
				var nx = nextBtn(function () { o.onNext(c); });
				fb.after(nx);
				setTimeout(function () { fb.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' }); }, 60);
			});
			list.appendChild(b);
		});
		main.appendChild(list);
	}

	/* 複数選ぶ問題 */
	function multi(main, o) {
		// o: {items:[{label, sub, g, fb, fx}], n, key, onNext(selected)}
		var sel = [];
		var list = h('div', 'cards');
		var info = h('p', 'pickinfo');
		var ok = h('button', 'btn btn--main', '決定する');
		ok.type = 'button';
		function refresh() {
			var left = o.n - sel.length;
			info.textContent = left > 0 ? 'あと ' + left + ' つ選んでください' : 'これで決定しますか？';
			ok.disabled = left !== 0;
		}
		o.items.forEach(function (c, i) {
			var b = h('button', 'card', '<span class="card__l">' + c.label + '</span>' + (c.sub ? '<span class="card__s">' + c.sub + '</span>' : ''));
			b.type = 'button';
			b.setAttribute('aria-pressed', 'false');
			b.addEventListener('click', function () {
				if (b.disabled) return;
				var k = sel.indexOf(i);
				if (k >= 0) sel.splice(k, 1);
				else { if (sel.length >= o.n) return; sel.push(i); }
				b.classList.toggle('on', k < 0);
				b.setAttribute('aria-pressed', k < 0 ? 'true' : 'false');
				refresh();
			});
			list.appendChild(b);
		});
		ok.addEventListener('click', function () {
			if (ok.disabled) return;
			ok.remove(); info.remove();
			var chosen = sel.map(function (i) { return o.items[i]; });
			var fx = {};
			chosen.forEach(function (c) { Object.keys(c.fx || {}).forEach(function (k) { fx[k] = (fx[k] || 0) + c.fx[k]; }); });
			var gained = applyFx(fx);
			var sum = chosen.reduce(function (a, c) { return a + gpts(c.g); }, 0);
			var maxSum = o.items.map(function (c) { return gpts(c.g); }).sort(function (a, b) { return b - a; }).slice(0, o.n).reduce(function (a, b) { return a + b; }, 0);
			if (o.key) addPts(o.key, Math.round(2 * sum / maxSum), 2);
			var g = sum >= maxSum - 1 ? 'best' : sum >= maxSum / 2 ? 'good' : 'bad';
			Array.prototype.forEach.call(list.children, function (x, j) {
				x.disabled = true;
				var it = o.items[j];
				x.classList.add('g-' + it.g);
				x.insertAdjacentHTML('afterbegin', '<span class="mark">' + MARK[it.g] + '</span>');
				x.insertAdjacentHTML('beforeend', '<span class="card__fb">' + fill(it.fb) + '</span>');
			});
			var extra = o.summary ? o.summary(chosen, g) : '';
			var fb = h('div', 'feedback g-' + g, '<p class="feedback__h">' + MARK[g] + ' ' + GRADE_WORD[g] + (gained.length ? '<span class="gain">' + gained.join('　') + '</span>' : '') + '</p>' + extra);
			list.after(fb);
			fb.after(nextBtn(function () { o.onNext(chosen, g); }));
			setTimeout(function () { fb.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' }); }, 60);
		});
		main.appendChild(list);
		main.appendChild(info);
		main.appendChild(ok);
		refresh();
	}

	function nextBtn(fn, label) {
		var b = h('button', 'btn btn--main btn--next', (label || '次へ') + ' <span aria-hidden="true">→</span>');
		b.type = 'button';
		b.addEventListener('click', function () { b.disabled = true; fn(); });
		return b;
	}
	function heading(main, kicker, title) {
		main.appendChild(h('p', 'kicker', kicker));
		main.appendChild(h('h2', 'title', title));
	}

	/* ===== タイトル ===== */
	function titleScreen() {
		S = null;
		app.innerHTML = '';
		var best = store('frc_best');
		var t = h('div', 'cover');
		t.innerHTML =
			'<div class="cover__img"><img src="img/title.jpg" alt="" width="1200" height="800" onerror="this.parentNode.classList.add(\'noimg\')"></div>' +
			'<p class="cover__kicker">fundraising.jp オリジナルゲーム</p>' +
			'<h1 class="cover__title">ファンドレイジング<br>チャレンジ</h1>' +
			'<p class="cover__lead">あなたの「やりたい」を、みんなの応援で実現する30日間。<br>AI編集スタッフと一緒に、はじめてのクラウドファンディングに挑戦しよう。</p>' +
			'<ul class="cover__learn"><li>お金の集め方の使い分け</li><li>想いが伝わるストーリー</li><li>目標金額とリターン設計</li><li>初動と、期間中の発信</li><li>お礼と活動報告</li></ul>' +
			'<p class="cover__time">所要時間：約5分　' + (best ? '／ あなたのベスト：' + esc(best) + '点' : '') + '</p>';
		var go = nextBtn(projectScreen, 'はじめる');
		go.classList.add('btn--big');
		t.appendChild(go);
		var team = h('div', 'cover__team');
		Object.keys(STAFF).forEach(function (k) { team.insertAdjacentHTML('beforeend', '<figure><img src="' + STAFF[k].img + '" alt="" width="56" height="56"><figcaption>' + STAFF[k].name.split(' ')[0] + '<small>' + STAFF[k].role + '</small></figcaption></figure>'); });
		t.appendChild(team);
		app.appendChild(t);
		top();
	}

	/* ===== プロジェクトを選ぶ ===== */
	function projectScreen() {
		S = null;
		var main = frame(-1);
		heading(main, 'STEP 0', 'どのプロジェクトに挑戦する？');
		main.appendChild(talk('date', 'はじめまして、編集長の伊達です。今日はあなたが、プロジェクトの<strong>実行者</strong>。実現したいことを一つ選んでください。'));
		var list = h('div', 'projects');
		PROJECTS.forEach(function (p) {
			var b = h('button', 'project', '<span class="project__icon" aria-hidden="true">' + p.icon + '</span><span class="project__name">' + p.name + '</span><span class="project__intro">' + p.intro + '</span><span class="project__cost">必要な経費：' + man(p.cost) + '</span>');
			b.type = 'button';
			b.addEventListener('click', function () { reset(p); methodScreen(0, shuffle(METHOD_QS).slice(0, 3), 0); });
			list.appendChild(b);
		});
		main.appendChild(list);
	}

	/* ===== ① お金の集め方の使い分け ===== */
	function methodScreen(i, qs, correct) {
		var main = frame(0);
		heading(main, '① 手段を選ぶ　' + (i + 1) + ' / 3', 'この場合、どの集め方が合う？');
		if (i === 0) main.appendChild(talk('aoba', '調査担当の青葉です。お金の集め方は一つじゃありません。まずは<strong>目的に合った道具</strong>を選ぶ練習から。'));
		var q = qs[i];
		main.appendChild(h('div', 'case', '<span class="case__tag">ケース' + (i + 1) + '</span>' + q.q));
		single(main, {
			key: 'method', noBest: true,
			choices: METHOD_OPTS.map(function (label, j) {
				return { label: label, g: j === q.a ? 'best' : 'bad', fb: j === q.a ? q.fb : '正解は「' + METHOD_OPTS[q.a] + '」。' + q.fb, fx: {} };
			}),
			onNext: function (c) {
				var c2 = correct + (c.g === 'best' ? 1 : 0);
				if (i < 2) methodScreen(i + 1, qs, c2);
				else { S.lessons.method = c2 >= 2; methodWrap(c2); }
			}
		});
	}
	function methodWrap(c) {
		var main = frame(0);
		heading(main, '① 手段を選ぶ', '3問中 ' + c + '問 正解！');
		main.appendChild(talk('aoba', '寄付、クラファン、助成金。それぞれ得意なことが違います。組み合わせて使う団体も多いんですよ。<br>今回のあなたのプロジェクト「' + esc(S.p.name) + '」は、多くの人に想いを知ってもらいながら設備のお金を集めたいので、<strong>クラウドファンディング</strong>で挑戦しましょう！'));
		main.appendChild(nextBtn(titleSelect));
	}

	/* ===== ② 伝え方 ===== */
	function titleSelect() {
		var main = frame(1);
		heading(main, '② 伝え方　1 / 2', 'プロジェクトのタイトルはどれにする？');
		main.appendChild(talk('hirose', '執筆担当の広瀬です。タイトルは、ページを開くかどうかを決める<strong>最初の一言</strong>。「誰のために」「何を実現したいか」が伝わるものを選んでみて。'));
		var fbs = {
			best: '「誰のために、何を実現したいか」が一目で伝わります。情景が浮かぶ言葉は、読む人の心を動かします。',
			good: '間違いではありませんが、少し硬い印象。読む人がその先の風景を思い浮かべられる言葉を入れてみましょう。',
			bad: '勢いは伝わりますが、何のプロジェクトか分かりません。「拡散希望」だけでは、人はなかなか動きません。'
		};
		var fxs = { best: { kyo: 10, nin: 5 }, good: { kyo: 3 }, bad: { kyo: -3, nin: 2 } };
		single(main, {
			key: 'title',
			choices: shuffle(S.p.titles).map(function (t) { return { label: t.t, g: t.g, fb: fbs[t.g], fx: fxs[t.g] }; }),
			onNext: function (c) { S.titleG = c.g; storyCards(); }
		});
	}
	function storyCards() {
		var main = frame(1);
		heading(main, '② 伝え方　2 / 2', 'ページに書く内容を3つ選ぼう');
		main.appendChild(talk('hirose', 'プロジェクトページの本文に入れる内容を<strong>3つ</strong>選んでください。支援する人の気持ちになって考えるのがコツです。'));
		multi(main, {
			key: 'story', n: 3,
			items: shuffle(STORY_CARDS),
			summary: function (ch, g) {
				var bestN = ch.filter(function (c) { return c.g === 'best'; }).length;
				S.lessons.story = S.titleG === 'best' && bestN >= 2;
				return '<p>' + (g === 'best' ? '共感（なぜ・どんな場面）と、信頼（お金の使い道）の両方がそろった、心に届くページになりました。' :
					'伝わるページに欠かせないのは、<strong>「なぜやるのか」「具体的な場面」「お金の使い道」</strong>。共感と信頼の両方をそろえましょう。') + '</p>';
			},
			onNext: goalScreen
		});
	}

	/* ===== ③ 目標金額 ===== */
	function goalScreen() {
		var p = S.p;
		var mid = Math.ceil(p.cost / (1 - FEE - RET_EST) / 50000) * 50000;
		var main = frame(2);
		heading(main, '③ 目標金額　1 / 2', '目標金額はいくらにする？');
		var rows = p.costItems.map(function (c) { return '<tr><th>' + c[0] + '</th><td>' + yen(c[1]) + '</td></tr>'; }).join('');
		main.appendChild(talk('aoba', '数字の出番ですね。必要な経費はこちら。でも、集まったお金が<strong>そのまま全部使えるわけではない</strong>ことに注意です。'));
		main.appendChild(h('div', 'sheet',
			'<table><caption>必要な経費</caption>' + rows + '<tr class="sum"><th>合計</th><td>' + yen(p.cost) + '</td></tr></table>' +
			'<ul class="sheet__note"><li>集まった金額から<strong>手数料</strong>が引かれます（このゲームでは15%と仮定）</li><li>リターンの品物や送料など<strong>リターンの費用</strong>もかかります（目安として20%と見積もり）</li></ul>'));
		single(main, {
			key: 'goal',
			choices: [
				{ v: p.cost, label: man(p.cost), sub: '経費ぴったり', g: 'bad', fx: { shin: 2 },
					fb: '達成しても、手数料とリターンの費用が引かれると、手元に残るお金が経費に足りなくなってしまいます。' },
				{ v: mid, label: man(mid), sub: '経費＋手数料＋リターン費用から逆算', g: 'best', fx: { shin: 8 },
					fb: '経費 ÷（1 − 手数料15% − リターン費用20%）で逆算した、根拠のある目標です。根拠がはっきりした金額は、支援する人の安心にもつながります。' },
				{ v: p.cost * 3, label: man(p.cost * 3), sub: '夢は大きく！', g: 'bad', fx: { kyo: 2 },
					fb: '大きな夢は素敵ですが、根拠のない高い目標は届かないことも。必要な金額から逆算するのが基本です。' }
			],
			onNext: function (c) { S.goal = c.v; S.mid = mid; S.lessons.goal = c.g === 'best'; planScreen(); }
		});
	}
	function planScreen() {
		var main = frame(2);
		heading(main, '③ 目標金額　2 / 2', '集め方の方式はどっちにする？');
		main.appendChild(talk('jozenji', '校正・事実確認の定禅寺です。クラファンには大きく分けて2つの方式があります。多くのサービスで選べますが、<strong>条件はサービスごとに違う</strong>ので、実際には必ず規約を確認してくださいね。'));
		main.appendChild(h('div', 'compare',
			'<div><b>All-or-Nothing（達成時実行型）</b><p>期間内に目標金額に届いたときだけ、集まったお金を受け取れる。届かなければ不成立で、受け取れない。</p></div>' +
			'<div><b>All-in（実行確約型）</b><p>目標金額に届かなくても、集まった分を受け取れる。そのかわり、プロジェクトの実行とリターンのお届けが求められる。</p></div>'));
		single(main, {
			key: 'plan',
			choices: [
				{ v: 'aon', label: 'All-or-Nothing', sub: '目標に届いたら実行', g: 'best', fx: { shin: 3 },
					fb: '設備は必要な額がそろわないと買えません。お金が足りないまま始めて支援者との約束を守れなくなる事態を防げる、安心な選択です。' },
				{ v: 'allin', label: 'All-in', sub: '届かなくても実行', g: 'good', fx: { nin: 2 },
					fb: '集まった分は受け取れますが、目標に届かなくても実行とリターンが必要です。足りない分を自分たちで用意できるか、よく考えて選びましょう。' }
			],
			onNext: function (c) { S.plan = c.v; returnScreen(); }
		});
	}

	/* ===== ④ リターン設計 ===== */
	function returnScreen() {
		var p = S.p;
		var main = frame(3);
		heading(main, '④ リターン', '支援のお礼（リターン）を3つ選ぼう');
		main.appendChild(talk('jozenji', 'リターンは支援への「お礼」。ポイントは、<strong>気軽に参加できる入口</strong>、<strong>プロジェクトらしさ</strong>、そして<strong>費用と手間</strong>です。お届けまでが約束ですよ。'));
		multi(main, {
			key: 'returns', n: 3,
			items: [
				{ id: 'msg', label: '3,000円｜お礼のメッセージ＋活動報告', g: 'best', cost: 0.05, fx: { kyo: 5, shin: 5 },
					fb: '少額から気軽に参加できる「入口」。費用もほとんどかかりません。' },
				{ id: 'exp', label: '10,000円｜' + p.exp, g: 'best', cost: 0.20, fx: { kyo: 8 },
					fb: 'ここでしかできない体験は、支援者が「仲間」になるきっかけに。' },
				{ id: 'plate', label: '30,000円｜' + p.plate, g: 'good', cost: 0.15, fx: { kyo: 3, shin: 3 },
					fb: '形に残る記念は、高額でも応援したい人の受け皿になります。' },
				{ id: 'sticker', label: '5,000円｜オリジナルステッカー', g: 'good', cost: 0.30, fx: { nin: 3 },
					fb: '手軽で人気。ただし製作費と送料を忘れずに計算しましょう。' },
				{ id: 'tv', label: '50,000円｜最新の高級家電', g: 'bad', cost: 0.80, fx: { nin: 2 },
					fb: 'プロジェクトと関係が薄く、原価が高すぎて、集めたお金の多くが消えてしまいます。' },
				{ id: 'hand', label: '8,000円｜手づくりの品を一つずつ、全員に', g: 'bad', cost: 0.50, fx: { kyo: 2 },
					fb: '気持ちはうれしいけれど、費用と手間がかかりすぎて、肝心の活動に手が回らなくなるかも。' }
			],
			summary: function (ch) {
				S.returns = ch.map(function (c) { return c.id; });
				S.costRatio = ch.reduce(function (a, c) { return a + c.cost; }, 0) / ch.length;
				var bad = ch.some(function (c) { return c.g === 'bad'; });
				var entry = S.returns.indexOf('msg') >= 0;
				S.lessons.returns = entry && !bad;
				return '<p>選んだリターンの費用は、支援額のおよそ<strong>' + Math.round(S.costRatio * 100) + '%</strong>' +
					(S.costRatio > RET_EST + 0.02 ? '。見積もり（20%）を超えています。手元に残るお金が減ってしまうかも…。' : '。見積もりの範囲内です。') + '</p>' +
					(entry ? '' : '<p>少額で気軽に参加できる「入口」のリターンがあると、応援してくれる人のすそ野が広がります。</p>');
			},
			onNext: launchPrep
		});
	}

	/* ===== ⑤ 初動 ===== */
	function launchPrep() {
		var main = frame(4);
		heading(main, '⑤ 初動', '公開前の1週間、何をする？（2つ選ぶ）');
		main.appendChild(talk('date', 'いよいよ公開が近づいてきました。クラファンは<strong>公開直後の勢い</strong>がとても大切と言われます。最初に支援が集まっているページは、初めて見た人も「応援しよう」と思いやすいんです。'));
		multi(main, {
			key: 'launch', n: 2,
			items: [
				{ label: '家族・友人・仲間に一人ずつ直接連絡して、「初日に応援してほしい」とお願いする', g: 'best', seg: 0.32, fx: { nin: 15 },
					fb: '身近な人からの最初の支援が、知らない人の支援を呼ぶ呼び水になります。一斉送信より、一人ずつの言葉が届きます。' },
				{ label: '協力してくれそうな地域の人やお店に、公開前に説明しておく', g: 'best', seg: 0.25, fx: { nin: 10, shin: 8 },
					fb: '事前に話を通しておくと、公開と同時に一緒に広めてくれる仲間になります。' },
				{ label: 'SNSに「拡散希望」とだけ投稿する予定にする', g: 'bad', seg: 0.05, fx: { nin: 4 },
					fb: '知らない人に届いても、想いが伝わらなければ支援にはつながりにくいものです。' },
				{ label: '準備はあとまわし。公開してから考える', g: 'bad', seg: -0.15, fx: {},
					fb: '公開直後の数日は、いちばん注目が集まりやすい大切な時間です。準備なしではもったいない！' }
			],
			summary: function (ch, g) {
				S.seg[0] = 0.6 + ch.reduce(function (a, c) { return a + c.seg; }, 0);
				S.lessons.launch = g === 'best';
				return '<p>' + (g === 'best' ? '準備はばっちり。初日からスタートダッシュが期待できます！' : '初動の準備は、「公開前に、身近な人へ一人ずつ声をかけること」から。') + '</p>';
			},
			onNext: launchGo
		});
	}
	function launchGo() {
		var main = frame(5);
		heading(main, '公開！', '30日間のクラウドファンディング、スタート！');
		main.appendChild(talk('date', '目標は <strong>' + man(S.goal) + '</strong>（' + (S.plan === 'aon' ? 'All-or-Nothing' : 'All-in') + '）。途中で何度か、あなたの判断が必要になります。さあ、行きましょう！'));
		main.appendChild(nextBtn(function () { campaign(0); }, '公開する'));
	}

	/* ===== ⑥ 30日間 ===== */
	var SEGS = [[1, 3], [4, 10], [11, 20], [21, 27], [28, 30]];
	function dayWeight(d) { return d === 1 ? 10 : d === 2 ? 6 : d === 3 ? 4 : d <= 10 ? 2 : d <= 20 ? 1 : d <= 27 ? 1.5 : d === 28 ? 3 : d === 29 ? 4 : 7; }
	var W_SUM = (function () { var s = 0; for (var d = 1; d <= 30; d++) s += dayWeight(d); return s; })();

	var dash;
	function buildDash(main) {
		dash = h('div', 'dash');
		dash.innerHTML =
			'<div class="dash__top"><span class="dash__day">公開<b>0</b>日目</span><span class="dash__left">残り<b>30</b>日</span></div>' +
			'<p class="dash__amount" aria-live="polite"><b>0</b>円</p>' +
			'<div class="dash__bar"><i></i><span class="dash__goal">目標 ' + man(S.goal) + '</span></div>' +
			'<div class="dash__row"><span>達成率 <b class="dash__pct">0</b>%</span><span>支援者 <b class="dash__sup">0</b>人</span></div>' +
			'<ul class="dash__feed" aria-hidden="true"></ul>' +
			'<svg class="dash__chart" viewBox="0 0 300 60" preserveAspectRatio="none" aria-hidden="true"></svg>';
		main.appendChild(dash);
		renderDash();
	}
	var history = [];
	function renderDash() {
		if (!dash) return;
		var pct = S.raised / S.goal * 100;
		dash.querySelector('.dash__day b').textContent = S.day;
		dash.querySelector('.dash__left b').textContent = 30 - S.day;
		dash.querySelector('.dash__amount b').textContent = Math.round(S.raised).toLocaleString('ja-JP');
		dash.querySelector('.dash__bar i').style.width = Math.min(100, pct) + '%';
		dash.querySelector('.dash__pct').textContent = Math.floor(pct);
		dash.querySelector('.dash__sup').textContent = S.supporters;
		dash.classList.toggle('hit', S.raised >= S.goal);
		var svg = dash.querySelector('.dash__chart');
		if (history.length) {
			var mx = Math.max.apply(null, history.concat([1]));
			var bw = 300 / 30;
			svg.innerHTML = history.map(function (v, i) { var hh = Math.max(1, v / mx * 56); return '<rect x="' + (i * bw + 1) + '" y="' + (60 - hh) + '" width="' + (bw - 2) + '" height="' + hh + '" rx="1.5"></rect>'; }).join('');
		}
	}
	function feed(text) {
		var ul = dash && dash.querySelector('.dash__feed');
		if (!ul) return;
		var li = h('li', null, '💬 ' + esc(text));
		ul.prepend(li);
		while (ul.children.length > 2) ul.lastChild.remove();
	}
	function toast(html) {
		var t = h('div', 'toast', html);
		document.body.appendChild(t);
		setTimeout(function () { t.classList.add('out'); }, 2600);
		setTimeout(function () { t.remove(); }, 3200);
	}
	function confetti() {
		if (reduce) return;
		var box = h('div', 'confetti');
		var colors = ['#ec5f52', '#0e3869', '#ffb4a8', '#1d5596', '#ffd36b'];
		for (var i = 0; i < 46; i++) {
			var s = h('i');
			s.style.left = rand(0, 100) + '%';
			s.style.background = pick(colors);
			s.style.animationDelay = rand(0, 0.6) + 's';
			s.style.animationDuration = rand(1.6, 2.8) + 's';
			s.style.transform = 'rotate(' + rand(0, 360) + 'deg)';
			box.appendChild(s);
		}
		document.body.appendChild(box);
		setTimeout(function () { box.remove(); }, 3600);
	}

	function simDay(d, si) {
		var mult = S.seg[si];
		if (S.media && si === 2 && d >= 14) mult *= 1.35;
		var v = S.p.cost * POTENTIAL * quality() * dayWeight(d) / W_SUM * mult * rand(0.85, 1.15);
		return Math.max(0, v);
	}

	function runSeg(si, done) {
		var a = SEGS[si][0], b = SEGS[si][1];
		var d = a;
		var step = reduce ? 60 : 260;
		function tick() {
			if (d > b) { done(); return; }
			var v = simDay(d, si);
			var before = S.raised;
			S.raised += v;
			S.supporters += Math.max(v > 0 ? 1 : 0, Math.round(v / TICKET));
			S.day = d;
			history[d - 1] = v;
			if (Math.random() < 0.75) feed(Math.random() < 0.45 ? pick(S.p.comments) : pick(GENERIC_COMMENTS));
			if (S.media && si === 2 && d === 14) toast('📰 地元の新聞に、プロジェクトの記事が載りました！');
			if (!S.goalHit && before < S.goal && S.raised >= S.goal) {
				S.goalHit = true;
				confetti();
				toast('🎉 目標金額を達成しました！');
			}
			renderDash();
			d++;
			setTimeout(tick, step);
		}
		tick();
	}

	function campaignScreen(si) {
		var main = frame(5);
		var labels = ['スタートダッシュ', '序盤', '中盤', '終盤', 'ラストスパート'];
		heading(main, '⑥ 30日間　' + SEGS[si][0] + '〜' + SEGS[si][1] + '日目', labels[si] + (si === 0 ? '！ 公開しました' : ''));
		buildDash(main);
		return main;
	}

	function campaign(si) {
		history = si === 0 ? [] : history;
		var main = campaignScreen(si);
		var wait = h('p', 'running', '支援が集まっています…');
		main.appendChild(wait);
		runSeg(si, function () {
			wait.remove();
			if (si < 4) event(main, si);
			else nextAfterCampaign(main);
		});
	}

	function nextAfterCampaign(main) {
		main.appendChild(talk('date', '30日間、おつかれさまでした！ 結果を見てみましょう。'));
		main.appendChild(nextBtn(resultScreen, '結果を見る'));
	}

	var EVENTS = [
		function () {
			return {
				who: 'hirose', text: '公開から3日。' + (S.seg[0] >= 1 ? '準備のおかげで、たくさんの支援と応援コメントが届いています！' : 'ゆっくりですが、支援と応援コメントが届き始めました。') + 'さて、どうしましょう？',
				choices: [
					{ label: '支援してくれた人一人ひとりに、お礼を返す。「よかったらシェアしてください」とひと言添えて', g: 'best', seg: 1.2, fx: { shin: 10, nin: 8 },
						fb: '素早いお礼は、支援者を「応援団」に変えます。支援者からのシェアは、知り合いへの何よりの紹介になります。' },
					{ label: 'SNSで一斉に「ありがとうございます！」と投稿する', g: 'good', seg: 1.0, fx: { shin: 4, nin: 5 },
						fb: '感謝を伝えるのは大切。さらに一人ひとりに言葉を返すと、もっと気持ちが届きます。' },
					{ label: '数字が気になって、画面を見守るだけ', g: 'bad', seg: 0.8, fx: {},
						fb: '気持ちは分かります！でも、待っているだけでは支援は広がりません。' }
				]
			};
		},
		function () {
			return {
				who: 'jozenji', text: '公開10日目。<strong>中だるみ</strong>の時期に入り、支援のペースが落ちてきました。さらに「お金の使い道を、もう少しくわしく知りたい」という質問が届いています。',
				choices: [
					{ label: '質問にていねいに答え、ページにも追記。準備の様子を写真つきで「活動報告」として発信する', g: 'best', seg: 1.25, fx: { shin: 12, kyo: 6 },
						fb: '誠実な回答と、進んでいる様子が見える活動報告は、信頼を大きく高めます。途中経過の発信が、中だるみを乗りこえる力になります。', media: true },
					{ label: '最初と同じ告知文を、もう一度SNSに投稿する', g: 'good', seg: 1.0, fx: { nin: 4 },
						fb: '告知を続けるのは大事。ただ、同じ内容のくり返しより、新しい話題（進み具合や裏話）があると読まれやすくなります。' },
					{ label: '忙しいので、質問への返事はあとまわしにする', g: 'bad', seg: 0.8, fx: { shin: -5 },
						fb: '質問への返事がないと、見ている人も不安になります。答えはページにも書き足しておくと、同じ疑問をもつ人にも届きます。' }
				]
			};
		},
		function () {
			var hit = S.raised >= S.goal;
			var rest = Math.max(0, S.goal - S.raised);
			return hit ? {
				who: 'aoba', text: '公開20日目、なんと<strong>目標達成</strong>！ 残りはあと10日あります。どうしますか？',
				choices: [
					{ label: '「ネクストゴール」を設定。追加の支援で、さらに何ができるようになるかを具体的に伝える', g: 'best', seg: 1.2, fx: { kyo: 6, shin: 6 },
						fb: '達成後も「次に実現したいこと」を具体的に示すと、応援はもう一段広がります。追加の使い道を明確にするのがポイントです。' },
					{ label: '「達成しました！ありがとうございます」と報告する', g: 'good', seg: 1.0, fx: { shin: 5 },
						fb: '感謝の報告はとても大切。せっかくの残り期間、次の目標も示せるとさらに◎です。' },
					{ label: '達成したので、もう何もしない', g: 'bad', seg: 0.75, fx: {},
						fb: '期間はまだ続きます。報告とお礼だけでも続けると、支援者との関係が深まります。' }
				]
			} : {
				who: 'aoba', text: '公開20日目。目標まで、あと<strong>' + yen(rest) + '</strong>。残りは10日です。どうしますか？',
				choices: [
					{ label: '「あと' + man(Math.ceil(rest / 10000) * 10000) + 'で実現できます」と具体的に伝え、支援者に知り合いへの紹介をお願いする', g: 'best', seg: 1.3, fx: { nin: 10, kyo: 4 },
						fb: '「あといくら」が具体的だと、背中を押されます。支援してくれた人は、いちばん頼れる仲間です。' },
					{ label: 'これまでと同じ告知をくり返す', g: 'good', seg: 1.0, fx: { nin: 4 },
						fb: '続けることは大事。具体的な数字や新しい話題を添えると、もっと届きます。' },
					{ label: '「全然集まらない…」と弱音だけを投稿する', g: 'bad', seg: 0.8, fx: { kyo: -3 },
						fb: '正直な気持ちも大事ですが、「どうしてほしいか」が伝わらないと、応援したくても動けません。' }
				]
			};
		},
		function () {
			return {
				who: 'date', text: '終了まで、あと<strong>3日</strong>。終了間際は、ページを見る人が増えて支援が伸びやすいと言われます。最後の作戦は？',
				choices: [
					{ label: '終了の日時を予告し、これまでの歩みと感謝をこめて、最後の呼びかけをする', g: 'best', seg: 1.3, fx: { nin: 8, kyo: 6 },
						fb: '「いつまでか」がはっきりすると、迷っていた人が動きます。感謝の言葉は、支援してくれた人のシェアも生みます。' },
					{ label: 'いつもどおりの告知をする', g: 'good', seg: 1.0, fx: { nin: 2 },
						fb: '悪くはありません。でも、最後のチャンスと伝わるひと工夫で、結果は大きく変わります。' },
					{ label: '慌てて、新しいリターンを大量に追加する', g: 'bad', seg: 1.0, fx: { nin: 3 }, cost: 0.05,
						fb: '思いつきで増やすと、費用やお届けの手間で後から困ることに。リターンは公開前にしっかり設計しておきましょう。' }
				]
			};
		}
	];

	function event(main, si) {
		var e = EVENTS[si]();
		var box = h('div', 'event');
		box.appendChild(talk(e.who, e.text));
		main.appendChild(box);
		single(box, {
			key: 'camp',
			choices: e.choices,
			onNext: function (c) {
				S.seg[si + 1] = c.seg;
				if (c.cost) S.costRatio += c.cost;
				if (c.media && S.st.shin >= 50 && S.st.kyo >= 50) S.media = true;
				S.camp.push(c.g);
				campaign(si + 1);
			}
		});
		setTimeout(function () { box.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' }); }, 80);
	}

	/* ===== 結果 ===== */
	function resultScreen() {
		var p = S.p;
		var success = S.raised >= S.goal;
		var received = S.plan === 'aon' && !success ? 0 : S.raised;
		var fee = received * FEE;
		var rc = received * S.costRatio;
		var net = received - fee - rc;
		S.success = success;
		S.received = received > 0;
		S.enough = received > 0 && net >= p.cost;
		var main = frame(5);
		heading(main, '結果発表', success ? '🎉 目標達成！ プロジェクト成立！' : (S.plan === 'aon' ? '目標に届かず、今回は不成立…' : '目標には届かなかったけれど…'));
		var pct = Math.floor(S.raised / S.goal * 100);
		main.appendChild(h('div', 'result',
			'<div class="result__big"><span>集まった金額</span><b>' + yen(S.raised) + '</b><small>達成率 ' + pct + '%　支援者 ' + S.supporters + '人</small></div>' +
			'<table class="sheet__t"><caption>お金の行き先</caption>' +
			'<tr><th>受け取れる金額</th><td>' + yen(received) + '</td></tr>' +
			'<tr><th>手数料（15%と仮定）</th><td>−' + yen(fee) + '</td></tr>' +
			'<tr><th>リターンの費用（約' + Math.round(S.costRatio * 100) + '%）</th><td>−' + yen(rc) + '</td></tr>' +
			'<tr class="sum"><th>手元に残るお金</th><td>' + yen(net) + '</td></tr>' +
			'<tr><th>必要な経費</th><td>' + yen(p.cost) + '</td></tr></table>'));
		var msg;
		if (received === 0) msg = 'All-or-Nothing なので、今回はお金を受け取れません。でも、<strong>' + S.supporters + '人</strong>があなたの想いに共感してくれたことは、何よりの財産です。';
		else if (S.enough) msg = '手元に残るお金で、必要な経費をまかなえます！ <strong>' + p.done + '</strong>';
		else msg = '集まったお金から手数料とリターンの費用を引くと、<strong>経費に ' + yen(p.cost - net) + ' 足りません</strong>。' +
			(S.goal < S.mid ? '目標金額を、経費だけで決めてしまったのが原因かも。' : S.costRatio > RET_EST + 0.02 ? 'リターンの費用がかさんだのが原因かも。' : '') +
			(S.plan === 'allin' && !success ? 'All-in なので、足りない分を自分たちで用意して、約束どおり実行する必要があります。' : '');
		main.appendChild(talk(S.enough ? 'aoba' : 'jozenji', msg));
		main.appendChild(nextBtn(afterScreen));
		if (success && !reduce) setTimeout(confetti, 300);
	}

	/* ===== ⑦ お礼と報告 ===== */
	function afterScreen() {
		var p = S.p;
		var main = frame(6);
		heading(main, '⑦ お礼と報告', S.received ? '終了後、支援者にどう向き合う？' : '終了後、応援してくれた人にどうする？');
		main.appendChild(talk('jozenji', 'クラファンは、終わってからが本番とも言われます。支援してくれた人は、あなたの活動の<strong>仲間</strong>。次につながる向き合い方を選んでください。'));
		var choices = S.received ? [
			{ label: S.success ? 'お礼を伝え、リターンを約束どおり届ける。完成後は「' + p.report + '」を写真つきで活動報告する' :
				'お礼を伝え、リターンを約束どおり届ける。足りない分をどう補うか（自己資金や助成金など）と、進み具合を活動報告で伝える', g: 'best', fx: { shin: 10 },
				fb: 'お礼・お届け・活動報告まで続けると、支援者は「また応援したい」と感じます。写真に人が写るときは、本人（子どもなら保護者）の了解をとるなど、配慮も忘れずに。' },
			{ label: 'お礼のメッセージを一斉に1回送る', g: 'good', fx: { shin: 3 },
				fb: 'お礼は大切。その後の活動報告で「あなたの支援でこうなりました」と伝えると、つながりが続きます。' },
			{ label: '終わったので、そのまま次の準備にとりかかる', g: 'bad', fx: { shin: -5 },
				fb: 'お礼も報告もないと、支援者は「あのお金はどうなったの？」と不安に。信頼は、次の挑戦の土台です。' }
		] : [
			{ label: '応援してくれたことにお礼を伝え、今回のふりかえりと、これからどうするか（再挑戦や別の方法）を報告する', g: 'best', fx: { shin: 10 },
				fb: '結果がどうであれ、誠実な報告は信頼になります。ふりかえりを生かして、再挑戦で実現するプロジェクトもあります。' },
			{ label: '「残念でした」とだけ伝える', g: 'good', fx: { shin: 2 },
				fb: 'ひと言でも伝えるのは大切。次にどうするかまで伝えると、また応援してもらいやすくなります。' },
			{ label: '恥ずかしいので、何も言わずにそっとしておく', g: 'bad', fx: { shin: -5 },
				fb: '応援してくれた人は、結果よりあなたの次の一歩を気にかけています。ぜひ声を届けて。' }
		];
		single(main, {
			key: 'after',
			choices: choices,
			onNext: function (c) { S.lessons.after = c.g === 'best'; endingScreen(); }
		});
	}

	/* ===== エンディング ===== */
	var LESSONS = [
		{ k: 'method', t: 'お金の集め方の使い分け', tip: '寄付・クラファン・助成金には、それぞれ向き不向きがある。目的に合わせて選び、組み合わせる。' },
		{ k: 'story', t: '想いが伝わるストーリー', tip: '「なぜ自分が」「具体的な場面」「お金の使い道」。共感と信頼の両方をそろえる。' },
		{ k: 'goal', t: '根拠のある目標金額', tip: '経費に、手数料とリターンの費用を足して逆算する。手数料はサービスごとに違うので必ず確認。' },
		{ k: 'returns', t: 'リターンの設計', tip: '少額の入口、プロジェクトらしい体験、費用と手間の見積もり。' },
		{ k: 'launch', t: '初動の準備', tip: '公開前に、身近な人へ一人ずつ声をかけておく。最初の支援が次の支援を呼ぶ。' },
		{ k: 'camp', t: '期間中の発信', tip: 'お礼をすぐ返す、活動報告で進み具合を見せる、終了前に具体的に呼びかける。' },
		{ k: 'after', t: 'お礼と活動報告', tip: '終わってからが本番。お礼・お届け・報告が、次の応援につながる。' }
	];
	function endingScreen() {
		var campPts = S.camp.reduce(function (a, g) { return a + gpts(g); }, 0);
		S.lessons.camp = campPts >= 6;
		var got = S.pts.reduce(function (a, x) { return a + x.pts; }, 0);
		var max = S.pts.reduce(function (a, x) { return a + x.max; }, 0);
		var score = Math.round(got / max * 80 + (S.success ? 12 : 0) + (S.enough ? 8 : 0));
		var prev = parseInt(store('frc_best') || '0', 10);
		if (score > prev) store('frc_best', String(score));
		var rank = score >= 90 ? ['S', 'みんなを笑顔にするファンドレイザー'] : score >= 75 ? ['A', '想いを届けるプロジェクトリーダー'] : score >= 50 ? ['B', '伸びしろたっぷりのチャレンジャー'] : ['C', 'はじめの一歩を踏み出した挑戦者'];
		var cleared = LESSONS.filter(function (l) { return S.lessons[l.k]; }).length;

		var main = frame(7);
		var badge = h('div', 'badge rank-' + rank[0], '<p class="badge__k">あなたの称号</p><p class="badge__rank">' + rank[0] + '</p><p class="badge__t">' + rank[1] + '</p><p class="badge__s">スコア ' + score + '点' + (score > prev && prev ? '（ベスト更新！）' : '') + '　／　学び ' + cleared + ' / ' + LESSONS.length + '</p>');
		main.appendChild(badge);
		var ul = h('ul', 'lessons');
		LESSONS.forEach(function (l) {
			var ok = !!S.lessons[l.k];
			ul.insertAdjacentHTML('beforeend', '<li class="' + (ok ? 'ok' : 'todo') + '"><span class="lessons__m">' + (ok ? '✓' : '★') + '</span><div><b>' + l.t + '</b>' + (ok ? '' : '<em>次はここ！</em>') + '<p>' + l.tip + '</p></div></li>');
		});
		main.appendChild(h('h3', 'sub', '今回の学び'));
		main.appendChild(ul);
		main.appendChild(talk('date', (S.success ?
			'おめでとう！ でも、いちばんすごいのは、<strong>「やってみたい」を形にしようと一歩踏み出したこと</strong>です。' : S.received ?
			'目標には届かなかったけれど、<strong>' + S.supporters + '人</strong>の応援で、プロジェクトは一歩前に進みました。足りない分は、助成金や継続寄付など別の方法と組み合わせる道もあります。' :
			'今回は届かなかったけれど、応援してくれた<strong>' + S.supporters + '人</strong>は、もうあなたの仲間です。ふりかえって、もう一度挑戦すればいい。') +
			'<br>現実のファンドレイジングも、今日学んだことを一つずつ試せば、きっと応援してくれる人に出会えます。あなたの挑戦を、私たちも応援しています。', 'talk--final'));
		main.appendChild(h('div', 'todo-box',
			'<h3>今日からできる、はじめの3歩</h3><ol>' +
			'<li>実現したいことと「なぜ自分がやるのか」を、3行で書いてみる</li>' +
			'<li>最初に応援してくれそうな人を、10人書き出してみる</li>' +
			'<li>必要な経費を書き出して、目標金額を逆算してみる</li></ol>'));
		var acts = h('div', 'actions');
		var again = nextBtn(function () { var p = S.p; reset(p); methodScreen(0, shuffle(METHOD_QS).slice(0, 3), 0); }, '同じプロジェクトで再挑戦');
		var other = nextBtn(projectScreen, '別のプロジェクトに挑戦');
		other.classList.remove('btn--main'); other.classList.add('btn--sub');
		acts.appendChild(again); acts.appendChild(other);
		acts.insertAdjacentHTML('beforeend', '<a class="btn btn--link" href="https://fundraising.jp/" target="_top">fundraising.jp で、実際のプロジェクトを見てみる →</a>');
		main.appendChild(acts);
		main.appendChild(h('p', 'disclaimer', 'このゲームはフィクションです。手数料・リターン費用・支援の集まり方は、学びのための仮の設定です。実際の手数料や方式の条件はサービスやプランによって異なるため、必ず各サービスの最新情報をご確認ください。'));
		if (rank[0] === 'S' || rank[0] === 'A') setTimeout(confetti, 300);
	}

	titleScreen();
})();

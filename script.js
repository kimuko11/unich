// 🎛️ローディング・マスク

const 読み込みリスト = [
    'img/ucyu_enkei.webp',
    'img/ucyu_cyukei.webp',
    'img/ucyu_kinkei.webp',
    'img/ucyu_seigun.webp',
    'img/logo.webp',
    'img/logo_subtitle.webp',
    'img/logo_fukidasi.webp',
    'img/radio.webp',
    'pic/hosocyu_yuka.webp',
    'pic/hosocyu_ucyu-yoro.webp',
    'pic/hosocyu.webp',
    'pic/hosocyu_hosoto.webp',
    'pic/hosocyu_onair.webp'
];

function ページオープン() {
    const 暗幕 = document.getElementById('暗幕');
  
    if (暗幕 && !暗幕.classList.contains('読み込み完了')) {
        暗幕.classList.add('読み込み完了');
    }
}

function プリロード(対象URL) {
    return new Promise((成功) => {
        const 画像   = new Image();
        画像.src     = 対象URL;
        画像.onload  = 成功;
        画像.onerror = 成功; // エラーでも
    });
}

Promise.all(読み込みリスト.map(プリロード)).then(() => {
    ページオープン();
});
setTimeout(() => { // 3秒経過で強制
    ページオープン();
}, 3000);


// 🎛️設定 (初期値)

let スライダー文字速度 = 4;
let スライダー効果音量 = 4;

// ▫️計算用の派生変数

let 設定速度ms = 90 - スライダー文字速度 * 10; // 0〜90ms
let ボイス音量 = スライダー効果音量 * 0.03;    // 0.0〜0.27
let 効果音音量 = ボイス音量 * 0.3;

// ▫️設定更新関数

function 設定更新() {
    設定速度ms = 90 - スライダー文字速度 * 10;
    ボイス音量 = スライダー効果音量 * 0.03;
    効果音音量 = ボイス音量 * 0.3;
}


// 🎛️設定スライダーとリセット（localStorage対応）

document.addEventListener('DOMContentLoaded', () => {
    const 設定         = document.getElementById('設定');
    const ラジオ       = document.getElementById('📻');
    const 入力_文字速度 = document.getElementById('文字速度');
    const 入力_効果音量 = document.getElementById('効果音量');
    const リセット      = document.getElementById('リセット');

    const 初期値_文字速度 = 4;
    const 初期値_効果音量 = 4;

    // ▫️ストレージ保存用のKEY名

    const KEY_文字速度 = 'site_text_speed';
    const KEY_効果音量 = 'site_se_volume';

    // ▫️保存データの読み込み（無ければデフォルト値）

    const 保存_文字速度 = localStorage.getItem(KEY_文字速度);
    const 保存_効果音量 = localStorage.getItem(KEY_効果音量);

    スライダー文字速度 = 保存_文字速度 !== null ? parseInt(保存_文字速度, 10) : 初期値_文字速度;
    スライダー効果音量 = 保存_効果音量 !== null ? parseInt(保存_効果音量, 10) : 初期値_効果音量;

    // ▫️文字速度 (画面のスライダー要素と数値表示に初期値を反映)

    if (入力_文字速度) {
        入力_文字速度.value = スライダー文字速度;
        const 表示 = 入力_文字速度.nextElementSibling;
        if (表示) 表示.textContent = スライダー文字速度;

        入力_文字速度.addEventListener('input', (e) => {
            スライダー文字速度 = parseInt(e.target.value, 10);
            const 表示 = e.target.nextElementSibling;
            if (表示) 表示.textContent = e.target.value;
            
            localStorage.setItem(KEY_文字速度, スライダー文字速度); // 変更時にブラウザへ即時保存
            設定更新();
        });
    }

    // ▫️効果音量 (上記文字速度と同様)

    if (入力_効果音量) {
        入力_効果音量.value = スライダー効果音量;
        const 表示 = 入力_効果音量.nextElementSibling;
        if (表示) 表示.textContent = スライダー効果音量;

        入力_効果音量.addEventListener('input', (e) => {
            スライダー効果音量 = parseInt(e.target.value, 10);
            const 表示 = e.target.nextElementSibling;
            if (表示) 表示.textContent = e.target.value;

            localStorage.setItem(KEY_効果音量, スライダー効果音量);
            設定更新();
        });
    }

    // ▫️開閉切り替え

    ラジオ.addEventListener('click', (e) => {
        e.stopPropagation();
        設定.classList.toggle('オープン');
    });

    // ▫️設定外をタップしたら閉じる

    document.addEventListener('click', (e) => {
        if (!設定.contains(e.target)) {
            設定.classList.remove('オープン');
        }
    });

    // ▫️リセットボタンのクリック処理（保存値も削除してデフォルトへ）

    if (リセット) {
        リセット.addEventListener('click', () => {

            localStorage.removeItem(KEY_文字速度); // 保存データの消去
            localStorage.removeItem(KEY_効果音量);

            if (入力_文字速度) {
                入力_文字速度.value = 初期値_文字速度; // 文字速度のリセット
                スライダー文字速度  = 初期値_文字速度;
                const 表示 = 入力_文字速度.nextElementSibling;
                if (表示) 表示.textContent = 初期値_文字速度;
            }

            if (入力_効果音量) {
                入力_効果音量.value = 初期値_効果音量; // 効果音量のリセット
                スライダー効果音量  = 初期値_効果音量;
                const 表示 = 入力_効果音量.nextElementSibling;
                if (表示) 表示.textContent = 初期値_効果音量;
            }

            設定更新(); // 変数と音量の再計算
        });
    }

    設定更新(); // 初回の音量・速度設定の反映
});


// 🎛️スクロールによる画面出現(▼クラス)の監視

const ページ開始時刻          = performance.now();
const スクロール出現最短時刻   = 8000;      // ⚠️ページ開始から自動アニメ経過時間 + 1000ms
const スクロール出現閾値既定値 = 1;         // data-threshold 既定値
const スクロール出現マップ     = new Map(); // 監視対象要素 → .再生 を付与する要素の配列
const スクロール出現監視一覧   = new Map(); // threshold値 → IntersectionObserver（同じ閾値は1つに共有）
 
function スクロール出現実行(要素) {
    要素.classList.add('再生');
}
 
function スクロール出現交差時(項目一覧, 監視) {
    項目一覧.forEach((項目) => {
        if (!項目.isIntersecting) return;
        監視.unobserve(項目.target); // 一度再生したら監視終了
        const 対象一覧 = スクロール出現マップ.get(項目.target) || [項目.target];
        const 経過時刻 = performance.now() - ページ開始時刻;
        const 残り時刻 = スクロール出現最短時刻 - 経過時刻;
        const 再生実行 = () => 対象一覧.forEach(スクロール出現実行);

        if (残り時刻 > 0) {
            setTimeout(再生実行, 残り時刻);
        } else {
            再生実行();
        }
    });
}

function スクロール出現監視取得(閾値) {
    if (!スクロール出現監視一覧.has(閾値)) {
        const 監視 = new IntersectionObserver(
            (項目一覧) => スクロール出現交差時(項目一覧, 監視),
            { threshold: 閾値 }
        );
        スクロール出現監視一覧.set(閾値, 監視);
    }
    return スクロール出現監視一覧.get(閾値);
}

document.querySelectorAll('.▼').forEach((要素) => {
    const 親要素監視系 = 要素.classList.contains('スライド') || 要素.classList.contains('拡大') || 要素.classList.contains('倒れ');
    const 監視対象    = 親要素監視系 ? 要素.parentElement : 要素;
    const 指定閾値    = parseFloat(要素.dataset.threshold);
    const 閾値        = Number.isNaN(指定閾値) ? スクロール出現閾値既定値 : 指定閾値;
    const 監視        = スクロール出現監視取得(閾値);

    if (!スクロール出現マップ.has(監視対象)) {
        スクロール出現マップ.set(監視対象, []);
        監視.observe(監視対象);
    }
    スクロール出現マップ.get(監視対象).push(要素);
});


// 🎛️キャラ一覧

const キャラ一覧 = document.querySelectorAll('.🥸, .🐰, .👩, .👤');

// ▫️エリアのクラスからキャラ判定

function キャラ取得(エリア) {
    if (エリア.classList.contains('🥸')) return 'ドク';
    if (エリア.classList.contains('🐰')) return 'ユニ';
    return '第三';
}

// ▫️エリアのクラスから「身体アニメ管理用の種別」を判定

function 種別取得(エリア) {
    for (const 種別 of ['🥸', '🐰', '👩', '👤']) {
        if (エリア.classList.contains(種別)) return 種別;
    }
    return '__既定__';
}


// 🎛️キャラの画面内出現の監視

const 監視 = new IntersectionObserver((項目一覧) => {
    項目一覧.forEach((項目) => {
        if (項目.isIntersecting) {
            待機リスト.push(項目.target);
            監視.unobserve(項目.target);
        }
    });
    次キャラ処理();
}, { threshold: 0.9 });

キャラ一覧.forEach((エリア) => { 監視.observe(エリア); });


// 🎛️「上から順番に登場 → セリフ」を管理する待機キュー (高速スクロール対策)

const 待機リスト     = [];
const 最終登場エリア = {};
let 表示処理中       = false;

function 並び替え(リスト) {
    return リスト.sort((a, b) => {
        const 位置関係 = a.compareDocumentPosition(b);
        return 位置関係 & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
}

function 次キャラ処理() {
    if (表示処理中 || 待機リスト.length === 0) return;

    並び替え(待機リスト);
    const エリア = 待機リスト.shift();
    表示処理中 = true;

    const 種別      = 種別取得(エリア);
    const 前回エリア = 最終登場エリア[種別];
    if (前回エリア && 前回エリア !== エリア) {
        身体アニメ終了(前回エリア);
    }
    最終登場エリア[種別] = エリア;

    const キャラ画像 = エリア.querySelector('.キャラ画像');
    const ふきだし   = エリア.querySelector('.💬');

    キャラ画像.classList.add('出現');
    ふきだし  .classList.add('出現');

    キャラ画像.addEventListener('transitionend', function スライドイン完了(イベント) {
        if (イベント.propertyName !== 'transform') return;
        キャラ画像.removeEventListener('transitionend', スライドイン完了);

        ふきだし.style.setProperty('--横幅', `${ふきだし.offsetWidth}px`); // ふきだしを均等にフワフワさせるため取得
        ふきだし.style.setProperty('--縦幅', `${ふきだし.offsetHeight}px`);

        const 効果音パス = ふきだし.dataset.se; // 効果音があるなら再生
        if (効果音パス) {
            効果音再生(効果音パス);
        }

        セリフ表示(エリア, () => {
            表示処理中 = false;
            次キャラ処理();
        });
    });
}


// 🎛️身体・差分アニメ

function 身体アニメ開始(エリア) {
    エリア.querySelectorAll('.縦伸縮, .横揺れ, .横揺れ小, .驚き→縦伸縮, .震え, .驚き目→目パチ, .驚き汗').forEach((要素) => {
        要素.style.animation  = '';
        要素.style.rotate     = '';
        要素.style.scale      = '';
        要素.style.transition = '';
        要素.classList.add('再生');
    });
}

// ▫️身体アニメ終了

function 身体アニメ終了(エリア) {
    エリア.querySelectorAll('.横揺れ, .横揺れ小').forEach((要素) => {
        要素.classList.remove('再生');
        ニュートラル復帰(要素, 'rotate', '0deg');
    });

    エリア.querySelectorAll('.縦伸縮, .驚き→縦伸縮').forEach((要素) => {
        要素.classList.remove('再生');
        const キャラ反転 = getComputedStyle(要素).getPropertyValue('--キャラ反転').trim() || '1';
        ニュートラル復帰(要素, 'scale', `${キャラ反転} 1`);
    });

    エリア.querySelectorAll('.震え').forEach((要素) => {
        要素.classList.remove('再生');
    });
}

// ▫️アニメ終了時のニュートラル復帰

function ニュートラル復帰(要素, プロパティ, 目標値, 秒数 = 0.5) {
    const 現在値 = getComputedStyle(要素)[プロパティ];

    要素.style.animation  = 'none';
    要素.style.transition = 'none';
    要素.style[プロパティ] = 現在値;

    void 要素.offsetWidth;

    要素.style.transition = `${プロパティ} ${秒数}s ease-out`;
    要素.style[プロパティ] = 目標値;
}


// 🎛️口元アニメ

function 口元アニメ開始(エリア) {
    エリア.querySelectorAll('.口パク').forEach((要素) => {
        要素.style.animation  = '';
        要素.style.rotate     = '';
        要素.style.scale      = '';
        要素.style.transition = '';
        要素.classList.add('再生');
    });
}

// ▫️口元アニメ終了

function 口元アニメ終了(エリア) {
    エリア.querySelectorAll('.口パク').forEach((要素) => {
        要素.classList.remove('再生');
        ニュートラル復帰(要素, 'scale', '1');
    });
}


// 🎛️文字分解（ふきだし内のHTML構造を保ったまま、文字を1つずつ <span class="文字"> に分解）

function 文字分解(要素) {
    const 文字要素一覧 = [];

    function 走査(元ノード, 複製先) {
        元ノード.childNodes.forEach((子ノード) => {
            if (子ノード.nodeType === Node.TEXT_NODE) {
                const 整形文字 = 子ノード.textContent.replace(/\s+/g, ' ');
                [...整形文字].forEach((文字) => {
                    const 文字span = document.createElement('span');
                    文字span.className   = '文字';
                    文字span.textContent = 文字;
                    複製先.appendChild(文字span);
                    文字要素一覧.push(文字span);
                });
            } else if (子ノード.nodeType === Node.ELEMENT_NODE) {
                if (子ノード.tagName === 'BR') {
                    複製先.appendChild(document.createElement('br'));
                } else {
                    const 複製要素 = document.createElement(子ノード.tagName);
                    [...子ノード.attributes].forEach((属性) => {
                        複製要素.setAttribute(属性.name, 属性.value);
                    });
                    複製先.appendChild(複製要素);
                    走査(子ノード, 複製要素);
                }
            }
        });
    }

    const 元の内容 = 要素.cloneNode(true);
    要素.innerHTML = '';
    走査(元の内容, 要素);
    return 文字要素一覧;
}


// 🎛️セリフ表示（文字速度や設定の即時変更・タメ時間にも対応）

function セリフ表示(エリア, 完了コールバック) {
    const ふきだし   = エリア.querySelector('.💬');
    const モノローグ = ふきだし.classList.contains('無声');
    const キャラ     = キャラ取得(エリア);
    const 文字一覧   = 文字分解(ふきだし);

    const タメ文字数 = parseInt(ふきだし.dataset.wait || '0', 10); // HTMLの data-wait から追加文字数を取得（未設定なら0）

    身体アニメ開始(エリア);

    if (!モノローグ) 口元アニメ開始(エリア);

    let 現在位置   = 0;
    let タイマーID = null;

    // ▫️1文字進めるステップ関数

    function 次文字表示() {
        if (設定速度ms <= 0) { // 0ms以下(最速)の場合、待ち時間なしで全表示＆即完了
            for (let i = 現在位置; i < 文字一覧.length; i++) {
                文字一覧[i].classList.add('表示済');
            }
            if (!モノローグ) 口元アニメ終了(エリア);
            完了コールバック();
            return;
        }

        if (現在位置 >= 文字一覧.length + タメ文字数) { // 表示文字 ＋ タメ文字数 がすべて終了
            完了コールバック();
            return;
        }

        // ▫️実際の文字の表示処理（実際の文字数を超えた分は「タメ時間」として待機のみ行う）

        if (現在位置 < 文字一覧.length) {
            const 文字span = 文字一覧[現在位置];
            文字span.classList.add('表示済');

            if (!モノローグ && 文字span.textContent !== ' ') 音声再生(キャラ);

            if (現在位置 === 文字一覧.length - 1 && !モノローグ) { // 最後の1文字を表示し終えた瞬間に口パクを止める
                口元アニメ終了(エリア);
            }
        }

        現在位置++;

        タイマーID = setTimeout(次文字表示, 設定速度ms); // 毎回その時点の「設定速度ms」を取得して次のタイマーを設定
    }

    次文字表示(); // 処理開始
}


// 🎛️オーディオ

const 音声一覧 = {
    ドク: new Audio('se/doc.mp3'),
    ユニ: new Audio('se/uni.mp3'),
    第三: new Audio('se/oth.mp3')
};
Object.values(音声一覧).forEach((音声) => { 音声.preload = 'auto'; });

// ▫️音声再生（ボイス用）

function 音声再生(キャラ) {
    if (ボイス音量 <= 0) return; // 音量0なら再生スキップ
    const 音声 = 音声一覧[キャラ].cloneNode();
    音声.volume = Math.min(Math.max(ボイス音量, 0), 1); // 0.0 ~ 1.0 にクランプ
    音声.play().catch(() => {});
}

// ▫️効果音のプリロード

const 効果音キャッシュ = {};

document.querySelectorAll('.💬[data-se]').forEach((el) => {
    const パス = el.dataset.se;
    if (パス && !効果音キャッシュ[パス]) {
        const audio = new Audio(パス);
        audio.preload = 'auto';
        効果音キャッシュ[パス] = audio;
    }
});

// ▫️効果音再生

function 効果音再生(パス) {
    if (!パス || !効果音キャッシュ[パス] || 効果音音量 <= 0) return;
    const 効果音 = 効果音キャッシュ[パス].cloneNode();
    効果音.volume = Math.min(Math.max(効果音音量, 0), 1);
    効果音.play().catch(() => {});
}


// 🎛️流星の呼び出し

const 流星レイヤー = document.querySelector('.宇宙レイヤー');

function 流星作成() {
    const 流星 = document.createElement('div');
    流星.classList.add('流星');

    const 反転 = Math.random() < 0.5;

    if (反転) {
        流星.classList.add('反転');
        流星.style.left = `${Math.random() * window.innerWidth  * 0.5}px`; // 画面左から出現
        流星.style.top  = `${Math.random() * window.innerHeight * 0.8}px`;
    } else {
        流星.style.left = `${Math.random() * window.innerWidth  * 0.5 + window.innerWidth * 0.5}px`; // 画面右から出現
        流星.style.top  = `${Math.random() * window.innerHeight * 0.8}px`;
    }

    流星レイヤー.appendChild(流星);

    setTimeout(() => { 流星.remove(); }, 1000); // 1秒で消去
}

function 流星出現() {
    const 出現間隔 = Math.random() * 59000 + 1000; // 1～60秒に1回出現

    setTimeout(() => {
        流星作成();
        流星出現();
    }, 出現間隔);
}

流星出現();
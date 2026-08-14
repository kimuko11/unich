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
// 3秒経過で強制的にページオープン
setTimeout(() => {
    ページオープン();
}, 3000);


// 🎛️キャラクター(target)一覧

const キャラ一覧 = document.querySelectorAll('.🥸, .🐰, .👩, .👤');


// 🎛️スライダー設定のグローバル変数（初期値）

let スライダー文字速度 = 5;
let スライダー効果音量 = 5;

// 計算用の派生変数

let 設定速度ms = 100 - スライダー文字速度 * 10; // 10〜100ms
let ボイス音量 = スライダー効果音量 * 0.02;     // 0.0〜0.18
let 効果音音量 = ボイス音量 * 0.3;

// 設定更新関数

function 設定更新() {
    設定速度ms = 100 - スライダー文字速度 * 10;
    ボイス音量 = スライダー効果音量 * 0.02;
    効果音音量 = ボイス音量 * 0.3;
}

// 🎛️代替音声

const 音声一覧 = {
    ドク: new Audio('se/doc.mp3'),
    ユニ: new Audio('se/uni.mp3'),
    第三: new Audio('se/oth.mp3')
};
Object.values(音声一覧).forEach((音声) => { 音声.preload = 'auto'; });


// 🎛️エリアのクラスからキャラを判定

function キャラ取得(エリア) {
    if (エリア.classList.contains('🥸')) return 'ドク';
    if (エリア.classList.contains('🐰')) return 'ユニ';
    return '第三';
}

// エリアのクラスから「身体アニメ管理用の種別」を判定

function 種別取得(エリア) {
    for (const 種別 of ['🥸', '🐰', '👩', '👤']) {
        if (エリア.classList.contains(種別)) return 種別;
    }
    return '__既定__';
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
                    文字span.className = '文字';
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

// 🎛️音声再生（ボイス用）
function 音声再生(キャラ) {
    if (ボイス音量 <= 0) return; // 音量0なら再生スキップ
    const 音声 = 音声一覧[キャラ].cloneNode();
    音声.volume = Math.min(Math.max(ボイス音量, 0), 1); // 0.0 ~ 1.0 にクランプ
    音声.play().catch(() => {});
}

// 🎛️効果音（SE）の事前ロード用キャッシュ
const 効果音キャッシュ = {};

document.querySelectorAll('.💬[data-se]').forEach((el) => {
    const パス = el.dataset.se;
    if (パス && !効果音キャッシュ[パス]) {
        const audio = new Audio(パス);
        audio.preload = 'auto';
        効果音キャッシュ[パス] = audio;
    }
});

// 🎛️効果音再生
function 効果音再生(パス) {
    if (!パス || !効果音キャッシュ[パス] || 効果音音量 <= 0) return;
    const 効果音 = 効果音キャッシュ[パス].cloneNode();
    効果音.volume = Math.min(Math.max(効果音音量, 0), 1);
    効果音.play().catch(() => {});
}

// 🎛️身体・差分アニメ開始
function 身体アニメ開始(エリア) {
    エリア.querySelectorAll('.縦伸縮, .横揺れ, .横揺れ小, .驚き→縦伸縮, .震え, .驚き目→目パチ, .驚き汗').forEach((要素) => {
        要素.style.animation  = '';
        要素.style.rotate     = '';
        要素.style.scale      = '';
        要素.style.transition = '';
        要素.classList.add('再生');
    });
}

// 🎛️ニュートラル復帰
function ニュートラル復帰(要素, プロパティ, 目標値, 秒数 = 0.5) {
    const 現在値 = getComputedStyle(要素)[プロパティ];

    要素.style.animation  = 'none';
    要素.style.transition = 'none';
    要素.style[プロパティ] = 現在値;

    void 要素.offsetWidth;

    要素.style.transition = `${プロパティ} ${秒数}s ease-out`;
    要素.style[プロパティ] = 目標値;
}

// 🎛️身体アニメ終了
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

// 🎛️口元アニメ開始
function 口元アニメ開始(エリア) {
    エリア.querySelectorAll('.口パク').forEach((要素) => {
        要素.style.animation  = '';
        要素.style.rotate     = '';
        要素.style.scale      = '';
        要素.style.transition = '';
        要素.classList.add('再生');
    });
}

// 🎛️口元アニメ終了
function 口元アニメ終了(エリア) {
    エリア.querySelectorAll('.口パク').forEach((要素) => {
        要素.classList.remove('再生');
        ニュートラル復帰(要素, 'scale', '1');
    });
}

// 🎛️セリフ表示（文字速度や設定の即時変更・タメ時間にも対応）
function セリフ表示(エリア, 完了コールバック) {
    const ふきだし   = エリア.querySelector('.💬');
    const モノローグ = ふきだし.classList.contains('無声');
    const キャラ     = キャラ取得(エリア);
    const 文字一覧   = 文字分解(ふきだし);

    // 💡 HTMLの data-wait="文字数" から追加の待ち文字数を取得（未設定なら0）
    const 追加文字数 = parseInt(ふきだし.dataset.wait || '0', 10);

    身体アニメ開始(エリア);

    if (!モノローグ) 口元アニメ開始(エリア);

    let 現在位置 = 0;
    let タイマーID = null;

    // 💡 1文字進めるステップ関数
    function 次文字表示() {
        // 💡【文字速度 9（最大）の場合】: 待ち時間なしで全表示＆即完了
        if (設定速度ms <= 10) {
            for (let i = 現在位置; i < 文字一覧.length; i++) {
                文字一覧[i].classList.add('表示済');
            }
            if (!モノローグ) 口元アニメ終了(エリア);
            完了コールバック();
            return;
        }

        // 💡 表示文字 ＋ 追加のタメ文字数 がすべて終了した場合
        if (現在位置 >= 文字一覧.length + 追加文字数) {
            完了コールバック();
            return;
        }

        // 実際の文字の表示処理（実際の文字数を超えた分は「タメ時間」として待機のみ行う）
        if (現在位置 < 文字一覧.length) {
            const 文字span = 文字一覧[現在位置];
            文字span.classList.add('表示済');

            if (!モノローグ && 文字span.textContent !== ' ') 音声再生(キャラ);

            // 最後の1文字を表示し終えた瞬間に口パクを止める
            if (現在位置 === 文字一覧.length - 1 && !モノローグ) {
                口元アニメ終了(エリア);
            }
        }

        現在位置++;

        // 毎回その時点の「設定速度ms」を取得して次のタイマーを設定
        タイマーID = setTimeout(次文字表示, 設定速度ms);
    }

    // 処理開始
    次文字表示();
}

// 🎛️「上から順番に一人ずつ登場 → セリフ」を管理する待機キュー
const 待機リスト = [];
let 表示処理中 = false;
const 最終登場エリア = {};

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

    const 種別     = 種別取得(エリア);
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

        // 💡【追加】ふきだしが100%の大きさになった瞬間に実サイズを取得してCSS変数に代入
        ふきだし.style.setProperty('--横幅', `${ふきだし.offsetWidth}px`);
        ふきだし.style.setProperty('--縦幅', `${ふきだし.offsetHeight}px`);

        // 効果音再生
        const 効果音パス = ふきだし.dataset.se;
        if (効果音パス) {
            効果音再生(効果音パス);
        }

        セリフ表示(エリア, () => {
            表示処理中 = false;
            次キャラ処理();
        });
    });
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


// 🎛️▼の画面内出現の監視
const ページ開始時刻 = performance.now();
const スクロール出現最短時刻 = 8000;
const スクロール出現マップ = new Map(); // 監視対象要素 → 実際に .再生 を付与する要素の配列
 
function スクロール出現実行(要素) {
    要素.classList.add('再生');
}
 
const スクロール出現監視 = new IntersectionObserver((項目一覧) => {
    項目一覧.forEach((項目) => {
        if (!項目.isIntersecting) return;
        スクロール出現監視.unobserve(項目.target); // 一度再生したら監視終了
 
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
}, { threshold: 0.9 });
 
document.querySelectorAll('.▼').forEach((要素) => {
    const 横スライド系 = 要素.classList.contains('登場右') || 要素.classList.contains('登場左');
    const 監視対象 = 横スライド系 ? 要素.parentElement : 要素;
 
    if (!スクロール出現マップ.has(監視対象)) {
        スクロール出現マップ.set(監視対象, []);
        スクロール出現監視.observe(監視対象);
    }
    スクロール出現マップ.get(監視対象).push(要素);
});


// 🎛️UI・スライダー連携と初期設定（localStorage対応版）
document.addEventListener('DOMContentLoaded', () => {
    const 設定 = document.getElementById('設定');
    const ラジオ = document.getElementById('📻');
    const 入力_文字速度 = document.getElementById('文字速度');
    const 入力_効果音量 = document.getElementById('効果音量');
    const リセット = document.getElementById('リセット');

    // デフォルト値の定義
    const 初期値_文字速度 = 5;
    const 初期値_効果音量 = 5;

    // ストレージ保存用のキー名
    const KEY_文字速度 = 'site_text_speed';
    const KEY_効果音量 = 'site_se_volume';

    // 保存データの読み込み（無ければデフォルト値を使用）
    const 保存_文字速度 = localStorage.getItem(KEY_文字速度);
    const 保存_効果音量 = localStorage.getItem(KEY_効果音量);

    スライダー文字速度 = 保存_文字速度 !== null ? parseInt(保存_文字速度, 10) : 初期値_文字速度;
    スライダー効果音量 = 保存_効果音量 !== null ? parseInt(保存_効果音量, 10) : 初期値_効果音量;

    // 画面のスライダー要素と数値表示に初期値を反映
    if (入力_文字速度) {
        入力_文字速度.value = スライダー文字速度;
        const 表示 = 入力_文字速度.nextElementSibling;
        if (表示) 表示.textContent = スライダー文字速度;

        入力_文字速度.addEventListener('input', (e) => {
            スライダー文字速度 = parseInt(e.target.value, 10);
            const 表示 = e.target.nextElementSibling;
            if (表示) 表示.textContent = e.target.value;
            
            // 変更時にブラウザへ即時保存
            localStorage.setItem(KEY_文字速度, スライダー文字速度);
            設定更新();
        });
    }

    if (入力_効果音量) {
        入力_効果音量.value = スライダー効果音量;
        const 表示 = 入力_効果音量.nextElementSibling;
        if (表示) 表示.textContent = スライダー効果音量;

        入力_効果音量.addEventListener('input', (e) => {
            スライダー効果音量 = parseInt(e.target.value, 10);
            const 表示 = e.target.nextElementSibling;
            if (表示) 表示.textContent = e.target.value;

            // 変更時にブラウザへ即時保存
            localStorage.setItem(KEY_効果音量, スライダー効果音量);
            設定更新();
        });
    }

    // 開閉切り替え
    ラジオ.addEventListener('click', (e) => {
        e.stopPropagation();
        設定.classList.toggle('オープン');
    });

    // 設定外をタップしたら閉じる
    document.addEventListener('click', (e) => {
        if (!設定.contains(e.target)) {
            設定.classList.remove('オープン');
        }
    });

    // リセットボタンのクリック処理（保存値も削除してデフォルトへ）
    if (リセット) {
        リセット.addEventListener('click', () => {
            // 保存データの消去
            localStorage.removeItem(KEY_文字速度);
            localStorage.removeItem(KEY_効果音量);

            // 文字速度のリセット
            if (入力_文字速度) {
                入力_文字速度.value = 初期値_文字速度;
                スライダー文字速度 = 初期値_文字速度;
                const 表示 = 入力_文字速度.nextElementSibling;
                if (表示) 表示.textContent = 初期値_文字速度;
            }

            // 効果音量のリセット
            if (入力_効果音量) {
                入力_効果音量.value = 初期値_効果音量;
                スライダー効果音量 = 初期値_効果音量;
                const 表示 = 入力_効果音量.nextElementSibling;
                if (表示) 表示.textContent = 初期値_効果音量;
            }

            // 変数と音量の再計算
            設定更新();
        });
    }

    // 初回の音量・速度設定の反映
    設定更新();
});


// 🎛️流星呼び出し
const 流星レイヤー = document.querySelector('.宇宙レイヤー');

function 流星作成() {
    const 流星 = document.createElement('div');
    流星.classList.add('流星');

    const 反転 = Math.random() < 0.5;

    if (反転) {
        流星.classList.add('反転');
        流星.style.left = `${Math.random() * window.innerWidth  * 0.5}px`; 
        流星.style.top  = `${Math.random() * window.innerHeight * 0.8}px`;
    } else {
        流星.style.left = `${Math.random() * window.innerWidth  * 0.5 + window.innerWidth * 0.5}px`;
        流星.style.top  = `${Math.random() * window.innerHeight * 0.8}px`;
    }

    流星レイヤー.appendChild(流星);

    setTimeout(() => { 流星.remove(); }, 1000);
}

function 流星出現() {
    const 出現間隔 = Math.random() * 59000 + 1000;

    setTimeout(() => {
        流星作成();
        流星出現();
    }, 出現間隔);
}

流星出現();
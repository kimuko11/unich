// 🎛️対象一覧
const キャラ一覧 = document.querySelectorAll('.🥸, .🐰, .👩, .👤');

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

// 🎛️文字送り間隔（ミリ秒）
const 文字送り間隔 = 50;

// 🎛️文字分解（ふきだし内のHTML構造を保ったまま、文字を1つずつ <span class="文字"> に分解）
function 文字分解(要素) {
    const 文字要素一覧 = [];

    function 走査(元ノード, 複製先) {
        元ノード.childNodes.forEach((子ノード) => {
            if (子ノード.nodeType === Node.TEXT_NODE) {
                const 整形文字 = 子ノード.textContent.replace(/\s+/g, ' '); // 連続する空白や改行は半角スペース1つに整形
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
                    走査(子ノード, 複製要素); // 入れ子タグも再帰的に処理
                }
            }
        });
    }

    const 元の内容 = 要素.cloneNode(true);
    要素.innerHTML = '';
    走査(元の内容, 要素);
    return 文字要素一覧;
}

// 🎛️音声再生（キャラごとの音声を連続再生できるように複製してから再生）
function 音声再生(キャラ) {
    const 音声 = 音声一覧[キャラ].cloneNode();
    音声.volume = 0.1;
    音声.play().catch(() => {}); // 自動再生ブロック対策（無視してOK）
}

// 🎛️身体・差分アニメ開始
function 身体アニメ開始(エリア) {
    エリア.querySelectorAll('.縦伸縮, .横揺れ, .驚きと縦伸縮, .驚き汗').forEach((要素) => {
        要素.classList.add('再生');
    });
}

// 🎛️口元アニメ開始
function 口元アニメ開始(エリア) {
    エリア.querySelectorAll('.口パク').forEach((要素) => {
        要素.classList.add('再生');
    });
}

// 🎛️口元アニメ終了
function 口元アニメ終了(エリア) {
    エリア.querySelectorAll('.口パク').forEach((要素) => {
        要素.classList.remove('再生');
    });
}

// 🎛️セリフ表示（セリフを1文字ずつ表示し、モノローグでなければ音声＆口元アニメを伴わせる）
//  完了したら完了コールバックを呼ぶ（次キャラへ進むため）
function セリフ表示(エリア, 完了コールバック) {
    const ふきだし   = エリア.querySelector('.💬');
    const モノローグ = ふきだし.classList.contains('無声');
    const キャラ     = キャラ取得(エリア);
    const 文字一覧   = 文字分解(ふきだし);

    身体アニメ開始(エリア);
    if (!モノローグ) 口元アニメ開始(エリア);

    let 現在位置 = 0;
    const タイマーID = setInterval(() => {
        if (現在位置 >= 文字一覧.length) {
            clearInterval(タイマーID);
            if (!モノローグ) 口元アニメ終了(エリア); // セリフと音声終了
            完了コールバック();
            return;
        }

        const 文字span = 文字一覧[現在位置];
        文字span.classList.add('表示済');

        if (!モノローグ && 文字span.textContent !== ' ') 音声再生(キャラ);

        現在位置++;
    }, 文字送り間隔);
}

// 🎛️「上から順番に一人ずつ登場 → セリフ」を管理する待機キュー
const 待機リスト = [];
let 表示処理中 = false; // true の間は次キャラを登場させない

// 🎛️ DOM上での出現順（上から順）に並び替える
function 並び替え(リスト) {
    return リスト.sort((a, b) => {
        const 位置関係 = a.compareDocumentPosition(b);
        return 位置関係 & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
}

// 🎛️ 待機リストの先頭キャラを登場させ、話し終わったら次キャラへ
function 次キャラ処理() {
    if (表示処理中 || 待機リスト.length === 0) return;

    並び替え(待機リスト);
    const エリア = 待機リスト.shift();
    表示処理中 = true;

    const キャラ画像 = エリア.querySelector('.キャラ画像');
    const ふきだし   = エリア.querySelector('.💬');

    キャラ画像.classList.add('出現');
    ふきだし  .classList.add('出現');

    // キャラ画像のスライドイン完了（ふきだしが現れ始めるタイミング）でセリフ表示と口元アニメを開始
    キャラ画像.addEventListener('transitionend', function スライドイン完了(イベント) {
        if (イベント.propertyName !== 'transform') return;
        キャラ画像.removeEventListener('transitionend', スライドイン完了);

        セリフ表示(エリア, () => {
            表示処理中 = false;
            次キャラ処理(); // 話し終わったので次キャラへ
        });
    });
}

// 🎛️画面内出現の監視（出現順に待機リストへ積むだけ。実際の登場は上の関数が制御）
const 監視 = new IntersectionObserver((項目一覧) => {
    項目一覧.forEach((項目) => {
        if (項目.isIntersecting) {
            待機リスト.push(項目.target);
            監視.unobserve(項目.target); // 一度キューに入れたら監視終了
        }
    });
    次キャラ処理();
}, { threshold: 0.9 }
);

// 🎛️一つずつ監視対象に登録していく
キャラ一覧.forEach((エリア) => { 監視.observe(エリア); });

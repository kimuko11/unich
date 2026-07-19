// 🎛️対象エリア一覧
const キャラエリア一覧 = document.querySelectorAll('.🥸, .🐰, .👩, .👤');

// 🎛️SEオーディオ
const SE音源一覧 = {
    ドク: new Audio('se/doc.mp3'),
    ユニ: new Audio('se/uni.mp3'),
    その他: new Audio('se/oth.mp3')
};
Object.values(SE音源一覧).forEach((音) => { 音.preload = 'auto'; });

/** エリアのクラスからキャラ種別（ドク／ユニ／その他）を判定する */
function キャラ種別を取得する(エリア) {
    if (エリア.classList.contains('🥸')) return 'ドク';
    if (エリア.classList.contains('🐰')) return 'ユニ';
    return 'その他';
}

// 🎛️文字送りの間隔（ミリ秒）
const 文字送り間隔 = 50;

/**
 * ふきだし内のHTML構造（<big>や<br>）を保ったまま、
 * 文字を1つずつ<span class="文字">に分解する
 */
function 文字分解(要素) {
    const 文字要素一覧 = [];

    function 走査(元ノード, 複製先) {
        元ノード.childNodes.forEach((子ノード) => {
            if (子ノード.nodeType === Node.TEXT_NODE) {
                // 連続する空白・改行インデントは半角スペース1つに整形
                const 整形済みテキスト = 子ノード.textContent.replace(/\s+/g, ' ');
                [...整形済みテキスト].forEach((文字) => {
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

/** SEを再生する（キャラ種別ごとの音源を、連続再生できるよう複製してから再生） */
function SEを再生する(キャラ種別) {
    const 音 = SE音源一覧[キャラ種別].cloneNode();
    音.volume = 0.7;
    音.play().catch(() => {}); // 自動再生ブロック対策（無視してOK）
}

/** 口パク・ヒゲのアニメを開始する */
function 口パクを開始する(エリア) {
    エリア.querySelectorAll('.ヒゲ, .口パク, .驚き汗, .縦伸縮, .横揺れ').forEach((要素) => {
        要素.classList.add('再生');
    });
}

/** 口パク・ヒゲのアニメを終了する（ハートは対象外＝ずっと浮遊） */
function 口パクを終了する(エリア) {
    エリア.querySelectorAll('.ヒゲ, .口パク').forEach((要素) => {
        要素.classList.remove('再生');
    });
}

/** セリフを1文字ずつ表示し、モノローグでなければSE＆口パクを伴わせる
 *  完了したら完了コールバックを呼ぶ（＝次のキャラへバトンタッチするため） */
function セリフを表示する(エリア, 完了コールバック) {
    const 吹き出し = エリア.querySelector('.💬');
    const 段落 = 吹き出し.querySelector('p');
    const モノローグか = 吹き出し.classList.contains('無声');
    const キャラ種別 = キャラ種別を取得する(エリア);

    const 文字一覧 = 文字分解(段落);

    if (!モノローグか) {
        口パクを開始する(エリア);
    }

    let 現在位置 = 0;
    const タイマーID = setInterval(() => {
        if (現在位置 >= 文字一覧.length) {
            clearInterval(タイマーID);
            if (!モノローグか) {
                口パクを終了する(エリア); // セリフ＆SE終了で口パク停止
            }
            完了コールバック();
            return;
        }

        const 文字span = 文字一覧[現在位置];
        文字span.classList.add('表示済み');

        if (!モノローグか && 文字span.textContent !== ' ') {
            SEを再生する(キャラ種別);
        }

        現在位置++;
    }, 文字送り間隔);
}

// #️⃣🎛️「上から順番に一人ずつ登場→発話」を管理する待機キュー
const 待機リスト = [];
let 表示処理中フラグ = false; // trueの間は次のキャラを登場させない

/** DOM上での出現順（＝上から順）に並べ替える */
function 上から順に並べ替える(リスト) {
    return リスト.sort((a, b) => {
        const 位置関係 = a.compareDocumentPosition(b);
        return 位置関係 & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
}

/** 待機リストの先頭のキャラを登場させ、話し終わったら次のキャラへ */
function 次のキャラを処理する() {
    if (表示処理中フラグ || 待機リスト.length === 0) return;

    上から順に並べ替える(待機リスト);
    const エリア = 待機リスト.shift();
    表示処理中フラグ = true;

    const キャラ画像 = エリア.querySelector('.キャラ画像');
    const 吹き出し = エリア.querySelector('.💬');

    キャラ画像.classList.add('出現');
    吹き出し.classList.add('出現');

    // キャラのスライドインが完了＝ふきだしが現れ始めるタイミングで
    // セリフ表示（＋口パク）をスタートさせる
    キャラ画像.addEventListener('transitionend', function スライド完了時(イベント) {
        if (イベント.propertyName !== 'transform') return;
        キャラ画像.removeEventListener('transitionend', スライド完了時);

        セリフを表示する(エリア, () => {
            表示処理中フラグ = false;
            次のキャラを処理する(); // 話し終わったので次のキャラへバトンタッチ
        });
    });
}

// #️⃣🎛️画面内出現の監視（出現順に待機リストへ積むだけ。実際の登場は上の関数が制御）
const 監視 = new IntersectionObserver((項目一覧) => {
    項目一覧.forEach((項目) => {
        if (項目.isIntersecting) {
            待機リスト.push(項目.target);
            監視.unobserve(項目.target); // 一度キューに入れたら監視終了
        }
    });
    次のキャラを処理する();
}, {
    threshold: 0.9
});

// 一つずつ監視対象に登録していく
キャラエリア一覧.forEach((エリア) => {
    監視.observe(エリア);
});

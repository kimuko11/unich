// #️⃣対象エリア一覧
const キャラエリア一覧 = document.querySelectorAll('.🥸, .🐰, .👩, .👤');

// #️⃣SEオーディオ（ポポポポ用）
// ※ファイル名・パスはお手持ちのSEに合わせて変更してくださいませ
const SEオーディオ = new Audio('se/doc.mp3');
SEオーディオ.preload = 'auto';

// #️⃣文字送りの間隔（ミリ秒）
const 文字送り間隔 = 70;

/**
 * ふきだし内のHTML構造（<big>や<br>）を保ったまま、
 * 文字を1つずつ<span class="文字">に分解する
 */
function 文字を分解する(要素) {
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

/** SEを再生する（連続再生できるよう複製してから再生） */
function SEを再生する() {
    const 音 = SEオーディオ.cloneNode();
    音.volume = 0.7;
    音.play().catch(() => {}); // 自動再生ブロック対策（無視してOK）
}

/** 口パク・ヒゲのアニメを開始する */
function 口パクを開始する(エリア) {
    エリア.querySelectorAll('.口パク, .ヒゲ').forEach((要素) => {
        要素.classList.add('発話中');
    });
}

/** 口パク・ヒゲのアニメを終了する（ハートは対象外＝ずっと浮遊） */
function 口パクを終了する(エリア) {
    エリア.querySelectorAll('.口パク, .ヒゲ').forEach((要素) => {
        要素.classList.remove('発話中');
    });
}

/** セリフを1文字ずつ表示し、モノローグでなければSE＆口パクを伴わせる */
function セリフを表示する(エリア) {
    const 吹き出し = エリア.querySelector('.💬');
    const 段落 = 吹き出し.querySelector('p');
    const モノローグか = 吹き出し.classList.contains('無音');

    const 文字一覧 = 文字を分解する(段落);

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
            return;
        }

        const 文字span = 文字一覧[現在位置];
        文字span.classList.add('表示済み');

        if (!モノローグか && 文字span.textContent !== ' ') {
            SEを再生する();
        }

        現在位置++;
    }, 文字送り間隔);
}

// #️⃣画面内出現の監視
const 監視 = new IntersectionObserver((項目一覧) => {
    項目一覧.forEach((項目) => {
        if (項目.isIntersecting) {
            const エリア = 項目.target;
            const キャラ画像 = エリア.querySelector('.キャラ画像');
            const 吹き出し = エリア.querySelector('.💬');

            キャラ画像.classList.add('出現');
            吹き出し.classList.add('出現');

            // キャラのスライドインが完了＝ふきだしが現れ始めるタイミングで
            // セリフ表示（＋口パク）をスタートさせる
            キャラ画像.addEventListener('transitionend', function スライド完了時(イベント) {
                if (イベント.propertyName !== 'transform') return;
                キャラ画像.removeEventListener('transitionend', スライド完了時);
                セリフを表示する(エリア);
            });

            監視.unobserve(エリア); // 一度出現したら監視終了
        }
    });
}, {
    threshold: 1
});

// 一つずつ監視対象に登録していく
キャラエリア一覧.forEach((エリア) => {
    監視.observe(エリア);
});

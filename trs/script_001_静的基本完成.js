const キャラエリア一覧 = document.querySelectorAll('.🥸, .🐰, .👩, .👤');

const 監視 = new IntersectionObserver((項目一覧) => {
  項目一覧.forEach((項目) => {
    if (項目.isIntersecting) {
      項目.target.querySelector('.キャラ画像').classList.add('出現');
      項目.target.querySelector('.💬').classList.add('出現');
      監視.unobserve(項目.target); // 一度出現したら監視終了
    }
  });
}, {
  threshold: 1 // 要素がどの程度表示されたら出現するか、0～1の範囲で指定
});

// 一つずつ監視対象に登録していく
キャラエリア一覧.forEach((エリア) => {
  監視.observe(エリア);
});
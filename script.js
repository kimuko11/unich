const キャラエリア一覧 = document.querySelectorAll('.🥸, .🐰, .👩, .👤');

const 監視員 = new IntersectionObserver((項目一覧) => {
  項目一覧.forEach((項目) => {
    if (項目.isIntersecting) {
      項目.target.querySelector('.キャラ画像').classList.add('出現');
      項目.target.querySelector('.💬').classList.add('出現');
      監視員.unobserve(項目.target); // 一度出たら監視終了（何度も発動させない）
    }
  });
}, {
  threshold: 1 // スタートトリガー (要素がどの程度表示されたか、0～1の範囲で指定)
});

// 一人ずつ監視対象に登録していく
キャラエリア一覧.forEach((エリア) => {
  監視員.observe(エリア);
});
// index.html のときのみアラート表示
if ((location.pathname.split('/').pop() || 'index.html') === 'index.html') {
    alert("29日 京都2歳S\nバルセシート メイショウソラリス\n京都 8R\nマサノユニコーン\n東京 6R\nエドワードバローズ\n11R\nミッキーゴージャス");
}
    alert("買い目 京都2歳S\n3複 6-4.8.11-3.4.8.10.11\n京都 8R ３単 1.11.15BOX 馬単15-1.11\n東京 6R 複勝8\n11R 馬単 4-1.5.6.9.10 3単なら4.5軸");




const navItems = document.querySelectorAll('.bottom-nav .nav-item');
const currentPath = location.pathname.split('/').pop() || 'index.html';
navItems.forEach(function(link){
	const href = link.getAttribute('href');
	if (href === currentPath) {
		link.classList.add('active');
	}
});

console.log('bottom nav initialized');


// 背景画像をページ起動ごとにランダム設定
(function setRandomBackground(){
    // ここに使用したいJPGファイル名を追加してください（同じフォルダに配置）
    var backgroundImages = [
        'background.jpg',
        'background2.jpg',
        'background3.jpg',
    ];
    if (!Array.isArray(backgroundImages) || backgroundImages.length === 0) return;
    var index = Math.floor(Math.random() * backgroundImages.length);
    var selected = backgroundImages[index];

    // CSSのグラデーションを保ちつつ画像だけ差し替える
    var overlay = 'linear-gradient(135deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2))';
    document.body.style.backgroundImage = overlay + ', url(' + selected + ')';
})();


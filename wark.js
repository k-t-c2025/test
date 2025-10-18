// index.html のときのみアラート表示
if ((location.pathname.split('/').pop() || 'index.html') === 'index.html') {
    alert("19日 東京\n12R テリオスララ\n京都\n3R レッドカメリア\n12R キーガッツ");
}




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


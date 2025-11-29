// index.html のときのみアラート表示
if ((location.pathname.split('/').pop() || 'index.html') === 'index.html') {
    alert("30日 ジャパンC\nダノンデサイル\n京都 2R\n アルヴァンドルード サウンドムーブ\n8R\nコニーアイランド\n12R\nレイピア エーティマクフィ");
}
    alert("買い目 ジャパンC\n馬単 14-1.2.5.11.16 3連系なら15\n京都 2R 馬単 5-6両面 3単5.6-5.6-1.2.4.7.9.12.12\n8R 馬単 8-3.4.5.9.11\n12R 馬単 6-1.2.10.12.18");




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


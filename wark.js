// index.html のときのみアラート表示
if ((location.pathname.split('/').pop() || 'index.html') === 'index.html') {
    alert("24日 東スポ\nテルヒコウ ローベルクランツ サレジオ\n東京 1R イナズマダイモン\n9R アロンズロッド\n12R レッデキングリー\n福島 2R サザンティースプーン");
}
    alert("買い目 東スポ\推し馬ワイドBOX ３連ならダノン入り\n東京 1R ３単 2-11.12-9-11.12\n9R 馬単1-4.6.8.11\n12R 単勝7\n福島 2R ワイド5.14-2.5.13.15 3連なら9もあり");




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


const navItems = document.querySelectorAll('.bottom-nav .nav-item');
const currentPath = location.pathname.split('/').pop() || 'index.html';
navItems.forEach(function(link){
	const href = link.getAttribute('href');
	if (href === currentPath) {
		link.classList.add('active');
	}
});

console.log('bottom nav initialized');


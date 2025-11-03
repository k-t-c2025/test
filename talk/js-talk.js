// ============================================================================
// 定数定義
// ============================================================================
const STORAGE_PREFIX = 'boardPosts_';
const OLD_STORAGE_KEY = 'boardPosts';
const DELETE_CONFIRM_MESSAGE = 'この投稿を削除しますか？返信もすべて削除されます。';
const EMPTY_MESSAGE = 'まだ投稿がありません。最初の投稿をしてみましょう！';

// ============================================================================
// グローバル状態
// ============================================================================
let posts = [];
let currentMonthFilter = '';

// ============================================================================
// ユーティリティ関数
// ============================================================================

/**
 * 年月のキーを生成（例: "2024/01"）
 * @param {Date} date - 日付オブジェクト
 * @returns {string} 年月キー
 */
function getMonthKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}/${month}`;
}

/**
 * 日付と時間をフォーマット
 * @param {Date} date - 日付オブジェクト
 * @returns {string} フォーマット済み日時文字列
 */
function formatDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 月キーを表示用フォーマットに変換（例: "2024/01" → "2024年1月"）
 * @param {string} monthKey - 月キー
 * @returns {string} 表示用文字列
 */
function formatMonthDisplay(monthKey) {
    const [year, monthNum] = monthKey.split('/');
    const monthName = parseInt(monthNum);
    return `${year}年${monthName}月`;
}

/**
 * 一意のIDを生成
 * @returns {number} 一意のID
 */
function generateId() {
    return Date.now() + Math.random();
}

/**
 * 投稿オブジェクトを作成
 * @param {string} name - 投稿者名
 * @param {string} message - メッセージ
 * @returns {Object} 投稿オブジェクト
 */
function createPostObject(name, message, imageData = null) {
    return {
        id: generateId(),
        name: name,
        message: message,
        date: new Date(),
        imageData: imageData,
        replies: []
    };
}

// ============================================================================
// データ管理関数
// ============================================================================

/**
 * 指定された月の投稿を取得
 * @param {string} monthKey - 月キー
 * @returns {Array} 投稿配列
 */
function getPostsByMonth(monthKey) {
    try {
        const saved = localStorage.getItem(`${STORAGE_PREFIX}${monthKey}`);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
        return [];
    }
}

/**
 * すべての月の投稿を取得
 * @returns {Array} すべての投稿配列（新しい順）
 */
function getAllPosts() {
    const allPosts = [];
    try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(STORAGE_PREFIX)) {
                const monthPosts = JSON.parse(localStorage.getItem(key));
                allPosts.push(...monthPosts);
            }
        });
    } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
    }
    // 日付順にソート（新しい順）
    return allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * 投稿データを月別に保存
 * @param {string} monthKey - 月キー
 * @param {Array} postsToSave - 保存する投稿配列
 */
function savePostsByMonth(monthKey, postsToSave) {
    try {
        localStorage.setItem(`${STORAGE_PREFIX}${monthKey}`, JSON.stringify(postsToSave));
    } catch (error) {
        console.error('データの保存に失敗しました:', error);
    }
}

/**
 * IDで投稿を検索（再帰的に返信も検索）
 * @param {Array} postList - 投稿配列
 * @param {number} id - 検索するID
 * @returns {Object|null} 見つかった投稿、またはnull
 */
function findPostById(postList, id) {
    for (let post of postList) {
        if (post.id === id) {
            return post;
        }
        if (post.replies && post.replies.length > 0) {
            const found = findPostById(post.replies, id);
            if (found) return found;
        }
    }
    return null;
}

/**
 * 投稿リストから指定IDの投稿を削除（再帰的）
 * @param {Array} postList - 投稿配列
 * @param {number} targetId - 削除するID
 * @returns {boolean} 削除に成功したかどうか
 */
function removePostFromList(postList, targetId) {
    for (let i = postList.length - 1; i >= 0; i--) {
        if (postList[i].id === targetId) {
            postList.splice(i, 1);
            return true;
        }
        if (postList[i].replies && postList[i].replies.length > 0) {
            if (removePostFromList(postList[i].replies, targetId)) {
                return true;
            }
        }
    }
    return false;
}

/**
 * すべての月のストレージキーを取得
 * @returns {Array<string>} 月キーの配列
 */
function getAllMonthKeys() {
    const keys = Object.keys(localStorage);
    return keys
        .filter(key => key.startsWith(STORAGE_PREFIX))
        .map(key => key.replace(STORAGE_PREFIX, ''));
}

// ============================================================================
// データ移行関数
// ============================================================================

/**
 * 旧形式のデータを月別形式に移行
 * @param {Array} oldPosts - 旧形式の投稿配列
 */
function migrateOldData(oldPosts) {
    const postsByMonth = {};
    
    oldPosts.forEach(post => {
        const postDate = post.date ? new Date(post.date) : new Date();
        const monthKey = getMonthKey(postDate);
        
        if (!postsByMonth[monthKey]) {
            postsByMonth[monthKey] = [];
        }
        postsByMonth[monthKey].push(post);
    });
    
    // 各月のデータを保存
    Object.keys(postsByMonth).forEach(monthKey => {
        const existingPosts = getPostsByMonth(monthKey);
        // 既存のデータとマージ（重複を避けるため）
        const mergedPosts = [...existingPosts];
        postsByMonth[monthKey].forEach(post => {
            if (!existingPosts.find(p => p.id === post.id)) {
                mergedPosts.push(post);
            }
        });
        savePostsByMonth(monthKey, mergedPosts);
    });
}

/**
 * ページ読み込み時に保存されたデータを読み込む
 */
function loadPosts() {
    // 旧形式のデータがある場合は月別形式に移行
    const savedPosts = localStorage.getItem(OLD_STORAGE_KEY);
    if (savedPosts) {
        try {
            const oldPosts = JSON.parse(savedPosts);
            if (oldPosts && oldPosts.length > 0) {
                migrateOldData(oldPosts);
                localStorage.removeItem(OLD_STORAGE_KEY);
            }
        } catch (error) {
            console.error('旧データの移行に失敗しました:', error);
        }
    }
    loadPostsByMonth();
    updateMonthFilter();
}

/**
 * 月別に投稿データを読み込む
 */
function loadPostsByMonth() {
    if (currentMonthFilter) {
        posts = getPostsByMonth(currentMonthFilter);
    } else {
        posts = getAllPosts();
    }
    displayPosts();
}

// ============================================================================
// 投稿操作関数
// ============================================================================

/**
 * 投稿を追加
 * @param {string} name - 投稿者名
 * @param {string} message - メッセージ
 * @param {number|null} parentId - 親投稿ID（返信の場合）
 */
function addPost(name, message, parentId = null, imageData = null) {
    const post = createPostObject(name, message, imageData);

    if (parentId) {
        // 返信の場合
        addReplyToPost(post, parentId);
    } else {
        // 新規投稿の場合
        addNewPost(post);
    }

    loadPostsByMonth();
    updateMonthFilter();
}

/**
 * 新規投稿を追加
 * @param {Object} post - 投稿オブジェクト
 */
function addNewPost(post) {
    const monthKey = getMonthKey(post.date);
    const monthPosts = getPostsByMonth(monthKey);
    monthPosts.push(post);
    savePostsByMonth(monthKey, monthPosts);
}

/**
 * 返信を追加
 * @param {Object} reply - 返信オブジェクト
 * @param {number} parentId - 親投稿ID
 */
function addReplyToPost(reply, parentId) {
    const allPosts = getAllPosts();
    const parentPost = findPostById(allPosts, parentId);
    
    if (!parentPost) {
        console.error('親投稿が見つかりません');
        return;
    }

    parentPost.replies.push(reply);
    
    // 親投稿が属する月のデータを更新
    const parentMonthKey = getMonthKey(new Date(parentPost.date));
    const monthPosts = getPostsByMonth(parentMonthKey);
    const monthParentPost = findPostById(monthPosts, parentId);
    
    if (monthParentPost) {
        monthParentPost.replies.push(reply);
        savePostsByMonth(parentMonthKey, monthPosts);
    }
}

/**
 * 投稿を削除
 * @param {number} postId - 削除する投稿ID
 */
function deletePost(postId) {
    if (!confirm(DELETE_CONFIRM_MESSAGE)) {
        return;
    }

    const allPosts = getAllPosts();
    const postToDelete = findPostById(allPosts, postId);
    if (!postToDelete) {
        console.error('削除する投稿が見つかりません');
        return;
    }

    // すべての月から削除を試みる
    const monthKeys = getAllMonthKeys();
    monthKeys.forEach(monthKey => {
        const monthPosts = getPostsByMonth(monthKey);
        const removed = removePostFromList(monthPosts, postId);
        if (removed) {
            savePostsByMonth(monthKey, monthPosts);
        }
    });

    loadPostsByMonth();
}

// ============================================================================
// DOM操作関数
// ============================================================================

/**
 * 投稿を表示
 */
function displayPosts() {
    const postsContainer = document.getElementById('posts');
    if (!postsContainer) {
        console.error('投稿コンテナが見つかりません');
        return;
    }
    
    if (posts.length === 0) {
        postsContainer.innerHTML = `<div class="empty-message">${EMPTY_MESSAGE}</div>`;
        return;
    }

    postsContainer.innerHTML = '';
    posts.forEach(post => {
        postsContainer.appendChild(createPostElement(post));
    });
}

/**
 * 投稿ヘッダー要素を作成
 * @param {Object} post - 投稿オブジェクト
 * @returns {HTMLElement} ヘッダー要素
 */
function createPostHeader(post) {
    const header = document.createElement('div');
    header.className = 'post-header';

    const authorDiv = document.createElement('div');
    authorDiv.className = 'post-author';
    authorDiv.textContent = post.name;

    const dateDiv = document.createElement('div');
    dateDiv.className = 'post-date';
    dateDiv.textContent = formatDateTime(new Date(post.date));

    header.appendChild(authorDiv);
    header.appendChild(dateDiv);
    return header;
}

/**
 * 投稿コンテンツ要素を作成
 * @param {string} message - メッセージ
 * @returns {HTMLElement} コンテンツ要素
 */
function createPostContent(message) {
    const contentDiv = document.createElement('div');
    contentDiv.className = 'post-content';
    contentDiv.textContent = message;
    return contentDiv;
}

/**
 * 画像要素を作成
 * @param {string|null} imageData - 画像のDataURL
 * @returns {HTMLElement|null} 画像要素
 */
function createPostImage(imageData) {
    if (!imageData) return null;
    const img = document.createElement('img');
    img.className = 'post-image';
    img.src = imageData;
    img.alt = '投稿画像';
    return img;
}

/**
 * アクションボタンを作成
 * @param {Object} options - ボタン設定
 * @returns {HTMLElement} アクション要素
 */
function createActionButtons(options) {
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'post-actions';

    if (options.showReply) {
        const replyBtn = document.createElement('button');
        replyBtn.className = 'reply-btn';
        replyBtn.textContent = '返信';
        replyBtn.onclick = () => toggleReplyForm(options.postId);
        actionsDiv.appendChild(replyBtn);
    }

    if (options.showEdit) {
        const editBtn = document.createElement('button');
        editBtn.className = 'reply-btn';
        editBtn.textContent = '編集';
        editBtn.onclick = () => toggleEditForm(options.postId);
        actionsDiv.appendChild(editBtn);
    }

    if (options.showDelete) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '削除';
        deleteBtn.onclick = () => deletePost(options.postId);
        actionsDiv.appendChild(deleteBtn);
    }

    return actionsDiv;
}

/**
 * 投稿要素を作成
 * @param {Object} post - 投稿オブジェクト
 * @returns {HTMLElement} 投稿要素
 */
function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    postDiv.dataset.postId = post.id;

    postDiv.appendChild(createPostHeader(post));
    const contentEl = createPostContent(post.message);
    postDiv.appendChild(contentEl);
    const imageEl = createPostImage(post.imageData);
    if (imageEl) postDiv.appendChild(imageEl);
    postDiv.appendChild(createActionButtons({
        postId: post.id,
        showReply: true,
        showEdit: true,
        showDelete: true
    }));

    // 返信フォーム
    const replyForm = createReplyForm(post.id);
    postDiv.appendChild(replyForm);

    // 編集フォーム
    const editForm = createEditForm(post);
    postDiv.appendChild(editForm);

    // 返信を表示
    if (post.replies && post.replies.length > 0) {
        const repliesDiv = document.createElement('div');
        repliesDiv.className = 'replies';
        post.replies.forEach(reply => {
            repliesDiv.appendChild(createReplyElement(reply));
        });
        postDiv.appendChild(repliesDiv);
    }

    return postDiv;
}

/**
 * 返信要素を作成
 * @param {Object} reply - 返信オブジェクト
 * @returns {HTMLElement} 返信要素
 */
function createReplyElement(reply) {
    const replyDiv = document.createElement('div');
    replyDiv.className = 'reply';
    replyDiv.dataset.postId = reply.id;

    replyDiv.appendChild(createPostHeader(reply));
    replyDiv.appendChild(createPostContent(reply.message));
    replyDiv.appendChild(createActionButtons({
        postId: reply.id,
        showReply: false,
        showEdit: true,
        showDelete: true
    }));

    // 編集フォーム（返信用）
    const editForm = createEditForm(reply, true);
    replyDiv.appendChild(editForm);

    return replyDiv;
}

/**
 * 返信フォームを作成
 * @param {number} parentId - 親投稿ID
 * @returns {HTMLElement} フォーム要素
 */
function createReplyForm(parentId) {
    const form = document.createElement('form');
    form.className = 'reply-form';
    form.dataset.parentId = parentId;

    form.onsubmit = (e) => {
        e.preventDefault();
        const nameInput = form.querySelector('input[type="text"]');
        const messageInput = form.querySelector('textarea');
        const name = nameInput.value.trim();
        const message = messageInput.value.trim();

        if (name && message) {
            addPost(name, message, parentId);
            nameInput.value = '';
            messageInput.value = '';
            form.classList.remove('active');
        }
    };

    // 名前入力
    const nameGroup = createFormGroup('名前:', 'text');
    form.appendChild(nameGroup);

    // メッセージ入力
    const messageGroup = createFormGroup('メッセージ:', 'textarea', 3);
    form.appendChild(messageGroup);

    // ボタン
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = '返信';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'キャンセル';
    cancelBtn.style.background = '#999';
    cancelBtn.style.marginLeft = '10px';
    cancelBtn.onclick = () => {
        form.classList.remove('active');
        const nameInput = form.querySelector('input[type="text"]');
        const messageInput = form.querySelector('textarea');
        if (nameInput) nameInput.value = '';
        if (messageInput) messageInput.value = '';
    };

    form.appendChild(submitBtn);
    form.appendChild(cancelBtn);

    return form;
}

/**
 * フォームグループを作成
 * @param {string} labelText - ラベルテキスト
 * @param {string} inputType - 入力タイプ（'text' または 'textarea'）
 * @param {number} textareaRows - textareaの場合の行数
 * @returns {HTMLElement} フォームグループ要素
 */
function createFormGroup(labelText, inputType, textareaRows = 3) {
    const group = document.createElement('div');
    group.className = 'form-group';

    const label = document.createElement('label');
    label.textContent = labelText;

    let input;
    if (inputType === 'textarea') {
        input = document.createElement('textarea');
        input.rows = textareaRows;
    } else {
        input = document.createElement('input');
        input.type = inputType;
    }
    input.required = true;

    group.appendChild(label);
    group.appendChild(input);

    return group;
}

/**
 * 返信フォームの表示/非表示を切り替え
 * @param {number} parentId - 親投稿ID
 */
function toggleReplyForm(parentId) {
    const forms = document.querySelectorAll('.reply-form');
    forms.forEach(form => {
        if (form.dataset.parentId === String(parentId)) {
            form.classList.toggle('active');
        } else {
            form.classList.remove('active');
        }
    });
}

/**
 * 編集フォームを作成
 * @param {Object} target - 編集対象（投稿/返信）
 * @param {boolean} isReply - 返信かどうか
 * @returns {HTMLElement} フォーム要素
 */
function createEditForm(target, isReply = false) {
    const form = document.createElement('form');
    form.className = 'reply-form edit-form';
    form.dataset.postId = target.id;

    form.onsubmit = (e) => {
        e.preventDefault();
        const nameInput = form.querySelector('input[type="text"]');
        const messageInput = form.querySelector('textarea');
        const fileInput = form.querySelector('input[type="file"]');
        const name = nameInput.value.trim();
        const message = messageInput.value.trim();

        const doUpdate = (imageData) => {
            updatePostById(target.id, { name, message, imageData });
            form.classList.remove('active');
            loadPostsByMonth();
        };

        if (fileInput && fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => doUpdate(ev.target && ev.target.result ? ev.target.result : null);
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            doUpdate(undefined); // 画像は変更しない
        }
    };

    // 名前
    const nameGroup = createFormGroup('名前（編集）:', 'text');
    nameGroup.querySelector('input').value = target.name || '';
    form.appendChild(nameGroup);

    // メッセージ
    const messageGroup = createFormGroup('メッセージ（編集）:', 'textarea', 3);
    messageGroup.querySelector('textarea').value = target.message || '';
    form.appendChild(messageGroup);

    // 画像
    const imgGroup = document.createElement('div');
    imgGroup.className = 'form-group';
    const imgLabel = document.createElement('label');
    imgLabel.textContent = '画像差し替え（任意）:';
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    imgGroup.appendChild(imgLabel);
    imgGroup.appendChild(fileInput);
    form.appendChild(imgGroup);

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = '保存';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'キャンセル';
    cancelBtn.style.background = '#999';
    cancelBtn.style.marginLeft = '10px';
    cancelBtn.onclick = () => form.classList.remove('active');

    form.appendChild(submitBtn);
    form.appendChild(cancelBtn);
    return form;
}

/**
 * 編集フォームの表示/非表示を切り替え
 * @param {number} postId - 対象ID
 */
function toggleEditForm(postId) {
    const forms = document.querySelectorAll('.edit-form');
    forms.forEach(form => {
        if (form.dataset.postId === String(postId)) {
            form.classList.toggle('active');
        } else {
            form.classList.remove('active');
        }
    });
}

/**
 * IDで投稿/返信を更新（再帰）
 * @param {number} targetId
 * @param {{name?:string, message?:string, imageData?:string|undefined}} updates
 */
function updatePostById(targetId, updates) {
    const monthKeys = getAllMonthKeys();
    let updated = false;
    monthKeys.forEach(monthKey => {
        const list = getPostsByMonth(monthKey);
        const applyUpdates = (items) => {
            for (const item of items) {
                if (item.id === targetId) {
                    if (typeof updates.name === 'string') item.name = updates.name;
                    if (typeof updates.message === 'string') item.message = updates.message;
                    if (updates.imageData !== undefined) item.imageData = updates.imageData;
                    updated = true;
                    return true;
                }
                if (item.replies && item.replies.length > 0) {
                    const hit = applyUpdates(item.replies);
                    if (hit) return true;
                }
            }
            return false;
        };
        if (applyUpdates(list)) {
            savePostsByMonth(monthKey, list);
        }
    });
    return updated;
}

// ============================================================================
// フィルター関数
// ============================================================================

/**
 * 月フィルターのオプションを更新
 */
function updateMonthFilter() {
    const monthSelect = document.getElementById('monthSelect');
    if (!monthSelect) {
        console.error('月フィルター要素が見つかりません');
        return;
    }

    const months = getAllMonthKeys();
    months.sort().reverse();

    const currentValue = monthSelect.value;

    // 既存のオプションをクリア（"すべて表示"以外）
    while (monthSelect.options.length > 1) {
        monthSelect.remove(1);
    }

    // 月のオプションを追加
    months.forEach(month => {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = formatMonthDisplay(month);
        monthSelect.appendChild(option);
    });

    monthSelect.value = currentValue || '';
}

// ============================================================================
// イベントハンドラ
// ============================================================================

/**
 * 新規投稿フォームの送信処理
 */
function handlePostFormSubmit(e) {
    e.preventDefault();
    const nameInput = document.getElementById('name');
    const messageInput = document.getElementById('message');
    const imageInput = document.getElementById('image');
    
    if (!nameInput || !messageInput) {
        console.error('フォーム要素が見つかりません');
        return;
    }

    const name = nameInput.value.trim();
    const message = messageInput.value.trim();

    if (name && message) {
        const file = imageInput && imageInput.files && imageInput.files[0] ? imageInput.files[0] : null;
        if (file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                const dataUrl = ev.target && ev.target.result ? ev.target.result : null;
                addPost(name, message, null, dataUrl);
                nameInput.value = '';
                messageInput.value = '';
                imageInput.value = '';
            };
            reader.readAsDataURL(file);
        } else {
            addPost(name, message);
            nameInput.value = '';
            messageInput.value = '';
        }
    }
}

/**
 * 月フィルター変更処理
 */
function handleMonthFilterChange(e) {
    currentMonthFilter = e.target.value;
    loadPostsByMonth();
}

/**
 * 初期化
 */
function initialize() {
    const postForm = document.getElementById('postForm');
    const monthSelect = document.getElementById('monthSelect');

    if (postForm) {
        postForm.addEventListener('submit', handlePostFormSubmit);
    }

    if (monthSelect) {
        monthSelect.addEventListener('change', handleMonthFilterChange);
    }

    loadPosts();
}

// ============================================================================
// ページ読み込み時の初期化
// ============================================================================
document.addEventListener('DOMContentLoaded', initialize);

// 监听 popstate 事件，在历史记录状态改变时触发
window.addEventListener('popstate', function (event) {
    checkUrlPage();
});

var globalpage = 0;

$(document).ready(function () {
    // 页面初始化时的处理
    checkUrlPage();
    getIndexes();

    // 监听 popstate 事件，以便在用户点击浏览器的前进或后退按钮时检查URL路径
    window.addEventListener('popstate', function (event) {
        checkUrlPage();
    });
});

// 检查当前URL路径，并根据路径执行相应操作
function checkUrlPage() {
    var currentPath = window.location.pathname;
    var regexMappings = [
        { regex: /^\/albums\/([\w\d]+)$/, handler: loadAlbumDetails },
        { regex: /^\/artist\/([\w\d]+)$/, handler: loadArtistDetails },
        { regex: /^\/searchAlbums\/(.*)$/, handler: searchAlbums },
        { regex: /^\/searchArtists\/(.*)$/, handler: searchArtists },
        { regex: /^\/searchSongs\/(.*)$/, handler: searchSongs },
        { regex: /^\/albumlist\/(\d+)$/, handler: loadAlbums },
        { regex: /^\/displayFavoriteAlbums$/, handler: displayFavoriteAlbums }
    ];

    for (var i = 0; i < regexMappings.length; i++) {
        var mapping = regexMappings[i];
        var match = currentPath.match(mapping.regex);
        if (match) {
            var param = match[1]; // 提取匹配的参数
            mapping.handler(decodeURIComponent(param));
            return;
        }
    }

    // 如果没有匹配的路径，则默认加载专辑列表
    loadAlbums(globalpage);
}

// 翻页功能
function upPage() {
    if (globalpage > 0) {
        globalpage--;
        loadAlbums(globalpage);
    }
}

function downPage() {
    globalpage++;
    loadAlbums(globalpage);
}

// 弹出窗口内容
var popupContent = `
    <span>😊</span>
    <p>
        东方音乐播放站，版权没有<br>
        有事请联系：admin@thmusic.top<br>
        如果需要大幅度翻页请直接修改网址里的页面数目<br>
        就是网址最后的数字。<br>
        截至目前（2024年6月26日）总共721页。
    </p>
`;

// 创建并添加弹出窗口
var popup = document.createElement('div');
popup.className = 'popup';
popup.innerHTML = popupContent;
document.body.appendChild(popup);

// 点击按钮显示弹出窗口
var button = document.getElementById('about-button');
button.addEventListener('click', function () {
    popup.style.display = 'block';
});

// 点击窗口外部任意位置隐藏窗口
window.addEventListener('click', function (event) {
    if (event.target !== button && event.target !== popup) {
        popup.style.display = 'none';
    }
});

// 保存喜欢的专辑到本地cookie
function saveFavoriteAlbum(albumId) {
    let favorites = getFavoriteAlbums();
    favorites.push(albumId);
    document.cookie = `favorite_albums=${JSON.stringify(favorites)}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
    updateButton(albumId);
}

// 从本地cookie读取喜欢的专辑albumid数组
function getFavoriteAlbums() {
    let cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)favorite_albums\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    return cookieValue ? JSON.parse(cookieValue) : [];
}

// 将喜欢的专辑albumid编码为base64导出
function exportFavoriteAlbumsBase64() {
    let favorites = getFavoriteAlbums();
    let base64String = btoa(JSON.stringify(favorites));
    return base64String;
}

// 返回喜欢的专辑albumid数组
function getFavoriteAlbumsArray() {
    return getFavoriteAlbums();
}

// 检查本地cookie是否存在指定的albumId，
function checkAndDisableButton(albumId) {
    let favorites = getFavoriteAlbums();
    return favorites.includes(albumId);
}

// 删除本地cookie中的指定albumId
function removeFavoriteAlbum(albumId) {
    let favorites = getFavoriteAlbums();
    let index = favorites.indexOf(albumId);
    if (index !== -1) {
        favorites.splice(index, 1);
        document.cookie = `favorite_albums=${JSON.stringify(favorites)}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
        updateButton(albumId);
    }
}

// 根据给定的base64字符串保存收藏列表到cookie，并合并去重
function importFavoriteAlbumsBase64(base64String) {
    try {
        let decodedString = atob(base64String); // 解码base64字符串
        let importedFavorites = JSON.parse(decodedString); // 将解码后的字符串转换为数组

        let currentFavorites = getFavoriteAlbums(); // 获取当前本地保存的收藏列表

        // 合并去重
        let mergedFavorites = Array.from(new Set([...currentFavorites, ...importedFavorites]));

        document.cookie = `favorite_albums=${JSON.stringify(mergedFavorites)}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
        displayFavoriteAlbums();
        console.log("导入并合并的收藏专辑列表:", mergedFavorites);
    } catch (error) {
        alert("导入收藏专辑列表时发生错误:", error);
        console.error("导入收藏专辑列表时发生错误:", error);
        // 可以根据需要处理解析错误的情况，比如显示错误信息给用户
    }
}


// 更新按钮文字和绑定的方法
function updateButton(albumId) {
    let saveFavoriteBtn = document.getElementById('saveFavoriteBtn');
    if (saveFavoriteBtn) {
        if (getFavoriteAlbums().includes(albumId)) {
            saveFavoriteBtn.innerText = "移除收藏";
            saveFavoriteBtn.onclick = function () {
                removeFavoriteAlbum(albumId);
            };
        } else {
            saveFavoriteBtn.innerText = "保存喜欢的专辑";
            saveFavoriteBtn.onclick = function () {
                saveFavoriteAlbum(albumId);
            };
        }
    } else {
        console.error("Button with ID 'saveFavoriteBtn' not found.");
    }
}

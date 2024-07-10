$(document).ready(function () {
    var searchTimer; // 声明一个变量用于存储定时器ID

    var $searchAlbumInput = $('#search-album-input');
    var $searchArtistInput = $('#search-artist-input');
    var $searchSongInput = $('#search-song-input');

    // 搜索功能 - 专辑
    $searchAlbumInput.on('keyup', function () {
        var query = $(this).val();
        clearTimeout(searchTimer); // 清除之前的定时器

        // 设置新的定时器，在用户输入停止一秒后执行搜索
        searchTimer = setTimeout(function () {
            if (query.length > 2) {
                searchAlbums(query);
            } else if (query.length === 0) {
                loadAlbums(globalpage);
            }
            history.pushState(null, '', `/searchAlbums/${query}`);
            $searchArtistInput.val('');
            $searchSongInput.val('');
        }, 1000); // 延时1秒（1000毫秒）
    });

    // 搜索功能 - 艺术家
    $searchArtistInput.on('keyup', function () {
        var query = $(this).val();
        clearTimeout(searchTimer); // 清除之前的定时器

        // 设置新的定时器，在用户输入停止一秒后执行搜索
        searchTimer = setTimeout(function () {
            if (query.length > 2) {
                searchArtists(query);
            } else if (query.length === 0) {
                loadAlbums(globalpage);
            }
            history.pushState(null, '', `/searchArtists/${query}`);
            $searchAlbumInput.val('');
            $searchSongInput.val('');
        }, 1000); // 延时1秒（1000毫秒）
    });

    // 搜索功能 - 歌曲
    $searchSongInput.on('keyup', function () {
        var query = $(this).val();
        clearTimeout(searchTimer); // 清除之前的定时器

        // 设置新的定时器，在用户输入停止一秒后执行搜索
        searchTimer = setTimeout(function () {
            if (query.length > 2) {
                searchSongs(query);
            } else if (query.length === 0) {
                loadAlbums(globalpage);
            }
            history.pushState(null, '', `/searchSongs/${query}`);
            $searchAlbumInput.val('');
            $searchArtistInput.val('');
        }, 1000); // 延时1秒（1000毫秒）
    });
});

function searchAlbums(query) {
    $('#up-button').prop('disabled', true);
    $('#down-button').prop('disabled', true);
    $('#content').html('<p>Searching...</p>');
    $.getJSON('https://player.thmusic.top/search', { query: query }, function (data) {
        console.debug(data);
        if (data.status === 'ok') {
            var sAlbumHtml = '<div class="row">';
            data.albums.forEach(function (album) {
                sAlbumHtml += `
                    <div class="col-md-2 mb-4">
                        <div class="card shadow-sm">
                            <div class="square-img-container">
                                <img class="card-img-top square-img" src="/cover/${album.coverArt}" alt="${album.album} Album Cover - TouHou Music" onclick="loadAlbumDetails('${album.id}')">
                            </div>
                            <div class="card-body">
                                <h5 class="card-title">${album.album}</h5>
                                <p class="card-text">${album.artist} - ${album.year}</p>
                            </div>
                        </div>
                    </div>
                `;
            });
            sAlbumHtml += '</div>';
            $('#content').html(sAlbumHtml);
        } else {
            showError(data.message);
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        console.error('Failed to search albums:', textStatus, errorThrown);
        showError('Failed to search albums. Please try again later.');
    });
}

function searchArtists(query) {
    $('#up-button').prop('disabled', true);
    $('#down-button').prop('disabled', true);
    $('#content').html('<p>Searching...</p>');
    $.getJSON('https://player.thmusic.top/search_artists', { query: query }, function (data) {
        console.debug(data);
        if (data.status === 'ok') {
            var sArtistHtml = '<ul class="list-group">';
            data.artists.forEach(function (artist) {
                sArtistHtml += `
                    <li class="list-group-item">
                        <a href="#" onclick="loadArtistDetails('${artist.id}')"><h5>${artist.name}</h5></a>
                    </li>
                `;
            });
            sArtistHtml += '</ul>';
            $('#content').html(sArtistHtml);
        } else {
            showError(data.message);
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        console.error('Failed to search artists:', textStatus, errorThrown);
        showError('Failed to search artists. Please try again later.');
    });
}

function searchSongs(query) {
    $('#up-button').prop('disabled', true);
    $('#down-button').prop('disabled', true);
    $('#content').html('<p>Searching...</p>');
    $.getJSON('https://player.thmusic.top/search_songs', { query: query }, function (data) {
        console.debug(data);
        if (data.status === 'ok') {
            if (data.songs.length > 0) {
                var sSongsHtml = '<div class="list-group">';
                data.songs.forEach(function (song) {
                    sSongsHtml += `
                        <a href="javascript:void(0);" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" onclick="playSong('${song.id}', '${song.title}', '${song.coverArt}', '${song.artist}')">
                            <div class="d-flex align-items-center">
                                <img src="/cover/${song.coverArt}" alt="${song.artist} Album Cover - TouHou Music" class="img-thumbnail mr-3" style="width: 60px; height: 60px;">
                                <div class="song-info">
                                    <h5 class="mb-1">${song.track}. ${song.title}</h5>
                                    <p class="mb-1">${song.artist}</p>
                                </div>
                            </div>
                            <button type="button" class="btn btn-sm btn-primary" onclick="loadAlbumDetails('${song.albumId}')">打开专辑</button>
                        </a>
                    `;
                });
                sSongsHtml += '</div>';
                $('#content').html(sSongsHtml);
            } else {
                showError('No songs found.');
            }
        } else {
            showError(data.message);
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        console.error('Failed to search songs:', textStatus, errorThrown);
        showError('Failed to search songs. Please try again later.');
    });
}

function showError(message, selector = '#content') {
    $(selector).html(`<p>${message}</p>`);
}

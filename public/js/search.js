var SEARCH_DATA = {};

function initSearch() {
    document.addEventListener('keyup', handleDocumentKeyUp, false);
    document.addEventListener('keydown', handleDocumentKeyDown, false);

    window.addEventListener('load', function() {
        initSearchEvents();

        if (Turbolinks) {
            document.addEventListener('turbolinks:render', function() {
                initSearchEvents();
            })
        }
    });

    fetch('/search-data.json').then(function (response) {
        response.text().then(function (result) {
            SEARCH_DATA = JSON.parse(result.split('<pre>')[1].split('</pre>')[0]);
        });
    });
}

var currentSearchResults = [];
var selectedSearchResultItemIndex = 0;

function initSearchEvents() {
    const backdropEl = document.getElementsByClassName('search-backdrop')[0];
    backdropEl.addEventListener('click', function(e) {
        toggleSearchModal();
    });

    const searchModalEl = document.getElementsByClassName('search-modal')[0];
    searchModalEl.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    const searchInput = document.getElementsByClassName('search-input')[0];
    const searchInputIcon = document.getElementsByClassName('search-input-icon')[0];

    const startSearch = function() {
        location.href = '/search?q=' + encodeURI(searchInput.value.trim())
        
        if (searchModalActive) {
            toggleSearchModal()
        }
    }

    searchInputIcon.addEventListener('click', function(e) {
        startSearch();
    });

    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            const selectedItems = document.getElementsByClassName('search-result-selected-item');
            if (selectedItems.length > 0) {
                const goToPage = selectedItems[0].getAttribute('href');
                toggleSearchModal();

                if (Turbolinks) {
                    Turbolinks.visit(goToPage);
                } else {
                    location.href = goToPage;
                }
            }
        }
        setTimeout(function () {
            if (SEARCH_DATA.posts && searchInput.value && searchInput.value.trim().length > 2) {
                runSearch(searchInput);
            } else {
                currentSearchResults = [];
            }
            rerenderSearchResults();
        }, 50);
    });

    searchInput.addEventListener('keyup', function (e) {
        if (e.key === 'Backspace' && (!searchInput.value || searchInput.value.trim().length < 3)) {
            currentSearchResults = [];
        } else if (e.key === 'Backspace') {
            runSearch(searchInput);
        }

        rerenderSearchResults();
    })

    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
        }
    })

    const homeSearchBarEls = document.getElementsByClassName('home-search-bar');
    if (homeSearchBarEls.length > 0) {
        homeSearchBarEls[0].addEventListener('click', function(e) {
            toggleSearchModal();
        });
    }
}

var metaKeyRecentlyDown = false;
var searchModalActive = false;

function handleDocumentKeyUp(e) {
    if (e.ctrlKey && (e.key === 'k' || e.key === 'K')) {
        metaKeyRecentlyDown = false;
        toggleSearchModal();
        e.preventDefault();
    }
}

function handleDocumentKeyDown(e) {
    if (e.metaKey) {
        metaKeyRecentlyDown = true;
        setTimeout(function () {
            metaKeyRecentlyDown = false;
        }, 2000);
    }

    if (metaKeyRecentlyDown && (e.key === 'k' || e.key === 'K')) {
        metaKeyRecentlyDown = false;
        toggleSearchModal();
        e.preventDefault();
    }

    if (e.key === 'Escape' && searchModalActive) {
        toggleSearchModal();
    }

    function changeSelectedSearchResult(delta) {
        selectedSearchResultItemIndex += delta;

        if (selectedSearchResultItemIndex < 0) {
            selectedSearchResultItemIndex = 0;
        }

        if (selectedSearchResultItemIndex >= currentSearchResults.length) {
            selectedSearchResultItemIndex = currentSearchResults.length - 1;
        }
    }

    if (searchModalActive && e.key === 'ArrowUp') {
        changeSelectedSearchResult(-1);
    } else if (searchModalActive && e.key === 'ArrowDown') {
        changeSelectedSearchResult(1);
    }
}

function toggleBodyScroll() {

    if (searchModalActive) {
        document.body.style.overflowY = 'auto';
        document.body.style.paddingRight = '0';
    } else {
        const originalBodyWidth = document.body.offsetWidth;
        document.body.style.overflowY = 'hidden';
        const updatedBodyWidth = document.body.offsetWidth;

        if (updatedBodyWidth > originalBodyWidth) {
            document.body.style.paddingRight = (updatedBodyWidth - originalBodyWidth) + 'px';
        }
    }
}

function toggleSearchModal() {
    const backdropEl = document.getElementsByClassName('search-backdrop')[0];
    if (searchModalActive) {
        toggleBodyScroll();
        backdropEl.style.display = 'none';
        document.getElementsByClassName('search-input')[0].value = '';
        currentSearchResults = [];
        rerenderSearchResults();
    } else {
        toggleBodyScroll();
        backdropEl.style.display = 'block';
        const searchInputEl = document.getElementsByClassName('search-input')[0];
        searchInputEl.focus();
    }

    searchModalActive = !searchModalActive;
}

function runSearch(searchInput) {
    const matchingPosts = SEARCH_DATA.posts.filter(function (post) {
        return post.title.toLowerCase().indexOf(searchInput.value.trim().toLowerCase()) > -1;
    }).map(function (post) {
        post.type = 'post';
        return post;
    });

    const matchingSpaces = SEARCH_DATA.spaces.filter(function (space) {
        return space.title.toLowerCase().indexOf(searchInput.value.trim().toLowerCase()) > -1;
    }).map(function (space) {
        space.type = 'space';
        return space;
    });

    currentSearchResults = matchingPosts.concat(matchingSpaces);

    // if (searchInput.value && searchInput.value.length > 2) {
    //     currentSearchResults.push({
    //         type: 'full-text-search'
    //     });
    // }
}

function rerenderSearchResults() {
    const searchResultsEl = document.getElementsByClassName('search-results')[0];
    var source = '';

    if (selectedSearchResultItemIndex >= currentSearchResults.length) {
        selectedSearchResultItemIndex = Math.max(currentSearchResults.length - 1, 0);
    }

    currentSearchResults.forEach(function (result, index) {
        var item = '';
        if (result.type === 'post') {
            item = '<a href="/posts/' + result.id + '" class="search-result-item">'
                + result.title + ' <span class="search-result-item-comment"> Posted on '
                + result.spaceTitle + '</span></a>';
        } else if (result.type === 'space') {
            item = '<a href="/spaces/' + result.id + '" class="search-result-item">'
                + result.title + ' <span class="search-result-item-comment">Space</span></a>';
        } else if (result.type === 'full-text-search') {
            item = '<a href="/search?q=' + encodeURI(document.getElementsByClassName('search-input')[0].value) + '" class="search-result-item">Full text search <span class="search-result-item-comment">Find any occurrence</span></a>';
        }

        if (selectedSearchResultItemIndex === index) {
            item = item.replace('class="', 'class="search-result-selected-item ');
        }

        source += item;
    });

    searchResultsEl.innerHTML = source;
    
    if (currentSearchResults.length > 0) {
        searchResultsEl.style.display = 'block';
    } else {
        searchResultsEl.style.display = 'none';
    }
}


function searchShortcut() {
    const os = getOS();

    var output = '';

    if (os === 'macos') {
        output = "<span style=\"opacity: 0.7\">&#8984;K</span>"
    } else if (os === 'windows') {
        output = "<span style=\"opacity: 0.7\">Ctrl + K</span>"
    }

    return output;
}

function getOS() {
    var userAgent = window.navigator.userAgent.toLowerCase(),
      macosPlatforms = /(macintosh|macintel|macppc|mac68k|macos)/i,
      windowsPlatforms = /(win32|win64|windows|wince)/i,
      iosPlatforms = /(iphone|ipad|ipod)/i,
      os = null;
  
    if (macosPlatforms.test(userAgent)) {
      os = "macos";
    } else if (iosPlatforms.test(userAgent)) {
      os = "ios";
    } else if (windowsPlatforms.test(userAgent)) {
      os = "windows";
    } else if (/android/.test(userAgent)) {
      os = "android";
    } else if (!os && /linux/.test(userAgent)) {
      os = "linux";
    }
  
    return os;
}

function runFullTextSearch() {
    fetch('/full-text-search' + location.search).then(function (response) {
        response.json().then(function (result) {
            const resultsEl = document.getElementById('full-text-search-results');
            resultsEl.innerHTML = '';

            if (resultsEl) {
                if (result.results.length === 0) {
                    resultsEl.innerHTML = '<div class="fsr-no-result">No results found</div>';
                } else {
                    result.results.forEach((resultItem) => {
                        const resultItemEl = document.createElement('a');
                        resultItemEl.setAttribute('href', '/posts/' + resultItem.id);
                        resultItemEl.className = 'fsr-item';
                        resultItemEl.innerHTML = '<div class="fsr-title">' + resultItem.title + '</div>'
                            + '<div class="fsr-subtile">Published in ' + resultItem.spaceTitle + '</div>'
                            + '<div class="fsr-content">' + resultItem.content + '</div>';
                
                        resultsEl.appendChild(resultItemEl);
                    });
                }
            }
        });
    });
}



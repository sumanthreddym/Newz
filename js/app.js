var app = {
    isLoading: true,
    visibleCards: {},
    favoriteNewsPapers: [],
    favoriteStories: [],
    favoriteTopics: [],
    spinner: document.querySelector('.loader'),
    cardTemplate: document.querySelector('.card-template'),
    container: document.querySelector('.cards-section'),
    sources: [{ name: "Hindu", sourceStr: "the-hindu" }, { name: "The Times Of India", sourceStr: "the-times-of-india" }
        , { name: "ABC News(AU)", sourceStr: "abc-news-au" }, { name: "Al Jazeera English", sourceStr: "al-jazeera-english" }
        , { name: "ARS Technica", sourceStr: "ars-technica" }, { name: "Associated Press", sourceStr: "associated-press" }
        , { name: "BBC News", sourceStr: "bbc-news" }, { name: "BBC Sport", sourceStr: "bbc-sport" }
        , { name: "Bild", sourceStr: "bild" }, { name: "Bloomberg", sourceStr: "bloomberg" }
        , { name: "Breitbart News", sourceStr: "breitbart-news" }, { name: "Business Insider", sourceStr: "business-insider" }
        , { name: "Business Insider UK", sourceStr: "business-insider-uk" }, { name: "BuzzFeed", sourceStr: "buzzfeed" }
        , { name: "CNBC", sourceStr: "cnbc" }, { name: "CNN", sourceStr: "cnn" }, { name: "Daily Mail", sourceStr: "daily-mail" }]
};

app.getNews = function () {
    app.favoriteNewsPapers = JSON.parse(localStorage.getItem('favoriteNewsPapers'));

    if (app.favoriteNewsPapers != null) {
        for (var j = 0; j < app.favoriteNewsPapers.length; j++) {
            app.container.textContent = "";
            app.newsRequest(app.favoriteNewsPapers[j]);
        }
    } else {
    }
    
}
app.newsRequest = function (newsPaper) {
    var url = 'https://newsapi.org/v1/articles?source=' + newsPaper + '&sortBy=top&apiKey=137035c2092f4d07aee728db84fd2b33';
    // Fetch the latest data.
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
            if (request.status === 200) {
                console.log('app.js response');
                console.log(request.response);
                var response = JSON.parse(request.response);
                var articles = response.articles;
                for (var i = 0; i < articles.length; i++) {
                    displayNews(articles[i],newsPaper);
                }
            }
        } else {
            // Return the empty news template if no data is available
        }
    };
    request.open('GET', url);
    request.send();
}
function updateFavoriteNewsPapers() {
    app.favoriteNewsPapers = [];
    for (var i = 0; i < app.sources.length; i++) {
        var curElement = document.getElementById(app.sources[i].sourceStr);
        if (curElement.checked)
        {
            app.favoriteNewsPapers.push(curElement.getAttribute('value'));
        }
    }
    app.saveSelectedNewsPapers();
    app.container.textContent = '';
    app.getNews();
    app.init();
}
function addFavoriteStories() {
    var cardElement = event.path[3];
    var favoriteStories = JSON.parse(localStorage.getItem('favoriteStories'));
    if(favoriteStories!=null){
        app.favoriteStories = favoriteStories;
        if (favoriteStories.some(o => o.title == cardElement.querySelector('.card-title').textContent) > 0) {
            return;
        }
    }
    else{
        app.favoriteStories = [];
    }
    
    app.favoriteStories.push(new Story(cardElement.querySelector('.card-title').textContent,
    cardElement.querySelector('.card-content p').textContent,
    cardElement.querySelector('.card-action a').getAttribute('href'),
    cardElement.querySelector('.card-action a').textContent,
    cardElement.querySelector('.card-image img').getAttribute('src')));
    Materialize.toast('New Favourite Story Added', 4000);
    localStorage.setItem('favoriteStories',JSON.stringify(app.favoriteStories));
}
function deleteFavoriteStory() {

    var cardElement = event.path[3];
    app.favoriteStories = JSON.parse(localStorage.getItem('favoriteStories'));
    var deleteIndex;
    if (app.favoriteStories != null) {
        if ((deleteIndex = app.favoriteStories.findIndex(o => o.title == cardElement.querySelector('.card-title').textContent)) >= 0) {
           
            app.favoriteStories.splice(deleteIndex, 1);
            localStorage.setItem('favoriteStories', JSON.stringify(app.favoriteStories));
            displayFavoriteStories();
            Materialize.toast('Favourite Story Deleted', 4000);
        }
    }
    else {
        app.favoriteStories = [];
    }

}

/*****************************************************************************
 *
 * Event listeners for UI elements
 *
 ****************************************************************************/

document.onload = Load();
function Load(){
    if(JSON.parse(localStorage.getItem('favoriteNewsPapers')) != null){
        app.favoriteNewsPapers = JSON.parse(localStorage.getItem('favoriteNewsPapers'));
    }        
    app.getNews();
    displayOptions();
    var homeBtns = document.querySelectorAll('.btn-home');
    for (var i = 0; i < homeBtns.length; i++) {
        homeBtns[i].addEventListener('click', app.getNews);
    }
    document.querySelector('.btn-follow').addEventListener('click', displayOptions);
    var favoriteBtns = document.querySelectorAll('.btn-favorite-stories');
    for (var i = 0; i < favoriteBtns.length; i++) {
        favoriteBtns[i].addEventListener('click', displayFavoriteStories);
    }
}

/*****************************************************************************
 *
 * All Models go here
 *
 ****************************************************************************/
app.saveSelectedNewsPapers = function () {
    localStorage.favoriteNewsPapers = JSON.stringify(app.favoriteNewsPapers);
};

function Story(_title,_description,_url,_newsPaper,_urlToImage) {
    this.title = _title;
    this.description = _description;
    this.url = _url;
    this.newsPaper = _newsPaper;
    this.urlToImage = _urlToImage;
    this.date = Date()
};

/*****************************************************************************
   *
   * Methods to update/refresh the UI
   *
   ****************************************************************************/

function displayNews(newsObj, newsPaper) {
    var card;
    card = app.cardTemplate.cloneNode(true);
    card.classList.remove('card-template');
    card.removeAttribute('hidden');

    card.querySelector('.card-title').textContent = newsObj.title;
    card.querySelector('.card-content p').textContent = newsObj.description;
    card.querySelector('.card-action a').setAttribute('href', newsObj.url);
    card.querySelector('.card-action a').textContent = newsPaper;
    card.querySelector('.card-image img').setAttribute('src', newsObj.urlToImage);
    app.container.appendChild(card);
    card.querySelector('.card-action div').addEventListener('click', addFavoriteStories);
    document.querySelector('.btn-home').classList.add('active');
    document.querySelector('.btn-follow').classList.remove('active');
    document.querySelector('.btn-favorite-stories').classList.remove('active');
}
function displayOptions() {
    document.querySelector('.modal-maincontent').textContent = '';
    for (var i = 0; i < app.sources.length; i++) {
        var option = document.querySelector('.modal-option').cloneNode(true);
        option.classList.remove('modal-option');
        option.removeAttribute('hidden');
        option.querySelector('.checkbox-input').setAttribute('value', app.sources[i].sourceStr);
        option.querySelector('.checkbox-input').setAttribute('id', app.sources[i].sourceStr);
        if (app.favoriteNewsPapers != null && app.favoriteNewsPapers.indexOf(app.sources[i].sourceStr) >= 0) {
            option.querySelector('.checkbox-input').setAttribute('checked', true);
        }
        option.querySelector('label').setAttribute('for', app.sources[i].sourceStr);
        option.querySelector('label').textContent = app.sources[i].name;
        document.querySelector('.modal-maincontent').appendChild(option);
        option.addEventListener('click', updateFavoriteNewsPapers);
    }
}
function displayFavoriteStories() {
    app.container.textContent = '';
    var favoriteStories = JSON.parse(localStorage.getItem('favoriteStories'));
    if (favoriteStories != null) {
        for (var i = 0; i < favoriteStories.length; i++) {
            var card;
            card = app.cardTemplate.cloneNode(true);
            card.classList.remove('card-template');
            card.removeAttribute('hidden');
            card.querySelector('.card-title').textContent = favoriteStories[i].title;
            card.querySelector('.card-content p').textContent = favoriteStories[i].description;
            card.querySelector('.card-action a').setAttribute('href', favoriteStories[i].url);
            card.querySelector('.card-action a').textContent = favoriteStories[i].newsPaper;
            card.querySelector('.card-image img').setAttribute('src', favoriteStories[i].urlToImage);
            card.querySelector('.card-action div i').textContent = 'delete';
            card.querySelector('.card-action div').addEventListener('click', deleteFavoriteStory);
            app.container.appendChild(card);
        }
        
    }
    else {
        app.favoriteStories = [];
    }
    document.querySelector('.btn-home').classList.remove('active');
    document.querySelector('.btn-follow').classList.remove('active');
    document.querySelector('.btn-favorite-stories').classList.add('active');
}

app.init = function(){
    if(app.favoriteStories.length > 0){
    document.querySelector('.welcome-card').setAttribute('hidden',true);
    }
    else{
    document.querySelector('.welcome-card').removeAttribute('hidden');
    }
}
app.init();
//Register service worker here
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./service-worker.js')
             .then(function () { console.log('Service Worker Registered'); });
}




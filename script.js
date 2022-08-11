const search = document.querySelector('.search')
const btn = document.querySelector('.btn')
const input = document.querySelector('.input')


btn.addEventListener('click', () => {
    search.classList.toggle('active')
    input.focus()
})

// Now, we have the auth working in this... We want to be able to display a 
// picture of the album art.

const base = 'https://api.spotify.com/'
console.log(base)
const CLIENT_ID = 'b189b96c428d420988bc622dbe88ce57';
const CLIENT_SECRET = 'd8282bd6f657411c827c4f7de0bf5c26';

var SPOTIFY_AUTH_TOKEN = ''


fetch(`https://accounts.spotify.com/api/token`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET), 
                     },
        body : 'grant_type=client_credentials'
      })
      .then(res => res.json())
      .then(data => {
        console.log("Testing for ponushonu too poo: " + data.access_token)
        SPOTIFY_AUTH_TOKEN = data.access_token
        
    });


// var authToken = '';
const authToken = new Promise(() => {getAuthToken()});



var fetchTracks = function (albumId, callback) {
    $.ajax({
        url: 'https://api.spotify.com/v1/albums/' + albumId,
        success: function (response) {
            callback(response);
        }
    });
};



const albums = document.getElementById('albums');


async function searchAlbums(query) {
    var output = [];

    // fetch(`https://api.spotify.com/v1/search`, {
    //     method: 'GET',
    //     headers: { 'Authorization': 'Bearer ' + SPOTIFY_AUTH_TOKEN},
    //     data : {
    //         q: query,
    //         type: 'album'
    //     }
    //   })
    //   .then(res => console.log(res))
    //   .then(data => {
    //     console.log("Toopie 1 2 3: " + data)
    //     }
        // );
    
    $.ajax({
        url: 'https://api.spotify.com/v1/search',
        type: 'GET',
        beforeSend: async function (xhr) {
            // const forAuth = await authToken;
            xhr.setRequestHeader('Authorization', 'Bearer ' + SPOTIFY_AUTH_TOKEN);
        },
        data: {
            q: query,
            type: 'album',
            limit: '10'
        },
        success: function (data) {
            output = data.albums.items;
            console.log("Search Albums output: " + output)
            output.forEach((obj) => {

                console.log(obj);
        
                // var li = document.createElement("li");
                // li.appendChild(document.createTextNode(obj.name));
                // albums.appendChild(li);
                // console.log('added');
                var album = document.createElement("div")
                album.classList.add('album')
                album.innerHTML = 
                `
                    <div class="wrapper">
                        <img src="${obj.images[1].url}" class="albumArt">
                    </div>
                    <div class="albumInfo">
                        <h1 class="albumTitle">${obj.name}</h1>
                        <p>Released: ${obj.release_date}<br>
                            Track Count:  ${obj.total_tracks}</p>
                    </div>
                `
                albums.appendChild(album)
                
            })
            return output;
        },
        error: function (data) {
            console.log("Error: ")
            console.log(data)
            console.log("Token used: ")
            console.log(authToken)
        }
    });

};

var searchbar = document.getElementById("input");


// Upon entering album name into search bar, display the
// albums.
input.addEventListener("keyup", async function(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
      // Cancel the default action, if needed
      event.preventDefault();
      // Trigger the button element with a click

      // remove current albums
      while( albums.firstChild ){
        albums.removeChild( albums.firstChild );
      }
      const albumList = await searchAlbums(searchbar.value);
      console.log("Album List: " + albumList)


    }
  });





const search = document.querySelector('.search')
const btn = document.querySelector('.btn')
const input = document.querySelector('.input')


btn.addEventListener('click', () => {
    search.classList.toggle('active')
    input.focus()
})



const base = 'https://api.spotify.com/'
console.log(base)
const CLIENT_ID = 'b189b96c428d420988bc622dbe88ce57';
const CLIENT_SECRET = 'd8282bd6f657411c827c4f7de0bf5c26';


async function getAuthToken() {

    const result = await fetch(`https://accounts.spotify.com/api/token`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET), 
                     },
        body : 'grant_type=client_credentials'
      });

    const data = await result.json();

    console.log("Auth Token: " + data.access_token)

    return data.access_token;


}

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


var searchAlbums = async function (query) {

    var output = [];

    if(authToken === ''){
        const empty = await new Promise(r => setTimeout(r, 1000));
    }

    $.ajax({
        url: 'https://api.spotify.com/v1/search',
        type: 'GET',
        beforeSend: async function (xhr) {
            // const forAuth = await authToken;
            xhr.setRequestHeader('Authorization', 'Bearer ' + 'BQBs1aG_D-05OyLEXZ0QIoYsvPOo206bZlukrfx-RsNrzW4orobuyEAUQJDUHzNVgPBX6W04A1WWFdKzeEUWTbjo0w2RrivxjXAZCL8iylYXVv_Lat0');
        },
        data: {
            q: query,
            type: 'album',
        },
        success: function (data) {
            output = data.albums.items;
            console.log(output)

            output.forEach((obj) => {

                // console.log(obj);
                var li = document.createElement("li");
                li.appendChild(document.createTextNode(obj.name));
                albums.appendChild(li);
                console.log('added');

            })



        },
        error: function (data) {
            console.log("Error: ")
            console.log(data)
            console.log("Token used: ")
            console.log(authToken)
        }
    });

    console.log(output)

    return output;
};

// searchAlbums('led zeppelin');

var searchbar = document.getElementById("input");

input.addEventListener("keyup", function(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
      // Cancel the default action, if needed
      event.preventDefault();
      // Trigger the button element with a click

      while( albums.firstChild ){
        albums.removeChild( albums.firstChild );
      }
      searchAlbums(searchbar.value);
    }
  });





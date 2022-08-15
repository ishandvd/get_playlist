
// Generate Code Verifier
function generateRandomString(length) {
    let text = '';
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }



// Hash the verifier.
async function generateCodeChallenge(codeVerifier) {
    const digest = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(codeVerifier),
    );

    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
}


// User is sent to this URL
function generateUrlWithSearchParams(url, params) {
    const urlObject = new URL(url);
    urlObject.search = new URLSearchParams(params).toString();

    return urlObject.toString();
}


// Send user to the auth url, for them to be called back/
function redirectToSpotifyAuthorizeEndpoint() {
    const codeVerifier = generateRandomString(64);

    generateCodeChallenge(codeVerifier).then((code_challenge) => {
      window.localStorage.setItem('code_verifier', codeVerifier);

      // Redirect to example:
      // GET https://accounts.spotify.com/authorize?response_type=code&client_id=77e602fc63fa4b96acff255ed33428d3&redirect_uri=http%3A%2F%2Flocalhost&scope=user-follow-modify&state=e21392da45dbf4&code_challenge=KADwyz1X~HIdcAG20lnXitK6k51xBP4pEMEZHmCneHD1JhrcHjE1P3yU_NjhBz4TdhV6acGo16PCd10xLwMJJ4uCutQZHw&code_challenge_method=S256

      window.location = generateUrlWithSearchParams(
        'https://accounts.spotify.com/authorize',
        {
          response_type: 'code',
          client_id,
          scope: 'user-read-private user-read-email user-read-currently-playing',
          code_challenge_method: 'S256',
          code_challenge,
          redirect_uri,
        },
      );

      // If the user accepts spotify will come back to your application with the code in the response query string
      // Example: http://127.0.0.1:8080/?code=NApCCg..BkWtQ&state=profile%2Factivity
    });
  }


  // now that we have a code, we must provide the verifier along with
  // the redirect uri, and client id
  function exchangeToken(code) {
    console.log("Getting code_verifier, getting access token. auth code: " + code);
    const code_verifier = localStorage.getItem('code_verifier');

    fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: new URLSearchParams({
        client_id,
        grant_type: 'authorization_code',
        code,
        redirect_uri,
        code_verifier,
      }),
    }).then(addThrowErrorToFetch)
      .then((data) => {
      processTokenResponse(data);

      // clear search query params in the url
      window.history.replaceState({}, document.title, '/');
    })
  }


  function refreshToken() {
    fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: new URLSearchParams({
        client_id,
        grant_type: 'refresh_token',
        refresh_token,
      }),
    }).then(addThrowErrorToFetch)
      .then((data) => {
      processTokenResponse(data);

      // clear search query params in the url
      window.history.replaceState({}, document.title, '/');
    })
  }

  // can be called to clear local storage and reload window
  function logout() {
    localStorage.clear();
    window.location.reload();
  }

  async function addThrowErrorToFetch(response) {
    if (response.ok) {
      return response.json();
    } else {
      throw { response, error: await response.json() };
    }
  }


  // Process the response upon sending the auth code to the auth server.
  // Get the access token and the refresh token.
  function processTokenResponse(data) {
    console.log(`Process Token Response ${JSON.stringify(data)}`);
    console.log("Promise token: " + data.access_token)
    access_token = data.access_token;
    refresh_token = data.refresh_token;

    const t = new Date();
    expires_at = t.setSeconds(t.getSeconds() + data.expires_in);

    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('expires_at', expires_at);


    // Replace login screen with logged in screen
    document.getElementById('login').style.display = 'none';
    document.getElementById('loggedin').style.display = 'unset';

    // load data of logged in user
    // TODO: Call function to get currently playing song
    console.log(`Access_token in local Storage: ${localStorage.getItem('access_token')}`)
  }


  // Your client id from your app in the spotify dashboard:
  // https://developer.spotify.com/dashboard/applications
  const client_id = 'b189b96c428d420988bc622dbe88ce57';
  const redirect_uri = 'http://localhost:5500'; // Your redirect uri
  const genius_access_token = 'A_xibWa7G_wGU9qQMIW3mMKCTcn7waMDD7ops-E5MF0HQyBvYJbeAUoTcSnge66E'
  const genius_client_id = 'wosUYP40PBKd5o3fkMd3wRQLD4KD7raRxDJyAgvVio74A267fRAjEcpT772tj4GG'


  // Restore tokens from localStorage
  let access_token = localStorage.getItem('access_token') || null;
  let refresh_token = localStorage.getItem('refresh_token') || null;
  let expires_at = localStorage.getItem('expires_at') || null;


  // If the user has accepted the authorize request spotify will come back to your application with the code in the response query string
  // Example: http://127.0.0.1:8080/?code=NApCCg..BkWtQ&state=profile%2Factivity
  const args = new URLSearchParams(window.location.search);
  const code = args.get('code');

  if (code) {
    // we have received the code from spotify and will exchange it for a access_token
    exchangeToken(code);
  } else if (access_token && refresh_token && expires_at) {
    // we are already authorized and reload our tokens from localStorage
    document.getElementById('loggedin').style.display = 'unset';
    document.getElementById('login').style.display = 'none';

    //TODO: SHOW THE CURRENT SONG PLAYING
  } else {
    // we are not logged in so show the login button
    document.getElementById('login').style.display = 'unset';
    document.getElementById('loggedin').style.display = 'none';
  }

  document
    .getElementById('login-button')
    .addEventListener('click', redirectToSpotifyAuthorizeEndpoint, false);

  document
    .getElementById('logout-button')
    .addEventListener('click', logout, false);




// And now... The cool stuff :)

const getCurrent = document.getElementById('getCurrent')
const skip = document.getElementById('skip')
const content = document.getElementById('content')

getCurrent.addEventListener('click', () => {

    fetch('https://api.spotify.com/v1/me/player/currently-playing', {
          headers: {
            Authorization: 'Bearer ' + access_token,
          },
        })
        .then(async (response) => {
          if (response.ok) {
            console.log("response: " + JSON.stringify(response))
            console.log("Currently Playing response: " + JSON.stringify(response))
            // if (JSON.stringify(response) === '{}'){
            //   throw 'no-song'
            // }
            return response.json(); // error handling
          } else {
            throw await response.json();
          }
        })
        .then((data) => {
          console.log("Currently playing: " + JSON.stringify(data))
          console.log("Song: " + data.item.name)
          content.innerHTML = processTrack(data)
          const currentSong = document.createElement("h1")
          currentSong.innerText = `${data.item.name}`
          content.appendChild(currentSong)

          const artists = data.item.artists

          console.log("Artists: " + JSON.stringify(artists))

          artists.forEach((artist,index) => {
            console.log("Artist " + index + ": " + artist.name)
            const artistName = document.createElement("h1")
            artistName.innerText = `${artist.name}`
            content.appendChild(artistName)
          })
        })
        .catch((error) => {
          if (error === 'no-song'){
            console.log("Nothing playing right now...")
            content.innerHTML = `<p>Our miners couldn't find your current song...</p>`
          }
        })
})


function processCurrentlyPlaying(data) {

  if(data)
  
  if(!data.currently_playing_type){
    console.log("Error, not valid track")
    return "Not valid track"
  }
  
  if(data.currenttly_playing_type === 'ad') {
    console.log("Currently playing ad")
    return "ad"
  }

  if (data.currenttly_playing_type === 'track'){
    console.log("Currently playing track")
    return "track"
  }
}


function processTrack(data){
  return `
  <div class="wrapper">
    <img src="${data.item.album.images[1].url}" id="albumArt">
  </div>`
}



// const data = fetch(`
//           https://api.genius.com/oauth/authorize?
//             client_id=${genius_client_id}&
//             redirect_uri=YOUR_REDIRECT_URI&
//             scope=REQUESTED_SCOPE&
//             state=SOME_STATE_VALUE&
//             response_type=code`)



// &access_token=YOUR_ACCESS_TOKEN


fetch(`https://api.genius.com/search?q=up%20cardi%20b&access_token=${genius_access_token}`
    )
    .then(async (response) => {
        console.log("Submitted search query...")
        if (response.ok) {
          return response.json(); // error handling
        } else {
          throw await response.json();
        }
      })
      .then((data) => {
        console.log("Response: " + JSON.stringify(data))
        const firstSong = data.response.hits[0]
        console.log(firstSong)
        return firstSong
        
      }).then((firstSong) => {

          getSongFromId(firstSong.result.id)
          


      })


async function getSongFromId(id) {

  fetch(`https://api.genius.com/songs/${id}?access_token=${genius_access_token}`)
  .then(async (response) => {
    if (response.ok) {
      return response.json(); // error handling
    } else {
      throw await response.json();
    }
  })
  .then((data) => {
    console.log("Song?: " + JSON.stringify(data))
  })


}




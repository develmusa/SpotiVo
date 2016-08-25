var express = require('express');
var router = express.Router();
var request = require('request'); // "Request" library
var querystring = require('querystring');
var schedule = require('node-schedule');

var client_id = '3036ac0c826f4f5e8b4a8c1a1bc8278d'; // Your client id
var client_secret = '7ce92e60920d43f1b6a48e162422fdeb'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

var SpotifyWebApi = require('spotify-web-api-node');

// credentials are optional
var spotifyApi = new SpotifyWebApi({
  clientId : '3036ac0c826f4f5e8b4a8c1a1bc8278d',
  clientSecret : '7ce92e60920d43f1b6a48e162422fdeb',
  redirectUri : 'http://localhost:8888/callback '
});

var sheduledDaemon; //used for daemon

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('cover', { title: 'Express' });
});



router.get('/login', function(req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

router.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
        querystring.stringify({
          error: 'state_mismatch'
        }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;
        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);

        //save access token & refresh token to session
        req.session.accessToken = access_token;
        req.session.refreshToken = refresh_token;
        req.session.userId = "custom_undefined";

        console.log(access_token);

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          //console.log(body)
          req.app.locals.db.login(body.id);
          req.session.userId = body.id;

          //redirect after getting userId
          if (body.id == "spotivoapplication") {
              res.redirect('/daemon');
          } else {
              res.redirect('/dashboard');
          }
        });

        // we can also pass the token to the browser to make requests from there
        //res.redirect('/dashboard'); hani nach obe verschobe damit t user id zerst abgfrögt wird bevor witergleitet wird.

       /* res.redirect('/playlists' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));*/
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });

  }
});

/* GET dashboard. */
router.get('/dashboard', function(req, res, next) {
  console.log("Session: user Id ", req.session.userId);
  req.app.locals.db.getManagedPlaylists(req.session.userId, function(data) {
      console.log(JSON.stringify(data, null, 4));
  });
  spotifyApi.getUserPlaylists(req.session.userId)
    .then(function(data) {
      var response = (data.body.items);
      //console.log('Retrieved playlists', data.body);
      //TODO: Response müssti in Databank gspeicheret werde und vo dere denn grenderet werde
      //TODO: bestätigung das mer au würklich es voting wil erstele
      //TODO: Text vom button ändere das es bi Playliste wo scho existiered (funktion doesPlaylistExist() nur show staat)
      res.render('dashboard', {  data: response });
    },function(err) {
      console.log('Something went wrong!', err);
    });
});


router.post('/test', function(req,res){
  var requestPlaylistId = req.body.id;
  console.log(req.body);
  res.redirect('/playlist?id=' + requestPlaylistId);
});

router.get('/playlist', function(req, res, next) {
  var requestPlaylistId = req.query.id;
  //console.log('session userId: ', req.session.userId);
  spotifyApi.getPlaylist(req.session.userId, requestPlaylistId)
    .then(function (data) {

      //create Playlist if not already exists
      req.app.locals.db.doesPlaylistExist(requestPlaylistId, function(err, playlistExists) {
        if (!playlistExists) {
            req.app.locals.db.createPlaylist(spotifyApi, requestPlaylistId, data.body.name, req.session.userId);
        } else {
            req.app.locals.db.getPlaylistTracks(requestPlaylistId, req.session.userId, "name", true, function(err, data) {
                console.log(err);
                console.log(JSON.stringify(data, null, 4));
            });
        }
      });

      var response = (data.body.tracks.items);
      //console.log('Retrieved playlists', response);
      //Für db: name->data.body.tracks.items.track.name artist->data.body.tracks.items.track.artists.name(artists isch es array vo alli aristse vo dem song beinhaltet)

      res.render('dashboardSongs', {  data: response });
    }, function (err) {
      console.log('Something went wrong!', err);
    });
});


router.get('/daemon', function(req, res, next) {
  if (req.session.userId != "spotivoapplication") {
    res.redirect('/dashboard');
  }
  console.log("daemon");
  req.app.locals.db.checkDaemonState(function(err, daemonRunning) {
    if (!err) {
      console.log("daemon Running: " + daemonRunning);
      res.render('daemon', {daemonRunning: daemonRunning });
    }
  });
});

router.get('/daemonss', function(req, res, next) {
  if (req.session.userId != "spotivoapplication") {
    res.redirect('/dashboard');
  }
  req.app.locals.db.checkDaemonState(function(err, daemonRunning) {
    if (!err) {
      if (daemonRunning == 1) {
        req.app.locals.db.setDaemonRunning(0, function(err) {
          if (!err) {
            res.redirect('/daemon');
          }
        });
      } else {
        //set Flag on Database
        req.app.locals.db.setDaemonRunning(1, function(err) {
          if (!err) {
            res.redirect('/daemon');
          }
        });

        //start Daemon
        sheduledDaemon = schedule.scheduleJob('*/10 * * * * *', daemon);
      }
    }
  });

  function daemon() {
    //daemon Function
    console.log("daemon running");
    var syncRunning = false;
    var playlistData;

    req.app.locals.db.checkDaemonState(function(err, daemonRunning) {
      if (daemonRunning == 0) {
        sheduledDaemon.cancel();
      } else {
        startSync();
      }
    });

    function startSync() {
      req.app.locals.db.getAllPlaylists(function(err, data) {
        if (!err) {
          playlistData = data;
          playlistSyncStarter(0);
        } else {
          console.log("Error: could not get all Playlists from Database! Abort Daemon");
          console.log(err);
          sheduledDaemon.cancel();
        }
      })
    }

    //for loop in function form!
    function playlistSyncStarter(i) {
      if (i < playlistData.length) {
        syncPlaylist(playlistdata[i].playlist, function(err) {
          if (err) {
            console.log("Error: could not sync Playlist!");
            console.log(err);
            sheduledDaemon.cancel();
          } else {
            playlistSyncStarter(i+1);
          }
        })
      }
    }

    //this function syncs a single playlist with spotify.
    function syncPlaylist(playlist, callback) {
      //TODO: write funciton to sync playlist with spotify
    }
  }

});


module.exports = router;

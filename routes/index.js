var express = require('express');
var router = express.Router();
var request = require('request'); // "Request" library
var querystring = require('querystring');
var schedule = require('node-schedule');

var client_id = '3036ac0c826f4f5e8b4a8c1a1bc8278d'; // Your client id
var client_secret = '7ce92e60920d43f1b6a48e162422fdeb'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri
var scopes = 'user-read-private user-read-email playlist-modify-public playlist-modify-private playlist-read-private playlist-read-collaborative';

var SpotifyWebApi = require('spotify-web-api-node');

// credentials are optional
var spotifyApi = new SpotifyWebApi({
  clientId: '3036ac0c826f4f5e8b4a8c1a1bc8278d',
  clientSecret: '7ce92e60920d43f1b6a48e162422fdeb',
  redirectUri: 'http://localhost:8888/callback '
});

var sheduledDaemon; //used for daemon

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function (length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('cover', {title: 'Express'});
});

router.get('/login', function (req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scopes,
      redirect_uri: redirect_uri,
      state: state
    }));
});

router.get('/callback', function (req, res) {

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

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
          refresh_token = body.refresh_token;
        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);

        //save access token & refresh token to session
        req.session.accessToken = access_token;
        req.session.refreshToken = refresh_token;
        req.session.userId = "custom_undefined";

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: {'Authorization': 'Bearer ' + access_token},
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function (error, response, body) {
          //console.log(body)
          req.app.locals.db.login(body.id);
          req.session.userId = body.id;

          req.app.locals.db.setRefreshToken(req.session.userId, req.session.refreshToken, function (err) {
            if (err) {
              console.log(err);
            } else {
              console.log("refresh token written to database!");
            }
          });

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
router.get('/dashboard', function (req, res, next) {
  console.log("Session: user Id ", req.session.userId);
  req.app.locals.db.getManagedPlaylists(req.session.userId, function (data) {
    console.log(JSON.stringify(data, null, 4));
  });
  spotifyApi.getUserPlaylists() //no argument to get the current user's playlists
    .then(function (data) {
      var response = (data.body.items);
      //console.log('Retrieved playlists', data.body);
      //TODO: Response müssti in Databank gspeicheret werde und vo dere denn grenderet werde
      //TODO: bestätigung das mer au würklich es voting wil erstele
      //TODO: Text vom button ändere das es bi Playliste wo scho existiered (funktion doesPlaylistExist() nur show staat)
      //TODO: Nur die playlists azeige, wo au em user ghöred! (z.B. seven cats inn sött nur de simon gse). Si werdet all abgruefe.
      res.render('dashboard', {data: response, userId: req.session.userId});
    }, function (err) {
      console.log('Something went wrong!', err);
    });
});


router.post('/test', function (req, res) {
  var requestPlaylistId = req.body.id;
  console.log(req.body);
  res.redirect('/playlist?id=' + requestPlaylistId);
});

router.get('/playlist', function (req, res, next) {
  var requestPlaylistId = req.query.id;
  //console.log('session userId: ', req.session.userId);
  spotifyApi.getPlaylist(req.session.userId, requestPlaylistId)
    .then(function (data) {

      //create Playlist if not already exists
      req.app.locals.db.doesPlaylistExist(requestPlaylistId, function (err, playlistExists) {
        if (!playlistExists) {
          req.app.locals.db.createPlaylist(spotifyApi, requestPlaylistId, data.body.name, req.session.userId);
          //set playlist public and collaborative
          spotifyApi.changePlaylistDetails(req.session.userId, data.body.id, {
            name: data.body.description,
            'public': true
          })
            .then(function (data) {
              console.log("playlist is now public");
            }, function (err) {
              console.log("something went wrong!");
              console.log(err);
            });
        } else {
          req.app.locals.db.getPlaylistTracks(requestPlaylistId, req.session.userId, "name", true, function (err, data) {
            console.log(err);
            console.log(JSON.stringify(data, null, 4));
          });
        }
      });

      var response = (data.body.tracks.items);
      //console.log('Retrieved playlists', response);
      //Für db: name->data.body.tracks.items.track.name artist->data.body.tracks.items.track.artists.name(artists isch es array vo alli aristse vo dem song beinhaltet)

      res.render('dashboardSongs', {data: response});
    }, function (err) {
      console.log('Something went wrong!', err);
    });
});


router.get('/daemon', function (req, res, next) {
  if (req.session.userId != "spotivoapplication") {
    res.redirect('/dashboard');
  }
  console.log("daemon");
  req.app.locals.db.checkDaemonState(function (err, daemonRunning) {
    if (!err) {
      console.log("daemon Running: " + daemonRunning);
      res.render('daemon', {daemonRunning: daemonRunning});
    }
  });
});

router.get('/daemonss', function (req, res, next) {
  if (req.session.userId != "spotivoapplication") {
    res.redirect('/dashboard');
  }
  req.app.locals.db.checkDaemonState(function (err, daemonRunning) {
    if (!err) {
      if (daemonRunning == 1) {
        req.app.locals.db.setDaemonRunning(0, function (err) {
          if (!err) {
            res.redirect('/daemon');
          }
        });
      } else {
        //set Flag on Database
        req.app.locals.db.setDaemonRunning(1, function (err) {
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
    var syncRunning = false;
    var playlistData;

    //check daemon state
    req.app.locals.db.checkDaemonState(function (err, daemonRunning) {
      if (daemonRunning == 0) {
        console.log("stop daemon");
        sheduledDaemon.cancel();
      } else {
        console.log("daemon running...");
        startSync();
      }
    });

    function startSync() {
      req.app.locals.db.getAllPlaylists(function (err, data) {
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
      console.log("playlistSyncStarter(" + i + "), length = " + playlistData.playlists.length);
      if (i < playlistData.playlists.length) {
        syncPlaylist(playlistData.playlists[i].playlist, function (err) {
          if (err) {
            console.log("Error: could not sync Playlist!");
            console.log(err);
            if (err.msg == 'Error: user is not authorized to read this playlist!') {
              //sheduledDaemon.cancel();
              playlistSyncStarter(i + 1);
            } else {
              playlistSyncStarter(i + 1);
            }
          } else {
            playlistSyncStarter(i + 1);
          }
        })
      }
    }

    //this function starts the sync-process on a single playlist with spotify.
    function syncPlaylist(playlist, callback) {

      //login as owner
      //refresh spotify access token
      spotifyApi.setRefreshToken(playlist.refreshToken);
      spotifyApi.refreshAccessToken()
        .then(function (data) {
          console.log('The access token has been refreshed!');
          // Save the access token so that it's used in future calls
          spotifyApi.setAccessToken(data.body['access_token']);

          //get Members of Playlist
          req.app.locals.db.getMembersOfPlaylist(playlist.dbId, function (err, members) {
            if (!err) {
              //get all Tracks from Playlist
              req.app.locals.db.getPlaylistTracks(playlist.spotifyId, req.session.userId, "added_at", true, function (err, data) {
                if (!err) {
                  var tracks = data.tracks;

                  /**
                   * compare main playlist
                   */
                  //get spotify playlist
                  spotifyApi.getPlaylist(playlist.owner, playlist.spotifyId, null, function (err, data) {
                    if (!err) {
                      //save Snapshot Id
                      playlist.snapshotId = data.body.snapshot_id;
                      //start Sync process on main playlist
                      syncMainPlaylist(playlist, members, tracks, data.body.tracks.items, function (err) {
                        if (!err) {
                          //continue
                        } else {
                          callback(err);
                        }
                      });
                    } else {
                      callback(err);
                    }
                  });
                } else {
                  callback(err);
                }
              });
            } else {
              callback(err);
            }
          });

        }, function (err) {
          console.log("Error: could not set access token to login as Owner");
          callback(err);
        });
    }

    //this function syncs the main playlist
    function syncMainPlaylist(playlist, members, tracks, spotifyTracks, callback) {

      var tracksToRemove = {
        tracks: [],
        snapshot_id: playlist.snapshotId
      };

      //check all spotify tracks to match them to the database
      //all Tracks matched successfully are deleted in tracks list from Database. The remaining were deleted
      for (var i in spotifyTracks) {
        //check if the track is present on the database
        var found = false;
        tracks.every(function (track, j) {
          if (track.track.spotifyId == spotifyTracks[i].track.id) {
            found = true
            track.track.found = true;
            return false;
          } else return true;
        });
        if (!found) {
          //track was newly added to the spotify playlist!
          //check if track was added by a member
          var isMember = false;
          members.every(function (member, j) {
            if (member.member == spotifyTracks[i].added_by.id) {
              isMember = true;
              return false;
            } else return true;
          });
          //add track to db if added by a member or if permissions on playlist is set accordingly
          if (isMember || playlist.permission == 0 || playlist.permission == 1) {
            console.log("add Track to database");
            req.app.locals.db.addTrackToPlaylist(playlist.dbId, spotifyTracks[i], function (err) {
              if (!err) {
                //create Vote if not added by a member and permissions is set to 1
                if (!isMember && playlist.permission == 1) {
                  console.log("create vote");
                  req.app.locals.db.createVote(playlist.spotifyId, spotifyTracks[i].track.id, {type: 1});
                }
              } else {
                console.log("ERROR: could not add Track to playlist");
                callback(err);
              }
            });
          } else {
            console.log("remove Track from Spotify");
            //if user was not member and permissions were set to 2, delete the track from playlist
            //Add track to Array, to delete all tracks together
            tracksToRemove.tracks.push({uri: "spotify:track:" + spotifyTracks[i].track.id});
          }
        }
      }

      //delete tracks on spotify playlist
      var options = {
        method: 'DELETE',
        url: 'https://api.spotify.com/v1/users/' + playlist.owner + '/playlists/' + playlist.spotifyId + '/tracks',
        headers: {
          'Authorization': "Bearer " + spotifyApi.getAccessToken(),
          'Content-Type': 'application/json'
        },
        json: tracksToRemove
      }
      request(options, function (err, res, body) {
        if (err) {
          console.log("Error: could not make Request to spotify api!");
          callback(err);
        } else {
          if (res.error) {
            console.log("Error: error returned from spotify api");
            callback(err);
          }
        }
      });

      //add tracks to spotify playlist if they exist on database
      var tracksToAdd = {uris: []};
      for (var i in tracks) {
        if (tracks[i].track.found == false) {
          tracksToAdd.uris.push("spotify:track:" + tracks[i].track.spotifyId);
        }
      }

      //delete tracks on spotify playlist
      var options = {
        method: 'POST',
        url: 'https://api.spotify.com/v1/users/' + playlist.owner + '/playlists/' + playlist.spotifyId + '/tracks',
        headers: {
          'Authorization': "Bearer " + spotifyApi.getAccessToken(),
          'Content-Type': 'application/json'
        },
        json: tracksToAdd
      }
      request(options, function (err, res, body) {
        if (err) {
          console.log("Error: could not make Request to spotify api!");
          callback(err);
        } else {
          if (res.error) {
            console.log("Error: error returned from spotify api");
            callback(err);
          }
        }
      });

      callback(null);
    }
  }

});


module.exports = router;

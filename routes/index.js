var express = require('express');
var router = express.Router();
var request = require('request'); // "Request" library
var querystring = require('querystring');
var schedule = require('node-schedule');
var moment = require('moment-timezone');

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
        } else {
          req.app.locals.db.vote("spotivoapplication", requestPlaylistId, "0qAPxT4KrKWhPeUNhJqtZS", true);
          req.app.locals.db.getPlaylistTracks(requestPlaylistId, req.session.userId, "name", true, function (err, data) {
            //console.log(err);
            //console.log(JSON.stringify(data, null, 4));
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


  //TODO: move this function to a better place
  function createSubPlaylist(playlistId, subPlaylistName, callback) {
    //check if user is the correct owner
    checkOwner()
    function checkOwner() {
      req.app.locals.db.isUserOwnerOfPlaylist(playlistId, req.session.userId, function(err, isOwner, dbPlaylistId) {
        if (!err) {
          if (isOwner) {
            spotifyApi.createPlaylist(req.session.userId, subPlaylistName, {'public': true}, function(err, data) {
              if (!err) {
                var playlist = {
                  spotifyId: data.body.id,
                  name: data.body.name
                }
                req.app.locals.db.createSubPlaylist(dbPlaylistId, data.body.name, data.body.id, function(err) {
                  callback(err);
                })
              } else {
                console.log("Error: could not create sub Playlist on Spotify");
                console.log(err);
                callback(err);
              }
            });
          } else {
            console.log("Error: User is not owner of the playlist! Could not create subPlaylist");
            callback({msg: "User is not the owner of the playlist!"});
          }
        }
      })
    }
  }
});


router.get('/daemon', function (req, res, next) {
  var pageSize = 20;
  var page = 1;
  if (req.query.p) {
    page = req.query.p;
  }

  if (req.session.userId != "spotivoapplication") {
    res.redirect('/dashboard');
  }
  req.app.locals.db.checkDaemonState(function (err, daemonRunning) {
    if (!err) {
      req.app.locals.db.getFullDaemonLog(pageSize, page, function(err, data) {
        if (!err) {
          res.render('daemon', {daemonRunning: daemonRunning, logData: data});
        } else {
          console.log(err);
        }
      })
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
        sheduledDaemon = schedule.scheduleJob('*/15 * * * * *', daemon);
      }
    }
  });

  function daemon() {
    //daemon Function
    var syncRunning = false;
    var playlistData;

    //check daemon state and run sync function if daemon still is running
    req.app.locals.db.checkDaemonState(function (err, daemonRunning) {
      if (daemonRunning == 0) {
        console.log("stop daemon");
        sheduledDaemon.cancel();
      } else {
        startSync();
      }
    });

    //starts the loop process to sync all different playlists
    function startSync() {
      req.app.locals.db.getAllPlaylists(function (err, data) {
        if (!err) {
          playlistData = data;
          req.app.locals.db.cleanUpDatabase();
          playlistSyncStarter(0);
        } else {
          console.log("Error: could not get all Playlists from Database! Abort Daemon");
          console.log(err);
          sheduledDaemon.cancel();
        }
      })
    }

    //for loop in function form! This function is run on every Playlist which is managed. After this, it will run itself on the next index
    function playlistSyncStarter(i) {
      if (i < playlistData.playlists.length) {
        console.log("Daemon: Sync main playlist " + (i+1) + " (of " + playlistData.playlists.length + ")");
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
      } else {
        console.log("Daemon: finished");
      }
    }

    //start the sync-process on a single playlist with spotify.
    function syncPlaylist(playlist, callback) {
      //login as owner
      //refresh spotify access token
      spotifyApi.setRefreshToken(playlist.refreshToken);
      spotifyApi.refreshAccessToken()
        .then(function (data) {
          // Save the access token so that it's used in future calls
          spotifyApi.setAccessToken(data.body['access_token']);

          //get Members of Playlist
          req.app.locals.db.getMembersOfPlaylist(playlist.dbId, function (err, members) {
            if (!err) {
              //get all Tracks from Playlist
              req.app.locals.db.getPlaylistTracks(playlist.spotifyId, req.session.userId, "added_at", true, function (err, data) {
                if (!err) {
                  var tracks = data.tracks;
                  executeVotes();

                  /*
                   * Execute Votes
                   */
                  function executeVotes() {
                    req.app.locals.db.getVotesOfPlaylist(playlist.dbId, function(err, votes) {
                      if (!err) {
                        executeVotesOnPlaylist(playlist, votes, tracks, function(err) {
                          if (!err) {
                            compareMainPlaylist();
                          } else {
                            console.log("Error: Could not execute Votes on Playlist!");
                            console.log(err);
                            //done
                            compareMainPlaylist();
                          }
                        })
                      } else {
                        console.log(err);
                        //problem, but continue
                        compareMainPlaylist();
                      }
                    })
                  }

                  /*
                   * compare main playlist
                   */
                  function compareMainPlaylist() {
                    //get spotify playlist
                    spotifyApi.getPlaylist(playlist.owner, playlist.spotifyId, null, function (err, data) {
                      if (!err) {
                        //save Snapshot Id
                        playlist.snapshotId = data.body.snapshot_id;
                        //start Sync process on main playlist
                        syncMainPlaylist(playlist, members, tracks, data.body.tracks.items, function (err) {
                          if (!err) {
                            //done
                            compareSubPlaylists()
                          } else {
                            callback(err);
                          }
                        });
                      } else {
                        callback(err);
                        req.app.locals.db.addDaemonLog({
                          dbId: playlist.dbId,
                          type: 3,
                          message: "Problem while syncing main Playlist " + playlist.name + ". Synchronization of sub playlists are skipped!"
                        });
                        //problem. don't continue to sub playlist
                      }
                    });
                  }

                  /*
                   * compare Sub Playlists (All of them)
                   */
                  function compareSubPlaylists() {
                    forEachSubPlaylist(0);
                    function forEachSubPlaylist(i) {
                      if (i < playlist.subPlaylists.length) {
                        console.log("Daemon: Sync sub  playlist " + (i+1) + " (of " + playlist.subPlaylists.length + ")");
                        var subPlaylist = playlist.subPlaylists[i].subPlaylist;
                        spotifyApi.getPlaylist(playlist.owner, subPlaylist.spotifyId, null)
                          .then(function (data) {
                            subPlaylist.snapshotId = data.body.snapshot_id;
                            subPlaylist.owner = playlist.owner;
                            subPlaylist.refreshToken = playlist.refreshToken;
                            syncSubPlaylist(playlist, subPlaylist, members, tracks, data.body.tracks.items, function (err) {
                              if (!err) {
                                forEachSubPlaylist(i + 1);
                              } else {
                                console.log("Error: could not sync subPlaylists!");
                                console.log(err);
                                forEachSubPlaylist(i + 1);
                              }
                            })
                          }, function (err) {
                            console.log("Error: could not get playlist data of sub-playlist " + subPlaylist.name + " from Spotify");
                            console.log(err);
                            req.app.locals.db.addDaemonLog({
                              dbId: playlist.dbId,
                              type: 3,
                              message: "Could not get playlist data of sub-playlist " + subPlaylist.name + " from Spotify! " + JSON.stringify(err)
                            });
                            forEachSubPlaylist(i + 1);
                          });
                      } else {
                        //done
                        callback(null);
                      }
                    }
                  }

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

    //sync the main playlist
    function syncMainPlaylist(playlist, members, tracks, spotifyTracks, callback) {
      deleteDuplicates(spotifyTracks, playlist, doSyncMain);

      function doSyncMain() {
        var tracksToRemove = {
          tracks: [],
          snapshot_id: playlist.snapshotId
        };

        //check all spotify tracks to match them to the database
        //all Tracks matched successfully are deleted in tracks list from Database. The remaining were deleted
        for (var i in spotifyTracks) {
          //if track was deleted due to it is a duplicate, skip
          if (spotifyTracks[i] === undefined) {
            continue;
          }

          checkMember(members, spotifyTracks[i], playlist, searchTrackMain);

          //search for Track on Database
          function searchTrackMain() {
            var found = false;
            tracks.every(function (track, j) {
              if (track.track.spotifyId == spotifyTracks[i].track.id) {
                found = true
                track.track.found = true;
                if (track.track.deleted) {
                  //track was removed on database but found on spotify playlist! delete it
                  console.log("Remove Track from Spotify Playlist which was marked as deleted on Database");

                  tracksToRemove.tracks.push({uri: "spotify:track:" + spotifyTracks[i].track.id});
                  //create log
                  var log = {
                    dbId: playlist.dbId,
                    type: 1,
                    message: "Track " + spotifyTracks[i].track.name + " was removed from the playlist"
                  }
                  req.app.locals.db.addDaemonLog(log);
                }
                return false;
              } else return true;
            });
            doStuffWithTrackMain(found);
          }

          //Do stuff to track on database or on spotify to sync it
          function doStuffWithTrackMain(found) {
            var isMember = false;
            members.every(function (member, j) {
              if (member.member == spotifyTracks[i].added_by.id) {
                isMember = true;
                return false;
              } else return true;
            });

            if (!found) {
              checkPermissionsAndPerformSync(spotifyTracks[i], playlist, isMember, tracksToRemove);
            }
          }
        }


        //add tracks to spotify playlist if they exist on database
        var tracksToAdd = {uris: []};
        for (var i in tracks) {
          if (!tracks[i].track.found && !tracks[i].track.deleted) {
            console.log("Add track to Spotify Playlist");
            tracksToAdd.uris.push("spotify:track:" + tracks[i].track.spotifyId);
            req.app.locals.db.updateTrackDataAdded(tracks[i].track.dbId, playlist.owner, moment().tz('Europe/Zurich').format('YYYY-MM-DD HH:mm:ss'), function(err) {
              if (err) {
                console.log("Error: could not update Track Data");
                console.log(err);
                req.app.locals.db.addDaemonLog({
                  dbId: playlist.dbId,
                  type: 3,
                  message: "Could not update Added-Information of Track " + tracks[i].track.name + " to database! (Check following messages if track was added successfully). " + err
                });
              }
            })
            req.app.locals.db.addDaemonLog({
              dbId: playlist.dbId,
              type: 1,
              message: "Track " + tracks[i].track.name + " was added back to spotify "
            });
          }
        }

        ChangeSpotifyPlaylist(tracksToRemove, tracksToAdd, playlist.owner, playlist.spotifyId, playlist.dbId, playlist.refreshToken);

      }

      callback(null);
    }

    //sync Sub Playlist
    function syncSubPlaylist(playlist, subPlaylist, members, tracks, spotifyTracks, callback) {
      deleteDuplicates(spotifyTracks, subPlaylist, doSyncSub);
      function doSyncSub() {
        //reset found-property on tracks
        for (var i in tracks) {tracks[i].track.found = false;}

        //prepare Variables for Spotify Requests
        var tracksToRemove = {
          tracks: [],
          snapshot_id: subPlaylist.snapshotId
        };
        var tracksToAdd = { uris: [] };

        for (var i in spotifyTracks) {
          //if track was deleted due to duplication, skip
          if (spotifyTracks[i] === undefined) { continue; }

          checkMember(members, spotifyTracks[i], playlist, searchTrackSub);

          function searchTrackSub() {
            var foundInSub = false;
            var foundInMain = false;
            tracks.every(function (track, j) {
              var subPlaylistDataId = -1;
              if (track.track.spotifyId == spotifyTracks[i].track.id) {
                foundInMain = true;
                //search all Sub Playlists
                for (var k in track.track.subPlaylists) {
                  if (track.track.subPlaylists[k].spotifyId = subPlaylist.spotifyId) {
                    foundInSub = true;
                    track.track.found = true;
                    subPlaylistDataId = k;
                    break;
                  }
                }

                //if track was marked as Deleted on main playlist
                if (track.track.deleted) {
                  console.log("Remove Track from Spotify sub playlist which was marked as deleted on Database");
                  tracksToRemove.tracks.push({uri: "spotify:track:" + spotifyTracks[i].track.id});
                  req.app.locals.db.addDaemonLog({
                    dbId: playlist.dbId,
                    type: 1,
                    message: "Track " + spotifyTracks[i].track.name + " was removed from the sub playlist " + track.track.subPlaylists[subPlaylistDataId].subPlaylist.name
                  });
                }

                //if track was marked as deleted on sub playlist
                if (foundInSub) {
                  if (track.track.subPlaylists[subPlaylistDataId].subPlaylist.deleted) {
                    console.log("Remove Track from Spotify sub playlist which was marked as deleted in sub playlist on database");
                    tracksToRemove.tracks.push({uri: "spotify:track:" + spotifyTracks[i].track.id});
                    req.app.locals.db.addDaemonLog({
                      dbId: playlist.dbId,
                      type: 1,
                      message: "Track " + spotifyTracks[i].track.name + " was removed from the sub playlist " + track.track.subPlaylists[subPlaylistDataId].subPlaylist.name
                    });
                  }
                }

                return false;
              } else return true;
            });
            doStuffWithTrackSub(foundInMain, foundInSub);
          }

          //do Stuff with track to sync it with spotify and database
          function doStuffWithTrackSub(foundInMain, foundInSub) {
            //check if user is member
            var isMember = false;
            members.every(function (member, j) {
              if (member.member == spotifyTracks[i].added_by.id) {
                isMember = true;
                return false;
              } else return true;
            });

            if (!foundInMain) {
              //run the same function when adding a track of main playlist was not found on main Playlist on database
              checkPermissionsAndPerformSync(spotifyTracks[i], playlist, isMember, tracksToRemove);
            }

            if (!foundInSub) {
              //add track to db if added by a member or if permissions on playlist is set accordingly
              if ((isMember || playlist.permission == 0) && subPlaylist.allowAdd) {
                console.log("add Track to database");
                req.app.locals.db.addTrackToSubPlaylist(subPlaylist.dbId, playlist.dbId, spotifyTracks[i].track.id, null, function (err) {
                  if (!err) {
                    req.app.locals.db.addDaemonLog({
                      dbId: playlist.dbId,
                      type: 1,
                      message: "Track " + spotifyTracks[i].track.name + " was Added to sub playlist " + subPlaylist.name + "."
                    });
                  } else {
                    req.app.locals.db.addDaemonLog({
                      dbId: playlist.dbId,
                      type: 3,
                      message: "Could not add track " + spotifyTracks[i].track.name + " to to sub playlist " + subPlaylist.name + ". " + JSON.stringify(err)
                    });
                  }
                });
              } else {
                console.log("remove Track from Spotify");
                //if user was not member and permissions were set to 2, delete the track from playlist
                //Add track to Array, to delete all tracks together
                tracksToRemove.tracks.push({uri: "spotify:track:" + spotifyTracks[i].track.id});
                var logMessage;
                //check if new vote needs to be created
                if (subPlaylist.allowAdd) {
                  //no vote needs to be created
                  logMessage = "Track " + spotifyTracks[i].track.name + " was added by a unauthorized User (" + spotifyTracks[i].added_by.id + ") and was removed from the playlist";
                } else {
                  //create new vote
                  logMessage = "Track " + spotifyTracks[i].track.name + " was removed from sub playlist " + subPlaylist.name + " and a vote was created.";
                  var vote = {
                    type: 2,
                    subPlaylist: subPlaylist.spotifyId
                  }
                  req.app.locals.db.createVote(req.session.userId, playlist.spotifyId, spotifyTracks[i].track.id, vote);
                }
                req.app.locals.db.addDaemonLog({
                  dbId: playlist.dbId,
                  type: 1,
                  message: logMessage
                });
              }
            }
          }
        }


        //search all Tracks on Database which were not present on Spotify
        for (var j in tracks) {
          if (!tracks[j].track.found && !tracks[i].track.deleted) {
            //check, if track is in the sub playlist
            for (var k in tracks[j].track.subPlaylists) {
              if (tracks[j].track.subPlaylists[k].subPlaylist.spotifyId == subPlaylist.spotifyId && !tracks[j].track.subPlaylists[k].subPlaylist.deleted) {
                console.log("add Track to sub Playlist");
                tracksToAdd.uris.push("spotify:track:" + tracks[j].track.spotifyId);
                req.app.locals.db.addDaemonLog({
                  dbId: playlist.dbId,
                  type: 1,
                  message: "Track " + tracks[j].track.name + " was Added to sub Playlist: " + subPlaylist.name
                });
                break;
              }
            }
          }
        }

        ChangeSpotifyPlaylist(tracksToRemove, tracksToAdd, playlist.owner, subPlaylist.spotifyId, playlist.dbId, playlist.refreshToken);

        callback(null);
      }
    }

    //delete douplicates of playlist (or sub playlist)
    function deleteDuplicates(spotifyTracks, playlist, callback) {
      var tracksToRemove = {
        tracks: []
      };
      for (var i = 0; i < spotifyTracks.length-1; i++) {
        for (var j = i+1; j < spotifyTracks.length; j++) {
          if (spotifyTracks[i] === undefined || spotifyTracks[j] === undefined) { continue; }
          if (spotifyTracks[i].track.id == spotifyTracks[j].track.id) {
            tracksToRemove.tracks.push({uri: spotifyTracks[i].track.uri, positions: [j]});
            delete spotifyTracks[j];

            //create log
            var log = {
              dbId: playlist.dbId,
              type: 2,
              message: "Duplicate track " + spotifyTracks[i].track.name + " was removed from the playlist."
            }
            req.app.locals.db.addDaemonLog(log);
            break
          }
        }
      }

      if (tracksToRemove.tracks.length != 0) {

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
            console.log(err);

            //create log
            var log = {
              dbId: playlist.dbId,
              type: 3,
              message: "Could not add tracks to Spotify playlist. Connection Error! " + JSON.stringify(err)
            }
            req.app.locals.db.addDaemonLog(log);
          } else {
            if (body.error) {
              console.log("Error: error returned from spotify api");
              console.log(body);

              //create log
              var log = {
                dbId: playlist.dbId,
                type: 3,
                message: "Could not add tracks to Spotify playlist. Wrong request! " + JSON.stringify(body)
              }
              req.app.locals.db.addDaemonLog(log);
            }
          }
          callback();
        });
      } else {
        callback();
      }
    }

    //check if track was added by a member. Else, add new Entry to members if policies were set
    function checkMember(members, spotifyTrack, playlist, callback) {
      var found = false;
      for (var j in members) {
        if (spotifyTrack.added_by.id == members[j].member) {
          found = true;
          break;
        }
      }
      if (!found) {
        /*
         add Member if:
         permission is not set to 2 (delete all new Tracks not from Members) AND
         memberPolicy is set to 0 OR
         memberPolicy is set to 1 and track was added one week ago
         */
        if (playlist.permission != 2 && (playlist.memberPolicy == 0 || (playlist.memberPolicy == 1 && moment(spotifyTracks[i].added_at).tz('Europe/Zurich').add(playlist.voteTime, 's').isBefore(moment())))) {
          req.app.locals.db.addMemberFromDaemon(playlist.dbId, spotifyTracks[i].added_by.id, function(err) {
            if (!err) {
              console.log("New member was added to playlist");

              //create log
              var log = {
                dbId: playlist.dbId,
                type: 1,
                message: "Member " + spotifyTracks[i].added_by.id + " was added to the Playlist. "
              }
              req.app.locals.db.addDaemonLog(log);
            } else {
              console.log("Error: could not add new Member to playlist");

              //create log
              var log = {
                dbId: playlist.dbId,
                type: 3,
                message: "Could not add new Member to Database. " + JSON.stringify(err)
              }
              req.app.locals.db.addDaemonLog(log);
            }
            callback();
          });
        }
      } else {
        callback();
      }
    }

    //checks Permissions of Playlist and performs the sync action on the Spotify Playlist or the database
    function checkPermissionsAndPerformSync(spotifyTrack, playlist, isMember, tracksToRemove) {
      //add track to db if added by a member or if permissions on playlist is set accordingly
      if (isMember || playlist.permission == 0 || playlist.permission == 1) {
        console.log("add Track to database");
        req.app.locals.db.addTrackToPlaylist(playlist.dbId, spotifyTrack, function (err) {
          if (!err) {
            //create Vote if not added by a member and permissions is set to 1
            var log;
            if (!isMember && playlist.permission == 1) {
              //create vote
              req.app.locals.db.createVote(req.session.userId, playlist.spotifyId, spotifyTrack.track.id, {type: 1});
              log = {
                dbId: playlist.dbId,
                type: 1,
                message: "Track " + spotifyTrack.track.name + " was added to the Playlist (and a new Vote was created)."
              }
            } else {
              log = {
                dbId: playlist.dbId,
                type: 1,
                message: "Track " + spotifyTrack.track.name + " was added to the Playlist"
              }
            }
            //write log to database
            req.app.locals.db.addDaemonLog(log);
          } else {
            req.app.locals.db.addDaemonLog({
              dbId: playlist.dbId,
              type: 3,
              message: "Could not add track " + spotifyTrack.track.name + " to Database. " + JSON.stringify(err)
            });
          }
        });
      } else {
        console.log("remove Track from Spotify");
        //if user was not member and permissions were set to 2, delete the track from playlist
        //Add track to Array, to delete all tracks together
        tracksToRemove.tracks.push({uri: "spotify:track:" + spotifyTrack.track.id});
        req.app.locals.db.addDaemonLog({
          dbId: playlist.dbId,
          type: 2,
          message: "Track " + spotifyTrack.track.name + " was added by a unauthorized User (" + spotifyTrack.added_by.id + ") and was removed from the playlist"
        });
      }
    }

    //Execute requests to remove old tracks and add new tracks to Spotify
    function ChangeSpotifyPlaylist(tracksToRemove, tracksToAdd, owner, playlistId, dbPlaylistId, refreshToken) {

      if (tracksToRemove.tracks.length == 0 && tracksToAdd.uris.length == 0) {
        return;
      }
        //Query to delete tracks on spotify playlist
        var requestOptions;
        if (tracksToRemove.tracks.length != 0) {
          requestOptions = {
            method: 'DELETE',
            url: 'https://api.spotify.com/v1/users/' + owner + '/playlists/' + playlistId + '/tracks',
            headers: {
              'Authorization': "Bearer " + spotifyApi.getAccessToken(),
              'Content-Type': 'application/json'
            },
            json: tracksToRemove
          }
          request(requestOptions, function (err, res, body) {
            if (err) {
              console.log("Error: could not make Request to spotify api!");
              console.log(err);

              //create log
              var log = {
                dbId: dbPlaylistId,
                type: 3,
                message: "Could not remove tracks from Spotify playlist. Connection Error! " + JSON.stringify(err)
              }
              req.app.locals.db.addDaemonLog(log);
            } else {
              if (body.error) {
                console.log("Error: error returned from spotify api");
                console.log(body);

                //create log
                var log = {
                  dbId: playlistId,
                  type: 3,
                  message: "Could not remove tracks from Spotify playlist. Wrong request! " + JSON.stringify(body)
                }
                req.app.locals.db.addDaemonLog(log);
              }
            }
          });
        }

        //Query to add tracks to spotify playlist
        if (tracksToAdd.uris.length != 0) {
          requestOptions = {
            method: 'POST',
            url: 'https://api.spotify.com/v1/users/' + owner + '/playlists/' + playlistId + '/tracks',
            headers: {
              'Authorization': "Bearer " + spotifyApi.getAccessToken(),
              'Content-Type': 'application/json'
            },
            json: tracksToAdd
          }
          request(requestOptions, function (err, res, body) {
            if (err) {
              console.log("Error: could not make Request to spotify api!");
              console.log(err);

              //create log
              var log = {
                dbId: dbPlaylistId,
                type: 3,
                message: "Could not add tracks to Spotify playlist. Connection Error! " + JSON.stringify(err)
              }
              req.app.locals.db.addDaemonLog(log);
            } else {
              if (body.error) {
                console.log("Error: error returned from spotify api");
                console.log(body);

                //create log
                var log = {
                  dbId: dbPlaylistId,
                  type: 3,
                  message: "Could not add tracks to Spotify playlist. Wrong request! " + JSON.stringify(body)
                }
                req.app.locals.db.addDaemonLog(log);
              }
            }
          });
        }

    }

    //Execute Votes on single Playlist
    function executeVotesOnPlaylist(playlist, votes, tracks, callback) {
      //check every single vote:
      for (var i in votes) {
        if (votes[i].finished) {
          //this vote needs to be executed
          //compair votes
          if (votes[i].voteYes > votes[i].voteNo) {
            //the majority was for voting yes! Executing what has to be done in the vote
            //All changes just affect the Database. Changes will be added later by the daemon to spotify
            //search specific track on Tracklist
            var trackIndex = -1;
            for (var j in tracks) {
              if (tracks[j].track.dbId == votes[i].dbTrackId) {
                trackIndex = j;
                break;
              }
            }
            //if track was not found, delete the vote and continue with next vote
            if (trackIndex == -1) { //delete
              console.log("Error: track on which the vote points, does not exist! Delete Vote");
              req.app.locals.db.addDaemonLog({
                dbId: playlist.dbId,
                type: 3,
                message: "Track on which the vote points does not exist! delete Vote!"
              });

              //delete Vote
              req.app.locals.db.deleteVote(votes[i].dbVoteId, function(err) {
                if (err) {
                  console.log(err);
                  req.app.locals.db.addDaemonLog({
                    dbId: playlist.dbId,
                    type: 3,
                    message: "Vote could not be deleted! " + JSON.stringify(err)
                  });
                }
              });
              continue;
            }

            //execute the vote depending on the type
            switch (votes[i].type) {
              case 1:
                //check, if track is already deleted
                if (tracks[trackIndex].track.deleted) {
                  //mark track as not deleted
                  req.app.locals.db.markTrackAsNotDeleted(votes[i].dbTrackId, function(err) {
                    if (err) {
                      console.log(err);
                      req.app.locals.db.addDaemonLog({
                        dbId: playlist.dbId,
                        type: 1,
                        message: "Vote to recover Track " + tracks[trackIndex].track.name + " was accepted but could not be executed! " + JSON.stringify(err)
                      });
                    } else {
                      req.app.locals.db.addDaemonLog({
                        dbId: playlist.dbId,
                        type: 1,
                        message: "Vote to recover track " + tracks[trackIndex].track.name + " was accepted!"
                      });
                    }
                  });
                } else {
                  //mark track as deleted
                  req.app.locals.db.markTrackAsDeleted(votes[i].dbTrackId, function(err) {
                    if (err) {
                      console.log(err);
                      req.app.locals.db.addDaemonLog({
                        dbId: playlist.dbId,
                        type: 3,
                        message: "Vote to delete track " + tracks[trackIndex].track.name + " was accepted but could not be executed! " + JSON.stringify(err)
                      });
                    } else {
                      req.app.locals.db.addDaemonLog({
                        dbId: playlist.dbId,
                        type: 1,
                        message: "Vote to delete track " + tracks[trackIndex].track.name + " was accepted!"
                      });
                    }
                  });
                }
                break;
              case 2:
                //check if track is already in playlist
                var subPlaylistDataId = -1;
                for (var j in tracks[trackIndex].track.subPlaylists) {
                  if (tracks[trackIndex].track.subPlaylists[j].subPlaylist.dbId == votes[i].subPlaylist1) {
                    subPlaylistDataId = j;
                    break;
                  }
                }
                if (subPlaylistDataId == -1) {
                  //track is not in sub playlist. Add it
                  console.log("Add Track to sub PLaylist: dbSubPlaylistId: " + votes[i].subPlaylist1 + ", dbPlaylistId: " + playlist.dbId + ", dbTrackId: " + votes[i].dbTrackId);
                  req.app.locals.db.addTrackToSubPlaylist(votes[i].subPlaylist1, playlist.dbId, null, votes[i].dbTrackId, function(err) {
                    if (!err) {
                      //everything ok
                      //TODO: add name of sub playlist. The name is stored on database
                      req.app.locals.db.addDaemonLog({
                        dbId: playlist.dbId,
                        type: 1,
                        message: "Vote to add Track " + tracks[trackIndex].track.name + " to sub playlist was accepted!"
                      });
                    } else {
                      req.app.locals.db.addDaemonLog({
                        dbId: playlist.dbId,
                        type: 3,
                        message: "Vote to add Track " + tracks[trackIndex].track.name + " to sub playlist " +
                        tracks[trackIndex].track.subPlaylists[subPlaylistDataId].subPlaylist.name + " was accepted but " +
                        "could not be executed"
                      });
                    }
                  })
                } else {
                  //tack is in sub Playlist. Mark it as deleted
                  req.app.locals.db.removeTrackFromSubPlaylist(votes[i].dbTrackId, votes[i].subPlaylist1, function(err) {
                    if (!err) {
                      //everything ok
                      req.app.locals.db.addDaemonLog({
                        dbId: playlist.dbId,
                        type: 1,
                        message: "Vote to remove Track " + tracks[trackIndex].track.name + " from sub playlist " +
                        tracks[trackIndex].track.subPlaylists[subPlaylistDataId].subPlaylist.name + " was accepted!"
                      });
                    } else {
                      req.app.locals.db.addDaemonLog({
                        dbId: playlist.dbId,
                        type: 3,
                        message: "Vote to remove Track " + tracks[trackIndex].track.name + " from sub playlist " +
                        tracks[trackIndex].track.subPlaylists[subPlaylistDataId].subPlaylist.name + " was accepted but " +
                        "could not be executed"
                      });
                    }
                  })
                }
                break;
              case 3:
                //TODO: implement move-vote
                break;
            }

            //delete Vote
            req.app.locals.db.markVoteAsExecuted(votes[i].dbVoteId, function(err) {
              if (err) {
                console.log(err);
                req.app.locals.db.addDaemonLog({
                  dbId: playlist.dbId,
                  type: 3,
                  message: "Vote could not be deleted! " + JSON.stringify(err)
                });
              }
            });
          }
        }
      }
      callback(null);
    }
  }

});


module.exports = router;

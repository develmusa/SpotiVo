var mysql = require("mysql");
var moment = require("moment-timezone");

var dbUsername = "application";
var dbPassword = "y7F!z6C7U#EKWsI8";
var dbName = "application";

var tabUsersName = "user";
var tabPlaylistName = "playlist";
var tabPlaylistMemberName = "playlist_members";
var tabTrackName = "track";
var tabVoteName = "vote";
var tabSubPlaylistName = "sub_playlist";
var tabSubPlaylistTrackName = "sub_playlist_track";
var tabDaemonName = "daemon";
var tabDaemonLogName = "daemon_log";
var tabMemberVoteName = "member_vote";

var connection = mysql.createConnection({
  host: "localhost",
  user: dbUsername,
  password: dbPassword
})

/**
 * connect to database
 */
connection.connect(function (err) {
  if (err) {
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection established');
  connection.query("USE " + dbName + ";", function (err, result) {

  })
});

//TODO: should not be public!! should be private
exports.connection = connection;

/**
 ******************
 * User Functions
 ******************
 */

/**
 * login user: create db entry if user does not already exist
 *
 * @param userId: spotifyId (or Username) of user
 */
exports.login = function login(userId) {
  console.log("Login on Database with user: " + userId);
  var post = {spotify_id: userId};
  connection.query("SELECT * FROM " + tabUsersName + " WHERE ?", post, function (err, result, fields) {
    if (result.length == 0) {
      console.log("create new");
      connection.query('INSERT INTO ' + tabUsersName + ' SET ?', post, function (err, result) {
      });
    } else {
      console.log("user found");
    }
  });
}

/**
 * Set a refresh token for Daemon to login as the owner
 *
 * @param userId: Spotify Username
 * @param refreshToken: Refresh-token recieved from login
 * @param callback: function(err)
 */
exports.setRefreshToken = function setRefreshToken(userId, refreshToken, callback) {
  connection.query("UPDATE " + tabUsersName + " SET refresh_token = ? WHERE spotify_id = ?", [refreshToken, userId], function(err, result) {
    if (!err) {
      callback(null);
    } else {
      console.log("Error: could not set access token on database!");
      callback(err);
    }
  });
}

/**
 * get user Id used on database
 *
 * @param userId: Spotify ID (or Username) of user
 * @param callback(err, dbUserId)
 */
function getUserIdOnDatabase(userId, callback) {
  connection.query("SELECT * FROM " + tabUsersName + " WHERE ?", {spotify_id: userId}, function (err, result, fields) {
    if (err) {
      callback(err, null);
    }
    if (result.length == 1) {
      for (var i in result) {
        callback(null, result[i].id);
      }
    } else {
      callback({msg: "Error: there are multiple Users on Database!"}, null);
    }
  });
}

/**
 * Get a list of all managed Playlists where the user is member of
 *
 * @param userId: Spotify-id (username) of current user
 * @param callback: function(err, data)
 *          data: {
 *              playlists [
 *                  playlist: {
 *                      spotifyId, name, owner, dbId, numTracks
 *                      subPlaylists[
 *                          subPlaylist: {name, numTracks, spotifyId, dbId},
 *                          subPlaylist: {..}
 *                      ]
 *                  },
 *                  playlist: {...}
 *              ]
 *          }
 */
exports.getManagedPlaylists = function getManagedPlaylists(userId, callback) {

  var query = "SELECT `playlist`.name AS playlist_name, `playlist`.id AS playlist_id, `playlist`.`spotify_id` AS playlist_spotify_id, " +
    "`sub_playlist`.name AS sub_playlist_name, `sub_playlist`.`spotify_id` AS sub_playlist_spotify_id, `sub_playlist`.`id` AS sub_playlist_id, " +
    "( SELECT COUNT(id) FROM track WHERE track.fs_playlist = `playlist`.`id`) AS track_count, " +
    "( SELECT COUNT(id) FROM `sub_playlist_track` WHERE `sub_playlist_track`.`fs_sub_playlist` = `sub_playlist`.`id` ) AS sub_playlist_track_count " +
    " FROM `sub_playlist` " +
    "INNER JOIN `playlist` ON `sub_playlist`.fs_playlist = `playlist`.id " +
    "RIGHT JOIN `playlist_members` ON `playlist`.id = `playlist_members`.fs_playlist " +
    "INNER JOIN `user` ON `playlist_members`.fs_user = `user`.id " +
    "WHERE `user`.spotify_id = ?";
  connection.query(query, userId, function (err, data) {
    if (!err) {
      prepareOutput(data);
    } else {
      console.log("Error: could not get List of Playlists (getManagedPlaylists())");
      console.log(err);
    }
  });

  function prepareOutput(data) {
    //iterate all entries
    var counter = -1;
    var output = {playlists: []};
    for (var i in data) {
      if (counter == -1 || output.playlists[counter].playlist.spotifyId != data[i].playlist_spotify_id) {

        //create new Entry for Playlist
        output.playlists.push({
          playlist: {
            spotifyId: data[i].playlist_spotify_id,
            name: data[i].playlist_name,
            dbId: data[i].playlist_id,
            numTracks: data[i].track_count,
            subPlaylists: []
          }
        });
        output.playlists[++counter].playlist.subPlaylists.push({
          subPlaylist: {
            name: data[i].sub_playlist_name,
            numTracks: data[i].sub_playlist_track_count,
            spotify_id: data[i].sub_playlist_spotify_id,
            dbId: data[i].sub_playlist_id
          }
        });
      } else {
        output.playlists[counter].playlist.subPlaylists.push({
          subPlaylist: {
            name: data[i].sub_playlist_name,
            numTracks: data[i].sub_playlist_track_count,
            spotify_id: data[i].sub_playlist_spotify_id,
            dbId: data[i].sub_playlist_id
          }
        })
      }
    }
    callback(output);
  }
}


/**
 ************************
 * Playlist Management:
 ************************
 */

/**
 * check if playlist already exists
 *
 * @param playlistId: spotify id for playlist
 * @param callback(err, playlistExists [boolean])
 */
exports.doesPlaylistExist = function doesPlaylistExist(playlistId, callback) {
  console.log("check if playlist is already managed")
  var post = {spotify_id: playlistId};
  connection.query("SELECT * FROM " + tabPlaylistName + " WHERE ?", post, function (err, result, fields) {
    if (err) {
      callback(err, null);
    } else if (result.length == 0) {
      callback(null, false);
    } else {
      callback(null, true);
    }
  });
}

/**
 * create new Playlist and add all Tracks to it!
 *  If a track is a duplicate of another, this track will be deleted on spotify!
 *  (to ensure that we can refer to the right track! else it would mess around with our database)
 *
 * @param spotifyApi: used to get Tracks from Spotify server)
 * @param playlistId: spotifyId of playlist
 * @param userId: spotifyId (or Username) of User
 */
exports.createPlaylist = function createPlaylist(spotifyApi, playlistId, playlistName, userId) {
  console.log("create Playlist ", playlistId);
  console.log("with user ", userId);
  spotifyApi.getPlaylistTracks(userId, playlistId)
    .then(function (data) {
      getUserIdOnDatabase(userId, function (err, dbUserId) {
        if (!err) {
          var response = data.body.items;
          console.log("start");

          //create Playlist on database
          var post = {
            spotify_id: playlistId,
            name: playlistName,
            fs_owner: dbUserId
          };
          connection.query("INSERT INTO " + tabPlaylistName + " SET ?", post, function (err, result) {
            var dbPlaylistId = result.insertId;
            if (dbPlaylistId != -1 && dbUserId != -1 && !err) {
              //everything ok!

              //create Member
              var post = {
                fs_user: dbUserId,
                fs_playlist: dbPlaylistId
              }
              connection.query("INSERT INTO " + tabPlaylistMemberName + " SET ?", post, function (err, result) {
                if (err) {
                  console.log("Error: could not isert member to db (createPlaylist())");
                  console.log(err);
                }
              })

              //create all Tracks
              for (var i in response) {
                console.log("working on: " + i);
                //console.log(response[i].track);
                //get artist name
                var artist = "";
                for (var j in response[i].track.artists) {
                  artist += response[i].track.artists[j].name + ", ";
                }
                artist = artist.slice(0, -2);

                var trackData = {
                  fs_playlist: dbPlaylistId,
                  spotify_id: response[i].track.id,
                  name: response[i].track.name,
                  artist: artist,
                  album: response[i].track.album.name,
                  added_at: moment(response[i].added_at).tz('Europe/Zurich').format('YYYY-MM-DD HH:mm:ss'),
                  added_by: response[i].added_by.id,
                  deleted: 0
                }
                console.log(trackData);
                connection.query("INSERT IGNORE INTO " + tabTrackName + " SET ?", trackData, function (err, result) {
                  //neat!
                  if (err) {
                    console.log("ERROR: could not create Track on database (createPlaylist()");
                    console.log(err);
                  }
                });
              }
            } else {
              console.log("ERROR: playlist could not be created (createPlaylist())");
              if (!err) {
                console.log(err);
              }
            }
          });
        } else {
          console.log("ERROR: user does not exist on db! (createPlaylist())")
        }
      });
    }, function (err) {
      console.log('ERROR: playlist does not exist on spotify server! (createPlaylist())', err);
    });
}


/**
 * Create a new Sub Playlist on Database
 * @param dbPlaylistId: Database ID of main Playlist
 * @param name: name of Sub Playlist
 * @param spotifyId: spotify id of sub playlist
 * @param callback: function(err)
 */
exports.createSubPlaylist = function createSubPlaylist(dbPlaylistId, name, spotifyId, callback) {
  var data = {
    name: name,
    spotify_id: spotifyId,
    fs_playlist: dbPlaylistId
  };
  connection.query("INSERT INTO " + tabSubPlaylistName + " SET ?", data, function(err) {
    if (!err) {
      callback(null)
    } else {
      console.log("Error: could not create Sub Playlist on Database!");
      console.log(err);
      callback(err);
    }
  })
}


/**
 * get Playlist Id used on database
 *
 * @param playlistId: spotifyId of playlist
 * @param callback(err, dbPlaylistId)
 */
function getPlaylistIdOnDatabase(playlistId, callback) {
  connection.query("SELECT * FROM " + tabPlaylistName + " WHERE ?", {spotify_id: playlistId}, function (err, result, fields) {
    if (err) {
      callback(err, null)
    } else if (result.length == 1) {
      for (var i in result) {
        callback(null, result[i].id);
      }
    } else {
      return callback({msg: "Error: there are multiple playlists existing on database!"}, null)
    }
  });
}


/**
 * get Sub Playlist Id used on database
 *
 * @param subPlaylistId: spotifyId of playlist
 * @param callback(err, dbSubPlaylistId)
 */
function getSubPlaylistIdOnDatabase(subPlaylistId, callback) {
  connection.query("SELECT * FROM " + tabSubPlaylistName + " WHERE ?", {spotify_id: subPlaylistId}, function (err, result, fields) {
    if (err) {
      callback(err, null)
    } else if (result.length == 1) {
      callback(null, result[0].id);
    } else {
      return callback({msg: "Error: there are multiple sub playlists existing on database!"}, null)
    }
  });
}


/**
 * is User a member of Playlist
 *
 * @param dbPlaylistId: Database ID of playlist
 * @param userId: spotify_id (or username) of user
 * @param callback: function(error, userIsMember [boolean])
 */
function isUserMemberOfPlaylist(dbPlaylistId, userId, callback) {
  getUserIdOnDatabase(userId, function (err, dbUserId) {
    if (!err) {
      var post = [dbPlaylistId, dbUserId];
      connection.query("SELECT * FROM " + tabPlaylistMemberName + " WHERE fs_playlist = ? AND fs_user = ?", post, function (err2, data) {
        if (!err2) {
          if (data.length == 1) {
            callback(null, true);
          } else if (data.length == 0) {
            callback(null, false);
          } else {
            callback({msg: "FATAL ERROR: multiple playlist-member entries of the same user and playlist do exist"}, null);
          }
        } else {
          callback(err2, null);
        }
      });
    } else {
      callback(err, null);
    }
  });
}


/**
 * Checks if user is Owner of a playlist
 * @param playlistId: spotify-id of playlist
 * @param userId: spotify username of user
 * @param callback: function(err, isOwner[boolean], dbPlaylistId)
 */
exports.isUserOwnerOfPlaylist = function isUserOwnerOfPlaylist(playlistId, userId, callback) {
  connection.query("SELECT p.id FROM " + tabPlaylistName + " AS p INNER JOIN user AS u ON p.fs_owner = u.id WHERE p.spotify_id = ? AND u.spotify_id = ?", [playlistId, userId], function(err, data) {
    if (!err) {
      var isOwner = false;
      if (data.length == 1) {
        isOwner = true;
      }
      callback(null, isOwner, data[0].id);
    } else {
      console.log("Error: could not check if User is Owner of Playlist!");
      console.log(err);
      callback(err);
    }
  })
}


/**
 * Adds a member to a playlist
 *
 * @param playlistId: Spotify Id of playlist
 * @param userId: Spotify Username of
 * @param callback: function(err)
 */
exports.addMemberToPlaylist = function addMemberToPlaylist(playlistId, userId, callback) {
  getPlaylistIdOnDatabase(playlistId, function(err, dbPlaylistId) {
    if (!err) {
      getUserIdOnDatabase(userId, function (err, dbUserId) {
        if (!err) {
          isUserMemberOfPlaylist(dbPlaylistId, userId, function (err, userIsMember) {
            if (!err && !userIsMember) {
              connection.query("INSERT INTO " + tabPlaylistMemberName + " SET ?", {
                fs_user: dbUserId,
                fs_playlist: dbPlaylistId
              }, function (err) {
                if (!err) {
                  callback(null);
                } else {
                  console.log("Error: could not add Member to Playlist on Database");
                  callback(err);
                }
              })
            } else if (err) {
              console.log("Error: could not check if User is Member of Playlist");
              callback(err);
            }
          });
        } else {
          console.log("Error: could not get Database Id of user!");
          callback(err);
        }
      });
    } else {
      console.log("Error: could not get Database Id of Playlist!");
      callback(err);
    }
  });
}


/*
 * Reference to function in User Management:
 * getManagedPlaylists(userId, callback)
 */


/**
 ********************
 * Track Management
 ********************
 */

/**
 * get Track Id used on database
 *
 * @param dbPlaylistId: playlist Id on Database!!
 * @param trackId: spotifyId of Track
 * @param callback(err, dbTrackId) dbTrackId returns -1 if track does not exist
 */
function getTrackIdOnDatabase(dbPlaylistId, trackId, callback) {
  connection.query("SELECT * FROM " + tabTrackName + " WHERE spotify_id = ? AND fs_playlist = ?", [trackId, dbPlaylistId], function (err, result, fields) {
    if (err) {
      callback(err, null)
    } else if (result.length == 1) {
      for (var i in result) {
        callback(null, result[i].id);
      }
    } else if (result.length == 0) {
      callback(null, -1);
    } else {
      return callback({msg: "Error: multiple entries of the same track and playlist exist!"}, null)
    }
  });
}


/**
 * GetPlaylistTracks *
 *
 * @param playlistId: Spotify Id of playlist
 * @param userId
 * @param sortAfter
 * @param ascending
 * @param callback: function(err, data)
 *           data:
 *              playlistId,
 *              dbPlaylistId,
 *              tracks [
 *                  track: {id, name, artist, album, addedAt, addedBy, spotifyId, dbId,
 *                          subPlaylists [subPlaylist: {name, spotifyId, dbId},
 *                                        subPlaylist: {...}
 *                          ]
 *                  },
 *                  track: {...}
 *              ],
 *              subPlaylists[
 *                  subPlaylist{name, spotifyId, dbId},
 *                  subPlaylist{...}
 *              ]
 *
 */

exports.getPlaylistTracks = function getPlaylistTracks(playlistId, userId, sortAfter, ascending, callback) {
  //get playlist id from Database
  getPlaylistIdOnDatabase(playlistId, function (err, dbPlaylistId) {
    if (!err) {
      isUserMemberOfPlaylist(dbPlaylistId, userId, function (err2, userIsMember) {
        if (!err2) {
          if (userIsMember || userId === 'spotivoapplication') {
            var dbData = {
              playlistId: playlistId,
              dbPlaylistId: dbPlaylistId,
              tracks: [],
              subPlaylists: []
            };
            var getTracksDone = false;
            var getSubPlaylistsDone = false;

            //get Track
            var direction = "";
            if (ascending) {
              direction = "ASC";
            } else {
              direction = "DESC";
            }
            var post = [dbPlaylistId];
            var sqlQuery = "SELECT t.id, t.spotify_id, t.name, t.artist, t.album, t.added_at, t.added_by, t.deleted, " +
              "t.deleted_at, sp.id AS sub_playlist_id, sp.name AS sub_playlist_name, " +
              "sp.spotify_id AS sub_playlist_spotify_id, spt.deleted AS sub_deleted, spt.deleted_at AS sub_deleted_at " +
              "FROM " + tabTrackName + " AS t " +
              "LEFT OUTER JOIN " + tabSubPlaylistTrackName + " AS spt ON t.id = spt.fs_track " +
              "LEFT OUTER JOIN " + tabSubPlaylistName + " AS sp ON spt.fs_sub_playlist = sp.id " +
              "WHERE t.fs_playlist = ? " +
              "ORDER BY t." + sortAfter + " " + direction;
            connection.query(sqlQuery, post, function (err3, data) {
              if (!err3) {
                var index = -1;
                var lastId = "";
                for (var i in data) {
                  if (lastId != data[i].spotify_id) {
                    //new Entry
                    index++;
                    lastId = data[i].spotify_id;
                    var deleted = false;
                    var deletedAt;
                    if (data[i].deleted == 1) {
                      deleted = true;
                      deletedAt = moment(data[i].deleted_at).tz('Europe/Zurich').format('YYYY-MM-DD HH:mm:ss');
                    }
                    dbData.tracks.push({
                      track: {
                        name: data[i].name,
                        artist: data[i].artist,
                        album: data[i].album,
                        addedAt: data[i].added_at,
                        addedBy: data[i].added_by,
                        spotifyId: data[i].spotify_id,
                        dbId: data[i].id,
                        deleted: deleted,
                        deletedAt: deletedAt,
                        subPlaylists: [],
                        found: false
                      }
                    });
                    if (data[i].sub_playlist_id != null) {
                      deleted = false;
                      deletedAt = null;
                      if (data[i].sub_deleted == 1) {
                        deleted = true;
                        deletedAt = moment(data[i].sub_deleted_at).tz('Europe/Zurich').format('YYYY-MM-DD HH:mm:ss');
                      }
                      dbData.tracks[index].track.subPlaylists.push({
                        subPlaylist: {
                          name: data[i].sub_playlist_name,
                          spotifyId: data[i].sub_playlist_spotify_id,
                          dbId: data[i].sub_playlist_id,
                          deleted: deleted,
                          deletedAt: deletedAt
                        }
                      });
                      ;
                    }
                  } else {
                    //existing Entry
                    deleted = false;
                    deletedAt = null;
                    if (data[i].sub_deleted == 1) {
                      deleted = true;
                      deletedAt = moment(data[i].sub_deleted_at).tz('Europe/Zurich').format('YYYY-MM-DD HH:mm:ss');
                    }
                    dbData.tracks[index].track.subPlaylists.push({
                      subPlaylist: {
                        name: data[i].sub_playlist_name,
                        spotifyId: data[i].sub_playlist_spotify_id,
                        dbId: data[i].sub_playlist_id,
                        deleted: deleted,
                        deletedAt: deletedAt
                      }
                    });
                  }
                }
                getTracksDone = true;
                if (getSubPlaylistsDone) {
                  callback(null, dbData);
                }
              } else {
                console.log("Error: could not get track list from Database (getPlaylistTracks())");
                console.log(err3);
              }
            });

            //get SubPlaylists
            connection.query("SELECT * FROM " + tabSubPlaylistName + " WHERE ?", {fs_playlist: dbPlaylistId}, function (err3, data) {
              if (!err3) {
                for (var i in data) {
                  dbData.subPlaylists.push({
                    subPlaylist: {
                      name: data[i].name,
                      spotifyId: data[i].spotify_id,
                      dbId: data[i].id
                    }
                  });
                }
                getSubPlaylistsDone = true;
                if (getTracksDone) {
                  callback(null, dbData);
                }
              } else {
                console.log("Error: could not get subPlaylists from Database (getPlaylistTracks())");
                console.log(err3);
              }
            });

          } else {
            callback({msg: "Error: user is not authorized to read this playlist!"}, null);
          }
        } else {
          console.log("Error while checking if user is Member of Playlist (getPlaylistTrack())");
          console.log(err2);
        }
      });
    } else {
      console.log("Error: could not get playlist Id: " + playlistId + "(getPlaylistTracks())");
      console.log(err);
    }
  });
}


/**
 *******************
 * Vote Management
 *******************
 */

/**
 * check if a vote for track already exists
 *
 * @param playlistId: spotifyId of playlist
 * @param trackId: spotifyId of Track
 * @param callback(err, trackExists [boolean])
 */
function doesVoteExist(playlistId, trackId, callback) {
  getPlaylistIdOnDatabase(playlistId, function (err, dbPlaylistId) {
    if (!err) {
      //continue
      var post = [dbPlaylistId, trackId]
      connection.query("SELECT * FROM `vote` INNER JOIN track ON vote.fs_track = track.id WHERE executed = 1 AND fs_playlist = ? AND spotify_id = ?", post, function (err, result, fields) {
        if (err) {
          callback(err, null)
        } else if (result.length == 1) {
          callback(null, true);
        } else {
          return callback(1, null)
        }
      });
    } else {
      console.log("ERROR: playlist was not found! (doesVoteExist())");
      callback({msg: "playlist does not exist"}, null);
    }
  });
}

/**
 * return vote ID used on database
 *
 * @param playlistId: spotifyId of playlist
 * @param trackId: trackId of playlist
 * @param callback(err, data): data is an array with fields from Database:
 *                              - dbVoteId
 *                              - type
 */
function getVoteIdOnDatabase(playlistId, trackId, callback) {
  getPlaylistIdOnDatabase(playlistId, function (err, dbPlaylistId) {
    if (!err) {
      //continue
      var post = [dbPlaylistId, trackId];
      connection.query("SELECT vote.id, vote.type, track.fs_playlist, track.spotify_id FROM `vote` INNER JOIN track ON vote.fs_track = track.id WHERE executed = 0 AND fs_playlist = ? AND spotify_id = ?", post, function (err2, result, fields) {
        if (err2) {
          callback(err2, null)
        } else if (result.length == 1) {
          for (var i in result) {
            var data = {
              dbVoteId: result[i].id,
              type: result[i].type
            }
            callback(null, data);
          }
        } else {
          var data = {
            dbVoteId: -1,
            type: -1
          }
          callback(null, data);
        }
      });
    } else {
      console.log("ERROR: playlist was not found! (doesVoteExist())");
      callback(err, null);
    }
  });
}

/**
 * create a new Vote!
 *
 * @param userId: spotify username of user which created the vote
 * @param playlistId: spotifyId of playlist
 * @param trackId: spotifyId of track
 * @param vote: type of vote:
 *              0:  undef
 *              1:  Delete-vote
 *              2:  Add/Delete-vote
 *              3:  Move-vote
 *            If Type 1 the format is: {type: 1}
 *            If type 2 the format is: {type: 2, subPlaylist: spotifyId}
 *            If type 3 the format is: {type: 3, fromSubPlaylist: spotifyId, toSubPlaylist: spotifyId}
 */
exports.createVote = function createVote(userId, playlistId, trackId, vote) {
  getPlaylistIdOnDatabase(playlistId, function (err, dbPlaylistId) {
    if (!err) {
      getVoteIdOnDatabase(playlistId, trackId, function (err, data) {
        if (!err) {
          var dbVoteId = data.dbVoteId
          if (dbVoteId == -1) {
            getTrackIdOnDatabase(dbPlaylistId, trackId, function (err, dbTrackId) {
              if (!err) {
                //Vote does not exist, create a new one
                var post = {
                  fs_track: dbTrackId,
                  type: vote.type,
                  vote_yes: 1,
                  vote_no: 0
                }

                //Set remaining Arguments depending on vote type. If error, abort by setting type to 0
                switch (vote.type) {
                  case 1:
                    //Delete-vote:
                    //set end_time
                    getVoteEndTime(null, dbPlaylistId, function (err, endTime) {
                      if (!err) {
                        post.end_time = endTime;
                        createVote()
                      } else {
                        console.log("Error: could not get Vote Time!");
                        console.log(err);
                      }
                    });
                    break;
                  case 2:
                    //Add/Remove-vote
                    //set sub_playlist1
                    getSubPlaylistIdOnDatabase(vote.subPlaylist, function (err, dbSubPlaylistId) {
                      if (!err && dbSubPlaylistId != -1) {
                        post.sub_playlist_1 = dbSubPlaylistId;
                        post.sub_playlist_2 = null;
                        //set end_time
                        getVoteEndTime(dbSubPlaylistId, dbPlaylistId, function (err, endTime) {
                          if (!err) {
                            post.end_time = endTime;
                            createVote();
                          } else {
                            console.log("Error: could not get Vote Time!");
                            console.log(err);
                          }
                        });
                      } else {
                        console.log("Error: sub playlist does not exist or there is an error!");
                        console.log(err);
                      }
                    });
                    break;
                  case 3:
                    //move-vote
                    //set sub_playlist1
                    getSubPlaylistIdOnDatabase(vote.fromSubPlaylist, function (err, dbSubPlaylistId) {
                      if (!err && dbSubPlaylistId != -1) {
                        post.sub_playlist_1 = dbSubPlaylistId;
                        if (post.sub_playlist_2 != null && post.end_time != null) {
                          createVote();
                        }
                      } else {
                        console.log("Error: sub playlist does not exist! abort creating Vote!");
                        console.log(err);
                      }
                    });
                    //set sub_playlist2
                    getSubPlaylistIdOnDatabase(vote.fromSubPlaylist, function (err, dbSubPlaylistId) {
                      if (!err && dbSubPlaylistId != -1) {
                        post.sub_playlist_2 = dbSubPlaylistId;
                        if (post.sub_playlist_1 != null && post.end_time != null) {
                          createVote();
                        }
                      } else {
                        console.log("Error: sub playlist does not exist or database error");
                        console.log(err);
                      }
                    });
                    //set end_time
                    getVoteEndTime(null, dbPlaylistId, function (err, endTime) {
                      if (!err) {
                        post.end_time = endTime;
                        if (post.sub_playlist_1 != null && post.sub_playlist_2 != null) {
                          createVote();
                        }
                      } else {
                        console.log("Error: could not get Vote Time!");
                        console.log(err);
                      }
                    });
                    break;
                }

                function createVote() {
                  connection.query("INSERT INTO " + tabVoteName + " SET ?", post, function (err, data) {
                    if (!err) {
                      connection.query("INSERT INTO " + tabMemberVoteName + " SET fs_vote = ?, vote_yes = 1, " +
                        "fs_member = (SELECT m.id FROM " + tabPlaylistMemberName + " AS m INNER JOIN " + tabUsersName + " AS u " +
                        "WHERE m.fs_playlist = ? AND u.spotify_id = ?)", [data.insertId, dbPlaylistId, userId], function(err) {
                        if (!err) {
                          //neat! return
                        } else {
                          console.log("Error: could not create Member Link to new Vote");
                          console.log(err);
                        }
                      })
                    } else {
                      console.log("Error: could not create new Vote (voteTrack()");
                      console.log(err);
                    }
                  });
                }
              } else {
                console.log("Error: could not get Track ID on Database! (createVote())");
                console.log(err);
              }
            });
          } else {
            //Vote does already exist! do nothing
            console.log("Error: vote does already exist (createVote())")
          }
        } else {
          console.log("Error: could not get playlist id from Database (voteTrack()");
          console.log(err);
        }
      });
    } else {
      console.log("Error: could not get playlist id from Database (voteTrack()");
      console.log(err);
    }
  });
}

/**
 * vote for an existing vote
 *
 * @param userId: spotify username of user
 * @param playlistId: spotifyId of playlist
 * @param trackId: spotifyId of Track
 * @param voteYes: boolean:
 *              true:   vote Yes to selected vote
 *              false:  vote No to selected Vote
 */
exports.vote = function vote(userId, playlistId, trackId, voteYes) {
  var dbPlaylistId, dbVoteId;
  getPlaylistId();

  function getPlaylistId() {
    getPlaylistIdOnDatabase(playlistId, function (err, data) {
      if (!err) {
        dbPlaylistId = data;
        getVoteId()
      } else {
        console.log("Error: could not get playlist id from Database (voteTrack()");
        console.log(err);
      }
    });
  }

  function getVoteId() {
    getVoteIdOnDatabase(playlistId, trackId, function (err, data) {
      if (!err) {
        if (data.dbVoteId == -1) {
          //vote does not exist! do nothing
          console.log("Error: vote does not exist (vote())")
        } else {
          dbVoteId = data.dbVoteId;
          checkVote();
        }
      } else {
        console.log("Error: could not get Vote id from Database (vote())");
        console.log(err);
      }
    });
  }

  function checkVote() {
    checkIfUserAlreadyVoted(dbVoteId, userId, function(err, alreadyVoted) {
      if (!err) {
        if (!alreadyVoted) {
          doVote();
        }
      }
      //else cancel
    })
  }

  function doVote() {
    //set query depending on voteYes
    var updateQuery;
    if (voteYes) {
      updateQuery = "UPDATE " + tabVoteName + " SET vote_yes = vote_yes + 1 WHERE id = ?";
    } else {
      updateQuery = "UPDATE " + tabVoteName + " SET vote_yes = vote_no + 1 WHERE id = ?";
    }

    var post = [dbVoteId];
    connection.query(updateQuery, post, function (err, res) {
      if (!err) {
        //voted successfully
      } else {
        console.log("Error: could not change Value in DB (vote())");
        console.log(err);
      }
    });

    var voteYesData = 0;
    if (voteYes) {
      voteYesData = 1;
    }

    connection.query("INSERT INTO " + tabMemberVoteName + " SET " +
      "fs_vote = ?, vote_yes = ?, fs_member = (SELECT m.id FROM " + tabPlaylistMemberName + " AS m" +
      "INNER JOIN " + tabUsersName + " AS u ON u.id = m.fs_user WHERE u.spotify_id = ?)",
      [dbVoteId, voteYesData, userId],
      function(err) {
      if (!err) {
        //voted successfully
      } else {
        console.log("Error: could not insert Vote from Member on Playlist");
        console.log(err);
      }
    })
  }
}

/**
 * Checks if a user already voted for a specific vote
 *
 * @param dbVoteId: database id of vote
 * @param userId: spotify username of user
 * @param callback: function(err, alreadyVoted[boolean])
 */
function checkIfUserAlreadyVoted(dbVoteId, userId, callback) {
  connection.query("SELECT id FROM " + tabMemberVoteName + " WHERE fs_vote = ? AND fs_member = " +
    "(SELECT m.id FROM " + tabPlaylistMemberName + " AS m " +
    "INNER JOIN " + tabUsersName + " AS u ON u.id = m.fs_user WHERE u.spotify_id = ?)", [dbVoteId, userId], function(err, data) {
    if (!err) {
      if (data.length == 1) {
        //user already voted
        callback(null, true);
      } else {
        //user did not vote
        callback(null, false);
      }
    } else {
      console.log("Error: could not check if user already voted!");
      console.log(err);
      callback(err, null);
    }
  })
}

/**
 * Get Settings of Playlists on database and calculate End Time of Vote
 *  if dbSubPlaylist = null, it will not check it's settings. If set to dbPlaylistId.
 *
 * @param dbSubPlaylistId
 * @param dbPlaylistId
 * @param callback = function(err, endTime)
 */
function getVoteEndTime(dbSubPlaylistId, dbPlaylistId, callback) {
  if (!dbSubPlaylistId) {
    getVoteTimeOfMainPlaylist();
  } else {
    //get Settings of sub Playlist
    sqlQuery = connection.query("SELECT vote_time FROM " + tabSubPlaylistName + " WHERE `id` = ?", [dbSubPlaylistId], function (err, data, fields) {
      if (!err) {
        if (data.length == 1) {
          if (data[0].vote_time != null) {
            calculateEndTime(data[0].vote_time);
          } else {
            getVoteTimeOfMainPlaylist();
          }
        } else {
          console.log("Error: could not find sub Playlist on database while getting vote_time");
          callback({msg: "Could not find sub Playlist or multiple Playlists found. Number of Sub Playlist found: " + data.length}, null);
        }
      } else {
        console.log(sqlQuery.sql);
        callback(err, null);
      }
    });
  }

  function getVoteTimeOfMainPlaylist() {
    //get Settings of main Playlist
    var sqlQuery = connection.query("SELECT vote_time FROM " + tabPlaylistName + " WHERE `id` = ?", [dbPlaylistId], function (err, data, fields) {
      if (!err) {
        if (data.length == 1) {
          calculateEndTime(data[0].vote_time);
        } else {
          callback({msg: "Could not find Playlist or multiple Playlists found. Number of Playlist found: " + data.length}, null);
        }
      } else {
        console.log(sqlQuery.sql);
        callback(err, null);
      }
    });
  }

  function calculateEndTime(voteTime) {
    var endTime = moment().tz('Europe/Zurich').add(voteTime, 's').format('YYYY-MM-DD HH:mm:ss');
    callback(null, endTime);
  }
}


/**
 * Returns all Votes currently active on the selected Playlist
 * @param dbPlaylistId: Database Id of playlist
 * @param callback: function(err, votes). Format of data:
 *  votes = [
 *    {dbTrackId, endTime, type, voteYes, voteNo, subPlaylist1, subPlaylist2},
 *    {...}
 *  ]
 */
exports.getVotesOfPlaylist = function getVotesOfPlaylist(dbPlaylistId, callback) {
  connection.query("SELECT v.id, v.fs_track, v.end_time, v.type, v.vote_yes, v.vote_no, v.sub_playlist_1, " +
    "v.sub_playlist_2, (v.end_time < NOW()) AS finished " +
    "FROM " + tabVoteName + " AS v INNER JOIN " + tabTrackName + " AS t ON v.fs_track = t.id " +
    "WHERE v.executed = 0 AND t.fs_playlist = ?", dbPlaylistId, function(err, data) {
    if (!err) {
      var ret = [];
      for (var i in data) {
        var finished = false;
        if (data[i].finished == 1) {
          finished = true;
        }
        ret.push({
          dbVoteId: data[i].id,
          dbTrackId: data[i].fs_track,
          endTime: data[i].end_time,
          type: data[i].type,
          voteYes: data[i].vote_yes,
          voteNo: data[i].vote_no,
          subPlaylist1: data[i].sub_playlist_1,
          subPlaylist2: data[i].sub_playlist_2,
          finished: finished,
        });
      }
      callback(null, ret);
    } else {
      console.log("Error: could not get all Votes of Playlist from Database!");
      callback(err, null);
    }
  })
}


/**
 ********************
 * Daemon Functions
 ********************
 *
 * These functions should just be used by the daemon!
 */

/**
 * Returns 1 if the daemon is running
 *
 * @param callback: function(err, daemonRunning)
 */
exports.checkDaemonState = function checkDaemonState(callback) {
  connection.query("SELECT * FROM `" + tabDaemonName + "` WHERE `id` = 1", null, function (err, data) {
    if (!err) {
      callback(err, data[0].running);
    } else {
      console.log("Error: could not get Daemon State!");
      console.log(err);
      callback(err, null);
    }
  });
}

/**
 * Set state of Daemon on Database
 *
 * @param state: 0 if not running, 1 if running
 * @param callback: function(err), err = null if no errors ocurred
 */
exports.setDaemonRunning = function setDaemonRunning(state, callback) {
  connection.query("UPDATE `" + tabDaemonName + "` SET `running` = ? WHERE `id` = 1;", state, function (err, data) {
    if (!err) {
      callback(null);
    } else {
      console.log("Error: could not get Daemon State!");
      console.log(err);
      callback(err);
    }
  });
}

/**
 * Get a list of all managed Playlists on database
 * Used just for the daemon
 *
 * @param userId: Spotify-id (username) of current user
 * @param callback: function(err, data)
 *          data: {
 *              playlists [
 *                  playlist: {
 *                      spotifyId, name, owner, dbId
 *                      subPlaylists[
 *                          subPlaylist: {name, spotifyId, dbId},
 *                          subPlaylist: {..}
 *                      ]
 *                  },
 *                  playlist: {...}
 *              ]
 *          }
 */
exports.getAllPlaylists = function getAllPlaylists(callback) {
  var query = "SELECT `playlist`.name AS playlist_name, `playlist`.id AS playlist_id, `playlist`.`spotify_id` AS playlist_spotify_id, `playlist`.vote_time AS playlist_vote_time, " +
    "`playlist`.delete_playlist_active, `playlist`.delete_playlist_spotify_id, `playlist`.playlist_permission, `playlist`.member_policy AS member_policy, " +
    "`sub_playlist`.name AS sub_playlist_name, `sub_playlist`.`spotify_id` AS sub_playlist_spotify_id, `sub_playlist`.`id` AS sub_playlist_id, " +
    "`sub_playlist`.allow_add AS sub_playlist_allow_add, `sub_playlist`.vote_time AS sub_playlist_vote_time, " +
    "`user`.spotify_id AS owner, `user`.refresh_token AS refresh_token" +
    " FROM `sub_playlist` " +
    "RIGHT OUTER JOIN `playlist` ON `sub_playlist`.fs_playlist = `playlist`.id " +
    "INNER JOIN `user` ON `playlist`.fs_owner = `user`.`id`" +
    "WHERE 1";
  connection.query(query, null, function (err, data) {
    if (!err) {
      prepareOutput(data);
    } else {
      console.log("Error: could not get List of Playlists (getAllPlaylists())");
      console.log(err);
    }
  });

  function prepareOutput(data) {
    //iterate all entries
    var counter = -1;
    var output = {playlists: []};
    for (var i in data) {
      if (counter == -1 || output.playlists[counter].playlist.spotifyId != data[i].playlist_spotify_id) {

        //create new Entry for Playlist
        var playlistData = {
          playlist: {
            spotifyId: data[i].playlist_spotify_id,
            name: data[i].playlist_name,
            dbId: data[i].playlist_id,
            permission: data[i].playlist_permission,
            memberPolicy: data[i].member_policy,
            voteTime: data[i].playlist_vote_time,
            found: false,
            owner: data[i].owner,
            refreshToken: data[i].refresh_token,
            subPlaylists: []
          }
        }
        if (data[i].delete_playlist_active == 1) {
          playlistData.playlist.deletePlaylistActive = true;
          playlistdata.playlist.deletePlaylistSpotifyId = data[i].delete_playlist_spotify_id;
        } else {
          playlistData.playlist.deletePlaylistActive = false;
        }
        output.playlists.push(playlistData);
        var allowAdd = false;
        if (data[i].sub_playlist_allow_add == 1) {allowAdd = true};
        output.playlists[++counter].playlist.subPlaylists.push({
          subPlaylist: {
            name: data[i].sub_playlist_name,
            spotifyId: data[i].sub_playlist_spotify_id,
            dbId: data[i].sub_playlist_id,
            allowAdd: allowAdd,
            voteTime: data[i].sub_playlist_vote_time
          }
        });
      } else {
        allowAdd = false;
        if (data[i].sub_playlist_allow_add == 1) {allowAdd = true};
        output.playlists[counter].playlist.subPlaylists.push({
          subPlaylist: {
            name: data[i].sub_playlist_name,
            spotifyId: data[i].sub_playlist_spotify_id,
            dbId: data[i].sub_playlist_id,
            allowAdd: allowAdd,
            voteTime: data[i].sub_playlist_vote_time
          }
        })
      }
    }
    callback(null, output);
  }
}

/**
 * Returns all Members of the Playlist
 * Used just for the daemon
 *
 * return: function(err, members)
 *  members: [{member: username}, {member: username}]
 */
exports.getMembersOfPlaylist = function getMembersOfPlaylist(dbPlaylistId, callback) {
  connection.query("SELECT * FROM `playlist_members` INNER JOIN `user` ON  `playlist_members`.fs_user = `user`.`id` WHERE `playlist_members`.fs_playlist = ?", [dbPlaylistId], function (err, data) {
    if (!err) {
      var ret = [];
      for (var i in data) {
        ret.push({
          member: data[i].spotify_id
        });
      }
      callback(null, ret);
    } else {
      callback(err, null);
    }
  });
}

/**
 * Add a track to a playlist
 * Used just for the daemon
 *
 * @param dbPlaylistId: database id of playlist
 * @param track:        Array Element of the reply from Spotify
 * @param callback: function(err)
 */
exports.addTrackToPlaylist = function addTrackToPlaylist(dbPlaylistId, track, callback) {
  //prepare artist name
  var artist = "";
  for (var j in track.track.artists) {
    artist += track.track.artists[j].name + ", ";
  }
  artist = artist.slice(0, -2);

  var trackData = {
    fs_playlist:  dbPlaylistId,
    spotify_id:   track.track.id,
    name:         track.track.name,
    artist:       artist,
    album:        track.track.album.name,
    added_at:     moment(track.added_at).tz('Europe/Zurich').format('YYYY-MM-DD HH:mm:ss'),
    added_by:     track.added_by.id,
    deleted:      0
  }
  connection.query("INSERT INTO " + tabTrackName + " SET ?", trackData, function(err, data) {
    if (err) {
      console.log("Error! could not create Track on database");
      console.log(err);
    }
    callback(err);
  });
}

/**
 * Adds a Track to a sub playlist
 * Used just by the daemon
 * @param dbSubPlaylistId: Database Id of sub playlist
 * @param dbPlaylistId: database id of main playlist
 * @param trackId: spotify id of track
 * @param callback: function(err)
 */
exports.addTrackToSubPlaylist = function addTrackToSubPlaylist(dbSubPlaylistId, dbPlaylistId, trackId, dbTrackId, callback) {
  if (!dbTrackId) {
    getTrackIdOnDatabase(dbPlaylistId, trackId, function (err, tmpDbTrackId) {
      if (!err) {
        dbTrackId = tmpDbTrackId;
        if (dbTrackId == -1) {
          console.log("Error: the track was not found on database! trackId: " + trackId);
          callback({msg: "Error: track was not found on database."})
        }
      } else {
        console.log("Error: could not get Track ID on Sub Playlist");
        console.log(err);
        callback(err);
      }
    })
  }

  var data = {
    fs_sub_playlist: dbSubPlaylistId,
    fs_track: dbTrackId
  }
  connection.query("INSERT INTO " + tabSubPlaylistTrackName + " SET ?", data, function (err) {
    if (err) {
      console.log("Error: could not link Track with Sub Playlist!");
      console.log(err);
    }
    callback(err);
  });
}

/**
 * Makes a Daemon Log on the database
 *
 * @param log: json-object:
 *   {
 *     spotifyId / dbId,
 *     type, (1: normal, 2: warning, 3: error)
 *     message (string)
 *   }
 */
exports.addDaemonLog = function addDaemonLog(log) {
  //get spotifyId if necessary
  if (log.hasOwnProperty('spotifyId')) {
    getPlaylistIdOnDatabase(log.spotifyId, function(err, dbId) {
      log.dbId = dbId;
      addLog();
    });
  } else {
    addLog();
  }

  function addLog() {
    var data = {
      fs_playlist: log.dbId,
      type: log.type,
      message: log.message
    }
    connection.query("INSERT INTO " + tabDaemonLogName + " SET ?", data, function(err, data) {
      if (err) {
        console.log("Error: could not create log on database!");
        console.log(err);
      }
    })
  }
}

/**
 * This function adds a member to a Playlist form the Daemon
 * In this function, user is not tested if it is already member. The daemon checks this.
 *
 * @param dbPlaylistId: Database Id of playlist
 * @param userId: Username from Spotify
 * @param callback: function(err)
 */
exports.addMemberFromDaemon = function addMemberFromDaemon(dbPlaylistId, userId, callback) {
  getUserIdOnDatabase(userId, function(err, dbUserId) {
    if (!err) {
      connection.query("INSERT INTO " + tabPlaylistMemberName + " SET ?", {
        fs_user: dbUserId,
        fs_playlist: dbPlaylistId
      }, function (err) {
        if (!err) {
          callback(null);
        } else {
          console.log("Error: could not add Member to Playlist on Database");
          callback(err);
        }
      })
    } else {
      console.log("Error: could not get User ID on database!");
      callback(err);
    }
  })
}

/**
 * Updates the fields added_by and added_at of the specified Track
 * Used just from daemon
 *
 * @param dbTrackId: Database Id of track
 * @param addedBy: spotify username of user which added the track
 * @param addedAt: already formated String of Date when track was added
 * @param callback: function(err)
 */
exports.updateTrackDataAdded = function updateTrackDataAdded(dbTrackId, addedBy, addedAt, callback) {
  connection.query("UPDATE " + tabTrackName + " SET added_by = ?, added_at = ? WHERE id = ?", [addedBy, addedAt, dbTrackId], function(err) {
    if (!err) {
      callback(null);
    } else {
      console.log("Error: could not update Track data on Database");
      callback(err);
    }
  })
}

/**
 * Returns daemon log entries (of all playlists)
 * @param num: number of entries
 * @param page: Page number, starts at 1
 * @param callback
 */
exports.getFullDaemonLog = function getFullDaemonLog(num, page, callback) {
  var offset = (page - 1) * num;
  connection.query(
    "SELECT d.id, d.type, d.message, d.time as log_time, p.name AS playlist_name " +
    "FROM daemon_log AS d LEFT JOIN playlist AS p ON d.fs_playlist = p.id WHERE 1 ORDER BY id DESC LIMIT ?,?",
    [offset, num],
    function(err, data1) {
      if (!err) {
        connection.query("SELECT COUNT(*) AS count FROM " + tabDaemonLogName, null, function(err, data2) {
          if (!err) {
            callback(null, {
              logs: data1,
              numLogs: data2[0].count,
              currentPage: page,
              nextPageExists: ((page-1)*num >= data2[0].count)
            });
          } else {
            console.log("Error: could not count number of Daemon Logs on database!");
            callback(err, null);
          }
        })
      } else {
        console.log("Error: could not get Daemon Log from Database!");
        callback(err, null);
      }
    })
}

/**
 * Marks a Track as Deleted and sets the deleted_at property to now
 * Used just by the daemon
 *
 * @param dbTrackId: Database Id of track
 * @param callback: function(err)
 */
exports.markTrackAsDeleted = function markTrackAsDeleted(dbTrackId, callback) {
  connection.query("UPDATE " + tabTrackName + " SET deleted = 1, deleted_at = ? WHERE id = ?", [moment().tz('Europe/Zurich').format('YYYY-MM-DD HH:mm:ss'), dbTrackId], function(err) {
    if (!err) {
      connection.query("UPDATE " + tabSubPlaylistTrackName + " SET deleted = 1, deleted_at = ? WHERE fs_track = ?", [moment().tz('Europe/Zurich').format('YYYY-MM-DD HH:mm:ss'), dbTrackId, function(err) {
        if (!err) {
          callback(null);
        } else {
          console.log("Error: could not mark track as Deleted on sub playlists");
          console.log(err);
          callback(err);
        }
      }])
    } else {
      console.log("Error: could not mark track as deleted on database!");
      console.log(err);
      callback(err);
    }
  });
}

/**
 * Marks a Track as Not Deleted
 * used just by the daemon
 *
 * @param dbTrackId: Database Id of track
 * @param callback: function(err)
 */
exports.markTrackAsNotDeleted = function markTrackAsNotDeleted(dbTrackId, callback) {
  connection.query("UPDATE " + tabTrackName + " SET deleted = 0, deleted_at = NULL WHERE id = ?", [dbTrackId], function(err) {
    if (!err) {
      callback(null);
    } else {
      console.log("Error: could not mark track as not deleted on database!");
      callback(err);
    }
  });
}

/**
 * Mark a Link from sub playlist to track as deleted and set the current delete dateTime
 * Used just by the daemon from votes
 *
 * @param dbTrackId: Database Id of track
 * @param dbSubPlaylistId: database Id of sub Playlist
 * @param callback: function(err)
 */
exports.removeTrackFromSubPlaylist = function removeTrackFromSubPlaylist(dbTrackId, dbSubPlaylistId, callback) {
  connection.query("UPDATE " + tabSubPlaylistTrackName + " SET deleted = 1, deleted_at = ? WHERE fs_track = ? AND fs_sub_playlist = ?", [moment().tz('Europe/Zurich').format('YYYY-MM-DD HH:mm:ss'), dbTrackId, dbSubPlaylistId], function(err) {
    if (!err) {
      callback(null);
    } else {
      console.log("Error: could not mark track as removed from Sub Playlist!");
      console.log(err);
      callback(err);
    }
  });
}

/**
 * Delete a Vote on the Database
 * used just by the daemon
 *
 * @param dbVoteId: database Id of Vote
 * @param callback: function(err)
 */
exports.deleteVote = function deleteVote(dbVoteId, callback) {
  connection.query("DELETE FROM " + tabVoteName + " WHERE id = ?", dbVoteId, function(err) {
    if (!err) {
      callback(null);
    } else {
      console.log("Error: could not delete Vote from Database");
      callback(err);
    }
  })
}

/**
 * Marks a vote as Executed!
 * @param dbVoteId: database ID of vote
 * @param callback: function(err)
 */
exports.markVoteAsExecuted = function markVoteAsExecuted(dbVoteId, callback) {
  connection.query("UPDATE " + tabVoteName + " SET executed = 1 WHERE id = ?", [dbVoteId], function(err) {
    if (!err) {
      callback(null);
    } else {
      console.log("Error: could mark Vote as Executed!");
      console.log(err);
      callback(err);
    }
  })
}

/**
 * Clean up function which deletes old or wrong Entries on database
 */
exports.cleanUpDatabase = function cleanUpDatabase() {
  //TODO: delete old Votes which are executed 2 weeks earlyer
  //TODO: delete Votes which do not point to a valid track
  connection.query("DELETE FROM " + tabSubPlaylistTrackName + " WHERE deleted = 1 AND deleted_at < NOW() - INTERVAL 14 DAY", null, function(err) {
    if (err) {
      console.log("Error: could not delete all deleted and 2 weeks old links on Sub Playlist Tracks!");
      console.log(err);
    }
  });

}

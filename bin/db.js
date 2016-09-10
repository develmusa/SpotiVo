var mysql = require("mysql");
var moment = require("moment");

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

//TODO: nöd so unglaublich verschachtlete code schribe tibor... sorry ich verstaas eifach nöd
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
                  added_at: moment(response[i].added_at).format('YYYY-MM-DD hh:mm:ss'),
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
      connection.query("SELECT * FROM `vote` INNER JOIN track ON vote.fs_track = track.id WHERE fs_playlist = ? AND spotify_id = ?", post, function (err, result, fields) {
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
      connection.query("SELECT vote.id, vote.type, track.fs_playlist, track.spotify_id FROM `vote` INNER JOIN track ON vote.fs_track = track.id WHERE fs_playlist = ? AND spotify_id = ?", post, function (err2, result, fields) {
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
exports.createVote = function createVote(playlistId, trackId, vote) {
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
                        post.sub_playlist1 = dbSubPlaylistId;
                        if (post.end_time != null) {
                          createVote();
                        }
                      } else {
                        console.log("Error: sub playlist does not exist or there is an error!");
                        console.log(err);
                      }
                    });
                    //set end_time
                    getVoteEndTime(vote.subPlaylist, dbPlaylistId, function (err, endTime) {
                      if (!err) {
                        post.end_time = endTime;
                        if (post.sub_playlist1 != null) {
                          createVote();
                        }
                      } else {
                        console.log("Error: could not get Vote Time!");
                        console.log(err);
                      }
                    });
                    break;
                  case 3:
                    //Add/Remove-vote
                    //set sub_playlist1
                    getSubPlaylistIdOnDatabase(vote.fromSubPlaylist, function (err, dbSubPlaylistId) {
                      if (!err && dbSubPlaylistId != -1) {
                        post.sub_playlist1 = dbSubPlaylistId;
                        if (post.subPlaylist2 != null && post.end_time != null) {
                          createVote();
                        }
                      } else {
                        console.log("Error: sub playlist does not exist! abort creating Vote!");
                        post.type = 0;
                      }
                    });
                    //set sub_playlist2
                    getSubPlaylistIdOnDatabase(vote.fromSubPlaylist, function (err, dbSubPlaylistId) {
                      if (!err && dbSubPlaylistId != -1) {
                        post.sub_playlist2 = dbSubPlaylistId;
                        if (post.sub_playlist1 != null && post.end_time != null) {
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
                        if (post.sub_playlist1 != null && post.sub_playlist2 != null) {
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
                  connection.query("INSERT INTO " + tabVoteName + " SET ?", post, function (err, res) {
                    if (!err) {
                      //Neat! return
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
 * @param playlistId: spotifyId of playlist
 * @param trackId: spotifyId of Track
 * @param voteYes: boolean:
 *              true:   vote Yes to selected vote
 *              false:  vote No to selected Vote
 */
exports.vote = function vote(playlistId, trackId, voteYes) {
  getPlaylistIdOnDatabase(playlistId, function (err, dbPlaylistId) {
    if (!err) {
      getVoteIdOnDatabase(playlistId, trackId, function (err2, data) {
        if (!err2) {
          if (data.dbVoteId == -1) {
            //vote does not exist! do nothing
            console.log("Error: vote does not exist (vote())")
          } else {
            //set query depending on voteYes
            if (voteYes) {
              var updateQuery = "UPDATE " + tabVoteName + " SET vote_yes = vote_yes + 1 WHERE id = ?";
            } else {
              var updateQuery = "UPDATE " + tabVoteName + " SET vote_yes = vote_no + 1 WHERE id = ?";
            }

            var post = [data.dbVoteId];
            connection.query(updateQuery, post, function (err3, res) {
              if (!err3) {
                //voted successfully
              } else {
                console.log("Error: could not change Value in DB (vote())");
                console.log(err3);
              }
            });
          }
        } else {
          console.log("Error: could not get Vote id from Database (vote())");
          console.log(err2);
        }
      });
    } else {
      console.log("Error: could not get playlist id from Database (voteTrack()");
      console.log(err);
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
 * Get Settings of Playlists on database and calculate End Time of Vote
 *  if dbSubPlaylist = null, it will not check it's settings. If set to dbPlaylistId.
 *
 * @param dbSubPlaylistId
 * @param dbPlaylistId
 * @param callback = function(err, endTime)
 */
function getVoteEndTime(dbSubPlaylistId, dbPlaylistId, callback) {
  if (!dbSubPlaylistId) {
    getSettingsOnMainPlaylist();
  } else {
    //get Settings of sub Playlist
    connection.query("SELECT vote_time FROM " + tabSubPlaylistName + " WHERE ?", {id: dbSubPlaylistId}, function (err, data, fields) {
      if (!err) {
        if (data.length == 1) {
          calculateEndTime(data[0].vote_time);
        } else {
          callback({msg: "Could not find sub Playlist or multiple Playlists found. Number of Sub Playlist found: " + data.length}, null);
        }
      } else {
        callback(err, null);
      }
    });
  }
  function getSettingsOnMainPlaylist() {
    connection.query("SELECT vote_time FROM " + tabPlaylistName + " WHERE ?", {id: dbPlaylistId}, function (err, data, fields) {
      if (!err) {
        if (data.length == 1) {
          calculateEndTime(data[0].vote_time);
        } else {
          callback({msg: "Could not find Playlist or multiple Playlists found. Number of Playlist found: " + data.length}, null);
        }
      } else {
        callback(err, null);
      }
    });
  }

  function calculateEndTime(voteTime) {
    var endTime = moment().add(voteTime, 's').format('YYYY-MM-DD hh:mm:ss');
    callback(null, endTime)
  }
}

/**
 * GetPlaylistTracks *
 *
 * @param playlistId
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
            var sqlQuery = "SELECT t.id, t.spotify_id, t.name, t.artist, t.album, t.added_at, t.added_by, sp.id AS sub_playlist_id, sp.name AS sub_playlist_name, sp.spotify_id AS sub_playlist_spotify_id " +
              "FROM " + tabTrackName + " AS t " +
              "LEFT OUTER JOIN " + tabSubPlaylistTrackName + " AS spt ON t.id = spt.fs_track " +
              "LEFT OUTER JOIN " + tabSubPlaylistName + " AS sp ON spt.fs_sub_playlist = sp.id " +
              "WHERE t.fs_playlist = ?  AND t.deleted = 0 " +
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
                    dbData.tracks.push({
                      track: {
                        name: data[i].name,
                        artist: data[i].artist,
                        album: data[i].album,
                        addedAt: data[i].added_at,
                        addedBy: data[i].added_by,
                        spotifyId: data[i].spotify_id,
                        dbId: data[i].id,
                        subPlaylists: [],
                        found: false
                      }
                    });
                    if (data[i].sub_playlist_id != null) {
                      dbData.tracks[index].track.subPlaylists.push({
                        subPlaylist: {
                          name: data[i].sub_playlist_name,
                          spotifyId: data[i].sub_playlist_spotify_id,
                          dbId: data[i].sub_playlist_id
                        }
                      });
                      ;
                    }
                  } else {
                    //existing Entry
                    dbData.tracks[index].track.subPlaylists.push({
                      subPlaylist: {
                        name: data[i].sub_playlist_name,
                        spotifyId: data[i].sub_playlist_spotify_id,
                        dbId: data[i].sub_playlist_id
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
 * Returns 1 if the daemon is running
 *
 * @param callback: function(err, daemonRunning)
 */
exports.checkDaemonState = function checkDaemonState(callback) {
  connection.query("SELECT * FROM `daemon` WHERE `id` = 1", null, function (err, data) {
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
  connection.query("UPDATE `daemon` SET `running` = ? WHERE `id` = 1;", state, function (err, data) {
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
  var query = "SELECT `playlist`.name AS playlist_name, `playlist`.id AS playlist_id, `playlist`.`spotify_id` AS playlist_spotify_id, " +
    "`playlist`.delete_playlist_active, `playlist`.delete_playlist_spotify_id, `playlist`.playlist_permission, " +
    "`sub_playlist`.name AS sub_playlist_name, `sub_playlist`.`spotify_id` AS sub_playlist_spotify_id, `sub_playlist`.`id` AS sub_playlist_id, `sub_playlist`.allow_add AS sub_playlist_allow_add, " +
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
        output.playlists[++counter].playlist.subPlaylists.push({
          subPlaylist: {
            name: data[i].sub_playlist_name,
            spotify_id: data[i].sub_playlist_spotify_id,
            dbId: data[i].sub_playlist_id,
            allowAdd: data[i].sub_playlist_allow_add
          }
        });
      } else {
        output.playlists[counter].playlist.subPlaylists.push({
          subPlaylist: {
            name: data[i].sub_playlist_name,
            spotify_id: data[i].sub_playlist_spotify_id,
            dbId: data[i].sub_playlist_id,
            allowAdd: data[i].sub_playlist_allow_add
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
        callback(null, ret);
      }
    } else {
      callback(err, null);
    }
  });
}


/**
 * Add a track to a playlist
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
    added_at:     moment(track.added_at).format('YYYY-MM-DD hh:mm:ss'),
    added_by:     track.added_by.id,
    deleted:      0
  }
  connection.query("INSERT INTO " + tabTrackName + " SET ?", trackData, function(err, data) {
    if (err) {
      console.log("Error! could not create Track on database")
    }
    callback(err);
  });
}
var mysql = require("mysql");
var moment = require("moment");

var dbUsername = "application";
var dbPassword = "y7F!z6C7U#EKWsI8";
var dbName = "application";

var tabUsersName = "user";
var tabPlaylistName = "playlist";
var tabPlaylistMemberName = "playlist_members";
var tabPlaylistTrackName = "playlist_tracks";
var tabVoteName = "vote";

var connection = mysql.createConnection({
    host: "localhost",
    user: dbUsername,
    password: dbPassword
})

/**
 * connect to database
 */
connection.connect(function(err){
    if(err){
        console.log('Error connecting to Db');
        return;
    }
    console.log('Connection established');
    connection.query("USE " + dbName + ";", function(err, result) {

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
    connection.query("SELECT * FROM " + tabUsersName + " WHERE ?", post, function(err, result, fields) {
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
 * check if playlist already exists
 *
 * @param playlistId: spotify id for playlist
 * @param callback(err, playlistExists [boolean])
 */
exports.doesPlaylistExist = function doesPlaylistExist(playlistId, callback) {
    console.log("check if playlist is already managed")
    var post = {spotify_id: playlistId};
    connection.query("SELECT * FROM " + tabPlaylistName + " WHERE ?", post, function(err, result, fields) {
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
            getUserIdOnDatabase(userId, function(err, dbUserId) {
                if (!err) {
                    var response = data.body.items;
                    console.log("start");

                    //create Playlist on database
                    var post = {
                        spotify_id: playlistId,
                        name: playlistName
                    };
                    connection.query("INSERT INTO " + tabPlaylistName + " SET ?", post, function (err, result) {
                        //Neat!
                        dbPlaylistId = result.insertId;
                        if (dbPlaylistId != -1 && dbUserId != -1) {
                            //everything ok!

                            //create Member
                            var post = {
                                fs_user: dbUserId,
                                fs_playlist: dbPlaylistId
                            }
                            connection.query("INSERT INTO " + tabPlaylistMemberName + " SET ?", post, function(err, result) {
                                //Neat!
                            })

                            //create all Tracks
                            for (var i in response) {
                                var track = response[i].track;
                                //get artist name
                                var artist = "";
                                for (var j in track.artists) {
                                    artist += track.artists[j].name + ", ";
                                }
                                artist = artist.slice(0, -2);

                                var post = {
                                    fs_playlist: dbPlaylistId,
                                    spotify_id: track.id,
                                    name: track.name,
                                    artist: artist,
                                    album: track.album.name,
                                    added_at: moment(response[i].added_at).format('YYYY-MM-DD hh:mm:ss'),
                                    added_by: response[i].added_by.id,
                                    deleted: 0,
                                    liked: 0
                                }
                                console.log(post);
                                connection.query("INSERT INTO " + tabPlaylistTrackName + " SET ?", post, function(err, result) {
                                    //neat!
                                    if (err) {
                                        console.log("ERROR: could not insert data: ", err);
                                    }
                                })
                            }
                        } else {
                            console.log("ERROR: playlist could not be created (createPlaylist())");
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
    connection.query("SELECT * FROM " + tabUsersName + " WHERE ?", {spotify_id: userId}, function(err, result, fields) {
        if (err) {
            callback(err, null);
        }
        if (result.length == 1) {
            for (var i in result) {
                callback(null, result[i].id);
            }
        } else {
            callback(1, null);
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
    connection.query("SELECT * FROM " + tabPlaylistName + " WHERE ?", {spotify_id: playlistId}, function(err, result, fields) {
        if (err) {
            callback(err, null)
        } else if (result.length == 1) {
            for (var i in result) {
                callback(null, result[i].id);
            }
        } else {
            return callback(1, null)
        }
    });
}


/**
 * get Track Id used on database
 *
 * @param dbPlaylistId: playlist Id on Database!!
 * @param trackId: spotifyId of Track
 * @param callback(err, dbTrackId)
 */
function getTrackIdOnDatabase(dbPlaylistId, trackId, callback) {
    connection.query("SELECT * FROM " + tabPlaylistTrackName + " WHERE spotify_id = ? AND fs_playlist = ?", [trackId, dbPlaylistId], function(err, result, fields) {
        if (err) {
            callback(err, null)
        } else if (result.length == 1) {
            for (var i in result) {
                callback(null, result[i].id);
            }
        } else {
            return callback(1, null)
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
    //Parameter sind Spotify ID's
    //return parameter: callback(err, voteExists)
    getPlaylistIdOnDatabase(playlistId, function(err, dbPlaylistId) {
        if (!err) {
            //continue
            var post = {
                fs_playlist: dbPlaylistId,
                spotify_id: trackId
            }
            connection.query("SELECT * FROM `vote` INNER JOIN playlist_tracks ON vote.fs_playlist_track = playlist_tracks.id WHERE ?", post, function(err, result, fields) {
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
    //Parameter sind Spotify ID's
    //return parameter: callback(err, voteExists)
    getPlaylistIdOnDatabase(playlistId, function(err, dbPlaylistId) {
        if (!err) {
            //continue
            var post = [dbPlaylistId, trackId];
            connection.query("SELECT vote.id, vote.type, playlist_tracks.fs_playlist, playlist_tracks.spotify_id " +
                                "FROM `vote` INNER JOIN playlist_tracks ON vote.fs_playlist_track = playlist_tracks.id WHERE fs_playlist = ? AND spotify_id = ?", post, function(err2, result, fields) {
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
 * @param type: type of vote:
 *              0:  Vote out of "main" playlist
 *              1:  Vote in to "main" playlist, if it was vouted out before
 *              2:  Vote in "best of" playlist
 *              3:  vote back from "best of" into "main" playlist
 */
exports.createVote = function createVote(playlistId, trackId, type) {
    getPlaylistIdOnDatabase(playlistId, function(err, dbPlaylistId) {
        if (!err) {
            getVoteIdOnDatabase(playlistId, trackId, function(err, data) {
                var dbVoteId = data.dbVoteId
                if (!err) {
                    if (dbVoteId == -1) {
                        getTrackIdOnDatabase(dbPlaylistId, trackId, function(err, dbTrackId) {
                            if (!err) {
                                //Vote does not exist, create a new one
                                var post = {
                                    fs_playlist_track: dbTrackId,
                                    type: type,
                                    vote_yes: 1,
                                    vote_no: 0
                                }
                                connection.query("INSERT INTO " + tabVoteName + " SET ?", post, function (err, res) {
                                    if (!err) {
                                        //Neat! return
                                    } else {
                                        console.log("Error: could not create new Vote (voteTrack()");
                                        console.log(err);
                                    }
                                });
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
 * @param type: type of vote:
 *              0:  Vote out of "main" playlist
 *              1:  Vote in to "main" playlist, if it was vouted out before
 *              2:  Vote in "best of" playlist
 *              3:  vote back from "best of" into "main" playlist
 * @param voteYes: boolean:
 *              true:   vote Yes to selected vote
 *              false:  vote No to selected Vote
 */
exports.vote = function vote(playlistId, trackId, type, voteYes) {
    getPlaylistIdOnDatabase(playlistId, function(err, dbPlaylistId) {
        if (!err) {
            getVoteIdOnDatabase(playlistId, trackId, function(err2, data) {
                if (!err2) {
                    if (data.dbVoteId == -1) {
                        //vote does not exist! do nothing
                        console.log("Error: vote does not exist (vote())")
                    } else if (data.type == type) {
                        //set query depending on voteYes
                        if (voteYes) {
                            var updateQuery = "UPDATE " + tabVoteName + " SET vote_yes = vote_yes + 1 WHERE id = ?";
                        } else {
                            var updateQuery = "UPDATE " + tabVoteName + " SET vote_yes = vote_no + 1 WHERE id = ?";
                        }

                        var post = [data.dbVoteId];
                        connection.query(updateQuery, post, function(err3, res) {
                            if (!err3) {
                                //voted successfully
                            } else {
                                console.log("Error: could not change Value in DB (vote())");
                                console.log(err3);
                            }
                        });
                    } else {
                        //types are not equal
                        console.log("Error: vote types are not equal! (vote())", data);
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

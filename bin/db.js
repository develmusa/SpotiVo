var mysql = require("mysql");

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
exports.createPlaylist = function createPlaylist(spotifyApi, playlistId, userId) {
    console.log("create Playlist ", playlistId);
    spotifyApi.getPlaylistTracks(userId, playlistId)
        .then(function (data) {
            getUserIdOnDatabase(userId, new function(err, dbUserId) {
                if (!err) {
                    console.log(data);
                    var response = data.body.items;
                    console.log("start");

                    //create Playlist on database
                    var post = {
                        spotify_id: playlistId,
                        name: "temporary_null"
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
                                    album: track.album,
                                    deleted: 0,
                                    liked: 0
                                }
                                connection.query("INSERT INTO " + tabPlaylistTrackName + " SET ?", post, function(err, result) {
                                    //neat!
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
            return callback(1, null);
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
 * @param callback(err, dbVoteId)
 */
function getVoteIdOnDatabase(playlistId, trackId, callback) {
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
                    for (var i in result) {
                        callback(null, result[i].id);
                    }
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






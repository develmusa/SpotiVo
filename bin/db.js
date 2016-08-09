var mysql = require("mysql");

var dbUsername = "application";
var dbPassword = "y7F!z6C7U#EKWsI8";
var dbName = "application";

var tabUsersName = "users";
var tabPlaylistName = "playlist";
var tabPlaylistMemberName = "playlist_members";
var tabPlaylistTrackName = "playlist_tracks";

var connection = mysql.createConnection({
    host: "localhost",
    user: dbUsername,
    password: dbPassword
})

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

exports.doesPlaylistExist = function doesPlaylistExist(spotifyId, callback) {
    console.log("check if playlist is already managed")
    var post = {spotify_id: spotifyId};
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
exports.createPlaylist = function createPlaylist(spotifyApi, playlistId, userId) {
    console.log("create Playlist ", playlistId);
    spotifyApi.getPlaylistTracks(userId, playlistId)
        .then(function (data) {
            var dbUserId = -1;
            connection.query("SELECT * FROM " + tabUsersName + " WHERE ?", {spotify_id: userId}, function(err, result, fields) {
                if (result.length == 1) {
                    for (var i in result) {
                        dbUserId = result[i].id;
                    }
                }
                if (dbUserId != -1) {
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
                                fs_users: dbUserId,
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
                            console.log("error: playlist could not be created");
                        }
                    });
                } else {
                    console.log("error: user does not exist on db!")
                }
            });
        }, function (err) {
            console.log('Error! playlist does not exist on spotify server!', err);
        });
}

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
            return callback(null, -1);
        }
    });
}




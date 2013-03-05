/**
 * Global namespace
 * @type {Object}
 */
window.CatTube = {};

/**
 * Placeholder object for playlists
 * @type {Object}
 */
CatTube.Playlists = {};

// EOF


/**
 * CatTube
 */

// requires namespaces

/**
 * Main application
 */
CatTube.App = function() {

	var first_round = true;
	var now_playing = null;
	var queue;
	var debug = false;

	var self = this;

	this.init = function(playlist)
	{
		console.log('CatTube initializing with playlist "' + playlist + '"');

		if(typeof CatTube.Playlists[playlist] === 'undefined')
		{
			console.error('Cannot find playlist "' + playlist + '"');
			return false;
		}

		playPlaylist(new CatTube.Playlists[playlist]());
	};

	this.tick = function()
	{
		var video_time;

		// What time is it now?
		var t = new Date();

		// We're only interested in the time when the minute has just changed
		var now_seconds = t.getSeconds();

		// Debug:
		if(debug === true && first_round === true)
		{
			now_seconds = 0;
		}

		if(now_seconds !== 0)
		{
			return;
		}

		var current = {
			'hour'   : t.getHours(),
			'minute' : t.getMinutes()
		};

		// Debug:
		if(debug === true && first_round === true)
		{
			current = {
				'hour'   : 11,
				'minute' : 30
			};
		}

		// Iterate our playlist and see if any video should start playing now
		for(video_time in queue)
		{
			var bits   = video_time.split(':');
			var hour   = parseInt(bits[0], 10);
			var minute = parseInt(bits[1], 10);

			if(hour !== current.hour || minute !== current.minute)
			{
				// Nothing to do
				console.log('No match for this minute (' + current.minute + ').');
				continue;
			}

			var vid = queue[video_time];

			playVideo(vid);
			now_playing = vid;
			break;
		}
	};

	var playPlaylist = function(playlist)
	{
		playlist.init();
		queue = playlist.getQueue();

		setInterval(self.tick, 1000);
	};

	var playVideo = function(video)
	{
		if(now_playing !== null)
		{
			// Video is already playing, bail
			return false;
		}

		console.log('Playing ' + video.id);

		// Reset the "now_playing" var after this video's done playing
		setTimeout(function()
		{
			console.log('Stopping playing video ' + video.id);
			now_playing = null;
		}, convertDuration(video.duration));

		var embed_code = '<iframe id="youtube_iframe" src="http://www.youtube.com/embed/' + video.id + '?autoplay=1" frameborder="0" allowfullscreen></iframe>';

		$('#arena').html(embed_code);

		first_round = false;
	};

	var convertDuration = function(str)
	{
		var bits = str.split(':');

		var minutes = parseInt(bits[0], 10);
		var seconds = parseInt(bits[1], 10);

		var milliseconds = 0;

		milliseconds += (minutes * 60) * 1000;
		milliseconds += seconds * 1000;

		return milliseconds;
	};

};

// ---------------------------------------------------------------------------

$(function()
{
	var app = new CatTube.App();
	app.init('Default');
});

// EOF


// requires namespaces

CatTube.Playlists.Default = function() {

	var videos = {
		'11:30' : {
			id       : 'vORtczn3N7o',
			duration : '5:16'
		},
		'20:41' : {
			id       : 'CYbI8kyyyQ4',
			duration : '1:54'
		},
		'20:38' : {
			id       : 'vORtczn3N7o',
			duration : '5:16'
		}
	};

	this.init = function()
	{
		console.log('Playlist "Default" initializing...');
	};

	this.getQueue = function()
	{
		return videos;
	};

};

// EOF



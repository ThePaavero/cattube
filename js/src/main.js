/**
 * CatTube main JS file
 * @package CatTube
 */

// requires namespaces

/**
 * Main application
 */
CatTube.App = function() {

	var debug       = false;
	var first_round = true;
	var now_playing = null;
	var queue;
	var running;
	var self = this;

	/**
	 * Initialize
	 * @param  {object} playlist
	 * @return void
	 */
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

	/**
	 * Do a dycle or "tick" (called upon each second)
	 * @return void
	 */
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
			return false;
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

	/**
	 * Play playlist
	 * @param  {object} playlist
	 * @return void
	 */
	var playPlaylist = function(playlist)
	{
		playlist.init();
		queue = playlist.getQueue();

		if(running)
		{
			clearInterval(running);
		}

		running = setInterval(self.tick, 1000);
	};

	/**
	 * Play a video
	 * @param  {object} video
	 * @return void
	 */
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

	/**
	 * Helper function for turning strings to milliseconds
	 * @param  {string} str e.g. '00:55'
	 * @return {integer}     Milliseconds
	 */
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

/**
 * On document ready, do...
 * @return void
 */
$(function()
{
	var app = new CatTube.App();
	app.init('Default');
});

// EOF
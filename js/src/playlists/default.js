/**
 * Playlist "Default"
 * @package CatTube
 */

// requires namespaces

CatTube.Playlists.Default = function() {

	var videos = {
		'17:12' : {
			id       : 'vORtczn3N7o',
			duration : '5:16'
		},
		'17:20' : {
			id       : 'CYbI8kyyyQ4',
			duration : '1:54'
		},
		'17:23' : {
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
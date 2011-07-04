function YouTubeAPIExample() {
	
	/*
	 * Start, Get Most Popular Videos Feed
	 */
	this.init = function() {
		//Empty container
		$('#main-videos').empty();
		
		//Add preloader of thumbnails
		$('#thumbs-preloader').css('display', 'none')
		
		//preload
		.ajaxStart(function(e) {
			$(this).show();
		})
		
		//when finish, hide!
		.ajaxComplete(function(e) {
			$(this).css('display', 'none');
		});
		
		//parse most popular videos feed
		parseVideoFeed('http://gdata.youtube.com/feeds/api/standardfeeds/most_popular?v=2&alt=json');
		
		//Search for a video
		$('#search-button').click(function(e) {
			e.preventDefault();
			
			var searchField = $('#search-text');
			var searchText = searchField.val();
			
			if (searchText == '') {
				searchField.addClass('error').focus();
				searchField.blur(function(e) {
					$(this).removeClass('error');
				});
			} else {
				makeSearch(searchText);
			}
		});
	}
	
	/*
	 * Display a single video
	 * Get comments, and related videos
	 */
	function displayVideo(id, title) {
		//update title
		$('#title-search-container h1').text(title);
		
		//empty container, remove video div, to keep only 1 video visible
		//remove search result label (if searched for a video previously)
		$('#main-videos').empty();
		$('#video-display').remove();
		$('#results-text').remove();
		
		//create video area and comments area
		var $videoDisplay = $('<section id="video-display" class="container_12"></div>');
		var $videoArea = $('<div id="video-area" class="grid_8"></div>');
		var $videoPlaceholder = $('<div id="video-placeholder"></div>');
		
		var $commentsArea = $('<div id="comments-area" class="grid_4 comments"></div>');
		var $commentsTabs = $('<div id="main-comments"></div>');
		$commentsTabs.append('<ul><li><a href="#tabs-1">Comments</a></li></ul>');
		$commentsTabs.append('<div id="tabs-1"></div>');
		$commentsArea.append($commentsTabs);
		
		$videoDisplay.insertAfter('#title-search-container');
		$videoDisplay.append($videoArea);
		$videoDisplay.append($commentsArea);
		$videoArea.append($videoPlaceholder);
		
		//embed player
		swfobject.embedSWF('http://www.youtube.com/e/' + id + '?enablejsapi=1&playerapiid=ytplayer', 
		'video-placeholder', '620', '375', '9.0.0', null, null, { allowScriptAccess: "always" }, 
		{ id: "myyoutubeplayer" } );
		
		//get video comments
		parseComments('http://gdata.youtube.com/feeds/api/videos/' + id + '/comments?v=2&alt=json');
		
		//get related videos
		$('#main-videos').append('<div class="grid_12"><h3>Related Videos</h3></div>');
		parseVideoFeed('http://gdata.youtube.com/feeds/api/videos/' + id + '/related?v=2&alt=json');
	}
	
	/*
	 * Parse comments on a video
	 */
	function parseComments(feed) {
		$('#main-comments').tabs();
		$('#tabs-1').append('<ul id="comments-list"></ul>');
		
		$.getJSON(feed, function(data) {
			if (data['feed']) {
				$.each(data['feed']['entry'], function(i, entry) {
					$('#comments-list').append('<li>' + entry.content.$t + '<span>by ' + entry.author[0].name.$t + '</span></li>');
				});
			}
		});
	}
	
	/*
	 * Parses a Video Feed : JSON
	 */
	function parseVideoFeed(feed) {
		$.getJSON(feed, function(data) {
			console.log('json');
			if (data['feed']) {
				$.each(data['feed']['entry'], function(i, entry) {
					//Create video thumbs
					var $videoDiv = $('<div></div>').addClass('grid_4 video-thumbnail');
					$videoDiv.append('<img src="' + entry.media$group.media$thumbnail[0].url + '">');
					$videoDiv.append('<h5>' + entry.title.$t + '</h5>');
					$videoDiv.append('<p>by ' + entry.author[0].name.$t + '</p>');
					$videoDiv.append('<p>' + entry.yt$statistics.viewCount + ' hits</p>');
					$('#main-videos').append($videoDiv);
					
					//on thumbnail click
					$videoDiv.click(function(e) {
						displayVideo(entry.media$group.yt$videoid.$t, entry.title.$t);
					});
				});
			}
		});
	}
	
	/*
	 * Searches for a video
	 */
	function makeSearch(query) {
		//Empty container
		$('#main-videos').empty();
		
		//update title, set search result title (delete if exists)
		//remove video and comments area (if searched while watching a video)
		$('#results-text').remove();
		$('#video-display').remove();
		$('#title-search-container h1').text('Search Videos')
		.after('<p id="results-text">Search Results for "' + query + '"</p>');
		
		//display results
		parseVideoFeed('http://gdata.youtube.com/feeds/api/videos?q=' + query + '&v=2&alt=json');
	}
}

/*
 * Start on Document Ready
 */
$(document).ready(function(e) {
	var youTubeApiExample = new YouTubeAPIExample();
	youTubeApiExample.init(); 
});

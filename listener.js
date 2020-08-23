function createAudio(){
	body = document.querySelector('body');
	var audiotrack = document.createElement('div');
	audiotrack.id = 'audiotrack';
	var tracklist = []
	
	for(i=0;i<localStorage.length;i++){
		key = localStorage.key(i);
		found = localStorage.getItem(key);
		checkid = key.match(/\d+/);
		if(checkid){
			tracklist[i] = key;
		}
	}
	
	tracklist.sort((a, b) => a - b);
	tracklist.forEach(function(trackid){
		var track = JSON.parse(localStorage.getItem(trackid));
		var newaudio = document.createElement('audio');
		newaudio.id = trackid;
		newaudio.className = track.cmdname.toLowerCase();
		newaudio.controls = false;
		newaudio.hidden = true;
		newaudio.addEventListener('ended',whenAudioEnds);
		newaudio.addEventListener('pause',whenAudioPaused);
		newaudio.addEventListener('play',whenAudioPlayed);
		var newaudiosrc = document.createElement('source');
		newaudiosrc.type = "audio/mpeg"
		newaudiosrc.src = track.path;
		newaudio.appendChild(newaudiosrc);
		audiotrack.appendChild(newaudio);
	});
	body.appendChild(audiotrack);
}

createAudio();
var checkaudio = document.getElementById('audiotrack').hasChildNodes();

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	if(request && checkaudio){
		console.log('button mode activated');
		audioControl(request.cmd);
	}
	else {
		notify('No AudioTrack is present');
	}
});

if(checkaudio === true){
	var firstaudio = document.querySelector('audio').id;
	playing = localStorage.setItem('Playing',firstaudio);
	initTrack = localStorage.getItem('Playing');
	document.getElementById(initTrack).hidden = false;
	localStorage.removeItem('customPlaying');
	var rec = new webkitSpeechRecognition
	var vpatterns = [ 'play' , 'pause' , 'next', 'reload'];
	var grammar = '#JSGF V1.0; grammar vpatterns; public <vpatterns> = ' + vpatterns.join(' | ') + ' ;'
	var recList = new webkitSpeechGrammarList();
	recList.addFromString(grammar, 0);
	rec.grammars = recList;
	rec.lang = 'en-US';
	rec.continuous = true;
	rec.start();
	recognize(rec);
}
else {
	console.log('No AudioTrack is present');
	notify('No AudioTrack is present');
}


function recognize(rec){
	var transcript = "";
	rec.onresult = function(event){
		transcript = event.results[event.resultIndex]["0"].transcript;
		console.log(transcript);
		if(transcript && event.resultIndex === 0){
			rec.stop();
			var commands = {play:"play",pause:"pause",stop:"stop",previous:"previous",next:"next",reload:"reload",list:"list", loop:"loop"};
		
			if(transcript === "play"){
				audioControl(commands.play);
			}
			else if(transcript === "pause"){
				audioControl(commands.pause);
			}
			else if(transcript === "stop"){
				audioControl(commands.stop);
			}
			else if(transcript === "previous"){
				audioControl(commands.previous);
			}
			else if(transcript === "next"){
				audioControl(commands.next);
			}
			else if(transcript === "reload"){
				audioControl(commands.reload);
			}
			else if(transcript === "again"){
				audioControl(commands.loop);
			}
			else if(transcript === "list" || transcript === "playlist"){
				audioControl(commands.list);
			}
			else {
				var cmdstatus = false;
				a = document.querySelectorAll('audio');
				a.forEach(function(item){
					var aid = item.id;
					if(transcript === aid){
						cmdstatus = true;
						audioControl('play',aid);
					}
					else {
						source = item.querySelector('source').src;
						trackname = getTrackName(source);
						trackname = trackname.toLowerCase();
						transcript = transcript.toLowerCase();
						transcript = transcript.replace("'",'');
				
						if(trackname === transcript){
							cmdstatus = true;
							audioControl('play',aid);
						}
					}
				});
				
				var commandname = transcript.replace(/\s/,".");
				try {
					var custom = document.querySelectorAll('.'+commandname);
					var c = localStorage.getItem('customPlaying');
					if(custom.length !== 0){
					notify("Custom Command was : " + transcript);
					if(!c){
						localStorage.setItem('customPlaying',0);
						audioControl('play',custom.item(0).id);
					}
					else if(c){
						var next = parseInt(c)+1;
						if(custom.length !== next){
							localStorage.setItem('customPlaying',next);
							audioControl('play',custom.item(next).id);
						}
						else {
							notify('You reached the end of the custom list.');
							whenAudioEnds();
						}
					}
					cmdstatus = true;
				}
				}
				catch(e){
					notify("Custom commands name cannot contain numbers");
				}
				if(!cmdstatus && transcript !== 'halt'){
					var message = "Invalid command received : " + transcript;
					notify(message);
				}
			}
		

		
	}
		
	}

	rec.onstart = function(event){
		console.log("Listening....");
		localStorage.setItem('permission',true);
	}

	rec.onnomatch = function(event){
		console.log("No grammar match was found");
	}

	rec.onerror = function(event){
		if(event.error === "not-allowed"){
			console.log("Microphone permission is missing, refer to the options page to give the required permission");
			notify("Microphone permission is missing, refer to the options page to give the required permission");
			localStorage.setItem('permission',false);
		}
		else if(event.error === "no-speech"){
			console.log("Nothing received.");
			rec.stop();
		}
	}

	rec.onspeechend = function(event){
		console.log("Speech ended");
		rec.stop();
	}
	
	rec.onend = function(event){
		var permission = localStorage.getItem('permission');
		if(transcript !== 'halt' && permission === 'true'){
			console.log("Still running....");
			rec.start();
		}
		else if(transcript === 'halt' || permission === 'false'){
			if(transcript === 'halt'){
				console.log("I was stopped by " + transcript + " command");
				notify("I was stopped by " + transcript + " command");
			}
			else if(permission === 'false'){
				console.log("Permission is missing");
				notify("Microphone permission is missing, refer to the options page to give the required permission");
			}
		}
	}
}

function audioControl(command, aid=null){
	if(command === 'play'){
		playing = localStorage.getItem('Playing');
		if(playing && aid === null){
			a = document.getElementById(playing);
			a.play();
			src = a.querySelector('source').src;
			trackname = getTrackName(src);
			notify('Now Playing : ' + trackname);
		}
		else {
			a = document.getElementById(aid);
			p = document.getElementById(playing);
			p.pause();
			p.currentTime = 0;
			a.currentTime = 0;
			a.play();
			src = a.querySelector('source').src;
			trackname = getTrackName(src);
			notify('Now Playing : ' + trackname);
			localStorage.setItem('Playing',a.id);
		}
	}
	else if(command === 'pause'){
		playing = localStorage.getItem('Playing');
		if(playing){
			a = document.getElementById(playing);
			a.pause();
			src = a.querySelector('source').src;
			trackname = getTrackName(src);
			notify('Paused : ' + trackname);
		}
	}
	else if(command === 'stop'){
		playing = localStorage.getItem('Playing');
		if(playing){
			a = document.getElementById(playing);
			a.pause();
			src = a.querySelector('source').src;
			trackname = getTrackName(src);
			notify('Stopped : ' + trackname);
			a.currentTime = 0;
			localStorage.setItem('play',false);
			localStorage.setItem('pause',true);
		}
	}
	else if(command === 'reload'){
		playing = localStorage.getItem('Playing');
		if(playing){
			a = document.getElementById(playing);
			a.currentTime = 0;
			a.play();
			src = a.querySelector('source').src;
			trackname = getTrackName(src);
			notify('Replay : ' + trackname);
			localStorage.setItem('play',true);
			localStorage.setItem('pause',false);
		}
	}
	else if(command === 'loop'){
		playing = localStorage.getItem('Playing');
		if(playing){
			a = document.getElementById(playing);
			src = a.querySelector('source').src;
			trackname = getTrackName(src);
			
			if(!a.loop){
				a.loop = true;
				notify('Loop Enabled : ' + trackname);
			}
			else if(a.loop){
				a.loop = false;
				notify('Loop Disabled : ' + trackname);
			}
		}
	}
	else if(command === 'next'){
		a = document.querySelector('audio');
		playing = localStorage.getItem('Playing');
		currentTrack = document.getElementById(playing);
		p = currentTrack.nextElementSibling;
		
		if(p){
			currentTrack.pause();
			currentTrack.hidden = true;
			currentTrack.currentTime = 0;
			p.hidden = false;
			src = p.querySelector('source').src;
			trackname = getTrackName(src);
			notify('Next Track : ' + trackname);
			p.play();
			localStorage.setItem('Playing',p.id);
		}
		else {
			localStorage.setItem('play',false);
			localStorage.setItem('pause',true);
			notify("No tracks left use list command to list available tracks");
		}
	}
	else if(command === 'previous'){
		playing = localStorage.getItem('Playing');
		currentTrack = document.getElementById(playing);
		p = currentTrack.previousElementSibling;
		
		if(p){
			currentTrack.pause();
			currentTrack.hidden = true;
			currentTrack.currentTime = 0;
			p.hidden = false;
			p.play();
			localStorage.setItem('Playing',p.id);
			src = p.querySelector('source').src;
			trackname = getTrackName(src);
			notify('Previous Track : ' + trackname);
		}
		else {
			localStorage.setItem('play',false);
			localStorage.setItem('pause',true);
			notify("No tracks left use list command to list available tracks");
		}
	}		
	else if(command === 'list' || command === 'playlist'){
		var audiotracks = document.querySelector('#audiotrack').querySelectorAll('source');
		var tracklist = [];
		audiotracks.forEach(function(list, i){
			tracklist[i] = {};
			tracksrc = list.src;
			tracklist[i].message = getTrackName(tracksrc);
			tracklist[i].title = "Track " + list.parentElement.id;
		});
		var message = "Track List : ";
		notify(message,tracklist);
	}
}

function getTrackName(list){
	trackname = list;
	trackname = trackname.match(/.+\/(.+.mp3)/);
	trackname = trackname[1].replace(/%20/g,' ');
	trackname = trackname.replace('.mp3','');
	return trackname;
}

function notify(message, tracklist=null){
	var lastnotifyid = localStorage.getItem('notifyid');
	if(lastnotifyid){
		chrome.notifications.clear(lastnotifyid);
	}
	
	if(tracklist !== null){
		var options = {"type":"list","iconUrl":"48.png","title":"Item Info",message: message,"items":tracklist,buttons:[{title:'Full list here'}]};
		chrome.notifications.create(options, function callback(notifyid){
			localStorage.setItem('notifyid',notifyid);
		});
	}
	else {
		var options = {"type":"basic","iconUrl":"48.png","title":"Item Info",message: message};
		chrome.notifications.create(options, function callback(notifyid){
			localStorage.setItem('notifyid',notifyid);
		});
	}
}


function whenAudioEnds(e){
	console.log('Audio ended.',e);
	var s = 0;
	var interval = setInterval(function(){
		s++;
		notify('Wait ' + s);
		if(s === 3){
			clearInterval(interval);
			audioControl('next')
		}
	}, 1000);
}

function whenAudioPlayed(e){
	localStorage.setItem('play',true);
	localStorage.setItem('pause',false);
}	

function whenAudioPaused(e){
	localStorage.setItem('play',false);
	localStorage.setItem('pause',true);
}

/*
navigator.mediaDevices.enumerateDevices().then(function(devices){
	console.log(devices);
});*/

navigator.mediaDevices.ondevicechange = function(event) {
	notify("Device change detected. Switching...");
	rec.stop();
}

chrome.notifications.onButtonClicked.addListener(function callback(){
	var dst = chrome.runtime.getURL("main.html");
	chrome.tabs.create({url: dst});
});
var play = document.getElementById('play-button');
var pause = document.getElementById('pause-button');
var next = document.getElementById('next-button');

play.addEventListener('click',playAction);
pause.addEventListener('click',pauseAction);
next.addEventListener('click',nextAction);

var lastplay = localStorage.getItem('play');
var lastpause = localStorage.getItem('pause');

if(lastplay === 'true' && lastpause === 'false'){
	play.hidden = true;
	pause.hidden = false;
}
else if(lastplay === 'false' && lastpause === 'true'){
	play.hidden = false;
	pause.hidden = true;
}
	
function playAction(){
	play.hidden = true;
	pause.hidden = false;
	localStorage.setItem('play',true);
	localStorage.setItem('pause',false);
	chrome.runtime.sendMessage({cmd: 'play'});
}

function pauseAction(){
	play.hidden = false;
	pause.hidden = true;
	localStorage.setItem('play',false);
	localStorage.setItem('pause',true);
	chrome.runtime.sendMessage({cmd: 'pause'});
}

function nextAction(){
	chrome.runtime.sendMessage({cmd: 'next'});
}
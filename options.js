function DoOnEvent(action)
{	
	function getTabs(tab)
	{
		for(i=0;i<tab.length;i++)
		{
			url = tab[i].url.match("youtube.com/watch");
			
			if(url)
			{
				chrome.tabs.executeScript(tab[i].id, action);
				tabId = tab[i].id;
				
				chrome.tabs.onUpdated.addListener(function (tabId , info, ctab) {	
					if (info.title != undefined) {
						console.log(ctab.url,tabId);
						curl = ctab.url.match("youtube.com/watch");
						if(curl)
						{
							var options = {"type":"basic","iconUrl":"48p.png","title":"Now Playing","message":info.title};
							chrome.notifications.create(options);
						}
					}
				});
			}
		}
	}
	var queryInfo = {};
	chrome.tabs.query(queryInfo,getTabs);
}

function toggleButton() {
	elem = document.getElementById('play-pause');
	var isPaused = {"file":"ispaused.js"};
	var play = {"file":"play.js"};
	DoOnEvent(isPaused);
	src = elem.src.match(/play.png/);
	
	if(src) {
		elem.src = "pause.png";
		DoOnEvent(play);
	}
	else if(!src) {
		elem.src = "play.png";
		DoOnEvent(play);
	}
}

function onNext(){
	var next = {"file":"next.js"};
	DoOnEvent(next);
}

 document.getElementById("control-button").addEventListener("click", askPermission);
 document.getElementById("next-button").addEventListener("click", onNext);
 
var rec = new webkitSpeechRecognition

var vpatterns = [ 'play' , 'pause' , 'next', 'reload'];
var grammar = '#JSGF V1.0; grammar vpatterns; public <vpatterns> = ' + vpatterns.join(' | ') + ' ;'
var recList = new webkitSpeechGrammarList();
recList.addFromString(grammar, 0);
rec.grammars = recList;
rec.lang = 'en-US';

function askPermission(){
	navigator.mediaDevices.getUserMedia({audio:true});
}

var promise = navigator.mediaDevices.getUserMedia({audio:true})
promise.then(function(res){
		rec.start();
		recognize();
	}).catch(function(e){
		console.log('error not allowed',e)
	})


function recognize(){

rec.onresult = function(event){
	transcript = event.results["0"]["0"].transcript;
	
	function notify(){
		var options = {"type":"basic","iconUrl":"48.png","title":"Item Info","message":"command received was " + transcript};
		chrome.notifications.create(options);
	}
	
	if(transcript){
		console.log(transcript);
		
		var play = {"file":"play.js"};
		var next = {"file":"next.js"};
		var reload = {"file":"reload.js"};
		
		if(transcript === "play"){
			DoOnEvent(play);
			notify();
		}
		else if(transcript === "next"){
			DoOnEvent(next);
			notify();
		}
		else if(transcript === "again"){
			DoOnEvent(reload);
			notify();
		}
		else if(transcript === "more"){
			console.log("started again",transcript);
			rec.start();
		}
		else {
			notify();
		}
		
		rec.onend = function(event){
			if(transcript !== 'stop'){
				console.log("Still running....");
				rec.start();
			}
			else {
				console.log("I was stopped by " + transcript + "command");
				var options = {"type":"basic","iconUrl":"48.png","title":"Item Info","message":"I was stopped by " + transcript + " command"};
				chrome.notifications.create(options);
			}
		}
		
	}
		
}

rec.onstart = function(event){
	console.log("I am listening....");
}

rec.onnomatch = function(event){
	console.log("What you were saying, I didn't understand");
}

rec.onerror = function(event){
	console.log("I can't hear anything");
}

rec.onspeechend = function(event){
	console.log("Speech ends");
}

}
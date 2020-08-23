document.getElementById('audiofile').addEventListener("change", audioAdd);
document.getElementById('save-path').addEventListener("click", newPath);

var cpath = localStorage.getItem('audiopath');
if(cpath){
	document.getElementById('cpath').innerText = cpath;
	var initpath = cpath;
}
else {
	var defaultpath = 'C:\\Users\\Public\\Music';
	document.getElementById('cpath').innerText = defaultpath;
	var initpath = defaultpath;
}

function newPath(){
	var vpath = document.getElementById('path').value;
	if(vpath !== ''){
		document.getElementById('cpath').innerText = vpath;
		localStorage.setItem('audiopath',vpath);
	}
	else if(!initpath){
		vpath = 'C:\\Users\\Public\\Music';
		document.getElementById('cpath').innerText = vpath;
		localStorage.setItem('audiopath',vpath);
	}
}

getPlayList();

var promise = navigator.mediaDevices.getUserMedia({audio:true})	

promise.then(function(res){
	console.log('permission given');
}).catch(function(e){
	console.log('no permission was given',e);
})

function getPlayList(e){
	for(i=0;i<localStorage.length;i++){
		key = localStorage.key(i);
		found = localStorage.getItem(key);
		checkid = key.match(/\d+/);
		if(checkid){
			var entry = JSON.parse(localStorage.getItem(key));
			var name = entry.cmdname;
			var v = entry.cmdtype;
			var trackname = entry.trackname;
			var id = 'audio-table';
			trackname = trackname.replace('.mp3','');
			newTableElement(name, v, trackname, id, key);
		}
	}
}

function audioAdd(e){
	var trackname = e.path[0].files[0].name;
	var path = initpath + trackname;
	var id = 'audio-table';
	var trackids = [];
	
	var name = document.getElementById('cmd-name').value;
	var checkinput = document.getElementById('cmd-name').validity.valid;
	var s = document.getElementById('cmd-options');
	var v = s.querySelector("option[value="+s.value+"]").label;
	
	if(checkinput){
		var cmdname = document.getElementById('cmd-name');
		cmdname.style = "border-color: initial";
		
		for(i=0;i<localStorage.length;i++){
			key = localStorage.key(i);
			found = localStorage.getItem(key);
			checkid = key.match(/\d+/);
			if(checkid){
				trackids[i] = key;
			}
		}
		if(trackids.length === 0){
			console.log('No id found');
			localStorage.setItem(1, JSON.stringify({cmdname:name, cmdtype: v, trackname: trackname, path:initpath+'\\'+trackname}));
			newTableElement(name, v, trackname, id, 1);
		}
		else if(trackids.length > 0){
			console.log("tracks found : ",trackids);
			trackid = parseInt(trackids[trackids.length-1]) + 1;
			localStorage.setItem(trackid, JSON.stringify({cmdname:name, cmdtype: v, trackname: trackname, path:initpath+'\\'+trackname}));
			newTableElement(name, v, trackname, id, trackid);
		}
	}
	else {
		var cmdname = document.getElementById('cmd-name');
		cmdname.style = "border-color: red";
		console.log("Command field is required");
	}
}

function addCmd(e){
	var trackname = e.path[0].files[0].name;
	var id = 'audio-table'
	var name = document.getElementById('cmd-name').value;
	var s = document.getElementById('cmd-options');
	var v = s.querySelector("option[value="+s.value+"]").label;
	newTableElement(name, v, trackname, id);
	console.log("cmd added",name);
}


function createAudio(e){
	console.log(e,this.files,this.value);
}

function removeCmd(e){
	t = document.querySelector('#audio-table');
	tbody = e.target.parentElement.parentElement.parentElement;
	confirmation = confirm("Are you sure you want to delete this command ?");
	
	if(confirmation){
		localStorage.removeItem(e.target.className);
		localStorage.removeItem(e.target.id);
		t.removeChild(tbody);
	}
}

function newTableElement(name, desc, tname, id, trackid){
	table = document.getElementById(id);
	tbody = document.createElement('tbody');
	tr = document.createElement('tr');
	tdname = document.createElement('td');
	nametxt = document.createTextNode(name);
	btn = document.createElement('button');
	btn.className = name;
	btn.id = trackid;
	btn.onclick = removeCmd;
	btn.style = "border:none;background-color:inherit";
	btn.appendChild(nametxt);
	tdname.appendChild(btn);
	tddesc = document.createElement('td');
	desctxt = document.createTextNode(desc);
	tddesc.appendChild(desctxt);
	tdtname = document.createElement('td');
	tnametxt = document.createTextNode(tname);
	tdtname.appendChild(tnametxt);
	
	tr.appendChild(tdname);
	tr.appendChild(tddesc);
	tr.appendChild(tdtname);
	
	tbody.appendChild(tr);
	e = document.getElementById('new-cmd');
	table.insertBefore(tbody, e);
}
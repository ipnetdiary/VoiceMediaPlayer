# VoiceMediaPlayer
Chrome extension to create and use voice commands to play audio. It leverages the WebSpeechAPI

The extension is available for download here: https://chrome.google.com/webstore/detail/voice-controlled-media-pl/mmmjpjajlahpmdadaigpcjdanhbjmlma

Once installed, you will need to right click on it and go to the Options page, skip the dummy login page by clicking Submit. After that, allow microphone access for the extension.

Then, start to configure the URLs from which you will retrieve your audio files. For local files, you will need to allow the extension to access local files in order for it to work.

In the options page, you will have to create the voice command you will use. Only English language is supported in this version, but this can be changed in the source file if needed. Just look for this line in the listener file "rec.lang = 'en-US'" change it to any of the supported language by the WebSpeechAPI, check the langs file for the list.

Once the extension is configured, just restart it and start using the commands you create to play your audio files.

It is preferable to use an external mic or a headset with mic integrated to get better results. 

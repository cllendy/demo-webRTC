const GUI = {
  divVideo: document.querySelector('#selfVideo'),
  buttonStart: document.querySelector('#startCall'),
  buttonAudio: document.querySelector('#stopAudio'),
  buttonVideo: document.querySelector('#stopVideo')
};

const optionCall = {
  audio: true,
  video: true
};

function toogleOptionCall(option) {
  optionCall[option] = !optionCall[option];
}

GUI.buttonAudio.addEventListener('click', () => {
  toogleOptionCall('audio');
  GUI.buttonAudio.classList.toggle('on');
  //Por si todavia no le ha dado a llamar y no ha configurado la variable
  if (window.localStream)
    localStream.getAudioTracks()[0].enabled = optionCall.audio;
});

GUI.buttonVideo.addEventListener('click', () => {
  toogleOptionCall('video');
  GUI.buttonVideo.classList.toggle('on');
  //Por si todavia no le ha dado a llamar y no ha configurado la variable
  if (window.localStream)
    localStream.getVideoTracks()[0].enabled = optionCall.video;
});

GUI.buttonStart.addEventListener('click', () => {
  navigator.mediaDevices
    //Lo pongo asi en vez de pasarle el optionCall que seria lo mismo porque asi es
    //mas facil para despues ponerlo si no habria que comprobar todo el rato si tiene o no el track de audio/video
    .getUserMedia({
      audio: true,
      video: true
    })
    .then(stream => {
      // localStream puede se cualquier variable no es que tenga que ser esa
      window.localStream = stream;

      //Poner el video en el la pagina
      GUI.divVideo.srcObject = stream;

      //Silenciar el video si lo tiene antes de la llamada
      localStream.getAudioTracks()[0].enabled = optionCall.audio;
      //Quitar el video si lo tiene antes de la llamada
      localStream.getVideoTracks()[0].enabled = optionCall.video;
    })
    .catch(err => {
      console.log(err);
    });
});

const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const time = document.getElementById("time");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

let volumeValue = 0.5;
video.volume = volumeValue;
let timeoutId = null;

const formatTime = (seconds) => {
  return new Date(seconds * 1000).toISOString().substr(11, 8);
};

const handlePlayClick = (e) => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtn.innerText = video.paused ? "Play" : "Pause";
};

const handleMute = (e) => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteBtn.innerText = video.muted ? "Unmute" : "Mute";
  volumeRange.value = video.muted ? 0 : volumeValue;
};

const handleVolumeInput = (e) => {
  const changedValue = e.target.value;
  if (video.muted) {
    video.muted = false;
    muteBtn.innerText = "Mute";
  }
  volumeValue = changedValue;
  video.volume = changedValue;
};

const handleVideoLoadedmetadata = () => {
  totalTime.innerText = formatTime(video.duration);
  timeline.max = Math.floor(video.duration);
};

const handletVideoTimeupdate = () => {
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime);
};

const handleTimelineInput = (e) => {
  const changedTime = e.target.value;
  video.currentTime = Math.floor(changedTime);
};

const handleFullscreenClick = () => {
  const fullscreenElement = document.fullscreenElement;
  if (fullscreenElement) {
    document.exitFullscreen();
    fullscreenBtn.innerText = "Enter Fullscreen";
  } else {
    videoContainer.requestFullscreen();
    fullscreenBtn.innerText = "Exit Fullscreen";
  }
};

const handleMouseEnter = () => {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
  videoControls.classList.add("showing");
};

const handleMouseLeave = () => {
  timeoutId = setTimeout(() => {
    videoControls.classList.remove("showing");
  }, 1000);
};

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolumeInput);
video.addEventListener("timeupdate", handletVideoTimeupdate);
video.addEventListener("loadedmetadata", handleVideoLoadedmetadata);
timeline.addEventListener("input", handleTimelineInput);
fullscreenBtn.addEventListener("click", handleFullscreenClick);
video.addEventListener("mouseenter", handleMouseEnter);
video.addEventListener("mouseleave", handleMouseLeave);

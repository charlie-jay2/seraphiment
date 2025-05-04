// Custom Video Player Controls
const playPauseButton = document.getElementById("play-pause");
const muteButton = document.getElementById("mute-unmute");
const fullscreenButton = document.getElementById("fullscreen");
const progressBar = document.getElementById("progress-bar");
const videoCanvas = document.getElementById("video-canvas");
const posterImage = document.getElementById("poster-image");

let videoPlaying = false;
let videoMuted = false;
let videoCanvasContext = videoCanvas.getContext("2d");

// Sample video data for the mock video
const videoFrames = ["frame1.jpg", "frame2.jpg", "frame3.jpg"]; // Array of frames for simplicity
let currentFrame = 0;

// Function to simulate video playback
function playVideo() {
  videoPlaying = true;
  playPauseButton.innerHTML = ` 
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-pause" viewBox="0 0 16 16">
            <path d="M5.5 0a.5.5 0 0 1 .5.5v15a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5V.5A.5.5 0 0 1 3.5 0h2zM10.5 0a.5.5 0 0 1 .5.5v15a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5V.5A.5.5 0 0 1 8.5 0h2z"/>
        </svg>
    `;
  posterImage.style.display = "none";
  simulatePlayback();
}

// Function to simulate video playback by updating the canvas
function simulatePlayback() {
  if (videoPlaying) {
    currentFrame = (currentFrame + 1) % videoFrames.length;
    const frame = new Image();
    frame.onload = function () {
      videoCanvasContext.clearRect(0, 0, videoCanvas.width, videoCanvas.height);
      videoCanvasContext.drawImage(
        frame,
        0,
        0,
        videoCanvas.width,
        videoCanvas.height
      );
    };
    frame.src = videoFrames[currentFrame];
    setTimeout(simulatePlayback, 1000 / 30); // Simulate 30 FPS
  }
}

// Play/Pause Button
playPauseButton.addEventListener("click", () => {
  if (videoPlaying) {
    videoPlaying = false;
    playPauseButton.innerHTML = ` 
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-play" viewBox="0 0 16 16">
                <path d="M3.5 1.5a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-.774.433l-8-6a.5.5 0 0 1 0-.866l8-6A.5.5 0 0 1 3.5 1.5z"/>
            </svg>
        `;
  } else {
    playVideo();
  }
});

// Mute/Unmute Button
muteButton.addEventListener("click", () => {
  videoMuted = !videoMuted;
  muteButton.innerHTML = videoMuted
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-volume-off" viewBox="0 0 16 16">
            <path d="M5.536 2.536a1 1 0 0 1 1.415 0L9 5.586l3.036-3.05a1 1 0 0 1 1.414 1.414l-3.036 3.05 3.036 3.05a1 1 0 0 1-1.414 1.414l-3.036-3.05-3.036 3.05a1 1 0 0 1-1.415-1.414l3.036-3.05-3.036-3.05a1 1 0 0 1 0-1.414z"/>
        </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-volume-up" viewBox="0 0 16 16">
            <path d="M11.536 2.536a1 1 0 0 1 1.415 0l3.05 3.036a1 1 0 0 1 0 1.414l-3.05 3.036a1 1 0 0 1-1.414-1.414l1.221-1.22a3.14 3.14 0 0 0-1.04-3.586L12.07 4.686a.5.5 0 0 1-.707 0l-.708-.707a.5.5 0 0 1 0-.707L9.32 2.5a3.14 3.14 0 0 0-3.586 1.04l-1.221-1.22a1 1 0 0 1 1.414-1.414l3.05 3.036A.5.5 0 0 1 6 5.5V9.5a3.14 3.14 0 0 0 3.586 3.586l1.22 1.22a1 1 0 0 1 0 1.414l3.05-3.036a1 1 0 0 1 0-1.414L11.536 2.536z"/>
        </svg>`;
});

// Fullscreen Button
fullscreenButton.addEventListener("click", () => {
  const player = document.getElementById("custom-video-player");
  if (player.requestFullscreen) {
    player.requestFullscreen();
  } else if (player.mozRequestFullScreen) {
    // Firefox
    player.mozRequestFullScreen();
  } else if (player.webkitRequestFullscreen) {
    // Chrome, Safari, Opera
    player.webkitRequestFullscreen();
  }
});

// Progress Bar Update
setInterval(() => {
  const progress = (currentFrame / videoFrames.length) * 100;
  progressBar.value = progress;
}, 100);

// Fetch show data and populate series and episodes
function fetchShows() {
  fetch("show.json")
    .then((response) => response.json())
    .then((data) => {
      const seriesButtonsContainer = document.getElementById("series-buttons");
      const episodeButtonsContainer =
        document.getElementById("episode-buttons");
      let currentSeries = data.series; // Default series
      let currentEpisode = 1; // Default episode

      // Create Series Buttons (currently only 1 series)
      for (let i = 1; i <= data.series; i++) {
        const seriesButton = document.createElement("button");
        seriesButton.classList.add("btn", "btn-primary");
        seriesButton.innerText = `Series ${i}`;
        seriesButton.onclick = () => loadEpisodes(i);
        seriesButtonsContainer.appendChild(seriesButton);
      }

      // Load Episodes for the selected series
      function loadEpisodes(series) {
        // Clear existing episode buttons
        episodeButtonsContainer.innerHTML = "";

        // Load episodes for the selected series
        const episodes = data.episodes;
        for (let episodeId in episodes) {
          const episode = episodes[episodeId];
          const episodeButton = document.createElement("button");
          episodeButton.classList.add("btn", "btn-secondary");
          episodeButton.innerText = `Episode ${episodeId}: ${episode.name}`;
          episodeButton.onclick = () => loadEpisode(episodeId);
          episodeButtonsContainer.appendChild(episodeButton);
        }
      }

      // Load a specific episode
      function loadEpisode(episodeId) {
        const episode = data.episodes[episodeId];
        console.log(
          `Loading Episode ${episodeId}: ${episode.name} (File: ${episode.file})`
        );
        // Here you can add functionality to load and play the episode, based on the `episode.file` data
      }

      // Initialize with the first series and episode
      loadEpisodes(currentSeries);
    })
    .catch((error) => {
      console.error("Error loading show data:", error);
    });
}

// Call the function to fetch shows data
fetchShows();

const mainContainer = document.getElementById("mainContainer");
const videoPlayer = document.getElementById("videoPlayer");
const fixationCross = document.getElementById("fixationCross");
const message = document.getElementById("message");
const buttonsContainer = document.getElementById("buttonsContainer");

const videos = [
    { id: "positive1", src: "positive1.mp4", type: "positive" },
    //{ id: "positive2", src: "positive2.mp4", type: "positive" },
    //{ id: "positive3", src: "positive3.mp4", type: "positive" },
    { id: "negative1", src: "negative1.mp4", type: "negative" },
    //{ id: "negative2", src: "negative2.mp4", type: "negative" },
    //{ id: "negative3", src: "negative3.mp4", type: "negative" },
];

let participantChoices = [];
let startTime; 

function startTimer() {  // Function to start the timer when buttons appear
    startTime = performance.now();
}

const feedbackContainer = document.getElementById("feedbackContainer");

function createFeedbackForm(videoId, onSubmit) {
    feedbackContainer.innerHTML = '';

    const question = document.createElement("p");
    question.textContent = "How interesting did you find this video?";

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = 0;
    slider.max = 7;
    slider.value = 3;

    const button = document.createElement("button");
    button.innerText = "Submit";
    button.onclick = () => {
        const rating = slider.value;
        onSubmit(rating);
    };

    feedbackContainer.appendChild(question);
    feedbackContainer.appendChild(slider);
    feedbackContainer.appendChild(button);
    feedbackContainer.style.display = "block";
}


function createEmotionGraph(videoId, onSubmit) {
    const emotionGraphContainer = document.getElementById('emotionGraphContainer');
    const emotionSubmit = document.getElementById('emotionSubmit');
    const emotionGraph = document.getElementById('emotionGraph');

    // Clear any existing dots from the graph
    const existingDots = emotionGraph.getElementsByClassName('emotion-dot');
    while (existingDots[0]) {
        existingDots[0].parentNode.removeChild(existingDots[0]);
    }

    // Create the dot and add it to the SVG
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("cx", 200);
    dot.setAttribute("cy", 200);
    dot.setAttribute("r", 10);
    dot.setAttribute("fill", "red");
    dot.setAttribute("class", "emotion-dot");
    emotionGraph.appendChild(dot);

    // Dragging state
    let dragging = false;

    const startDragging = (e) => {
        dragging = true;
    };

    const stopDragging = (e) => {
        dragging = false;
    };

    const dragDot = (e) => {
        if (dragging) {
            let x = e.offsetX;
            let y = e.offsetY;

            // Boundaries for SVG (400 x 400)
            if (x < 0) x = 0;
            if (x > 400) x = 400;
            if (y < 0) y = 0;
            if (y > 400) y = 400;

            dot.setAttribute("cx", x);
            dot.setAttribute("cy", y);
        }
    };

    emotionGraph.addEventListener('mousedown', startDragging);
    emotionGraph.addEventListener('mousemove', dragDot);
    emotionGraph.addEventListener('mouseup', stopDragging);
    emotionGraph.addEventListener('mouseleave', stopDragging);

    // Handle submit button click
    emotionSubmit.onclick = () => {
        emotionGraphContainer.style.display = "none";
        const valence = dot.getAttribute("cx");
        const arousal = 400 - dot.getAttribute("cy"); // Subtract from 400 because SVG Y-axis goes from top to bottom

        onSubmit(valence, arousal);
    };

    emotionGraphContainer.style.display = "block";
}





function startPart1() {
    const shuffledVideos = shuffleArray([...videos]);
    let currentVideoIndex = 0;

    function playNextVideo() {
        if (currentVideoIndex < shuffledVideos.length) {
            const video = shuffledVideos[currentVideoIndex];
            videoPlayer.src = video.src;
            videoPlayer.style.display = "block";
            videoPlayer.onended = () => {
                videoPlayer.style.display = "none";
                clearButtons();

                createFeedbackForm(video.id, (rating) => {
                    feedbackContainer.style.display = "none";
                    createEmotionGraph(video.id, (valence, arousal) => {
                        showFixationCross(playNextVideo);

                        // Consolidate data into one object and add it to the participantChoices array
                        participantChoices.push({
                            part: "Practice",
                            videoId: video.id,
                            rating: rating,
                            valence: valence, 
                            arousal: arousal
                        });
                    });
                });
            };

            const playButton = createButton("Play", (reactionTime) => {
                playButton.style.display = "none";
                videoPlayer.play();
                
                // Store the reaction time temporarily, to be added to the data object later
                video.reactionTime = reactionTime;

                currentVideoIndex++;
            });

            clearButtons();
            addButton(playButton);
        } else {
            showMessage("");
            startPart2();
        }
    }

    playNextVideo();
}




function startPart2() {
    showMessage("You have finished the first exercise. Press 'Next' to move on to the next one.");
    clearButtons();
    addButton(createButton("Next", () => {
        showMessage("");
        startPart3();
    }));
}


function playRandomVideo(excludeVideoId, videos) {
    let remainingVideos = videos.filter(video => video.id !== excludeVideoId);
    let randomVideoIndex = Math.floor(Math.random() * remainingVideos.length);
    return remainingVideos[randomVideoIndex];
}


function startPart3() {
    const shuffledVideos = shuffleArray([...videos]);
    let currentVideoIndex = 0;

    function playNextVideo() {
        if (currentVideoIndex < shuffledVideos.length) {
            const video = shuffledVideos[currentVideoIndex];
            videoPlayer.src = video.src;
            videoPlayer.style.display = "block";

            const watchButton = createButton("Watch this video", (reactionTime) => {
                watchButton.style.display = "none";
                skipButton.style.display = "none";
                videoPlayer.play();
                videoPlayer.onended = () => {
                    videoPlayer.style.display = "none";
                    clearButtons();

                    createFeedbackForm(video.id, (rating) => {
                        feedbackContainer.style.display = "none";
                        createEmotionGraph(video.id, (valence, arousal) => {
                            showFixationCross(playNextVideo);

                            participantChoices.push({
                                part: "Experimental_Choice",
                                decision: "watch",
                                videoId: video.id,
                                reactionTime: reactionTime,
                                rating: rating,
                                valence: valence, 
                                arousal: arousal
                            });
                        });
                    });
                };
                currentVideoIndex++;
            });

            const skipButton = createButton("Skip this video", (reactionTime) => {
                watchButton.style.display = "none";
                skipButton.style.display = "none";
                const randomVideo = playRandomVideo(video.id, videos);
                videoPlayer.src = randomVideo.src;
                videoPlayer.play();

                videoPlayer.onended = () => {
                    videoPlayer.style.display = "none";
                    clearButtons();

                    createFeedbackForm(video.id, (rating) => {
                        feedbackContainer.style.display = "none";
                        createEmotionGraph(video.id, (valence, arousal) => {
                            showFixationCross(playNextVideo);

                            participantChoices.push({
                                part: "Experimental_Choice",
                                decision: "skip",
                                videoId: video.id,
                                reactionTime: reactionTime,
                                forcedVideoId: randomVideo.id,
                                rating: rating,
                                valence: valence, 
                                arousal: arousal
                            });
                        });
                    });
                };
                currentVideoIndex++;
            });

            clearButtons();
            addButton(watchButton);
            addButton(skipButton);

            startTimer();
        } else {
            startPart4();
        }
    }

    playNextVideo();
}



function startPart4() {
    showMessage("You have finished the second exercise. Now you will move on to the last one.");
    clearButtons();
	addButton(createButton("Next", () => {
        showMessage("");
	startPart5();
	}));
}
	


function startPart5() {
    const watchRewardsAll = ["+1", "-1"];
    const skipRewardsAll = ["+1", "-1"];
    let videoRewardPairs = [];

    for (let video of videos) {
        for (let wr of watchRewardsAll) {
            for (let sr of skipRewardsAll) {
                videoRewardPairs.push({ video, rewards: [{type: 'watch', value: wr}, {type: 'skip', value: sr}] });
            }
        }
    }

    videoRewardPairs = shuffleArray(videoRewardPairs);

    let currentPairIndex = 0;

    function playNextVideo() {
        if (currentPairIndex < videoRewardPairs.length) {
            const { video, rewards } = videoRewardPairs[currentPairIndex];
            const watchReward = rewards.find(reward => reward.type === 'watch');
            const skipReward = rewards.find(reward => reward.type === 'skip');

            const rewardOnWatch = Math.random() < 0.5;  // Decide randomly if reward is on watch or skip button

            videoPlayer.src = video.src;
            videoPlayer.style.display = "block";

            const watchButtonText = rewardOnWatch ? `Watch this video (${watchReward.value})` : `Watch this video`;
            const watchButton = createButton(watchButtonText, getButtonCallback(video, watchReward, 'watch', rewardOnWatch));

            const skipButtonText = !rewardOnWatch ? `Skip this video (${skipReward.value})` : `Skip this video`;
            const skipButton = createButton(skipButtonText, getButtonCallback(video, skipReward, 'skip', !rewardOnWatch));

            clearButtons();
            addButton(watchButton);
            addButton(skipButton);
            startTimer();

            currentPairIndex++;
        } else {
            startPart6();
        }
    }

    function getButtonCallback(video, reward, buttonType, rewardOnButton) {
        return (reactionTime) => {
            buttonsContainer.style.display = "none";  // hide buttons
            let randomVideo;

            const processEndOfVideo = () => {
                videoPlayer.style.display = "none";
                buttonsContainer.style.display = "";  // show buttons again
                clearButtons();

                createFeedbackForm(video.id, (rating) => {
                    feedbackContainer.style.display = "none";

                    createEmotionGraph(video.id, (valence, arousal) => {
                        showFixationCross(playNextVideo);

                        participantChoices.push({
                            part: "Experimental_Reward",
                            decision: reward.type,
                            videoId: video.id,
                            reactionTime: reactionTime,
                            forcedVideoId: reward.type === 'skip' ? randomVideo.id : undefined,
                            reward: reward.value,
                            rewardButton: rewardOnButton ? buttonType : (buttonType === 'watch' ? 'skip' : 'watch'),
                            rating: rating,
                            valence: valence, 
                            arousal: arousal
                        });
                    });
                });
            };

            if (reward.type === 'watch') {
                videoPlayer.play();
                videoPlayer.onended = processEndOfVideo;
            } else {
                randomVideo = playRandomVideo(video.id, videos);
                videoPlayer.src = randomVideo.src;
                videoPlayer.play();
                videoPlayer.onended = processEndOfVideo;
            }
        };
    }

    playNextVideo();
}


function startPart6() {
    showMessage("Congratulations! You have completed this study :)");
    clearButtons();
	generateCSV(participantChoices);
	
}

function showMessage(text) {
    message.innerText = text;
    message.style.display = "block";
}

function createButton(text, onClick) {
    const button = document.createElement("button");
    button.innerText = text;
    button.onclick = () => {
        const reactionTime = performance.now() - startTime;
        onClick(reactionTime);
    };
    return button;
}

function addButton(button) {
    buttonsContainer.appendChild(button);
    startTimer(); 
}

function clearButtons() {
    buttonsContainer.innerHTML = "";
}

function showFixationCross(callback) {
    fixationCross.style.display = "block";
    setTimeout(() => {
        fixationCross.style.display = "none";
        callback();
    }, 1500);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


const axios = require('axios');

async function generateAndUploadCSV(participantChoices) {
  const header = ["part", "decision", "videoId", "reactionTime", "forcedVideoId", "reward", "rewardButton", "rating", "valence", "arousal"];
  const csvRows = [header];

  for (const row of participantChoices) {
    const rowData = [
      row.part,
      row.decision,
      row.videoId,
      row.reactionTime,
      row.forcedVideoId || "",
      row.reward || "",
      row.rewardButton || "",
      row.rating || "",
      row.valence || "",
      row.arousal || "",
    ];
    csvRows.push(rowData);
  }

  const csvContent = csvRows.map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  
  // Upload to Dropbox
  const accessToken = 'sl.Be4-dVaqS29c9ZFPFPrraWuTAie1zTm6llKJaRjR2_aLXiRi4ivsVZkbkKK906f8mvu3wU19vHAqVbWjCROVcw--a19vHGjurcQ4CWtwKCHjCx0fahhSpOOCWEgsiR3nANzqze4';
  const uploadUrl = 'https://content.dropboxapi.com/2/files/upload';
  const filePath = '/participant_choices.csv';

  const headers = {
    'Authorization': 'Bearer ' + accessToken,
    'Content-Type': 'application/octet-stream',
    'Dropbox-API-Arg': JSON.stringify({
      path: filePath,
      mode: 'add',
      autorename: true,
      mute: false
    })
  };

  try {
    const response = await axios.post(uploadUrl, blob, { headers });
    console.log('File uploaded successfully:', response.data);
  } catch (error) {
    console.error('Error uploading file:', error.response.data);
  }
}


startPart1();       
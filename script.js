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
let startTime;  // New: Global variable to keep track of the time when buttons appear

function startTimer() {  // New: Function to start the timer when buttons appear
    startTime = performance.now();
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
                showFixationCross(playNextVideo);
            };

            const playButton = createButton("Play", (reactionTime) => {  // Adjusted: added reactionTime parameter
                playButton.style.display = "none";
                videoPlayer.play();
                participantChoices.push({
                    part: "Practice",
                    videoId: video.id,
                    reactionTime: reactionTime,
                });
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

            const watchButton = createButton("Watch this video", (reactionTime) => { // Adjusted: added reactionTime parameter
                watchButton.style.display = "none";
                skipButton.style.display = "none";
                videoPlayer.play();
                videoPlayer.onended = () => {
                    videoPlayer.style.display = "none";
                    clearButtons();
                    showFixationCross(playNextVideo);
                };
                participantChoices.push({
                    part: "Part3",
                    decision: "watch",
                    videoId: video.id,
                    reactionTime: reactionTime,
                });
                currentVideoIndex++;
            });

            const skipButton = createButton("Skip this video", (reactionTime) => { // Adjusted: added reactionTime parameter
                watchButton.style.display = "none";
                skipButton.style.display = "none";
                const randomVideo = playRandomVideo(video.id, videos);
                videoPlayer.src = randomVideo.src;
                videoPlayer.play();
                videoPlayer.onended = () => {
                    videoPlayer.style.display = "none";
                    clearButtons();
                    showFixationCross(playNextVideo);
                };
                participantChoices.push({
                    part: "Experimental_Choice",
                    decision: "skip",
                    videoId: video.id,
                    reactionTime: reactionTime,
                    forcedVideoId: randomVideo.id,
                });
                currentVideoIndex++;
            });

            clearButtons();
            addButton(watchButton);
            addButton(skipButton);

            startTimer();  // Start the timer after all buttons are added
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

            // Decide randomly if reward is on watch or skip button
            const rewardOnWatch = Math.random() < 0.5;

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
        let randomVideo;
        buttonsContainer.style.display = "none";  // hide buttons

 if (reward.type === 'watch') {
            videoPlayer.play();
            videoPlayer.onended = () => {
                videoPlayer.style.display = "none";
                buttonsContainer.style.display = "";  // show buttons again
                clearButtons();
                showFixationCross(playNextVideo);
            };
        } else {
            randomVideo = playRandomVideo(video.id, videos);
            videoPlayer.src = randomVideo.src;
            videoPlayer.play();
            videoPlayer.onended = () => {
                videoPlayer.style.display = "none";
                buttonsContainer.style.display = "";  // show buttons again
                clearButtons();
                showFixationCross(playNextVideo);
            };
        }


        participantChoices.push({
            part: "Experimental_Reward",
            decision: reward.type,
            videoId: video.id,
            reactionTime: reactionTime,
            forcedVideoId: reward.type === 'skip' ? randomVideo.id : undefined,
            reward: reward.value,  // Always record the reward value
            rewardButton: rewardOnButton ? buttonType : (buttonType === 'watch' ? 'skip' : 'watch'),
        });
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

// Update addButton function:
function addButton(button) {
    buttonsContainer.appendChild(button);
    startTimer(); // Start the timer when a button is added
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


function generateCSV(participantChoices) {
    const header = ["part", "decision", "videoId", "reactionTime", "forcedVideoId", "reward", "rewardButton"];
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
        ];
        csvRows.push(rowData);
    }

    const csvContent = csvRows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "participant_choices.csv");
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


startPart1();       
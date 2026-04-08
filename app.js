const noSleep = new NoSleep();

function speakAndWait(text, waitSeconds) {
    speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    return new Promise(resolve => setTimeout(resolve, waitSeconds * 1000));
}

async function runExercise(routine) {
    try {
        await noSleep.enable();
        for (const [text, wait] of routine) {
            await speakAndWait(text, wait);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error starting exercise: ' + error.message);
    } finally {
        noSleep.disable();
    }
}

function startEyeExercise() {
    runExercise([
        ['Welcome dear! We will start eyes exercise now. This will last just 9 minutes. Sit comfortably and get in position', 25],
        ['We will start with rolling the eyes gently for 1.5 minute', 95],
        ['Perfect! The rolling is complete now. Relax!', 15],
        ['Now, Gently massage your eyes sockets for 1.5 minute.', 95],
        ['Perfect! The massage is complete now. Relax!', 15],
        ['Now, pin your acupressure points for 2 minutes', 125],
        ['Perfect! The acupressure is complete now. Relax!', 15],
        ['Awesome So far! Now focus adjustment for near and far points for 3 minutes. Starting now!', 127],
        ['Great! Relax now', 10],
        ['continue for another 1 minutes', 65],
        ['Terrific Work! we have completed all eye exercises. See you again!', 0],
    ]);
}

function startBellyExercise() {
    runExercise([
        ['Welcome dear! We will start belly exercise now. This will last just 8 minutes. Take your time to get in position. We will start in 10 seconds', 20],
        ['Are you ready now!', 5],
        ['Lets start standing knee raises for 2 minutes. Starting now!', 125],
        ['Great! Relax now for 10 seconds', 12],
        ['Lets start standing side bends for 2 minutes. Starting now!', 125],
        ['Great! Relax now for 10 seconds', 12],
        ['Lets start standing twists for 2 minutes. Starting now!', 125],
        ['Terrific Work! we have completed jumping exercise. See you again!', 0],
        ['You can do additionally Glute Bridges, Modified Plank and Dead Bug Exercise',o],
        
    ]);
}

function startYog() {
    runExercise([
        ['Welcome dear! We will start Yoga now. This will last just 12 minutes. Take your time to get in position. We will start in 10 seconds', 20],
        ['Lets start head shine for 5 minutes. Starting now!', 125],
        ['Great! Relax now for 10 seconds', 12],
        ['Continue for another 3 minutes', 125],
        ['Last 1 minute remaining now!', 65],
        ['Perfect! head shine is complete now. Relax!', 20],
        ['Lets start Nose breathing for 2 minutes. Starting now!', 125],
        ['Perfect! Nose breathing is complete now. Relax!', 20],
        ['Lets rub nails for 2 minutes. Starting now!', 125],
        ['Terrific Work! we have completed Yoga. See you again!', 0],
    ]);
}

function startRun() {
    runExercise([
        ['Today is the great day. We will run for 12 minutes. This is our time and moment to enjoy. We will start in 30 seconds. All the best!', 50],
        ['Lets hit the road now! Run!', 360],
        ['6 minutes remaining now', 120],
        ['Continue for another 4 minutes', 60],
        ['Just 3 minutes remaining now!', 60],
        ['Just 2 minutes remaining now!', 60],
        ['Last 1 minute to run. Come on!', 60],
        ['Terrific! Perfect! Run is complete now. Relax! See you tommorow same time!', 0],
    ]);
}

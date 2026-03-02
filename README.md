<html>
<body style="background:DarkOliveGreen; color: white; text-align: center; padding: 50px 20px; font-family: Arial;">
<center>
	<br>
    <button onclick="startEyeExercise()" style="height:120px;width:120px;background:OliveDrab;border-radius:30px">
        <b style="font-size:60px;">🧐</b><br><font color=gold><b>11 min</b></font>
    </button>
	&nbsp;&nbsp;
	
	<button onclick="startYog()" style="height:120px;width:120px;background:OliveDrab;border-radius:30px">
        <b style="font-size:60px;">🧘</b><br><font color=gold><b>12 min</b></font>
    </button>
	
	<br><br>
	 <button onclick="startBellyExercise()" style="height:120px;width:120px;background:OliveDrab;border-radius:30px">
        <b style="font-size:60px;">🦘</b><br><font color=gold><b>8 min</b></font>
    </button>
    &nbsp;&nbsp;
    
	
	<button onclick="startHang()" style="height:120px;width:120px;background:OliveDrab;border-radius:30px">
        <b style="font-size:60px;">🏋️</b><br><font color=gold><b>55 sec</b></font>
    </button>
    
	<br><br>
	<button onclick="startRun()" style="height:120px;width:120px;background:OliveDrab;border-radius:30px">
        <b style="font-size:60px;">🏃</b><br><font color=gold><b>9 min</b></font>
    </button>
    
	
</center>

<script src="https://unpkg.com/nosleep.js@0.12.0/dist/NoSleep.min.js"></script>
<script>
// Initialize NoSleep
const noSleep = new NoSleep();

function speakAndWait(text, waitSeconds) {
    speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    return new Promise(resolve => 
        setTimeout(resolve, waitSeconds * 1000)
    );
}

async function startEyeExercise() {
    try {
        // Enable no sleep - requires user gesture
        await noSleep.enable();
        console.log('NoSleep enabled');
        
        await speakAndWait('Welcome dear! We will start eyes exercise now. This will last just 11 minutes. Sit comfortably and get in position', 25);
        await speakAndWait('We will start with rolling the eyes gently for 2 minutes', 125);
		await speakAndWait('Perfect! The rolling is complete now. Relax!', 15);

        await speakAndWait('Now, Gently massage your eyes sockets for 2 minute.', 125);
        await speakAndWait('Perfect! The massage is complete now. Relax!', 15);

        await speakAndWait('Now, pin your acupressure points for 3 minutes', 185);
        await speakAndWait('Perfect! The acupressure is complete now. Relax!', 15);

        await speakAndWait('Awesome So far! Now focus adjustment for near and far points for 4 minutes. Starting now!', 127);
        await speakAndWait('Great! Relax now', 10);
        await speakAndWait('continue for another 2 minutes', 122);
        
		await speakAndWait('Terrific Work! we have completed all eye exercises. See you again!', 0);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error starting exercise: ' + error.message);
    } finally {
        // Always disable no sleep when done
        noSleep.disable();
        console.log('NoSleep disabled');
    }
}

async function startBellyExercise() {
    try {
        // Enable no sleep - requires user gesture
        await noSleep.enable();
        console.log('NoSleep enabled');
        
        await speakAndWait('Welcome dear! We will start belly exercise now. This will last just 8 minutes. Take your time to get in position. We will start in 10 seconds', 20);
        
		await speakAndWait('Are you ready now!', 5);
		await speakAndWait('Lets start jumping for 2 minutes straight. Starting now!', 125);
        await speakAndWait('Great! Relax now for 20 seconds', 30);
      
        await speakAndWait('Lets start jumping for another 2 minutes. This is second set. Starting now!', 125);
		await speakAndWait('Great! Relax now for 20 seconds', 30);
		
		await speakAndWait('Lets start jumping for another 2 minutes. This is third set. Starting now!', 125);
		await speakAndWait('Great! Relax now for 20 seconds', 30);
		
		await speakAndWait('Lets start jumping for another 2 minutes. This is last set. Starting now!', 125);
		
        await speakAndWait('Terrific Work! we have completed jumping exercise. See you again!', 0);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error starting exercise: ' + error.message);
    } finally {
        // Always disable no sleep when done
        noSleep.disable();
        console.log('NoSleep disabled');
    }
}

async function startYog() {
    try {
        // Enable no sleep - requires user gesture
        await noSleep.enable();
        console.log('NoSleep enabled');
        
        await speakAndWait('Welcome dear! We will start Yoga now. This will last just 12 minutes. Take your time to get in position. We will start in 10 seconds', 20);
		
		await speakAndWait('Lets start head shine for 5 minutes. Starting now!', 125);
		await speakAndWait('Great! Relax now for 10 seconds', 12);
		await speakAndWait('Continue for another 3 minutes', 125);
		await speakAndWait('Last 1 minute remaining now!', 65);
		await speakAndWait('Perfect! head shine is complete now. Relax!', 20);
		
		await speakAndWait('Lets start Nose breathing for 2 minutes. Starting now!', 125);
		await speakAndWait('Perfect! Nose breathing is complete now. Relax!', 20);
		
        await speakAndWait('Lets rub nails for 2 minutes. Starting now!', 125);
				
		await speakAndWait('Terrific Work! we have completed Yoga. See you again!', 0);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error starting exercise: ' + error.message);
    } finally {
        // Always disable no sleep when done
        noSleep.disable();
        console.log('NoSleep disabled');
    }
}

async function startRun() {
    try {
        // Enable no sleep - requires user gesture
        await noSleep.enable();
        console.log('NoSleep enabled');
        
        await speakAndWait('Today is the great day. We will run for 10 minutes finally. Remeber the time we set this goal, today we will be an achiever. Take your time to get in position. We will start in 30 seconds. All the best!', 50);
		
		await speakAndWait('Lets hit the road now! Run!', 240);
        await speakAndWait('6 minutes remaining now', 120);
		await speakAndWait('Continue for another 4 minutes', 60);
		await speakAndWait('Just 3 minutes remaining now!', 60);
		await speakAndWait('Just 2 minutes remaining now!', 60);
		await speakAndWait('Last 1 minute to run. Come on!', 60);
		
		await speakAndWait('Terrific! Perfect! Run is complete now. Relax! See you tommorow same time!', 0);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error starting exercise: ' + error.message);
    } finally {
        // Always disable no sleep when done
        noSleep.disable();
        console.log('NoSleep disabled');
    }
}

async function startHang() {
    try {
        // Enable no sleep - requires user gesture
        await noSleep.enable();
        console.log('NoSleep enabled');
        
        await speakAndWait('Cool! Lets do some hanging. Get in position', 20);
		
		await speakAndWait('Lets hang for 20 seconds first', 24);
        await speakAndWait('Relax for 40 seconds', 40);
		await speakAndWait('Lets do one more set for 20 seconds again', 24);
        await speakAndWait('Relax for 40 seconds', 40);
		await speakAndWait('Last one for 15 seconds', 19);
        		
		await speakAndWait('Great Dear! You nailed it! See you again!', 0);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error starting exercise: ' + error.message);
    } finally {
        // Always disable no sleep when done
        noSleep.disable();
        console.log('NoSleep disabled');
    }
}
</script>

</body>
</html>

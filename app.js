const noSleep = new NoSleep();
const DISTANCE_STORAGE_KEY = 'wellnessTimer.lastRunDistanceMeters';
const ROUTE_STORAGE_KEY = 'wellnessTimer.lastRunRoute';

const runTracking = {
    watchId: null,
    lastPosition: null,
    totalMeters: 0,
    isTracking: false,
    routePoints: []
};

let runRouteMap = null;
let runRouteLayer = null;
let isRouteMapFallbackFullscreen = false;

let hindiVoice = null;

function toRadians(value) {
    return value * (Math.PI / 180);
}

function calculateDistanceMeters(fromPos, toPos) {
    const earthRadiusMeters = 6371000;
    const lat1 = toRadians(fromPos.coords.latitude);
    const lat2 = toRadians(toPos.coords.latitude);
    const deltaLat = toRadians(toPos.coords.latitude - fromPos.coords.latitude);
    const deltaLon = toRadians(toPos.coords.longitude - fromPos.coords.longitude);

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2)
        + Math.cos(lat1) * Math.cos(lat2)
        * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusMeters * c;
}

function formatDistance(meters) {
    const roundedMeters = Math.max(0, Math.round(meters || 0));
    const kilometers = Math.floor(roundedMeters / 1000);
    const remainingMeters = roundedMeters % 1000;

    if (kilometers > 0) {
        return `${kilometers} km ${remainingMeters} m`;
    }

    return `${roundedMeters} m`;
}

function updateRunDistanceUI(valueText, subText) {
    const valueEl = document.getElementById('runDistanceValue');
    const subTextEl = document.getElementById('runDistanceSubtext');

    if (valueEl) {
        valueEl.textContent = valueText;
    }

    if (subTextEl) {
        subTextEl.textContent = subText;
    }
}

function setRouteVisibility(isVisible) {
    const routeWrap = document.getElementById('runRouteMapWrap');
    if (!routeWrap) {
        return;
    }

    routeWrap.classList.toggle('is-hidden', !isVisible);
}

function parseStoredRoute() {
    try {
        const stored = localStorage.getItem(ROUTE_STORAGE_KEY);
        if (!stored) {
            return [];
        }

        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.filter(point => {
            return point && Number.isFinite(point.lat) && Number.isFinite(point.lng);
        });
    } catch (error) {
        console.error('Failed to parse stored run route:', error);
        return [];
    }
}

function renderRunRouteMap(routePoints) {
    if (!window.L) {
        setRouteVisibility(false);
        return;
    }

    const mapElement = document.getElementById('runRouteMap');
    if (!mapElement) {
        return;
    }

    if (!Array.isArray(routePoints) || routePoints.length < 2) {
        setRouteVisibility(false);
        if (runRouteMap) {
            runRouteMap.remove();
            runRouteMap = null;
            runRouteLayer = null;
        }
        return;
    }

    setRouteVisibility(true);

    if (!runRouteMap) {
        runRouteMap = L.map(mapElement, {
            zoomControl: false,
            attributionControl: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(runRouteMap);
    }

    if (runRouteLayer) {
        runRouteLayer.remove();
    }

    const latLngs = routePoints.map(point => [point.lat, point.lng]);
    runRouteLayer = L.layerGroup();

    const routePath = L.polyline(latLngs, {
        color: '#4dd7c4',
        weight: 5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
    }).addTo(runRouteLayer);

    L.circleMarker(latLngs[0], {
        radius: 6,
        color: '#f6fbff',
        fillColor: '#5af2e0',
        fillOpacity: 0.9,
        weight: 2
    }).addTo(runRouteLayer);

    L.circleMarker(latLngs[latLngs.length - 1], {
        radius: 6,
        color: '#f6fbff',
        fillColor: '#ffcf6b',
        fillOpacity: 0.9,
        weight: 2
    }).addTo(runRouteLayer);

    runRouteLayer.addTo(runRouteMap);
    runRouteMap.fitBounds(routePath.getBounds(), { padding: [20, 20] });

    setTimeout(() => {
        if (runRouteMap) {
            runRouteMap.invalidateSize();
        }
    }, 0);
}

function invalidateRouteMapSizeSoon() {
    setTimeout(() => {
        if (runRouteMap) {
            runRouteMap.invalidateSize();
        }
    }, 60);
}

function setRouteMapFallbackFullscreen(isFullscreen) {
    const mapElement = document.getElementById('runRouteMap');
    const closeButton = document.getElementById('runRouteMapClose');
    if (!mapElement || !closeButton) {
        return;
    }

    isRouteMapFallbackFullscreen = isFullscreen;
    mapElement.classList.toggle('is-fallback-fullscreen', isFullscreen);
    closeButton.classList.toggle('is-visible', isFullscreen);
    document.body.classList.toggle('route-map-overlay-open', isFullscreen);
    invalidateRouteMapSizeSoon();
}

function openRouteMapFullscreen() {
    const mapElement = document.getElementById('runRouteMap');
    const closeButton = document.getElementById('runRouteMapClose');
    if (!mapElement || !closeButton) {
        return;
    }

    closeButton.classList.add('is-visible');

    if (mapElement.requestFullscreen) {
        mapElement.requestFullscreen()
            .then(() => invalidateRouteMapSizeSoon())
            .catch(() => setRouteMapFallbackFullscreen(true));
        return;
    }

    setRouteMapFallbackFullscreen(true);
}

function closeRouteMapFullscreen() {
    const mapElement = document.getElementById('runRouteMap');
    const closeButton = document.getElementById('runRouteMapClose');
    if (!mapElement || !closeButton) {
        return;
    }

    const isNativeFullscreen = document.fullscreenElement === mapElement;

    if (isNativeFullscreen && document.exitFullscreen) {
        document.exitFullscreen().finally(() => {
            closeButton.classList.remove('is-visible');
            invalidateRouteMapSizeSoon();
        });
        return;
    }

    if (isRouteMapFallbackFullscreen) {
        setRouteMapFallbackFullscreen(false);
    }

    closeButton.classList.remove('is-visible');
}

function initializeRouteMapInteractions() {
    const mapElement = document.getElementById('runRouteMap');
    const closeButton = document.getElementById('runRouteMapClose');
    if (!mapElement || !closeButton) {
        return;
    }

    mapElement.addEventListener('click', () => {
        const isNativeFullscreen = document.fullscreenElement === mapElement;
        if (!isNativeFullscreen && !isRouteMapFallbackFullscreen) {
            openRouteMapFullscreen();
        }
    });

    closeButton.addEventListener('click', event => {
        event.stopPropagation();
        closeRouteMapFullscreen();
    });

    document.addEventListener('fullscreenchange', () => {
        const isNativeFullscreen = document.fullscreenElement === mapElement;
        closeButton.classList.toggle('is-visible', isNativeFullscreen || isRouteMapFallbackFullscreen);
        if (!isNativeFullscreen) {
            document.body.classList.remove('route-map-overlay-open');
        }
        invalidateRouteMapSizeSoon();
    });
}

function renderStoredRunDistance() {
    const storedMeters = Number.parseFloat(localStorage.getItem(DISTANCE_STORAGE_KEY));
    const storedRoute = parseStoredRoute();

    if (Number.isFinite(storedMeters) && storedMeters > 0) {
        updateRunDistanceUI(formatDistance(storedMeters), 'Last completed run distance.');
        renderRunRouteMap(storedRoute);
        return;
    }

    updateRunDistanceUI('No run data yet', 'Tap Run to start GPS tracking.');
    setRouteVisibility(false);
}

function onRunPositionUpdate(position) {
    const accuracy = position.coords.accuracy || 0;
    if (accuracy > 80) {
        return;
    }

    if (runTracking.lastPosition) {
        const meters = calculateDistanceMeters(runTracking.lastPosition, position);
        const elapsedSeconds = (position.timestamp - runTracking.lastPosition.timestamp) / 1000;
        const speedMps = elapsedSeconds > 0 ? meters / elapsedSeconds : 0;

        // Filter jumps caused by weak GPS signal.
        if (meters < 120 && speedMps <= 8.5) {
            runTracking.totalMeters += meters;
        }
    }

    runTracking.lastPosition = position;

    const latestPoint = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    };
    const previousPoint = runTracking.routePoints[runTracking.routePoints.length - 1];
    if (!previousPoint || previousPoint.lat !== latestPoint.lat || previousPoint.lng !== latestPoint.lng) {
        runTracking.routePoints.push(latestPoint);
    }

    updateRunDistanceUI(formatDistance(runTracking.totalMeters), 'GPS tracking active while run session is in progress.');
}

function onRunPositionError(error) {
    if (error.code === error.PERMISSION_DENIED) {
        stopRunDistanceTracking();
        alert('GPS permission is required to track run distance. Please allow location access.');
        updateRunDistanceUI('GPS permission denied', 'Allow location permission and start Run again.');
    } else {
        updateRunDistanceUI(formatDistance(runTracking.totalMeters), 'GPS signal issue detected. Tracking will continue when signal improves.');
    }
}

function startRunDistanceTracking() {
    if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported on this device/browser.');
    }

    if (runTracking.watchId !== null) {
        navigator.geolocation.clearWatch(runTracking.watchId);
    }

    runTracking.watchId = null;
    runTracking.lastPosition = null;
    runTracking.totalMeters = 0;
    runTracking.isTracking = true;
    runTracking.routePoints = [];

    updateRunDistanceUI('0 m', 'Waiting for GPS lock...');
    setRouteVisibility(false);

    runTracking.watchId = navigator.geolocation.watchPosition(
        onRunPositionUpdate,
        onRunPositionError,
        {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 10000
        }
    );
}

function stopRunDistanceTracking() {
    if (runTracking.watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(runTracking.watchId);
    }

    runTracking.watchId = null;
    runTracking.lastPosition = null;
    runTracking.isTracking = false;

    return {
        totalMeters: runTracking.totalMeters,
        routePoints: [...runTracking.routePoints]
    };
}

function finalizeRunDistanceTracking() {
    if (!runTracking.isTracking) {
        return;
    }

    const { totalMeters, routePoints } = stopRunDistanceTracking();
    localStorage.setItem(DISTANCE_STORAGE_KEY, String(totalMeters));
    localStorage.setItem(ROUTE_STORAGE_KEY, JSON.stringify(routePoints));
    updateRunDistanceUI(formatDistance(totalMeters), 'Run completed. Distance and route saved on homepage.');
    renderRunRouteMap(routePoints);
}

function loadVoices() {
    const voices = speechSynthesis.getVoices();
    hindiVoice = voices.find(v => v.lang === 'hi-IN');
}

speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();

function speakAndWait(text, deadline) {
    return new Promise((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(text);
        if (hindiVoice) {
            utterance.voice = hindiVoice;
        }
        utterance.rate = 0.9;
        utterance.onend = () => {
            const remaining = deadline - performance.now();
            if (remaining <= 0) {
                resolve();
            } else {
                setTimeout(resolve, remaining);
            }
        };
        utterance.onerror = event => reject(new Error('Speech failed: ' + event.error));
        speechSynthesis.speak(utterance);
    });
}

async function runExercise(routine, hooks = {}) {
    try {
        if (hooks.onStart) {
            await hooks.onStart();
        }
        await noSleep.enable();
        let deadline = performance.now();
        for (const [text, wait] of routine) {
            deadline += wait * 1000;
            await speakAndWait(text, deadline);
            // Zero-length prompts are transitions that finish before the next timed phase.
            if (wait === 0) {
                deadline = performance.now();
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error starting exercise: ' + error.message);
    } finally {
        noSleep.disable();
        if (hooks.onComplete) {
            await hooks.onComplete();
        }
    }
}

function startPushUp() {
    // 'Go' has wait 0 so the schedule resets there: count 1 follows immediately, then a constant gap.
    const countdown = [['5', 1], ['4', 1], ['3', 1], ['2', 1], ['1', 1]];
    const reps = n => Array.from({ length: n }, (_, i) => [String(i + 1), 3.5]);

    runExercise([
        ['Get ready for 1st round', 5],
        ...countdown,
        ['Go!', 0],
        ...reps(9),
        ['Relax, Prepare for 2nd round', 60],

        ...countdown,
        ['Go!', 0],
        ...reps(8),
        ['Relax, Prepare for last round', 60],

        ...countdown,
        ['Go!', 0],
        ...reps(7),

        ['Push-ups complete. Well done!', 0]
    ]);
}

function startEyeExercise() {
    runExercise([

        ['अब आँखों के व्यायाम शुरू करेंगे।', 10],
        ['डेढ़ मिनट के लिए आँखों को हल्के से घुमाने से शुरुआत करेंगे', 95],
        ['अब डेढ़ मिनट के लिए अपनी आँखों की सॉकेट्स को हल्के से मालिश करें।', 95],
        ['अब दो मिनट के लिए अपनी एक्यूप्रेशर पॉइंट्स को दबाएँ', 125],
        ['अब ३ मिनट के लिए पास और दूर के बिंदुओं पर ध्यान समायोजन करें। अभी शुरू कर रहे हैं!', 187],
        ['हमने सभी आँखों के व्यायाम पूरे कर लिए हैं।', 0]

    ]);
}

function startBellyExercise() {
    runExercise([
        ['स्वागत है! हम अब कोर के व्यायाम शुरू करेंगे। यह केवल ५ मिनट का होगा। सही स्थिति में आने के लिए अपना समय लें। हम १० सेकंड में शुरू करेंगे', 20],
        ['आइए डेढ़ मिनट के लिए खड़े होकर घुटने उठाने वाला व्यायाम शुरू करें।', 95],
        ['बहुत बढ़िया! अब १० सेकंड के लिए आराम करें', 12],
        ['आइए डेढ़ मिनट के लिए खड़े होकर साइड बेंड्स शुरू करें।', 95],
        ['बहुत बढ़िया! अब १० सेकंड के लिए आराम करें', 12],
        ['आइए दो मिनट के लिए खड़े होकर ट्विस्ट्स शुरू करें।', 125],
        ['शानदार ! हमने सभी कोर व्यायाम पूरे कर लिए हैं। फिर मिलेंगे!', 0],
        ['आप अतिरिक्त रूप से ग्लूट ब्रिजेस, मॉडिफाइड प्लैंक और डेड बग व्यायाम कर सकते हैं', 0]
    ]);
}

function startYog() {
    runExercise([

        ['अब योग शुरू करेंगे। सही स्थिति में आने के लिए अपना समय लें। हम दस सेकंड में शुरू करेंगे', 3],
        ['आइए पाँच मिनट के लिए कपालभाति प्राणायाम शुरू करें।', 305],
        ['अब कपालभाति प्राणायाम पूरी हो गई है। आराम करें!', 20],
        ['आइए दो मिनट के लिए अनुलोम विलोम प्राणायाम शुरू करें।', 125],
        ['आइए दो मिनट के लिए बालायाम शुरू करें। अभी शुरू करते हैं!', 125],
        ['बालायाम प्राणायाम अब पूरा हो गया है। आराम करें!', 10],
        ['आइए डेढ़ मिनट के लिए मार्जारी आसन शुरू करें। अभी शुरू करते हैं!', 95],
        ['आइए डेढ़ मिनट के लिए बद्ध कोणासन शुरू करें। अभी शुरू करते हैं!', 95],
        ['हमने योग पूरा कर लिया है।', 0]


    ]);
}

function startHang() {
    runExercise([
        ['Get ready for 1st round', 5],
        ['5', 1],
        ['4', 1],
        ['3', 1],
        ['2', 1],
        ['1', 1],
        

        ['Go!', 5],
        ['5', 5],
        ['10', 5],
        ['15', 5],
        ['20', 5],
        ['25', 5],
        ['Relax, Prepare for 2nd round', 30],

        ['5', 1],
        ['4', 1],
        ['3', 1],
        ['2', 1],
        ['1', 1],
        

        ['Go!', 5],
        ['5', 5],
        ['10', 5],
        ['15', 5],
        ['Relax, Prepare for 3rd round', 30],

        ['5', 1],
        ['4', 1],
        ['3', 1],
        ['2', 1],
        ['1', 1],
        

        ['Go!', 5],
        ['5', 5],
        ['10', 5],
        ['Relax, Prepare for last round', 30],

        ['5', 1],
        ['4', 1],
        ['3', 1],
        ['2', 1],
        ['1', 1],

        ['Go!', 5],
        ['5', 5],

        ['Pull-up bar hang complete. Well done!', 0]
    ]);
}

function startRun() {
    runExercise([

        ['३० सेकंड में शुरू करेंगे।', 45],
        ['आरंभ करते हैं!', 60],
        ['टाइमर चल रहा है, निश्चिंत रहें। चवालीस मिनट और हैं।', 1080],
        ['बहुत बढ़िया! अब छब्बीस मिनट शेष हैं। अपनी गति बनाए रखें।', 300],
        ['अब इक्कीस मिनट और हैं।', 720],
        ['अब नौ मिनट शेष हैं।', 180],
        ['अब छह मिनट शेष हैं।', 120],
        ['अगले चार मिनट तक जारी रखें।', 60],
        ['अब सिर्फ तीन मिनट शेष हैं!', 60],
        ['अब सिर्फ दो मिनट शेष हैं!', 60],
        ['अंतिम एक मिनट शेष है!', 60],
        ['शानदार! दौड़ अब पूरी हो गई है। अपनी उपलब्धियों में इसे दर्ज करें।', 0]

    ], {
        onStart: startRunDistanceTracking,
        onComplete: finalizeRunDistanceTracking
    });
}

initializeRouteMapInteractions();
renderStoredRunDistance();

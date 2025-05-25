// Global variables
let currentScreen = 'home';
let currentEvent = 'supernova';
let isPlaying = false;
let isPaused = false;
let animationId = null;
let musicPlaying = false;

// Audio context for procedural music
let audioContext = null;
let musicNodes = [];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeSliders();
    initializeNavigation();
    initializeAudio();
    addHoverSounds(); // Додаємо звуки при наведенні
});

// Add hover sound effects
function addHoverSounds() {
    // Звуки для кнопок
    document.querySelectorAll('.control-btn, .cta-button').forEach(button => {
        button.addEventListener('mouseenter', () => {
            playSound('buttonHover', 0.3);
        });
    });

    // Звуки для карток подій
    document.querySelectorAll('.event-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            playSound('buttonHover', 0.2);
        });
    });

    // Звуки для навігації
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('mouseenter', () => {
            playSound('buttonHover', 0.1);
        });
    });
}

// Navigation functions
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const screen = link.getAttribute('data-screen');
            showScreen(screen);
        });
    });
}

function showScreen(screenName) {
    playSound('buttonClick'); // Звук переходу між екранами
    
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show selected screen
    document.getElementById(screenName).classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-screen') === screenName) {
            link.classList.add('active');
        }
    });
    
    currentScreen = screenName;
}

// Event selection
function selectEvent(eventType) {
    playSound('eventSelect'); // Звук вибору події
    
    currentEvent = eventType;
    const cosmicObject = document.getElementById('cosmicObject');
    
    // Remove all event classes
    cosmicObject.className = 'cosmic-object';
    
    // Add specific event class
    cosmicObject.classList.add(eventType);
    
    // Play event-specific sound
    playSound(eventType);
    
    // Switch to visualization screen
    showScreen('visualization');
}

// Slider initialization
function initializeSliders() {
    const sliders = [
        { id: 'timeScale', display: 'timeScaleValue', suffix: 'x' },
        { id: 'mass', display: 'massValue', suffix: ' M☉' },
        { id: 'distance', display: 'distanceValue', suffix: ' св. років' },
        { id: 'intensity', display: 'intensityValue', suffix: '%' },
        { id: 'musicVolume', display: 'musicVolumeValue', suffix: '%', multiplier: 100 }
    ];

    sliders.forEach(slider => {
        const element = document.getElementById(slider.id);
        const display = document.getElementById(slider.display);
        
        if (element && display) {
            element.addEventListener('input', () => {
                const value = parseFloat(element.value);
                const displayValue = slider.multiplier ? value * slider.multiplier : value;
                display.textContent = displayValue + slider.suffix;
                
                // Update simulation parameters
                updateSimulation();
                
                // Update music volume if it's the volume slider
                if (slider.id === 'musicVolume') {
                    updateMusicVolume(value);
                }
            });
            
            // Initialize display
            element.dispatchEvent(new Event('input'));
        }
    });
}

// Simulation control functions
function playSimulation() {
    playSound('simulationStart'); // Звук початку симуляції
    
    isPlaying = true;
    isPaused = false;
    startAnimation();
}

function pauseSimulation() {
    playSound('simulationStop'); // Звук зупинки симуляції
    
    isPaused = true;
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
}

function resetSimulation() {
    playSound('buttonClick'); // Звук кнопки скидання
    
    isPlaying = false;
    isPaused = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    const cosmicObject = document.getElementById('cosmicObject');
    cosmicObject.style.transform = 'scale(1)';
}

function startAnimation() {
    if (!isPlaying || isPaused) return;
    
    const cosmicObject = document.getElementById('cosmicObject');
    const timeScale = parseFloat(document.getElementById('timeScale').value);
    const mass = parseInt(document.getElementById('mass').value);
    const intensity = parseInt(document.getElementById('intensity').value);
    
    // Animate based on current event type
    animateCosmicObject(cosmicObject, timeScale, mass, intensity);
    
    animationId = requestAnimationFrame(() => startAnimation());
}

function animateCosmicObject(object, timeScale, mass, intensity) {
    const time = Date.now() * 0.001 * timeScale;
    
    switch (currentEvent) {
        case 'supernova':
            const supernovaScale = 1 + Math.sin(time * 2) * 0.5 * (intensity / 100);
            object.style.transform = `scale(${supernovaScale})`;
            object.style.boxShadow = `0 0 ${50 * intensity / 100}px #ff6b35, 0 0 ${100 * intensity / 100}px #f7931e`;
            break;
            
        case 'blackhole':
            const blackholeRotation = time * 45 * (mass / 50);
            object.style.transform = `rotate(${blackholeRotation}deg)`;
            object.style.boxShadow = `0 0 ${50 * intensity / 100}px #6a1b9a, 0 0 ${100 * intensity / 100}px #4a148c`;
            break;
            
        case 'neutron':
            const neutronPulse = 1 + Math.sin(time * 10) * 0.3 * (intensity / 100);
            object.style.transform = `scale(${neutronPulse})`;
            object.style.boxShadow = `0 0 ${50 * intensity / 100}px #00bcd4, 0 0 ${100 * intensity / 100}px #0097a7`;
            break;
    }
}

function updateSimulation() {
    if (isPlaying && !isPaused) {
        const cosmicObject = document.getElementById('cosmicObject');
        const timeScale = parseFloat(document.getElementById('timeScale').value);
        const mass = parseInt(document.getElementById('mass').value);
        const intensity = parseInt(document.getElementById('intensity').value);
        
        animateCosmicObject(cosmicObject, timeScale, mass, intensity);
    }
}

// Audio functions
let customSounds = {};

function initializeAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        loadCustomSounds();
    } catch (e) {
        console.log('Web Audio API не підтримується');
    }
}

// Load custom sounds (replace URLs with your own audio files)
async function loadCustomSounds() {
    const soundFiles = {
        buttonClick: './audio/button-click.wav',
        buttonHover: './audio/button-hover.wav',
        eventSelect: './audio/event-select.wav',
        simulationStart: './audio/simulation-start.wav',
        simulationStop: './audio/simulation-stop.wav',
        supernova: './audio/supernova.wav',
        blackhole: './audio/blackhole.wav',
        neutron: './audio/neutron.wav'
    };

    for (const [name, url] of Object.entries(soundFiles)) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                customSounds[name] = audioBuffer;
            } else {
                // Fallback to generated sounds if files don't load
                console.log(`Не вдалося завантажити ${name}, використовуємо згенерований звук`);
            }
        } catch (error) {
            console.log(`Помилка завантаження ${name}:`, error);
        }
    }
}

// Play custom sound
function playSound(soundName, volume = 0.5) {
    if (!audioContext) return;

    try {
        if (customSounds[soundName]) {
            // Play loaded audio file
            const source = audioContext.createBufferSource();
            const gainNode = audioContext.createGain();
            
            source.buffer = customSounds[soundName];
            source.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
            source.start();
        } else {
            // Fallback to generated sound
            playGeneratedSound(soundName, volume);
        }
    } catch (error) {
        console.log('Помилка відтворення звуку:', error);
        playGeneratedSound(soundName, volume);
    }
}

// Generate procedural sounds as fallback
function playGeneratedSound(soundName, volume = 0.5) {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    let frequency, duration, type;

    switch (soundName) {
        case 'buttonClick':
            frequency = 800;
            duration = 0.1;
            type = 'square';
            break;
        case 'buttonHover':
            frequency = 600;
            duration = 0.05;
            type = 'sine';
            break;
        case 'eventSelect':
            frequency = 1000;
            duration = 0.15;
            type = 'triangle';
            break;
        case 'simulationStart':
            frequency = 440;
            duration = 0.3;
            type = 'sawtooth';
            break;
        case 'simulationStop':
            frequency = 220;
            duration = 0.2;
            type = 'square';
            break;
        case 'supernova':
            frequency = 150;
            duration = 1.0;
            type = 'sawtooth';
            break;
        case 'blackhole':
            frequency = 80;
            duration = 2.0;
            type = 'sine';
            break;
        case 'neutron':
            frequency = 1200;
            duration = 0.5;
            type = 'square';
            break;
        default:
            frequency = 440;
            duration = 0.1;
            type = 'sine';
    }

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(volume * 0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
}

function toggleMusic() {
    playSound('buttonClick'); // Звук кнопки
    
    if (musicPlaying) {
        stopMusic();
    } else {
        startMusic();
    }
}

function startMusic() {
    if (!audioContext) return;
    
    musicPlaying = true;
    createCosmicMusic();
}

function stopMusic() {
    musicPlaying = false;
    musicNodes.forEach(node => {
        try {
            node.stop();
        } catch (e) {
            // Node might already be stopped
        }
    });
    musicNodes = [];
}

function createCosmicMusic() {
    if (!audioContext || !musicPlaying) return;
    
    const volume = parseFloat(document.getElementById('musicVolume').value);
    
    // Create ambient cosmic sounds
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Set frequency based on current event
    let frequency = 220; // Base frequency
    switch (currentEvent) {
        case 'supernova':
            frequency = 440;
            break;
        case 'blackhole':
            frequency = 110;
            break;
        case 'neutron':
            frequency = 880;
            break;
    }
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'sine';
    
    // Set volume
    gainNode.gain.setValueAtTime(volume * 0.1, audioContext.currentTime);
    
    // Start and schedule stop
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 2);
    
    musicNodes.push(oscillator);
    
    // Schedule next sound
    if (musicPlaying) {
        setTimeout(() => createCosmicMusic(), 2000);
    }
}

function updateMusicVolume(volume) {
    // Volume is already handled in createCosmicMusic function
    // This function can be extended for more complex volume control
}

// Load user-uploaded sounds
async function loadUserSounds() {
    const fileInput = document.getElementById('soundUpload');
    const files = fileInput.files;
    
    if (files.length === 0) {
        alert('Оберіть аудіофайли для завантаження');
        return;
    }

    try {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileName = file.name.split('.')[0].toLowerCase();
            
            // Convert file to ArrayBuffer
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            // Store the sound with filename as key
            customSounds[fileName] = audioBuffer;
        }
        
        alert(`Завантажено ${files.length} звукових файлів!`);
        playSound('eventSelect');
    } catch (error) {
        console.error('Помилка завантаження звуків:', error);
        alert('Помилка при завантаженні звуків. Перевірте формат файлів (MP3, WAV, OGG)');
    }
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Помилка:', e.error);
});
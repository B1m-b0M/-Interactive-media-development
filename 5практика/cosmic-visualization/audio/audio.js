// Advanced Audio System for Cosmic Visualization
class CosmicAudioSystem {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.sounds = new Map();
        this.musicNodes = [];
        this.isInitialized = false;
        this.musicPlaying = false;
        
        this.soundCategories = {
            ui: ['buttonClick', 'buttonHover', 'eventSelect'],
            simulation: ['simulationStart', 'simulationStop', 'simulationReset'],
            cosmic: ['supernova', 'blackhole', 'neutron', 'pulsar', 'gamma']
        };
    }

    async initialize() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = 0.5;
            
            this.isInitialized = true;
            await this.loadSoundLibrary();
            console.log('Cosmic Audio System initialized successfully');
        } catch (error) {
            console.error('Failed to initialize audio system:', error);
        }
    }

    async loadSoundLibrary() {
        // Generate procedural sounds for different categories
        this.generateUISounds();
        this.generateSimulationSounds();
        this.generateCosmicSounds();
    }

    generateUISounds() {
        // Button click sound
        this.createSound('buttonClick', {
            type: 'square',
            frequency: 800,
            duration: 0.1,
            volume: 0.3,
            envelope: { attack: 0.01, decay: 0.09, sustain: 0, release: 0 }
        });

        // Button hover sound
        this.createSound('buttonHover', {
            type: 'sine',
            frequency: 600,
            duration: 0.05,
            volume: 0.2,
            envelope: { attack: 0.01, decay: 0.04, sustain: 0, release: 0 }
        });

        // Event selection sound
        this.createSound('eventSelect', {
            type: 'triangle',
            frequency: 1000,
            duration: 0.15,
            volume: 0.4,
            envelope: { attack: 0.02, decay: 0.13, sustain: 0, release: 0 }
        });
    }

    generateSimulationSounds() {
        // Simulation start
        this.createSound('simulationStart', {
            type: 'sawtooth',
            frequency: 440,
            duration: 0.3,
            volume: 0.5,
            envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 0.15 },
            modulation: { type: 'frequency', rate: 5, depth: 50 }
        });

        // Simulation stop
        this.createSound('simulationStop', {
            type: 'square',
            frequency: 220,
            duration: 0.2,
            volume: 0.4,
            envelope: { attack: 0.01, decay: 0.19, sustain: 0, release: 0 }
        });
    }

    generateCosmicSounds() {
        // Supernova explosion
        this.createComplexSound('supernova', [
            { type: 'sawtooth', frequency: 80, duration: 2.0, volume: 0.6 },
            { type: 'noise', frequency: 0, duration: 1.5, volume: 0.4, delay: 0.2 },
            { type: 'sine', frequency: 200, duration: 3.0, volume: 0.3, delay: 0.5 }
        ]);

        // Black hole ambient
        this.createComplexSound('blackhole', [
            { type: 'sine', frequency: 40, duration: 4.0, volume: 0.5 },
            { type: 'sine', frequency: 60, duration: 4.0, volume: 0.3, delay: 0.1 },
            { type: 'sine', frequency: 80, duration: 4.0, volume: 0.2, delay: 0.2 }
        ]);

        // Neutron star pulse
        this.createComplexSound('neutron', [
            { type: 'square', frequency: 1200, duration: 0.05, volume: 0.8 },
            { type: 'sine', frequency: 600, duration: 0.1, volume: 0.4, delay: 0.05 }
        ]);
    }

    createSound(name, config) {
        this.sounds.set(name, config);
    }

    createComplexSound(name, layers) {
        this.sounds.set(name, { complex: true, layers: layers });
    }

    async playSound(soundName, options = {}) {
        if (!this.isInitialized || !this.sounds.has(soundName)) {
            console.warn(`Sound '${soundName}' not found`);
            return;
        }

        const soundConfig = this.sounds.get(soundName);
        const volume = options.volume || 1.0;
        const pitch = options.pitch || 1.0;

        if (soundConfig.complex) {
            this.playComplexSound(soundConfig, volume, pitch);
        } else {
            this.playSimpleSound(soundConfig, volume, pitch);
        }
    }

    playSimpleSound(config, volume, pitch) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        // Set oscillator properties
        oscillator.type = config.type;
        oscillator.frequency.value = config.frequency * pitch;

        // Set up envelope
        const now = this.audioContext.currentTime;
        const envelope = config.envelope || { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.2 };
        const totalVolume = config.volume * volume;

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(totalVolume, now + envelope.attack);
        gainNode.gain.linearRampToValueAtTime(totalVolume * envelope.sustain, now + envelope.attack + envelope.decay);
        gainNode.gain.setValueAtTime(totalVolume * envelope.sustain, now + config.duration - envelope.release);
        gainNode.gain.linearRampToValueAtTime(0, now + config.duration);

        // Add modulation if specified
        if (config.modulation) {
            const lfo = this.audioContext.createOscillator();
            const lfoGain = this.audioContext.createGain();
            
            lfo.frequency.value = config.modulation.rate;
            lfoGain.gain.value = config.modulation.depth;
            
            lfo.connect(lfoGain);
            
            if (config.modulation.type === 'frequency') {
                lfoGain.connect(oscillator.frequency);
            } else if (config.modulation.type === 'amplitude') {
                lfoGain.connect(gainNode.gain);
            }
            
            lfo.start(now);
            lfo.stop(now + config.duration);
        }

        oscillator.start(now);
        oscillator.stop(now + config.duration);
    }

    playComplexSound(config, volume, pitch) {
        config.layers.forEach(layer => {
            const delay = layer.delay || 0;
            
            setTimeout(() => {
                this.playSimpleSound({
                    ...layer,
                    frequency: layer.frequency * pitch,
                    volume: layer.volume * volume
                }, 1.0, 1.0);
            }, delay * 1000);
        });
    }

    // Cosmic background music system
    startCosmicMusic(eventType = 'general') {
        if (this.musicPlaying) return;
        
        this.musicPlaying = true;
        this.generateCosmicAmbience(eventType);
    }

    stopCosmicMusic() {
        this.musicPlaying = false;
        this.musicNodes.forEach(node => {
            try {
                if (node.stop) node.stop();
            } catch (e) {
                // Node might already be stopped
            }
        });
        this.musicNodes = [];
    }

    generateCosmicAmbience(eventType) {
        if (!this.musicPlaying) return;

        const musicConfig = this.getMusicConfig(eventType);
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        // Audio chain: oscillator -> filter -> gain -> output
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);

        // Configure based on event type
        oscillator.frequency.value = musicConfig.baseFreq;
        oscillator.type = musicConfig.waveType;
        
        filter.type = 'lowpass';
        filter.frequency.value = musicConfig.filterFreq;
        filter.Q.value = musicConfig.resonance;

        // Set up evolving parameters
        const now = this.audioContext.currentTime;
        const duration = musicConfig.duration;
        
        // Frequency evolution
        oscillator.frequency.setValueAtTime(musicConfig.baseFreq, now);
        oscillator.frequency.exponentialRampToValueAtTime(
            musicConfig.baseFreq * musicConfig.freqMultiplier, 
            now + duration
        );

        // Volume envelope
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(musicConfig.volume, now + 1);
        gainNode.gain.setValueAtTime(musicConfig.volume, now + duration - 1);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);

        // Filter sweep
        filter.frequency.setValueAtTime(musicConfig.filterFreq, now);
        filter.frequency.exponentialRampToValueAtTime(
            musicConfig.filterFreq * 2, 
            now + duration / 2
        );
        filter.frequency.exponentialRampToValueAtTime(
            musicConfig.filterFreq, 
            now + duration
        );

        oscillator.start(now);
        oscillator.stop(now + duration);
        
        this.musicNodes.push(oscillator);

        // Schedule next layer
        setTimeout(() => {
            this.generateCosmicAmbience(eventType);
        }, (duration - 2) * 1000);
    }

    getMusicConfig(eventType) {
        const configs = {
            supernova: {
                baseFreq: 55,
                freqMultiplier: 4,
                waveType: 'sawtooth',
                filterFreq: 200,
                resonance: 5,
                volume: 0.1,
                duration: 8
            },
            blackhole: {
                baseFreq: 27.5,
                freqMultiplier: 2,
                waveType: 'sine',
                filterFreq: 100,
                resonance: 2,
                volume: 0.08,
                duration: 12
            },
            neutron: {
                baseFreq: 110,
                freqMultiplier: 3,
                waveType: 'square',
                filterFreq: 800,
                resonance: 8,
                volume: 0.06,
                duration: 6
            },
            general: {
                baseFreq: 82.4,
                freqMultiplier: 2.5,
                waveType: 'triangle',
                filterFreq: 300,
                resonance: 3,
                volume: 0.05,
                duration: 10
            }
        };

        return configs[eventType] || configs.general;
    }

    // Audio reactive visualization data
    createAnalyser() {
        if (!this.isInitialized) return null;
        
        const analyser = this.audioContext.createAnalyser();
        analyser.fftSize = 256;
        this.masterGain.connect(analyser);
        
        return analyser;
    }

    setMasterVolume(volume) {
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
        }
    }

    // Load custom audio files
    async loadCustomSound(name, audioBuffer) {
        if (!this.isInitialized) return false;
        
        try {
            const customSoundConfig = {
                buffer: audioBuffer,
                isCustom: true
            };
            
            this.sounds.set(name, customSoundConfig);
            return true;
        } catch (error) {
            console.error(`Failed to load custom sound '${name}':`, error);
            return false;
        }
    }

    async playCustomSound(name, options = {}) {
        const soundConfig = this.sounds.get(name);
        if (!soundConfig || !soundConfig.isCustom) return;

        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = soundConfig.buffer;
        source.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        gainNode.gain.value = (options.volume || 1.0) * 0.5;
        source.playbackRate.value = options.pitch || 1.0;
        
        source.start();
    }
}

// Global instance
const cosmicAudio = new CosmicAudioSystem();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CosmicAudioSystem;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    cosmicAudio.initialize();
});
// scripts/gamification.js
// Система гейміфікації для Cosmic Visualization

const GAMIFICATION_LEVELS = [
    { name: 'Новачок', minPoints: 0 },
    { name: 'Дослідник', minPoints: 100 },
    { name: 'Астроном', minPoints: 300 },
    { name: 'Космічний експерт', minPoints: 700 }
];

const GAMIFICATION_BADGES = [
    { id: 'first-eclipse', name: 'Перше затемнення', desc: 'Переглянуто перше затемнення', condition: (stats) => stats.events.eclipse >= 1 },
    { id: 'meteor-hunter', name: 'Мисливець за метеоритами', desc: '3 метеоритних потоки', condition: (stats) => stats.events.meteor >= 3 },
    { id: 'galactic-traveler', name: 'Галактичний мандрівник', desc: 'Відвідано всі події', condition: (stats) => Object.values(stats.events).every(v => v > 0) }
];

const GAMIFICATION_MISSIONS = [
    { id: 'find-3-comets', name: 'Злови 3 комети', desc: 'Клікни по 3 кометах під час спостереження', type: 'comet', count: 3 },
    { id: 'find-5-comets', name: 'Злови 5 комет', desc: 'Клікни по 5 кометах', type: 'comet', count: 5 },
    { id: 'find-star', name: 'Знайди нову зірку', desc: 'Переглянь 5 різних зірок', type: 'star', count: 5 }
];

const GAMIFICATION_EVENT_POINTS = {
    eclipse: 10,
    meteor: 50,
    supernova: 30,
    blackhole: 40,
    neutron: 25,
    comet: 20,
    planet: 15
};

const MISSION_RESET_HOURS = 12;

const Gamification = {
    state: {
        points: 0,
        level: 0,
        badges: [],
        missions: {},
        events: {
            eclipse: 0,
            meteor: 0,
            supernova: 0,
            blackhole: 0,
            neutron: 0,
            comet: 0,
            planet: 0
        },
        missionProgress: {},
        lastEventDates: {},
        lastMissionReset: 0
    },

    load() {
        const saved = localStorage.getItem('cosmicGamification');
        if (saved) {
            this.state = JSON.parse(saved);
        }
        this.checkMissionReset();
    },
    save() {
        localStorage.setItem('cosmicGamification', JSON.stringify(this.state));
    },

    checkMissionReset() {
        const now = Date.now();
        if (!this.state.lastMissionReset || now - this.state.lastMissionReset > MISSION_RESET_HOURS * 60 * 60 * 1000) {
            // Скидаємо прогрес місій
            Object.keys(this.state.missionProgress).forEach(id => {
                this.state.missionProgress[id] = { count: 0, started: now, completed: false };
            });
            this.state.lastMissionReset = now;
            this.save();
            this.updateUI();
            this.showNotification('Місії оновлено!');
        }
    },

    addEvent(eventType) {
        this.checkMissionReset();
        // Додаємо підтримку "star" як події для місій
        if (!this.state.events[eventType]) this.state.events[eventType] = 0;
        this.state.events[eventType]++;
        this.state.points += GAMIFICATION_EVENT_POINTS[eventType] || 5;
        this.state.lastEventDates[eventType] = Date.now();
        // Якщо eventType === 'supernova' або 'neutron', також зараховуємо як 'star' для місій
        if (eventType === 'supernova' || eventType === 'neutron') {
            if (!this.state.events['star']) this.state.events['star'] = 0;
            this.state.events['star']++;
            this.updateMissions('star');
        }
        this.checkLevel();
        this.checkBadges();
        this.updateMissions(eventType);
        this.save();
        this.updateUI();
        // Додатковий ефект: анімація прогрес-бару
        const bar = document.getElementById('gamificationProgressBar');
        if (bar) {
            bar.classList.add('progress-animate');
            setTimeout(()=>bar.classList.remove('progress-animate'), 700);
        }
    },

    updateUI() {
        // Прогрес-бар
        const bar = document.getElementById('gamificationProgressBar');
        const label = document.getElementById('gamificationLevelLabel');
        if (bar && label) {
            const nextLevel = GAMIFICATION_LEVELS[Math.min(this.state.level + 1, GAMIFICATION_LEVELS.length - 1)];
            const currLevel = GAMIFICATION_LEVELS[this.state.level];
            const max = nextLevel.minPoints - currLevel.minPoints;
            const val = this.state.points - currLevel.minPoints;
            bar.value = val;
            bar.max = max;
            label.innerHTML = `<span style='font-size:1.2em;'>${currLevel.name}</span> <span style='color:#ffd600;'>${this.state.points}</span> / ${nextLevel.minPoints}`;
        }
        // Бейджі
        const badgeList = document.getElementById('gamificationBadges');
        if (badgeList) {
            badgeList.innerHTML = GAMIFICATION_BADGES.map(b =>
                `<div class="badge${this.state.badges.includes(b.id) ? ' earned' : ''}" title="${b.desc}">${b.name}<span style='font-size:1.1em;margin-left:4px;'>${this.state.badges.includes(b.id) ? '🏅' : ''}</span></div>`
            ).join('');
        }
        // Місії
        const missionList = document.getElementById('gamificationMissions');
        if (missionList) {
            missionList.innerHTML = GAMIFICATION_MISSIONS.map(m => {
                const p = this.state.missionProgress[m.id] || { count: 0, completed: false };
                return `<div class="mission${p.completed ? ' done' : ''}" style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
                    <span>${m.name}</span>
                    <span>${p.count} / ${m.count} ${p.completed ? '✅' : ''}</span>
                </div>`;
            }).join('');
        }
        // Карта місій
        const map = document.getElementById('gamificationMap');
        if (map) {
            map.innerHTML = GAMIFICATION_MISSIONS.map(m => {
                const p = this.state.missionProgress[m.id] || { completed: false };
                return `<span class="map-marker${p.completed ? ' done' : ''}" title="${m.name}" style="display:inline-block;width:18px;height:18px;border-radius:50%;background:${p.completed ? '#ffd600' : '#222b'};border:2px solid ${p.completed ? '#43a047' : '#64b5f6'};opacity:${p.completed ? 1 : 0.5};margin-right:4px;">${p.completed ? '⭐' : ''}</span>`;
            }).join('');
        }
        // Додатково: авто-скролл до панелі при новому рівні/досягненні на мобільному
        if (window.innerWidth < 700 && (this._justLeveledUp || this._justBadge)) {
            document.getElementById('gamificationPanel')?.scrollIntoView({behavior:'smooth',block:'center'});
            this._justLeveledUp = false;
            this._justBadge = false;
        }
    },
    checkLevel() {
        let newLevel = 0;
        for (let i = GAMIFICATION_LEVELS.length - 1; i >= 0; i--) {
            if (this.state.points >= GAMIFICATION_LEVELS[i].minPoints) {
                newLevel = i;
                break;
            }
        }
        if (newLevel !== this.state.level) {
            this.state.level = newLevel;
            this._justLeveledUp = true;
            this.showNotification(`Вітаємо! Новий рівень: ${GAMIFICATION_LEVELS[newLevel].name}`);
        }
    },
    checkBadges() {
        GAMIFICATION_BADGES.forEach(badge => {
            if (!this.state.badges.includes(badge.id) && badge.condition(this.state)) {
                this.state.badges.push(badge.id);
                this._justBadge = true;
                this.showNotification(`Досягнення: ${badge.name}`);
            }
        });
    },

    updateMissions(eventType) {
        GAMIFICATION_MISSIONS.forEach(mission => {
            if (!this.state.missionProgress[mission.id]) {
                this.state.missionProgress[mission.id] = { count: 0, started: Date.now(), completed: false };
            }
            const progress = this.state.missionProgress[mission.id];
            if (mission.type === eventType && !progress.completed) {
                progress.count++;
                if (mission.days) {
                    // Check if within time window
                    if (Date.now() - progress.started > mission.days * 24 * 60 * 60 * 1000) {
                        progress.count = 1;
                        progress.started = Date.now();
                    }
                }
                if (progress.count >= mission.count) {
                    progress.completed = true;
                    this.state.points += 100;
                    this.showNotification(`Місію виконано: ${mission.name}`);
                }
            }
        });
    },

    showNotification(text) {
        let notif = document.createElement('div');
        notif.className = 'gamification-notification';
        notif.innerHTML = `<span style='font-size:1.3em;margin-right:8px;'>🎉</span> ${text}`;
        notif.style.position = 'fixed';
        notif.style.top = '30px';
        notif.style.left = '50%';
        notif.style.transform = 'translateX(-50%) scale(0.95)';
        notif.style.background = 'linear-gradient(90deg,#1976d2,#64b5f6)';
        notif.style.color = '#fff';
        notif.style.padding = '1rem 2.5rem';
        notif.style.borderRadius = '30px';
        notif.style.fontSize = '1.2rem';
        notif.style.fontWeight = 'bold';
        notif.style.boxShadow = '0 8px 32px #0005';
        notif.style.opacity = '0';
        notif.style.zIndex = '3000';
        notif.style.transition = 'opacity 0.3s, transform 0.3s';
        notif.style.pointerEvents = 'none';
        document.body.appendChild(notif);
        setTimeout(() => notif.style.opacity = '1', 10);
        setTimeout(() => notif.style.opacity = '0', 3000);
        setTimeout(() => notif.remove(), 3500);
    },

    updateUI() {
        // Прогрес-бар
        const bar = document.getElementById('gamificationProgressBar');
        const label = document.getElementById('gamificationLevelLabel');
        if (bar && label) {
            const nextLevel = GAMIFICATION_LEVELS[Math.min(this.state.level + 1, GAMIFICATION_LEVELS.length - 1)];
            const currLevel = GAMIFICATION_LEVELS[this.state.level];
            const max = nextLevel.minPoints - currLevel.minPoints;
            const val = this.state.points - currLevel.minPoints;
            bar.value = val;
            bar.max = max;
            label.innerHTML = `<span style='font-size:1.2em;'>${currLevel.name}</span> <span style='color:#ffd600;'>${this.state.points}</span> / ${nextLevel.minPoints}`;
        }
        // Бейджі
        const badgeList = document.getElementById('gamificationBadges');
        if (badgeList) {
            badgeList.innerHTML = GAMIFICATION_BADGES.map(b =>
                `<div class="badge${this.state.badges.includes(b.id) ? ' earned' : ''}" title="${b.desc}">${b.name}<span style='font-size:1.1em;margin-left:4px;'>${this.state.badges.includes(b.id) ? '🏅' : ''}</span></div>`
            ).join('');
        }
        // Місії
        const missionList = document.getElementById('gamificationMissions');
        if (missionList) {
            missionList.innerHTML = GAMIFICATION_MISSIONS.map(m => {
                const p = this.state.missionProgress[m.id] || { count: 0, completed: false };
                return `<div class="mission${p.completed ? ' done' : ''}" style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
                    <span>${m.name}</span>
                    <span>${p.count} / ${m.count} ${p.completed ? '✅' : ''}</span>
                </div>`;
            }).join('');
        }
        // Карта місій
        const map = document.getElementById('gamificationMap');
        if (map) {
            map.innerHTML = GAMIFICATION_MISSIONS.map(m => {
                const p = this.state.missionProgress[m.id] || { completed: false };
                return `<span class="map-marker${p.completed ? ' done' : ''}" title="${m.name}" style="display:inline-block;width:18px;height:18px;border-radius:50%;background:${p.completed ? '#ffd600' : '#222b'};border:2px solid ${p.completed ? '#43a047' : '#64b5f6'};opacity:${p.completed ? 1 : 0.5};margin-right:4px;">${p.completed ? '⭐' : ''}</span>`;
            }).join('');
        }
        // Додатково: авто-скролл до панелі при новому рівні/досягненні на мобільному
        if (window.innerWidth < 700 && (this._justLeveledUp || this._justBadge)) {
            document.getElementById('gamificationPanel')?.scrollIntoView({behavior:'smooth',block:'center'});
            this._justLeveledUp = false;
            this._justBadge = false;
        }
    }
};

// Ініціалізація при завантаженні
window.addEventListener('DOMContentLoaded', () => {
    Gamification.load();
    Gamification.updateUI();
    // Додаємо live-оновлення при кліку на бейджі, місії, карту (для тесту)
    const badgeList = document.getElementById('gamificationBadges');
    if (badgeList) {
        badgeList.addEventListener('click', () => Gamification.updateUI());
    }
    const missionList = document.getElementById('gamificationMissions');
    if (missionList) {
        missionList.addEventListener('click', () => Gamification.updateUI());
    }
    const map = document.getElementById('gamificationMap');
    if (map) {
        map.addEventListener('click', () => Gamification.updateUI());
    }
});
// Додаємо глобально для тесту
window.Gamification = Gamification;

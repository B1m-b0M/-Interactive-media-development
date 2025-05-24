// ===================
// НАВІГАЦІЯ
// ===================

/**
 * Перемикання між екранами
 * @param {string} screenId - ID екрану для показу
 */
function showScreen(screenId) {
    // Сховати всі екрани
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Показати вибраний екран
    document.getElementById(screenId).classList.add('active');
    
    // Оновити навігацію
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[data-screen="${screenId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Додаємо слухачі подій для навігації
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const screenId = link.getAttribute('data-screen');
            showScreen(screenId);
        });
    });
});

// ===================
// ВИБІР ПОДІЙ
// ===================

/**
 * Вибір космічної події для візуалізації
 * @param {string} eventType - Тип події (supernova, blackhole, neutron)
 */
function selectEvent(eventType) {
    const cosmicObject = document.getElementById('cosmicObject');
    if (!cosmicObject) return;
    
    // Скидаємо всі класи
    cosmicObject.className = 'cosmic-object';
    
    // Додаємо відповідний клас
    switch(eventType) {
        case 'supernova':
            cosmicObject.classList.add('supernova');
            console.log('Обрано: Вибух наднової');
            break;
        case 'blackhole':
            cosmicObject.classList.add('black-hole');
            console.log('Обрано: Чорна діра');
            break;
        case 'neutron':
            cosmicObject.classList.add('neutron-star');
            console.log('Обрано: Нейтронна зірка');
            break;
        default:
            console.warn('Невідомий тип події:', eventType);
    }
    
    // Переходимо на екран візуалізації
    showScreen('visualization');
}

// ===================
// КОНТРОЛЬ ПАРАМЕТРІВ
// ===================

/**
 * Оновлення значень слайдерів
 */
function updateSliderValues() {
    const timeScale = document.getElementById('timeScale');
    const mass = document.getElementById('mass');
    const distance = document.getElementById('distance');
    const intensity = document.getElementById('intensity');

    // Оновлюємо відображення значень
    if (timeScale) {
        document.getElementById('timeScaleValue').textContent = timeScale.value + 'x';
    }
    if (mass) {
        document.getElementById('massValue').textContent = mass.value + ' M☉';
    }
    if (distance) {
        document.getElementById('distanceValue').textContent = distance.value + ' св. років';
    }
    if (intensity) {
        document.getElementById('intensityValue').textContent = intensity.value + '%';
    }
}

// Додаємо слухачі для слайдерів
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.slider').forEach(slider => {
        slider.addEventListener('input', updateSliderValues);
    });
});

// ===================
// СИМУЛЯЦІЯ
// ===================

let isPlaying = false;
let animationSpeed = 1;

/**
 * Запуск симуляції
 */
function playSimulation() {
    isPlaying = true;
    const cosmicObject = document.getElementById('cosmicObject');
    if (!cosmicObject) return;
    
    const timeScale = document.getElementById('timeScale');
    const currentTimeScale = timeScale ? parseFloat(timeScale.value) : 1;
    
    cosmicObject.style.animationPlayState = 'running';
    cosmicObject.style.animationDuration = (10 / currentTimeScale) + 's';
    
    console.log('Симуляція запущена зі швидкістю:', currentTimeScale + 'x');
}

/**
 * Пауза симуляції
 */
function pauseSimulation() {
    isPlaying = false;
    const cosmicObject = document.getElementById('cosmicObject');
    if (!cosmicObject) return;
    
    cosmicObject.style.animationPlayState = 'paused';
    console.log('Симуляція призупинена');
}

/**
 * Скидання симуляції
 */
function resetSimulation() {
    const cosmicObject = document.getElementById('cosmicObject');
    if (!cosmicObject) return;
    
    // Скидаємо анімацію
    cosmicObject.style.animation = 'none';
    
    // Перезапускаємо через невеликий таймаут
    setTimeout(() => {
        cosmicObject.style.animation = '';
        playSimulation();
    }, 50);
    
    console.log('Симуляція скинута та перезапущена');
}

// ===================
// ІНТЕРАКТИВНІСТЬ СЛАЙДЕРІВ
// ===================

document.addEventListener('DOMContentLoaded', function() {
    // Слухач для зміни масштабу часу
    const timeScaleSlider = document.getElementById('timeScale');
    if (timeScaleSlider) {
        timeScaleSlider.addEventListener('input', function() {
            if (isPlaying) {
                playSimulation(); // Оновлюємо швидкість анімації
            }
        });
    }

    // Слухач для зміни маси (впливає на розмір об'єкта)
    const massSlider = document.getElementById('mass');
    if (massSlider) {
        massSlider.addEventListener('input', function() {
            const cosmicObject = document.getElementById('cosmicObject');
            if (cosmicObject) {
                const scale = 0.5 + (this.value / 100);
                cosmicObject.style.transform = `scale(${scale})`;
            }
        });
    }

    // Слухач для зміни інтенсивності (впливає на яскравість)
    const intensitySlider = document.getElementById('intensity');
    if (intensitySlider) {
        intensitySlider.addEventListener('input', function() {
            const cosmicObject = document.getElementById('cosmicObject');
            if (cosmicObject) {
                const opacity = this.value / 100;
                cosmicObject.style.opacity = opacity;
            }
        });
    }
});

// ===================
// ДАНІ NASA (ІМІТАЦІЯ)
// ===================

/**
 * Оновлення даних NASA
 */
function updateNASAData() {
    const timeElement = document.querySelector('.data-card:last-child .data-value');
    if (timeElement) {
        const now = new Date();
        const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                          now.getMinutes().toString().padStart(2, '0');
        timeElement.textContent = timeString;
    }
}

// ===================
// ДОДАТКОВІ ЕФЕКТИ
// ===================

/**
 * Додаємо інтерактивні ефекти для карток подій
 */
document.addEventListener('DOMContentLoaded', function() {
    // Ефект наведення на картки подій
    document.querySelectorAll('.event-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05) translateY(-10px)';
            this.style.transition = 'all 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) translateY(0)';
        });
    });

    // Ефект наведення на кнопки управління
    document.querySelectorAll('.control-btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.transition = 'all 0.2s ease';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
});

// ===================
// ІНІЦІАЛІЗАЦІЯ
// ===================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🌌 CosmicViz ініціалізовано');
    
    // Оновлюємо значення слайдерів
    updateSliderValues();
    
    // Оновлюємо дані NASA кожну хвилину
    updateNASAData();
    setInterval(updateNASAData, 60000);
    
    // Показуємо повідомлення про готовність
    console.log('✅ Всі системи готові до роботи');
});

// ===================
// ОБРОБКА ПОМИЛОК
// ===================

window.addEventListener('error', function(e) {
    console.error('Помилка в CosmicViz:', e.error);
});

// Запобігання помилкам з відсутніми елементами
function safeElementOperation(elementId, operation) {
    const element = document.getElementById(elementId);
    if (element && typeof operation === 'function') {
        operation(element);
    } else if (!element) {
        console.warn(`Елемент з ID "${elementId}" не знайдено`);
    }
}
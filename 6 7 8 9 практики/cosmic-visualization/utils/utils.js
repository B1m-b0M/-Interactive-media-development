// utils.js - Утилітарні функції для CosmicViz

/**
 * Утилітарні функції для роботи з математикою та обчисленнями
 */
const MathUtils = {
    /**
     * Конвертує градуси в радіани
     */
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    },

    /**
     * Конвертує радіани в градуси
     */
    toDegrees(radians) {
        return radians * (180 / Math.PI);
    },

    /**
     * Обмежує значення між мінімумом та максимумом
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    /**
     * Лінійна інтерполяція між двома значеннями
     */
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    },

    /**
     * Генерує випадкове число в діапазоні
     */
    randomRange(min, max) {
        return Math.random() * (max - min) + min;
    },

    /**
     * Обчислює відстань між двома точками
     */
    distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
};

/**
 * Утилітарні функції для роботи з DOM елементами
 */
const DOMUtils = {
    /**
     * Безпечне отримання елемента за ID
     */
    getElementById(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Element with ID '${id}' not found`);
        }
        return element;
    },

    /**
     * Додає клас до елемента з перевіркою
     */
    addClass(element, className) {
        if (element && !element.classList.contains(className)) {
            element.classList.add(className);
        }
    },

    /**
     * Видаляє клас з елемента з перевіркою
     */
    removeClass(element, className) {
        if (element && element.classList.contains(className)) {
            element.classList.remove(className);
        }
    },

    /**
     * Перемикає клас елемента
     */
    toggleClass(element, className) {
        if (element) {
            element.classList.toggle(className);
        }
    },

    /**
     * Встановлює CSS стилі для елемента
     */
    setStyles(element, styles) {
        if (element && typeof styles === 'object') {
            Object.assign(element.style, styles);
        }
    }
};

/**
 * Утилітарні функції для роботи з анімаціями
 */
const AnimationUtils = {
    /**
     * Easing функції для плавних анімацій
     */
    easing: {
        linear: t => t,
        easeInQuad: t => t * t,
        easeOutQuad: t => t * (2 - t),
        easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeInCubic: t => t * t * t,
        easeOutCubic: t => (--t) * t * t + 1,
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
    },

    /**
     * Анімує значення від start до end за duration мілісекунд
     */
    animate(start, end, duration, callback, easingFunction = 'linear') {
        const startTime = performance.now();
        const easing = this.easing[easingFunction] || this.easing.linear;

        function step(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easing(progress);
            const currentValue = start + (end - start) * easedProgress;

            callback(currentValue, progress);

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }
};

/**
 * Утилітарні функції для форматування даних
 */
const FormatUtils = {
    /**
     * Форматує числа з суфіксами (K, M, B)
     */
    formatNumber(num) {
        if (num >= 1e9) {
            return (num / 1e9).toFixed(1) + 'B';
        }
        if (num >= 1e6) {
            return (num / 1e6).toFixed(1) + 'M';
        }
        if (num >= 1e3) {
            return (num / 1e3).toFixed(1) + 'K';
        }
        return num.toString();
    },

    /**
     * Форматує час у годинах, хвилинах, секундах
     */
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    },

    /**
     * Форматує відсотки
     */
    formatPercentage(value, decimals = 1) {
        return (value * 100).toFixed(decimals) + '%';
    },

    /**
     * Форматує астрономічні відстані
     */
    formatDistance(lightYears) {
        if (lightYears >= 1e9) {
            return (lightYears / 1e9).toFixed(2) + ' млрд св. років';
        }
        if (lightYears >= 1e6) {
            return (lightYears / 1e6).toFixed(2) + ' млн св. років';
        }
        if (lightYears >= 1e3) {
            return (lightYears / 1e3).toFixed(1) + ' тис. св. років';
        }
        return lightYears.toFixed(1) + ' св. років';
    },

    /**
     * Форматує масу зірок
     */
    formatMass(solarMasses) {
        if (solarMasses >= 1000) {
            return (solarMasses / 1000).toFixed(1) + 'k M☉';
        }
        return solarMasses.toFixed(1) + ' M☉';
    }
};

/**
 * Утилітарні функції для роботи з подіями
 */
const EventUtils = {
    /**
     * Дебаунс функція для обмеження частоти викликів
     */
    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    /**
     * Throttle функція для обмеження частоти викликів
     */
    throttle(func, delay) {
        let lastCall = 0;
        return function (...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                func.apply(this, args);
            }
        };
    },

    /**
     * Безпечне додавання обробника подій
     */
    addEventListener(element, event, handler, options = {}) {
        if (element && typeof handler === 'function') {
            element.addEventListener(event, handler, options);
            return () => element.removeEventListener(event, handler, options);
        }
        return () => {};
    }
};

/**
 * Утилітарні функції для роботи з локальним сховищем
 * Примітка: У Claude.ai artifacts localStorage не підтримується,
 * тому використовуємо fallback до памʼяті
 */
const StorageUtils = {
    data: new Map(), // Fallback storage for Claude.ai

    /**
     * Зберігає дані
     */
    setItem(key, value) {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(key, JSON.stringify(value));
            } else {
                this.data.set(key, value);
            }
        } catch (error) {
            console.warn('Storage not available, using memory storage');
            this.data.set(key, value);
        }
    },

    /**
     * Отримує дані
     */
    getItem(key) {
        try {
            if (typeof localStorage !== 'undefined') {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } else {
                return this.data.get(key) || null;
            }
        } catch (error) {
            console.warn('Storage not available, using memory storage');
            return this.data.get(key) || null;
        }
    },

    /**
     * Видаляє дані
     */
    removeItem(key) {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem(key);
            } else {
                this.data.delete(key);
            }
        } catch (error) {
            console.warn('Storage not available, using memory storage');
            this.data.delete(key);
        }
    },

    /**
     * Очищає всі дані
     */
    clear() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.clear();
            } else {
                this.data.clear();
            }
        } catch (error) {
            console.warn('Storage not available, using memory storage');
            this.data.clear();
        }
    }
};

/**
 * Утилітарні функції для валідації
 */
const ValidationUtils = {
    /**
     * Перевіряє чи є значення числом
     */
    isNumber(value) {
        return typeof value === 'number' && !isNaN(value) && isFinite(value);
    },

    /**
     * Перевіряє чи є значення у заданому діапазоні
     */
    isInRange(value, min, max) {
        return this.isNumber(value) && value >= min && value <= max;
    },

    /**
     * Перевіряє чи є рядок непустим
     */
    isNonEmptyString(value) {
        return typeof value === 'string' && value.trim().length > 0;
    },

    /**
     * Перевіряє чи є об'єкт непустим
     */
    isNonEmptyObject(value) {
        return typeof value === 'object' && value !== null && Object.keys(value).length > 0;
    }
};

/**
 * Константи для космічних розрахунків
 */
const CosmicConstants = {
    // Швидкість світла (км/с)
    SPEED_OF_LIGHT: 299792458,
    
    // Маса Сонця (кг)
    SOLAR_MASS: 1.989e30,
    
    // Радіус Сонця (км)
    SOLAR_RADIUS: 695700,
    
    // Світловий рік (км)
    LIGHT_YEAR: 9.461e12,
    
    // Парсек (км)  
    PARSEC: 3.086e13,
    
    // Гравітаційна константа
    GRAVITATIONAL_CONSTANT: 6.674e-11,
    
    // Константа Хаббла (км/с/Мпк)
    HUBBLE_CONSTANT: 70,
    
    // Вік Всесвіту (роки)
    UNIVERSE_AGE: 13.8e9
};

/**
 * Утилітарні функції для космічних розрахунків
 */
const CosmicUtils = {
    /**
     * Конвертує світлові роки в кілометри
     */
    lightYearsToKm(lightYears) {
        return lightYears * CosmicConstants.LIGHT_YEAR;
    },

    /**
     * Конвертує кілометри в світлові роки
     */
    kmToLightYears(km) {
        return km / CosmicConstants.LIGHT_YEAR;
    },

    /**
     * Обчислює гравітаційний радіус (радіус Шварцшільда)
     */
    schwarzschildRadius(massInSolarMasses) {
        const massInKg = massInSolarMasses * CosmicConstants.SOLAR_MASS;
        return (2 * CosmicConstants.GRAVITATIONAL_CONSTANT * massInKg) / (CosmicConstants.SPEED_OF_LIGHT * CosmicConstants.SPEED_OF_LIGHT);
    },

    /**
     * Обчислює енергію за формулою E=mc²
     */
    massEnergyEquivalence(massInKg) {
        return massInKg * Math.pow(CosmicConstants.SPEED_OF_LIGHT, 2);
    },

    /**
     * Обчислює червоне зміщення для заданої відстані
     */
    calculateRedshift(distanceInMpc) {
        const velocity = CosmicConstants.HUBBLE_CONSTANT * distanceInMpc;
        return velocity / CosmicConstants.SPEED_OF_LIGHT;
    }
};

/**
 * Утилітарні функції для роботи з кольорами
 */
const ColorUtils = {
    /**
     * Конвертує HSL в RGB
     */
    hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;

        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    },

    /**
     * Генерує колір на основі температури (для зірок)
     */
    temperatureToColor(temperature) {
        // Спрощена формула для конвертації температури в колір
        if (temperature >= 30000) return '#9bb0ff'; // Блакитний
        if (temperature >= 10000) return '#aabfff'; // Блакитно-білий
        if (temperature >= 7500) return '#cad7ff';  // Білий
        if (temperature >= 6000) return '#fff4ea';  // Жовто-білий
        if (temperature >= 5200) return '#ffeddb';  // Жовтий
        if (temperature >= 3700) return '#ffdbba';  // Помаранчевий
        return '#ffad7a'; // Червоний
    },

    /**
     * Змішує два кольори
     */
    mixColors(color1, color2, ratio) {
        const hex = (color) => {
            const c = color.substring(1);
            return parseInt(c, 16);
        };

        const r1 = (hex(color1) >> 16) & 255;
        const g1 = (hex(color1) >> 8) & 255;
        const b1 = hex(color1) & 255;

        const r2 = (hex(color2) >> 16) & 255;
        const g2 = (hex(color2) >> 8) & 255;
        const b2 = hex(color2) & 255;

        const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
        const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
        const b = Math.round(b1 * (1 - ratio) + b2 * ratio);

        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    }
};

// Експортуємо всі утиліти
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MathUtils,
        DOMUtils,
        AnimationUtils,
        FormatUtils,
        EventUtils,
        StorageUtils,
        ValidationUtils,
        CosmicConstants,
        CosmicUtils,
        ColorUtils
    };
}

// Для браузера - додаємо до глобального об'єкта
if (typeof window !== 'undefined') {
    window.CosmicVizUtils = {
        MathUtils,
        DOMUtils,
        AnimationUtils,
        FormatUtils,
        EventUtils,
        StorageUtils,
        ValidationUtils,
        CosmicConstants,
        CosmicUtils,
        ColorUtils
    };
}
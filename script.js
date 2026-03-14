// Danh sách các ngày lễ cố định (Dương lịch)
const fixedHolidays = [
    { name: "Tết Dương Lịch", date: "01-01" },
    { name: "Lễ Tình Nhân (Valentine)", date: "02-14" },
    { name: "Quốc Tế Phụ Nữ", date: "03-08" },
    { name: "Ngày Giải Phóng Miền Nam", date: "04-30" },
    { name: "Quốc Tế Lao Động", date: "05-01" },
    { name: "Ngày Quốc Khánh", date: "09-02" },
    { name: "Ngày Phụ Nữ Việt Nam", date: "10-20" },
    { name: "Lễ Giáng Sinh", date: "12-25" }
];

// Danh sách các ngày lễ Âm lịch (chuyển đổi sang Dương lịch 2024-2030)
const lunarHolidays = [
    {
        name: "Tết Nguyên Đán",
        dates: {
            2024: "02-10", 2025: "01-29", 2026: "02-17",
            2027: "02-06", 2028: "01-26", 2029: "02-13", 2030: "02-02"
        }
    },
    {
        name: "Giỗ Tổ Hùng Vương",
        dates: {
            2024: "04-18", 2025: "04-07", 2026: "04-26",
            2027: "04-15", 2028: "04-04", 2029: "04-23", 2030: "04-11"
        }
    }
];

let upcomingEvents = [];
let updateInterval;

function getUpcomingHolidays() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const allEvents = [];
    
    for (let yearOffset = 0; yearOffset <= 1; yearOffset++) {
        const year = currentYear + yearOffset;
        
        fixedHolidays.forEach((h, idx) => {
            const fullDate = new Date(`${year}-${h.date}T00:00:00+07:00`);
            allEvents.push({
                id: `fixed-${idx}-${year}`,
                name: h.name,
                fullDate: fullDate,
                year: year
            });
        });

        lunarHolidays.forEach((h, idx) => {
            if (h.dates[year]) {
                const fullDate = new Date(`${year}-${h.dates[year]}T00:00:00+07:00`);
                allEvents.push({
                    id: `lunar-${idx}-${year}`,
                    name: h.name,
                    fullDate: fullDate,
                    year: year
                });
            }
        });
    }

    const futureEvents = allEvents.filter(event => {
        const diff = event.fullDate.getTime() - now.getTime();
        return diff > -86400000; 
    });

    const uniqueEventsMap = new Map();
    futureEvents.sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());
    
    futureEvents.forEach(event => {
        if (!uniqueEventsMap.has(event.name)) {
            uniqueEventsMap.set(event.name, event);
        }
    });

    return Array.from(uniqueEventsMap.values()).sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());
}

function formatDateDisplay(dateObj) {
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
}

function renderLayout() {
    upcomingEvents = getUpcomingHolidays();
    const featuredEl = document.getElementById('featured-holiday');
    const gridEl = document.getElementById('holidays-grid');
    
    featuredEl.innerHTML = '';
    gridEl.innerHTML = '';

    if (upcomingEvents.length > 0) {
        // 1. Render Featured Holiday (Sự kiện gần nhất ở đầu và to nhất)
        const featured = upcomingEvents[0];
        featuredEl.innerHTML = `
            <div class="holiday-card featured-card" id="card-${featured.id}">
                <div class="card-header">
                    <h2 class="card-title">${featured.name}</h2>
                    <div class="card-date">${formatDateDisplay(featured.fullDate)}</div>
                </div>
                <div id="countdown-${featured.id}" class="countdown-container"></div>
            </div>
        `;

        // 2. Render Grid các ngày lễ còn lại ở bên dưới
        for (let i = 1; i < upcomingEvents.length; i++) {
            const event = upcomingEvents[i];
            const animDelay = (i - 1) * 0.1;
            
            const cardHtml = `
                <div class="holiday-card" id="card-${event.id}" style="animation-delay: ${animDelay}s">
                    <div class="card-header">
                        <h3 class="card-title">${event.name}</h3>
                        <div class="card-date">${formatDateDisplay(event.fullDate)}</div>
                    </div>
                    <div id="countdown-${event.id}" class="countdown-container"></div>
                </div>
            `;
            gridEl.insertAdjacentHTML('beforeend', cardHtml);
        }
    }
}

function updateCountdowns() {
    const now = new Date().getTime();
    
    upcomingEvents.forEach(event => {
        const target = event.fullDate.getTime();
        const distance = target - now;
        const container = document.getElementById(`countdown-${event.id}`);
        
        if (!container) return;

        // Nếu sự kiện đang diễn ra trong ngày hiện tại
        if (distance < 0 && distance >= -86400000) {
            container.innerHTML = `<div class="celebrate-msg">🎉 Đang diễn ra! 🎉</div>`;
            return;
        } 
        // Nếu đã qua, render lại giao diện để cập nhật sự kiện mới
        else if (distance < -86400000) {
            if (updateInterval) clearInterval(updateInterval);
            renderLayout();
            updateCountdowns();
            updateInterval = setInterval(updateCountdowns, 1000);
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        container.innerHTML = `
            <div class="mini-countdown">
                <div class="mini-time-box">
                    <span class="mini-time">${String(days).padStart(2, '0')}</span>
                    <span class="mini-label">Ngày</span>
                </div>
                <div class="mini-time-box">
                    <span class="mini-time">${String(hours).padStart(2, '0')}</span>
                    <span class="mini-label">Giờ</span>
                </div>
                <div class="mini-time-box">
                    <span class="mini-time">${String(minutes).padStart(2, '0')}</span>
                    <span class="mini-label">Phút</span>
                </div>
                <div class="mini-time-box">
                    <span class="mini-time">${String(seconds).padStart(2, '0')}</span>
                    <span class="mini-label">Giây</span>
                </div>
            </div>
        `;
    });
}

// Khởi chạy đếm ngược nếu đang ở trang chủ
if (document.getElementById('holidays-grid')) {
    renderLayout();
    updateCountdowns();
    // Cập nhật mỗi giây
    updateInterval = setInterval(updateCountdowns, 1000);
}

/* ========================================================
   MEMORY MATCH MINIGAME LOGIC
   ======================================================== */
const cardsArray = [
    { name: 'tet', icon: 'img/blossom.png' },
    { name: 'phaohoa', icon: 'img/fireworks.png' },
    { name: 'duahau', icon: 'img/watermelon.png' },
    { name: 'lixi', icon: 'img/luckymoney.png' },
    { name: 'cayneu', icon: 'img/bamboo.png' },
    { name: 'trong', icon: 'img/drum.png' },
    { name: 'covn', icon: 'img/star.png' },
    { name: 'chay', icon: 'img/shoes.png' }
];

let memoryDeck = [];
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let matchedPairs = 0;
let flips = 0;
let timer = 0;
let timerInterval = null;
let isPlaying = false;

const memoryBoard = document.getElementById('memory-board');
const flipsCount = document.getElementById('flips-count');
const timerDisplay = document.getElementById('timer');
const winMessage = document.getElementById('win-message');
const restartBtn = document.getElementById('restart-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const finalTime = document.getElementById('final-time');
const finalFlips = document.getElementById('final-flips');

function initGame() {
    // Reset state
    hasFlippedCard = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;
    matchedPairs = 0;
    flips = 0;
    timer = 0;
    isPlaying = false;
    
    clearInterval(timerInterval);
    flipsCount.textContent = `Số bước: ${flips}`;
    timerDisplay.textContent = `Thời gian: ${timer}s`;
    winMessage.classList.add('hidden');
    memoryBoard.innerHTML = '';
    
    // Create and shuffle deck
    memoryDeck = [...cardsArray, ...cardsArray];
    memoryDeck.sort(() => 0.5 - Math.random());
    
    // Render cards
    memoryDeck.forEach((cardDesc, index) => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.name = cardDesc.name;
        
        card.innerHTML = `
            <div class="card-face card-front"><img src="${cardDesc.icon}" alt="${cardDesc.name}"></div>
            <div class="card-face card-back"></div>
        `;
        
        card.addEventListener('click', flipCard);
        memoryBoard.appendChild(card);
    });
}

function startTimer() {
    isPlaying = true;
    timerInterval = setInterval(() => {
        timer++;
        timerDisplay.textContent = `Thời gian: ${timer}s`;
    }, 1000);
}

function flipCard() {
    if (!isPlaying) startTimer();
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('flipped');

    if (!hasFlippedCard) {
        // First click
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    // Second click
    secondCard = this;
    flips++;
    flipsCount.textContent = `Số bước: ${flips}`;
    checkForMatch();
}

function checkForMatch() {
    let isMatch = firstCard.dataset.name === secondCard.dataset.name;

    if (isMatch) {
        disableCards();
    } else {
        unflipCards();
    }
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');

    matchedPairs++;
    
    if (matchedPairs === cardsArray.length) {
        winGame();
    }
    
    resetBoard();
}

function unflipCards() {
    lockBoard = true;

    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function winGame() {
    clearInterval(timerInterval);
    setTimeout(() => {
        finalTime.textContent = timer;
        finalFlips.textContent = flips;
        winMessage.classList.remove('hidden');
    }, 500);
}

// Event Listeners
restartBtn.addEventListener('click', initGame);
playAgainBtn.addEventListener('click', initGame);

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Check if memory board exists before init (prevent errors on other pages)
    if (document.getElementById('memory-board')) {
        initGame();
    }
});

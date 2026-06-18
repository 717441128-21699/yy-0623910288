const Dashboard = {
    currentRange: 'today',

    init() {
        AppData.init();
        MapModule.init();
        HotwordsModule.init();
        ProgressModule.init();

        this.updateTime();
        setInterval(() => this.updateTime(), 1000);

        this.bindFilterEvents();
        this.updateAll('today');

        setInterval(() => this.refreshData(), 30000);
    },

    updateTime() {
        const now = new Date();
        
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        const weekDay = weekDays[now.getDay()];

        const dateEl = document.getElementById('currentDate');
        const timeEl = document.getElementById('currentTime');
        const weekEl = document.querySelector('.current-week');
        const updateTimeEl = document.getElementById('updateTime');

        if (dateEl) dateEl.textContent = `${year}年${month}月${day}日`;
        if (timeEl) timeEl.textContent = `${hours}:${minutes}:${seconds}`;
        if (weekEl) weekEl.textContent = weekDay;
        if (updateTimeEl) {
            updateTimeEl.textContent = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }
    },

    bindFilterEvents() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const range = btn.getAttribute('data-range');
                if (range && range !== this.currentRange) {
                    this.setActiveFilter(range);
                    this.updateAll(range);
                }
            });
        });
    },

    setActiveFilter(range) {
        this.currentRange = range;
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            const btnRange = btn.getAttribute('data-range');
            btn.classList.toggle('active', btnRange === range);
        });
    },

    updateAll(range) {
        MapModule.update(range);
        HotwordsModule.update(range);
        ProgressModule.update(range);
        this.updateStats(range);
    },

    updateStats(range) {
        const stats = AppData.getSummaryStats(range);
        
        const totalEl = document.getElementById('totalComplaints');
        const trendEl = document.getElementById('trendRate');
        const pendingEl = document.getElementById('pendingCount');

        if (totalEl) {
            this.animateValue(totalEl, 0, stats.total, 600);
        }

        if (trendEl) {
            const trendValue = parseFloat(stats.trend);
            trendEl.textContent = trendValue >= 0 ? `+${trendValue}%` : `${trendValue}%`;
            trendEl.className = `stat-value ${trendValue >= 0 ? 'trend-up' : 'trend-down'}`;
        }

        if (pendingEl) {
            this.animateValue(pendingEl, 0, stats.pending, 600);
        }
    },

    refreshData() {
        AppData.generateComplaints();
        AppData.generateHotwords();
        AppData.generateTeams();
        this.updateAll(this.currentRange);
    },

    animateValue(element, start, end, duration = 500) {
        if (!element) return;
        
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (end - start) * easeOut);
            
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Dashboard.init();
});

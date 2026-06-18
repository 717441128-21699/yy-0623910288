const Dashboard = {
    currentRange: 'today',
    currentTypeId: null,

    init() {
        AppData.init();
        MapModule.init();
        HotwordsModule.init();
        ProgressModule.init();
        DispatchModule.init();

        this.updateTime();
        setInterval(() => this.updateTime(), 1000);

        this.bindFilterEvents();
        this.bindTypeFilterEvents();
        this.updateAll('today', null);

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
                    this.updateAll(range, this.currentTypeId);
                }
            });
        });
    },

    bindTypeFilterEvents() {
        const typeBtns = document.querySelectorAll('.type-filter-btn');
        typeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const typeStr = btn.getAttribute('data-type');
                const typeId = typeStr === '0' ? null : parseInt(typeStr);
                
                if (typeId !== this.currentTypeId) {
                    this.setActiveTypeFilter(typeId);
                    this.updateAll(this.currentRange, typeId);
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

    setActiveTypeFilter(typeId) {
        this.currentTypeId = typeId;
        const typeBtns = document.querySelectorAll('.type-filter-btn');
        typeBtns.forEach(btn => {
            const btnTypeStr = btn.getAttribute('data-type');
            const btnTypeId = btnTypeStr === '0' ? null : parseInt(btnTypeStr);
            btn.classList.toggle('active', btnTypeId === typeId);
        });
    },

    updateAll(range, typeId = null) {
        MapModule.update(range, typeId);
        HotwordsModule.update(range, typeId);
        ProgressModule.update(range, typeId);
        DispatchModule.update(range, typeId);
        this.updateStats(range, typeId);
    },

    updateStats(range, typeId = null) {
        const stats = AppData.getSummaryStats(range, typeId);
        
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
        this.updateAll(this.currentRange, this.currentTypeId);
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

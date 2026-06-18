const ProgressModule = {
    listContainer: null,
    currentRange: 'today',

    init() {
        this.listContainer = document.getElementById('teamProgressList');
    },

    update(range) {
        this.currentRange = range;
        this.render();
        this.updateSummary();
    },

    updateSummary() {
        const stats = AppData.getSummaryStats(this.currentRange);
        
        const dispatchedEl = document.getElementById('dispatchedCount');
        const arrivedEl = document.getElementById('arrivedCount');
        const repliedEl = document.getElementById('repliedCount');
        
        this.animateValue(dispatchedEl, 0, stats.dispatched, 800);
        this.animateValue(arrivedEl, 0, stats.arrived, 800);
        this.animateValue(repliedEl, 0, stats.replied, 800);
    },

    render() {
        const teams = AppData.getTeams(this.currentRange);
        this.listContainer.innerHTML = '';

        teams.forEach((team, index) => {
            const item = this.createTeamItem(team, index);
            this.listContainer.appendChild(item);
        });

        setTimeout(() => {
            this.animateBars();
        }, 100);
    },

    createTeamItem(team, index) {
        const item = document.createElement('div');
        item.className = 'team-progress-item';
        item.setAttribute('data-team-id', team.id);
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = 'all 0.4s ease';
        item.style.transitionDelay = `${index * 0.08}s`;

        const header = document.createElement('div');
        header.className = 'team-header';
        
        const name = document.createElement('span');
        name.className = 'team-name';
        name.textContent = team.name;
        
        const total = document.createElement('span');
        total.className = 'team-total';
        total.textContent = `共 ${team.total} 件`;
        
        header.appendChild(name);
        header.appendChild(total);

        const bars = document.createElement('div');
        bars.className = 'progress-bars';

        const dispatchedRow = this.createProgressRow('已派单', team.dispatched, team.total, 'dispatched');
        const arrivedRow = this.createProgressRow('已到场', team.arrived, team.total, 'arrived');
        const repliedRow = this.createProgressRow('已回复', team.replied, team.total, 'replied');

        bars.appendChild(dispatchedRow);
        bars.appendChild(arrivedRow);
        bars.appendChild(repliedRow);

        item.appendChild(header);
        item.appendChild(bars);

        item.addEventListener('click', () => {
            this.onTeamClick(team);
        });

        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, index * 80);

        return item;
    },

    createProgressRow(label, value, total, type) {
        const row = document.createElement('div');
        row.className = 'progress-row';

        const labelEl = document.createElement('span');
        labelEl.className = 'progress-label';
        labelEl.textContent = label;

        const barContainer = document.createElement('div');
        barContainer.className = 'progress-bar';

        const fill = document.createElement('div');
        fill.className = `progress-fill ${type}`;
        fill.style.width = '0%';
        fill.dataset.targetWidth = `${(value / total) * 100}%`;

        barContainer.appendChild(fill);

        const valueEl = document.createElement('span');
        valueEl.className = 'progress-value';
        valueEl.textContent = value;

        row.appendChild(labelEl);
        row.appendChild(barContainer);
        row.appendChild(valueEl);

        return row;
    },

    animateBars() {
        const fills = this.listContainer.querySelectorAll('.progress-fill');
        fills.forEach((fill, index) => {
            setTimeout(() => {
                fill.style.width = fill.dataset.targetWidth;
            }, index * 50);
        });
    },

    onTeamClick(team) {
        console.log('Team clicked:', team);
    },

    animateValue(element, start, end, duration = 500) {
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

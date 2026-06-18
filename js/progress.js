const ProgressModule = {
    listContainer: null,
    listView: null,
    detailView: null,
    currentRange: 'today',
    currentTypeId: null,

    init() {
        this.listContainer = document.getElementById('teamProgressList');
        this.listView = document.getElementById('progressListView');
        this.detailView = document.getElementById('teamDetailView');

        const backBtn = document.getElementById('backToListBtn');
        backBtn.addEventListener('click', () => {
            this.showListView();
        });
    },

    update(range, typeId = null) {
        this.currentRange = range;
        this.currentTypeId = typeId;
        this.showListView();
        this.render();
        this.updateSummary();
    },

    showListView() {
        this.listView.style.display = 'flex';
        this.detailView.style.display = 'none';
        document.getElementById('progressSubtitle').textContent = '按执法队伍统计';
    },

    showDetailView() {
        this.listView.style.display = 'none';
        this.detailView.style.display = 'flex';
    },

    updateSummary() {
        const stats = AppData.getSummaryStats(this.currentRange, this.currentTypeId);
        
        const dispatchedEl = document.getElementById('dispatchedCount');
        const arrivedEl = document.getElementById('arrivedCount');
        const repliedEl = document.getElementById('repliedCount');
        
        this.animateValue(dispatchedEl, 0, stats.dispatched, 800);
        this.animateValue(arrivedEl, 0, stats.arrived, 800);
        this.animateValue(repliedEl, 0, stats.replied, 800);
    },

    render() {
        const teams = AppData.getTeams(this.currentRange, this.currentTypeId);
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
        item.style.cursor = 'pointer';

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
            this.openTeamDetail(team);
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
        fill.dataset.targetWidth = `${Math.min((value / total) * 100, 100)}%`;

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

    openTeamDetail(team) {
        document.getElementById('progressSubtitle').textContent = team.name;
        document.getElementById('teamDetailTitle').textContent = team.name;
        document.getElementById('teamDetailArea').textContent = team.area || '-';
        
        const districtNames = (team.districts || []).map(id => 
            AppData.districts.find(d => d.id === id)?.name || ''
        ).filter(Boolean).join('、');
        document.getElementById('teamDetailDistricts').textContent = districtNames || '-';

        this.renderStatusDist(team);
        this.renderPendingList(team);

        this.showDetailView();
    },

    renderStatusDist(team) {
        const container = document.getElementById('statusDistBars');
        container.innerHTML = '';

        const statusConfig = [
            { key: '已派单', cls: 'dist-dispatched', label: '已派单' },
            { key: '处理中', cls: 'dist-processing', label: '处理中' },
            { key: '已到场', cls: 'dist-arrived', label: '已到场' },
            { key: '已回复', cls: 'dist-replied', label: '已回复' }
        ];

        const total = team.total || 1;

        statusConfig.forEach((config, index) => {
            const count = team.statusDist?.[config.key] || 0;
            const percent = Math.min((count / total) * 100, 100);

            const item = document.createElement('div');
            item.className = 'status-dist-item';

            const label = document.createElement('span');
            label.className = 'status-dist-label';
            label.textContent = config.label;

            const bar = document.createElement('div');
            bar.className = 'status-dist-bar';

            const fill = document.createElement('div');
            fill.className = `status-dist-fill ${config.cls}`;
            fill.style.width = '0%';
            
            const countText = document.createElement('span');
            countText.textContent = count > 0 ? count : '';
            fill.appendChild(countText);

            bar.appendChild(fill);

            const countEl = document.createElement('span');
            countEl.className = 'status-dist-count';
            countEl.textContent = count;

            item.appendChild(label);
            item.appendChild(bar);
            item.appendChild(countEl);
            container.appendChild(item);

            setTimeout(() => {
                fill.style.width = `${percent}%`;
            }, index * 100 + 200);
        });
    },

    renderPendingList(team) {
        const container = document.getElementById('pendingList');
        container.innerHTML = '';

        const complaints = team.pendingComplaints || [];

        if (complaints.length === 0) {
            const empty = document.createElement('div');
            empty.style.textAlign = 'center';
            empty.style.color = 'var(--text-muted)';
            empty.style.fontSize = '12px';
            empty.style.padding = '20px';
            empty.textContent = '暂无未回复投诉';
            container.appendChild(empty);
            return;
        }

        complaints.forEach((complaint, index) => {
            const item = document.createElement('div');
            item.className = 'pending-item';
            item.style.opacity = '0';
            item.style.transform = 'translateX(-10px)';
            item.style.transition = 'all 0.3s ease';

            const header = document.createElement('div');
            header.className = 'pending-item-header';

            const typeEl = document.createElement('span');
            typeEl.className = 'pending-item-type';
            typeEl.textContent = complaint.typeName;
            typeEl.style.background = `rgba(${this.hexToRgb(complaint.typeColor)}, 0.2)`;
            typeEl.style.color = complaint.typeColor;
            typeEl.style.border = `1px solid rgba(${this.hexToRgb(complaint.typeColor)}, 0.4)`;

            const countEl = document.createElement('span');
            countEl.className = 'pending-item-count';
            countEl.textContent = `相似投诉 ${complaint.similarCount} 件`;

            header.appendChild(typeEl);
            header.appendChild(countEl);

            const address = document.createElement('div');
            address.className = 'pending-item-address';
            address.textContent = complaint.address || complaint.summary;

            const meta = document.createElement('div');
            meta.className = 'pending-item-meta';

            const source = document.createElement('span');
            source.textContent = `来源：${complaint.source}`;

            const time = document.createElement('span');
            time.textContent = complaint.timeAgo;

            meta.appendChild(source);
            meta.appendChild(time);

            item.appendChild(header);
            item.appendChild(address);
            item.appendChild(meta);

            item.addEventListener('click', () => {
                if (typeof MapModule !== 'undefined') {
                    MapModule.openDetailCard(complaint, complaint.x, complaint.y);
                }
            });

            container.appendChild(item);

            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * 100 + 300);
        });
    },

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
            '0, 195, 255';
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

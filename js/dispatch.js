const DispatchModule = {
    container: null,
    pressureList: null,
    riskList: null,
    suggestTeamList: null,
    currentRange: 'today',
    currentTypeId: null,
    selectedDistrict: null,

    init() {
        this.pressureList = document.getElementById('districtPressureList');
        this.riskList = document.getElementById('riskList');
        this.suggestTeamList = document.getElementById('suggestTeamList');

        this.bindTabEvents();
    },

    bindTabEvents() {
        const tabs = document.querySelectorAll('.panel-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    },

    switchTab(tabName) {
        const tabs = document.querySelectorAll('.panel-tab');
        tabs.forEach(t => {
            t.classList.toggle('active', t.getAttribute('data-tab') === tabName);
        });

        const tabContents = document.querySelectorAll('.panel-tab-content');
        tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}Tab`);
        });
    },

    update(range, typeId = null) {
        this.currentRange = range;
        this.currentTypeId = typeId;
        this.render();
    },

    render() {
        const data = AppData.getDispatchOverview(this.currentRange, this.currentTypeId);
        
        this.renderPressureList(data.districtPressures);
        this.renderRiskList(data.highRisk);
        this.renderSuggestTeams(data.suggestedTeams);
    },

    renderPressureList(pressures) {
        this.pressureList.innerHTML = '';
        
        const maxCount = Math.max(...pressures.map(p => p.pendingCount), 1);

        pressures.forEach((pressure, index) => {
            const item = document.createElement('div');
            item.className = 'district-pressure-item';
            item.dataset.districtId = pressure.districtId;
            item.style.opacity = '0';
            item.style.transform = 'translateX(-10px)';
            item.style.transition = 'all 0.3s ease';

            if (this.selectedDistrict === pressure.districtId) {
                item.classList.add('active');
            }

            const name = document.createElement('span');
            name.className = 'pressure-name';
            name.textContent = pressure.name;

            const bar = document.createElement('div');
            bar.className = 'pressure-bar';

            const fill = document.createElement('div');
            fill.className = `pressure-fill ${pressure.level}`;
            const width = Math.min((pressure.pendingCount / maxCount) * 100, 100);
            fill.style.width = '0%';
            fill.dataset.targetWidth = `${width}%`;
            
            bar.appendChild(fill);

            const count = document.createElement('span');
            count.className = `pressure-count ${pressure.level}`;
            count.textContent = pressure.pendingCount;

            item.appendChild(name);
            item.appendChild(bar);
            item.appendChild(count);

            item.addEventListener('click', () => {
                this.onDistrictClick(pressure.districtId, item);
            });

            this.pressureList.appendChild(item);

            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * 50);

            setTimeout(() => {
                fill.style.width = fill.dataset.targetWidth;
            }, index * 50 + 200);
        });
    },

    onDistrictClick(districtId, element) {
        if (this.selectedDistrict === districtId) {
            this.selectedDistrict = null;
            element.classList.remove('active');
            MapModule.setActiveDistrict(null);
        } else {
            this.selectedDistrict = districtId;
            
            const items = this.pressureList.querySelectorAll('.district-pressure-item');
            items.forEach(item => item.classList.remove('active'));
            element.classList.add('active');
            
            MapModule.setActiveDistrict(districtId);
        }
    },

    renderRiskList(risks) {
        this.riskList.innerHTML = '';

        if (risks.length === 0) {
            const empty = document.createElement('div');
            empty.style.textAlign = 'center';
            empty.style.color = 'var(--text-muted)';
            empty.style.fontSize = '12px';
            empty.style.padding = '15px';
            empty.textContent = '暂无超时风险';
            this.riskList.appendChild(empty);
            return;
        }

        risks.forEach((risk, index) => {
            const item = document.createElement('div');
            item.className = 'risk-item';
            item.style.opacity = '0';
            item.style.transform = 'translateX(-10px)';
            item.style.transition = 'all 0.3s ease';

            const address = document.createElement('div');
            address.className = 'risk-address';
            address.textContent = risk.address || risk.summary;

            const meta = document.createElement('div');
            meta.className = 'risk-meta';

            const source = document.createElement('span');
            source.textContent = `来源：${risk.source}`;

            const time = document.createElement('span');
            time.className = 'risk-time';
            time.textContent = risk.timeAgo;

            meta.appendChild(source);
            meta.appendChild(time);

            item.appendChild(address);
            item.appendChild(meta);

            item.addEventListener('click', () => {
                MapModule.openDetailCard(risk, risk.x, risk.y);
            });

            this.riskList.appendChild(item);

            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * 80 + 100);
        });
    },

    renderSuggestTeams(teams) {
        this.suggestTeamList.innerHTML = '';

        teams.forEach((team, index) => {
            const item = document.createElement('div');
            item.className = 'suggest-team-item';
            item.dataset.teamId = team.id;
            item.style.opacity = '0';
            item.style.transform = 'translateX(-10px)';
            item.style.transition = 'all 0.3s ease';

            const info = document.createElement('div');
            info.className = 'suggest-team-info';

            const name = document.createElement('span');
            name.className = 'suggest-team-name';
            name.textContent = team.name;

            const area = document.createElement('span');
            area.className = 'suggest-team-area';
            area.textContent = `待处置 ${team.pending} 件`;

            info.appendChild(name);
            info.appendChild(area);

            const badge = document.createElement('span');
            badge.className = 'suggest-team-badge';
            const rate = team.total > 0 ? Math.round((team.replied / team.total) * 100) : 0;
            badge.textContent = `${rate}%`;

            item.appendChild(info);
            item.appendChild(badge);

            item.addEventListener('click', () => {
                this.onTeamClick(team);
            });

            this.suggestTeamList.appendChild(item);

            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * 80 + 150);
        });
    },

    onTeamClick(team) {
        if (typeof ProgressModule !== 'undefined') {
            const teamDetail = AppData.getTeamDetail(
                this.currentRange, 
                team.id, 
                this.currentTypeId
            );
            if (teamDetail) {
                ProgressModule.openTeamDetail(teamDetail);
            }
        }
    },

    clearDistrictSelection() {
        this.selectedDistrict = null;
        const items = this.pressureList?.querySelectorAll('.district-pressure-item');
        items?.forEach(item => item.classList.remove('active'));
    }
};

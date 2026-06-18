const MapModule = {
    svg: null,
    markerGroup: null,
    detailCard: null,
    mapContainer: null,
    currentRange: 'today',
    currentTypeId: null,
    activeDistrict: null,
    clusteredMarkers: [],
    selectedComplaint: null,
    highlightedComplaintIds: new Set(),

    init() {
        this.svg = document.getElementById('mapSvg');
        this.markerGroup = document.getElementById('markerGroup');
        this.detailCard = document.getElementById('detailCard');
        this.mapContainer = document.getElementById('mapContainer');

        this.renderDistricts();
        this.renderRoads();
        this.bindEvents();
        this.bindDetailCardEvents();
    },

    renderDistricts() {
        const districtGroup = document.getElementById('districtPaths');
        districtGroup.innerHTML = '';

        AppData.districts.forEach(district => {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', district.path);
            path.setAttribute('data-district', district.id);
            districtGroup.appendChild(path);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', district.centerX);
            text.setAttribute('y', district.centerY);
            text.textContent = district.name;
            districtGroup.appendChild(text);
        });
    },

    renderRoads() {
        const roadGroup = document.getElementById('roadNetwork');
        roadGroup.innerHTML = '';

        const roads = [
            'M40,300 L760,300',
            'M400,40 L400,560',
            'M100,100 L700,500',
            'M700,100 L100,500',
            'M40,150 L300,150 L350,200 L600,200 L760,250',
            'M100,400 L250,400 L300,450 L500,450 L600,400 L760,400',
            'M200,40 L200,250 L150,350 L150,560',
            'M600,40 L600,200 L550,300 L550,560'
        ];

        roads.forEach(d => {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', d);
            roadGroup.appendChild(path);
        });
    },

    update(range, typeId = null) {
        this.currentRange = range;
        this.currentTypeId = typeId;
        this.closeDetailCard();
        this.renderMarkers();
        this.updateDistrictStats();
    },

    renderMarkers() {
        this.markerGroup.innerHTML = '';
        const complaints = AppData.getComplaints(this.currentRange, this.currentTypeId);

        const clustered = this.clusterComplaints(complaints);
        this.clusteredMarkers = clustered;

        clustered.forEach((cluster, index) => {
            if (cluster.count === 1) {
                this.createSingleMarker(cluster, index);
            } else {
                this.createClusterMarker(cluster, index);
            }
        });

        this.applyHighlight();
    },

    clusterComplaints(complaints) {
        const clusters = [];
        const threshold = 30;
        const used = new Set();

        complaints.forEach((complaint, i) => {
            if (used.has(i)) return;

            const cluster = {
                x: complaint.x,
                y: complaint.y,
                count: 1,
                complaints: [complaint],
                typeId: complaint.typeId,
                typeName: complaint.typeName,
                typeColor: complaint.typeColor
            };

            for (let j = i + 1; j < complaints.length; j++) {
                if (used.has(j)) continue;

                const other = complaints[j];
                const dist = Math.sqrt(
                    Math.pow(complaint.x - other.x, 2) +
                    Math.pow(complaint.y - other.y, 2)
                );

                if (dist < threshold && complaint.typeId === other.typeId) {
                    cluster.x = (cluster.x * cluster.count + other.x) / (cluster.count + 1);
                    cluster.y = (cluster.y * cluster.count + other.y) / (cluster.count + 1);
                    cluster.count++;
                    cluster.complaints.push(other);
                    used.add(j);
                }
            }

            used.add(i);
            clusters.push(cluster);
        });

        return clusters;
    },

    createSingleMarker(cluster, index) {
        const complaint = cluster.complaints[0];
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'marker-group');
        g.setAttribute('transform', `translate(${cluster.x}, ${cluster.y})`);
        g.setAttribute('data-index', index);
        g.dataset.complaintId = complaint.id;

        const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pulse.setAttribute('class', 'marker-pulse');
        pulse.setAttribute('r', '8');
        pulse.setAttribute('stroke', cluster.typeColor);
        pulse.style.animationDelay = `${index * 0.1}s`;
        g.appendChild(pulse);

        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('class', 'marker-dot');
        dot.setAttribute('r', '6');
        dot.setAttribute('fill', cluster.typeColor);
        dot.setAttribute('filter', 'url(#markerGlow)');
        g.appendChild(dot);

        g.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openDetailCard(complaint, cluster.x, cluster.y);
        });

        this.markerGroup.appendChild(g);
    },

    createClusterMarker(cluster, index) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'marker-group');
        g.setAttribute('transform', `translate(${cluster.x}, ${cluster.y})`);
        g.setAttribute('data-index', index);
        
        const complaintIds = cluster.complaints.map(c => c.id).join(',');
        g.dataset.complaintId = complaintIds;

        const size = Math.min(8 + cluster.count * 2, 20);

        const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pulse.setAttribute('class', 'marker-pulse');
        pulse.setAttribute('r', size.toString());
        pulse.setAttribute('stroke', cluster.typeColor);
        pulse.style.animationDelay = `${index * 0.08}s`;
        g.appendChild(pulse);

        const outer = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        outer.setAttribute('r', (size + 2).toString());
        outer.setAttribute('fill', cluster.typeColor);
        outer.setAttribute('opacity', '0.3');
        g.appendChild(outer);

        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('class', 'marker-dot');
        dot.setAttribute('r', size.toString());
        dot.setAttribute('fill', cluster.typeColor);
        dot.setAttribute('filter', 'url(#markerGlow)');
        g.appendChild(dot);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('class', 'marker-count');
        text.setAttribute('y', '4');
        text.textContent = cluster.count;
        g.appendChild(text);

        g.addEventListener('click', (e) => {
            e.stopPropagation();
            const mainComplaint = cluster.complaints.sort((a, b) => b.similarCount - a.similarCount)[0];
            this.openDetailCard(mainComplaint, cluster.x, cluster.y);
        });

        this.markerGroup.appendChild(g);
    },

    openDetailCard(complaint, x, y) {
        this.selectedComplaint = complaint;

        document.getElementById('detailTitle').textContent = `${complaint.districtName} - 投诉点位`;
        
        const typeEl = document.getElementById('detailType');
        typeEl.textContent = complaint.typeName;
        typeEl.className = `detail-card-type type-${complaint.typeId}`;

        document.getElementById('detailSummary').textContent = complaint.summary;
        document.getElementById('detailAddress').textContent = complaint.address || '-';
        document.getElementById('detailSource').textContent = complaint.source;
        document.getElementById('detailSimilar').textContent = `${complaint.similarCount} 件`;
        document.getElementById('detailTime').textContent = complaint.timeAgo;

        const tagsContainer = document.getElementById('detailTags');
        tagsContainer.innerHTML = '';
        if (complaint.relatedKeywords && complaint.relatedKeywords.length > 0) {
            complaint.relatedKeywords.forEach(keyword => {
                const tag = document.createElement('span');
                tag.className = 'detail-tag';
                tag.textContent = keyword;
                tagsContainer.appendChild(tag);
            });
        } else {
            const tag = document.createElement('span');
            tag.className = 'detail-tag';
            tag.textContent = '暂无';
            tagsContainer.appendChild(tag);
        }

        const statusBadge = document.getElementById('detailStatus');
        const statusMap = {
            '已派单': 'status-dispatched',
            '已到场': 'status-arrived',
            '已回复': 'status-replied',
            '处理中': 'status-processing'
        };
        statusBadge.textContent = complaint.status;
        statusBadge.className = `status-badge ${statusMap[complaint.status] || ''}`;

        this.detailCard.style.display = 'flex';
    },

    closeDetailCard() {
        this.detailCard.style.display = 'none';
        this.selectedComplaint = null;
    },

    bindDetailCardEvents() {
        const closeBtn = document.getElementById('detailCardClose');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeDetailCard();
        });

        this.mapContainer.addEventListener('click', (e) => {
            if (e.target.tagName === 'svg' || 
                e.target.tagName === 'rect' || 
                e.target.tagName === 'path' ||
                e.target === this.mapContainer) {
                this.closeDetailCard();
                this.clearHighlight();
                HotwordsModule.clearSelection();
            }
        });

        const locateBtn = document.getElementById('detailLocateBtn');
        locateBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.selectedComplaint) {
                console.log('定位到:', this.selectedComplaint);
            }
        });

        this.detailCard.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    },

    highlightByKeyword(keyword) {
        this.highlightedComplaintIds.clear();
        
        const hotwords = AppData.getHotwords(this.currentRange, this.currentTypeId);
        const matched = hotwords.find(h => h.text === keyword);
        
        if (matched && matched.relatedComplaintIds) {
            matched.relatedComplaintIds.forEach(id => this.highlightedComplaintIds.add(id));
        }

        this.applyHighlight();
    },

    applyHighlight() {
        const markerGroups = this.markerGroup.querySelectorAll('.marker-group');
        
        markerGroups.forEach(group => {
            const groupIds = (group.dataset.complaintId || '').split(',');
            const hasMatch = groupIds.some(id => this.highlightedComplaintIds.has(id));
            
            if (this.highlightedComplaintIds.size > 0) {
                if (hasMatch) {
                    group.classList.add('highlighted');
                    group.classList.remove('dimmed');
                } else {
                    group.classList.add('dimmed');
                    group.classList.remove('highlighted');
                }
            } else {
                group.classList.remove('highlighted', 'dimmed');
            }
        });
    },

    clearHighlight() {
        this.highlightedComplaintIds.clear();
        this.applyHighlight();
    },

    updateDistrictStats() {
        const stats = AppData.getDistrictStats(this.currentRange, this.currentTypeId);
        const statItems = document.querySelectorAll('.district-stat-item');

        statItems.forEach((item, index) => {
            const countEl = item.querySelector('.district-count');
            if (stats[index] && countEl) {
                countEl.textContent = stats[index].count;
            }
        });
    },

    setActiveDistrict(districtId) {
        this.activeDistrict = districtId;

        const statItems = document.querySelectorAll('.district-stat-item');
        statItems.forEach(item => {
            const id = parseInt(item.getAttribute('data-district'));
            item.classList.toggle('active', id === districtId);
        });

        const paths = document.querySelectorAll('.districts path');
        paths.forEach(path => {
            const id = parseInt(path.getAttribute('data-district'));
            path.style.fill = id === districtId 
                ? 'rgba(0, 195, 255, 0.25)' 
                : 'rgba(0, 100, 150, 0.15)';
        });
    },

    bindEvents() {
        const districtPaths = document.getElementById('districtPaths');
        districtPaths.addEventListener('click', (e) => {
            if (e.target.tagName === 'path') {
                const districtId = parseInt(e.target.getAttribute('data-district'));
                this.setActiveDistrict(
                    this.activeDistrict === districtId ? null : districtId
                );
            }
        });

        const statItems = document.querySelectorAll('.district-stat-item');
        statItems.forEach(item => {
            item.addEventListener('click', () => {
                const districtId = parseInt(item.getAttribute('data-district'));
                this.setActiveDistrict(
                    this.activeDistrict === districtId ? null : districtId
                );
            });
        });
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

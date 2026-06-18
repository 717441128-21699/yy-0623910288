const MapModule = {
    svg: null,
    markerGroup: null,
    tooltip: null,
    mapContainer: null,
    currentRange: 'today',
    activeDistrict: null,
    clusteredMarkers: [],

    init() {
        this.svg = document.getElementById('mapSvg');
        this.markerGroup = document.getElementById('markerGroup');
        this.tooltip = document.getElementById('mapTooltip');
        this.mapContainer = document.getElementById('mapContainer');

        this.renderDistricts();
        this.renderRoads();
        this.bindEvents();
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

    update(range) {
        this.currentRange = range;
        this.renderMarkers();
        this.updateDistrictStats();
    },

    renderMarkers() {
        this.markerGroup.innerHTML = '';
        const complaints = AppData.getComplaints(this.currentRange);

        const clustered = this.clusterComplaints(complaints);
        this.clusteredMarkers = clustered;

        clustered.forEach((cluster, index) => {
            if (cluster.count === 1) {
                this.createSingleMarker(cluster, index);
            } else {
                this.createClusterMarker(cluster, index);
            }
        });
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

        g.addEventListener('mouseenter', (e) => this.showTooltip(e, complaint));
        g.addEventListener('mousemove', (e) => this.moveTooltip(e));
        g.addEventListener('mouseleave', () => this.hideTooltip());
        g.addEventListener('click', () => this.onMarkerClick(complaint));

        this.markerGroup.appendChild(g);
    },

    createClusterMarker(cluster, index) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'marker-group');
        g.setAttribute('transform', `translate(${cluster.x}, ${cluster.y})`);
        g.setAttribute('data-index', index);

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

        g.addEventListener('mouseenter', (e) => this.showClusterTooltip(e, cluster));
        g.addEventListener('mousemove', (e) => this.moveTooltip(e));
        g.addEventListener('mouseleave', () => this.hideTooltip());
        g.addEventListener('click', () => this.onClusterClick(cluster));

        this.markerGroup.appendChild(g);
    },

    showTooltip(e, complaint) {
        const tooltipTitle = document.getElementById('tooltipTitle');
        const tooltipType = document.getElementById('tooltipType');
        const tooltipSummary = document.getElementById('tooltipSummary');
        const tooltipSource = document.getElementById('tooltipSource');
        const tooltipCount = document.getElementById('tooltipCount');
        const tooltipTime = document.getElementById('tooltipTime');

        tooltipTitle.textContent = `${complaint.districtName} - 投诉点位`;
        tooltipType.textContent = complaint.typeName;
        tooltipType.className = `tooltip-type type-${complaint.typeId}`;
        tooltipSummary.textContent = complaint.summary;
        tooltipSource.textContent = complaint.source;
        tooltipCount.textContent = `${complaint.similarCount} 件`;
        tooltipTime.textContent = complaint.timeAgo;

        this.tooltip.style.display = 'block';
        this.moveTooltip(e);
    },

    showClusterTooltip(e, cluster) {
        const tooltipTitle = document.getElementById('tooltipTitle');
        const tooltipType = document.getElementById('tooltipType');
        const tooltipSummary = document.getElementById('tooltipSummary');
        const tooltipSource = document.getElementById('tooltipSource');
        const tooltipCount = document.getElementById('tooltipCount');
        const tooltipTime = document.getElementById('tooltipTime');

        const mainComplaint = cluster.complaints[0];

        tooltipTitle.textContent = `${mainComplaint.districtName} - 聚类投诉点`;
        tooltipType.textContent = cluster.typeName;
        tooltipType.className = `tooltip-type type-${cluster.typeId}`;
        tooltipSummary.textContent = `该区域共有 ${cluster.count} 起同类投诉，主要集中在${mainComplaint.summary.substring(0, 20)}...`;
        tooltipSource.textContent = '多渠道来源';
        tooltipCount.textContent = `${cluster.count} 件`;
        tooltipTime.textContent = mainComplaint.timeAgo;

        this.tooltip.style.display = 'block';
        this.moveTooltip(e);
    },

    moveTooltip(e) {
        if (!this.tooltip || !this.mapContainer) return;

        const rect = this.mapContainer.getBoundingClientRect();
        let x = e.clientX - rect.left + 15;
        let y = e.clientY - rect.top + 15;

        const tooltipWidth = this.tooltip.offsetWidth;
        const tooltipHeight = this.tooltip.offsetHeight;

        if (x + tooltipWidth > rect.width - 10) {
            x = e.clientX - rect.left - tooltipWidth - 15;
        }
        if (y + tooltipHeight > rect.height - 10) {
            y = e.clientY - rect.top - tooltipHeight - 15;
        }

        this.tooltip.style.left = `${x}px`;
        this.tooltip.style.top = `${y}px`;
    },

    hideTooltip() {
        this.tooltip.style.display = 'none';
    },

    onMarkerClick(complaint) {
        console.log('Marker clicked:', complaint);
    },

    onClusterClick(cluster) {
        console.log('Cluster clicked:', cluster);
    },

    updateDistrictStats() {
        const stats = AppData.getDistrictStats(this.currentRange);
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

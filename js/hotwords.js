const HotwordsModule = {
    container: null,
    relatedSection: null,
    relatedList: null,
    relatedTitle: null,
    clearBtn: null,
    currentRange: 'today',
    currentTypeId: null,
    selectedKeyword: null,

    init() {
        this.container = document.getElementById('hotwordsContainer');
        this.relatedSection = document.getElementById('hotwordRelatedSection');
        this.relatedList = document.getElementById('hotwordRelatedList');
        this.relatedTitle = document.getElementById('hotwordRelatedTitle');
        this.clearBtn = document.getElementById('clearHotwordBtn');

        this.clearBtn.addEventListener('click', () => {
            this.clearSelection();
            MapModule.clearHighlight();
        });
    },

    update(range, typeId = null) {
        this.currentRange = range;
        this.currentTypeId = typeId;
        this.selectedKeyword = null;
        this.hideRelatedSection();
        this.render();
    },

    render() {
        const hotwords = AppData.getHotwords(this.currentRange, this.currentTypeId);
        this.container.innerHTML = '';

        hotwords.forEach((word, index) => {
            const item = this.createHotwordItem(word, index);
            this.container.appendChild(item);
        });
    },

    createHotwordItem(word, index) {
        const item = document.createElement('div');
        item.className = `hotword-item level-${word.level}`;
        item.style.animationDelay = `${index * 0.05}s`;
        item.dataset.keyword = word.text;

        const info = document.createElement('div');
        info.className = 'hotword-item-info';

        const mainRow = document.createElement('div');
        mainRow.className = 'hotword-item-main';

        const text = document.createElement('span');
        text.className = 'hotword-text';
        text.textContent = word.text;

        const typeTag = document.createElement('span');
        typeTag.className = 'hotword-type-tag';
        typeTag.textContent = word.typeLabel || this.getTypeLabel(word.type);

        mainRow.appendChild(text);
        mainRow.appendChild(typeTag);

        const metaRow = document.createElement('div');
        metaRow.className = 'hotword-item-main';
        metaRow.style.gap = '8px';

        const count = document.createElement('span');
        count.className = 'hotword-count';
        count.textContent = `${word.count}次`;

        const growth = document.createElement('span');
        growth.className = 'hotword-growth up';
        growth.innerHTML = `▲ ${word.growth}%`;

        metaRow.appendChild(count);
        metaRow.appendChild(growth);

        info.appendChild(mainRow);
        info.appendChild(metaRow);
        item.appendChild(info);

        item.addEventListener('click', () => {
            this.onWordClick(word, item);
        });

        return item;
    },

    getTypeLabel(type) {
        const labels = {
            'place': '地点',
            'mall': '商圈',
            'event': '事件'
        };
        return labels[type] || '其他';
    },

    onWordClick(word, element) {
        if (this.selectedKeyword === word.text) {
            this.clearSelection();
            MapModule.clearHighlight();
        } else {
            this.clearSelection();
            this.selectedKeyword = word.text;
            element.classList.add('selected');
            
            this.highlightMapByKeyword(word.text);
            this.showRelatedSection(word);
        }
    },

    highlightMapByKeyword(keyword) {
        MapModule.highlightedComplaintIds.clear();
        
        const relatedComplaints = AppData.getHotwordRelatedComplaints(
            this.currentRange, 
            keyword, 
            this.currentTypeId
        );
        
        relatedComplaints.forEach(c => {
            MapModule.highlightedComplaintIds.add(c.id);
        });

        MapModule.applyHighlight();
    },

    showRelatedSection(word) {
        const relatedComplaints = AppData.getHotwordRelatedComplaints(
            this.currentRange, 
            word.text, 
            this.currentTypeId
        );

        if (relatedComplaints.length === 0) {
            this.hideRelatedSection();
            return;
        }

        this.relatedTitle.textContent = `关联点位 (${relatedComplaints.length})`;
        this.relatedList.innerHTML = '';

        relatedComplaints.forEach((complaint, index) => {
            const item = document.createElement('div');
            item.className = 'hotword-related-item';
            item.style.opacity = '0';
            item.style.transform = 'translateX(-10px)';
            item.style.transition = 'all 0.3s ease';

            const address = document.createElement('div');
            address.className = 'hotword-related-address';
            address.textContent = complaint.address || complaint.summary.substring(0, 30) + '...';

            const meta = document.createElement('div');
            meta.className = 'hotword-related-meta';

            const source = document.createElement('span');
            source.className = 'hotword-related-source';
            source.textContent = complaint.source;

            const time = document.createElement('span');
            time.textContent = complaint.timeAgo;

            meta.appendChild(source);
            meta.appendChild(time);

            item.appendChild(address);
            item.appendChild(meta);

            item.addEventListener('click', () => {
                MapModule.openDetailCard(complaint, complaint.x, complaint.y);
            });

            this.relatedList.appendChild(item);

            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * 50);
        });

        this.relatedSection.style.display = 'block';
    },

    hideRelatedSection() {
        this.relatedSection.style.display = 'none';
    },

    clearSelection() {
        this.selectedKeyword = null;
        const items = this.container.querySelectorAll('.hotword-item');
        items.forEach(item => item.classList.remove('selected'));
        this.hideRelatedSection();
    },

    animateIn() {
        const items = this.container.querySelectorAll('.hotword-item');
        items.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                item.style.transition = 'all 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
            }, index * 30);
        });
    }
};

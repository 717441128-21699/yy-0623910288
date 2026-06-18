const HotwordsModule = {
    container: null,
    currentRange: 'today',
    currentTypeId: null,
    selectedKeyword: null,

    init() {
        this.container = document.getElementById('hotwordsContainer');
    },

    update(range, typeId = null) {
        this.currentRange = range;
        this.currentTypeId = typeId;
        this.selectedKeyword = null;
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
            MapModule.highlightByKeyword(word.text);
        }
    },

    clearSelection() {
        this.selectedKeyword = null;
        const items = this.container.querySelectorAll('.hotword-item');
        items.forEach(item => item.classList.remove('selected'));
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

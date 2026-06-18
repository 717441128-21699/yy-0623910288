const HotwordsModule = {
    container: null,
    currentRange: 'today',

    init() {
        this.container = document.getElementById('hotwordsContainer');
    },

    update(range) {
        this.currentRange = range;
        this.render();
    },

    render() {
        const hotwords = AppData.getHotwords(this.currentRange);
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

        const text = document.createElement('span');
        text.className = 'hotword-text';
        text.textContent = word.text;

        const count = document.createElement('span');
        count.className = 'hotword-count';
        count.textContent = word.count;

        item.appendChild(text);
        item.appendChild(count);

        item.addEventListener('mouseenter', () => {
            this.showWordDetail(word, item);
        });

        item.addEventListener('mouseleave', () => {
            this.hideWordDetail();
        });

        item.addEventListener('click', () => {
            this.onWordClick(word);
        });

        return item;
    },

    showWordDetail(word, element) {
    },

    hideWordDetail() {
    },

    onWordClick(word) {
        console.log('Hotword clicked:', word);
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

const AppData = {
    districts: [
        { id: 0, name: '城东区', path: 'M50,100 L250,80 L280,180 L260,280 L200,320 L80,300 L50,200 Z', centerX: 160, centerY: 200 },
        { id: 1, name: '城西区', path: 'M280,180 L250,80 L450,60 L550,100 L520,220 L420,260 L320,240 Z', centerX: 390, centerY: 165 },
        { id: 2, name: '城南区', path: 'M200,320 L260,280 L320,240 L420,260 L480,320 L450,420 L350,460 L250,440 L180,380 Z', centerX: 325, centerY: 360 },
        { id: 3, name: '城北区', path: 'M50,100 L50,200 L80,300 L200,320 L180,380 L100,400 L40,350 L20,200 Z', centerX: 100, centerY: 250 },
        { id: 4, name: '高新区', path: 'M520,220 L550,100 L680,120 L750,200 L760,350 L700,420 L580,450 L520,400 L480,320 L420,260 Z', centerX: 600, centerY: 280 }
    ],

    complaintTypes: [
        { id: 1, name: '占道经营', color: '#ff6b6b' },
        { id: 2, name: '夜间施工噪声', color: '#ffd93d' },
        { id: 3, name: '垃圾堆放', color: '#6bcb77' },
        { id: 4, name: '共享单车淤积', color: '#4d96ff' }
    ],

    sources: ['12345热线', '数字城管', '微信公众号', '官方微博', '市民APP'],

    summaryTemplates: [
        '该处流动摊贩占道经营严重，影响行人通行，希望尽快整治',
        '夜间工地施工噪音过大，严重影响周边居民休息，已多次投诉',
        '小区周边垃圾堆放多日未清理，气味难闻，蚊虫滋生',
        '地铁站口共享单车堆积如山，占用盲道和人行道',
        '菜市场周边占道经营现象普遍，上下班高峰期通行困难',
        '居民区附近工地夜间施工，机械噪音持续到凌晨',
        '街巷深处垃圾乱扔，无人清理，环境脏乱差',
        '商圈周边共享单车乱停乱放，影响城市形象',
        '学校门口流动摊贩多，食品安全无保障，堵塞交通',
        '建筑工地夜间施工扰民，希望相关部门加强监管',
        '老旧小区生活垃圾清运不及时，垃圾桶爆满',
        '公交站台共享单车乱停，乘客上下车不便'
    ],

    complaints: {
        today: [],
        threedays: [],
        week: []
    },

    hotwords: {
        today: [],
        threedays: [],
        week: []
    },

    teams: {
        today: [],
        threedays: [],
        week: []
    },

    teamNames: [
        '城管执法一大队',
        '城管执法二大队',
        '城管执法三大队',
        '城管执法四大队',
        '城管执法五大队',
        '高新区执法中队',
        '经开区执法中队'
    ],

    hotwordTemplates: [
        { text: '人民路', type: 'place' },
        { text: '解放路', type: 'place' },
        { text: '中山路', type: 'place' },
        { text: '建设路', type: 'place' },
        { text: '和平路', type: 'place' },
        { text: '万达广场', type: 'mall' },
        { text: '万象城', type: 'mall' },
        { text: '国贸中心', type: 'mall' },
        { text: '时代广场', type: 'mall' },
        { text: '大学城', type: 'place' },
        { text: '火车站', type: 'place' },
        { text: '汽车站', type: 'place' },
        { text: '夜市', type: 'event' },
        { text: '凌晨施工', type: 'event' },
        { text: '垃圾清运', type: 'event' },
        { text: '共享单车', type: 'event' },
        { text: '流动摊贩', type: 'event' },
        { text: '油烟扰民', type: 'event' },
        { text: '占道停车', type: 'event' },
        { text: '城中村', type: 'place' }
    ],

    init() {
        this.generateComplaints();
        this.generateHotwords();
        this.generateTeams();
    },

    generateComplaints() {
        const counts = { today: 35, threedays: 80, week: 120 };
        
        Object.keys(counts).forEach(range => {
            const complaints = [];
            for (let i = 0; i < counts[range]; i++) {
                const district = this.districts[Math.floor(Math.random() * this.districts.length)];
                const type = this.complaintTypes[Math.floor(Math.random() * this.complaintTypes.length)];
                const source = this.sources[Math.floor(Math.random() * this.sources.length)];
                const summary = this.summaryTemplates[Math.floor(Math.random() * this.summaryTemplates.length)];
                
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 60 + 20;
                const x = district.centerX + Math.cos(angle) * radius;
                const y = district.centerY + Math.sin(angle) * radius;
                
                const timeAgo = this.getTimeAgo(range, i, counts[range]);
                
                complaints.push({
                    id: `${range}-${i}`,
                    x: Math.max(40, Math.min(760, x)),
                    y: Math.max(40, Math.min(560, y)),
                    typeId: type.id,
                    typeName: type.name,
                    typeColor: type.color,
                    districtId: district.id,
                    districtName: district.name,
                    summary: summary,
                    source: source,
                    similarCount: Math.floor(Math.random() * 30) + 1,
                    timeAgo: timeAgo,
                    timestamp: Date.now() - Math.random() * this.getRangeMs(range)
                });
            }
            this.complaints[range] = complaints;
        });
    },

    getTimeAgo(range, index, total) {
        const maxHours = range === 'today' ? 12 : range === 'threedays' ? 72 : 168;
        const hours = Math.floor((index / total) * maxHours + Math.random() * 2);
        if (hours < 1) return '刚刚';
        if (hours < 24) return `${hours}小时前`;
        const days = Math.floor(hours / 24);
        return `${days}天前`;
    },

    getRangeMs(range) {
        switch (range) {
            case 'today': return 12 * 60 * 60 * 1000;
            case 'threedays': return 3 * 24 * 60 * 60 * 1000;
            case 'week': return 7 * 24 * 60 * 60 * 1000;
            default: return 24 * 60 * 60 * 1000;
        }
    },

    generateHotwords() {
        const counts = { today: 18, threedays: 24, week: 30 };
        
        Object.keys(counts).forEach(range => {
            const hotwords = [];
            const shuffled = [...this.hotwordTemplates].sort(() => Math.random() - 0.5);
            const selected = shuffled.slice(0, counts[range]);
            
            selected.forEach((word, index) => {
                const isHot = index < 5;
                const isWarm = index >= 5 && index < 12;
                const level = isHot ? 'hot' : isWarm ? 'warm' : 'normal';
                const count = Math.floor(Math.random() * 100) + (isHot ? 80 : isWarm ? 40 : 15);
                const growth = Math.floor(Math.random() * 50) + (isHot ? 30 : isWarm ? 15 : 5);
                
                hotwords.push({
                    text: word.text,
                    type: word.type,
                    level: level,
                    count: count,
                    growth: growth
                });
            });
            
            hotwords.sort((a, b) => b.count - a.count);
            this.hotwords[range] = hotwords;
        });
    },

    generateTeams() {
        const multipliers = { today: 1, threedays: 2.8, week: 4.5 };
        
        Object.keys(multipliers).forEach(range => {
            const teams = [];
            const mult = multipliers[range];
            
            this.teamNames.forEach((name, index) => {
                const base = 80 + Math.floor(Math.random() * 50);
                const total = Math.floor(base * mult);
                const dispatched = total;
                const arrived = Math.floor(total * (0.6 + Math.random() * 0.25));
                const replied = Math.floor(arrived * (0.7 + Math.random() * 0.2));
                
                teams.push({
                    id: index,
                    name: name,
                    total: total,
                    dispatched: dispatched,
                    arrived: arrived,
                    replied: replied
                });
            });
            
            teams.sort((a, b) => b.total - a.total);
            this.teams[range] = teams;
        });
    },

    getComplaints(range) {
        return this.complaints[range] || [];
    },

    getHotwords(range) {
        return this.hotwords[range] || [];
    },

    getTeams(range) {
        return this.teams[range] || [];
    },

    getDistrictStats(range) {
        const complaints = this.getComplaints(range);
        const stats = {};
        
        this.districts.forEach(d => {
            stats[d.id] = { name: d.name, count: 0 };
        });
        
        complaints.forEach(c => {
            if (stats[c.districtId]) {
                stats[c.districtId].count++;
            }
        });
        
        return Object.values(stats);
    },

    getSummaryStats(range) {
        const complaints = this.getComplaints(range);
        const teams = this.getTeams(range);
        
        const total = complaints.length;
        const dispatched = teams.reduce((sum, t) => sum + t.dispatched, 0);
        const arrived = teams.reduce((sum, t) => sum + t.arrived, 0);
        const replied = teams.reduce((sum, t) => sum + t.replied, 0);
        const pending = Math.max(0, total - replied);
        const trend = (Math.random() * 20 - 5).toFixed(1);
        
        return { total, dispatched, arrived, replied, pending, trend };
    }
};

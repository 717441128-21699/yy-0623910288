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

    teamConfig: [
        { name: '城管执法一大队', districts: [0, 1], area: '城东片区（含中心商圈）' },
        { name: '城管执法二大队', districts: [2], area: '城南片区' },
        { name: '城管执法三大队', districts: [3], area: '城北片区' },
        { name: '城管执法四大队', districts: [1], area: '城西片区' },
        { name: '城管执法五大队', districts: [0, 2], area: '东南片区' },
        { name: '高新区执法中队', districts: [4], area: '高新区全域' },
        { name: '经开区执法中队', districts: [4], area: '高新区经开片区' }
    ],

    hotwordTemplates: [
        { text: '人民路', type: 'place', typeLabel: '道路' },
        { text: '解放路', type: 'place', typeLabel: '道路' },
        { text: '中山路', type: 'place', typeLabel: '道路' },
        { text: '建设路', type: 'place', typeLabel: '道路' },
        { text: '和平路', type: 'place', typeLabel: '道路' },
        { text: '万达广场', type: 'mall', typeLabel: '商圈' },
        { text: '万象城', type: 'mall', typeLabel: '商圈' },
        { text: '国贸中心', type: 'mall', typeLabel: '商圈' },
        { text: '时代广场', type: 'mall', typeLabel: '商圈' },
        { text: '大学城', type: 'place', typeLabel: '区域' },
        { text: '火车站', type: 'place', typeLabel: '交通枢纽' },
        { text: '汽车站', type: 'place', typeLabel: '交通枢纽' },
        { text: '夜市', type: 'event', typeLabel: '事件' },
        { text: '凌晨施工', type: 'event', typeLabel: '事件' },
        { text: '垃圾清运', type: 'event', typeLabel: '事件' },
        { text: '共享单车', type: 'event', typeLabel: '事件' },
        { text: '流动摊贩', type: 'event', typeLabel: '事件' },
        { text: '油烟扰民', type: 'event', typeLabel: '事件' },
        { text: '占道停车', type: 'event', typeLabel: '事件' },
        { text: '城中村', type: 'place', typeLabel: '区域' }
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

                const statuses = ['已派单', '已到场', '已回复', '处理中'];
                const statusWeights = [0.15, 0.2, 0.5, 0.15];
                const rand = Math.random();
                let cumWeight = 0;
                let status = statuses[0];
                for (let s = 0; s < statuses.length; s++) {
                    cumWeight += statusWeights[s];
                    if (rand <= cumWeight) {
                        status = statuses[s];
                        break;
                    }
                }

                const relatedKeywords = [];
                const keywordCount = Math.floor(Math.random() * 2) + 1;
                for (let k = 0; k < keywordCount; k++) {
                    const template = this.hotwordTemplates[Math.floor(Math.random() * this.hotwordTemplates.length)];
                    if (!relatedKeywords.includes(template.text)) {
                        relatedKeywords.push(template.text);
                    }
                }
                
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
                    timestamp: Date.now() - Math.random() * this.getRangeMs(range),
                    status: status,
                    relatedKeywords: relatedKeywords,
                    teamId: Math.floor(Math.random() * this.teamConfig.length),
                    address: `${district.name}${['人民路', '解放路', '中山路', '建设路'][Math.floor(Math.random() * 4)]}${Math.floor(Math.random() * 200) + 1}号附近`
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

                const relatedComplaintIds = this.getRelatedComplaintIds(range, word.text);
                
                hotwords.push({
                    text: word.text,
                    type: word.type,
                    typeLabel: word.typeLabel,
                    level: level,
                    count: count,
                    growth: growth,
                    relatedComplaintIds: relatedComplaintIds
                });
            });
            
            hotwords.sort((a, b) => b.count - a.count);
            this.hotwords[range] = hotwords;
        });
    },

    getRelatedComplaintIds(range, keyword) {
        const complaints = this.complaints[range] || [];
        const related = [];
        
        complaints.forEach(c => {
            if (c.relatedKeywords && c.relatedKeywords.includes(keyword)) {
                related.push(c.id);
            }
        });

        if (related.length < 3) {
            const randomComplaints = complaints.sort(() => Math.random() - 0.5).slice(0, Math.min(5, complaints.length));
            randomComplaints.forEach(c => {
                if (!related.includes(c.id)) {
                    related.push(c.id);
                }
            });
        }
        
        return related.slice(0, 8);
    },

    generateTeams() {
        const multipliers = { today: 1, threedays: 2.8, week: 4.5 };
        
        Object.keys(multipliers).forEach(range => {
            const teams = [];
            const mult = multipliers[range];
            
            this.teamConfig.forEach((config, index) => {
                const base = 80 + Math.floor(Math.random() * 50);
                const total = Math.floor(base * mult);
                const dispatched = total;
                const arrived = Math.floor(total * (0.6 + Math.random() * 0.25));
                const replied = Math.floor(arrived * (0.7 + Math.random() * 0.2));

                const statusDist = {
                    '已派单': total - arrived,
                    '已到场': arrived - replied,
                    '已回复': replied,
                    '处理中': Math.floor(total * 0.05)
                };

                const pendingComplaints = this.getPendingComplaints(range, index);
                
                teams.push({
                    id: index,
                    name: config.name,
                    area: config.area,
                    districts: config.districts,
                    total: total,
                    dispatched: dispatched,
                    arrived: arrived,
                    replied: replied,
                    statusDist: statusDist,
                    pendingComplaints: pendingComplaints
                });
            });
            
            teams.sort((a, b) => b.total - a.total);
            this.teams[range] = teams;
        });
    },

    getPendingComplaints(range, teamId) {
        const complaints = this.complaints[range] || [];
        const teamComplaints = complaints.filter(c => c.teamId === teamId);
        
        const pending = teamComplaints.filter(c => c.status !== '已回复');
        
        return pending
            .sort((a, b) => b.similarCount - a.similarCount)
            .slice(0, 5);
    },

    getComplaints(range, typeId = null, keyword = null) {
        let complaints = this.complaints[range] || [];
        
        if (typeId) {
            complaints = complaints.filter(c => c.typeId === typeId);
        }
        
        if (keyword) {
            complaints = complaints.filter(c => 
                c.relatedKeywords && c.relatedKeywords.includes(keyword)
            );
        }
        
        return complaints;
    },

    getHotwords(range, typeId = null) {
        let hotwords = this.hotwords[range] || [];
        
        if (typeId) {
            const typeComplaints = this.getComplaints(range, typeId);
            const relatedKeywords = new Set();
            typeComplaints.forEach(c => {
                if (c.relatedKeywords) {
                    c.relatedKeywords.forEach(k => relatedKeywords.add(k));
                }
            });
            hotwords = hotwords.filter(h => relatedKeywords.has(h.text));
        }
        
        return hotwords;
    },

    getTeams(range, typeId = null) {
        let teams = this.teams[range] || [];
        
        if (typeId) {
            teams = teams.map(team => {
                const teamComplaints = this.getComplaints(range, typeId).filter(c => c.teamId === team.id);
                const dispatched = teamComplaints.length;
                
                const processing = teamComplaints.filter(c => c.status === '处理中').length;
                const arrived = teamComplaints.filter(c => c.status === '已到场').length + processing;
                const replied = teamComplaints.filter(c => c.status === '已回复').length;
                
                const pendingComplaints = this.getPendingComplaints(range, team.id, typeId);
                
                return {
                    ...team,
                    total: dispatched,
                    dispatched,
                    arrived,
                    replied,
                    statusDist: {
                        '已派单': Math.max(0, dispatched - arrived),
                        '处理中': processing,
                        '已到场': Math.max(0, arrived - replied - processing),
                        '已回复': replied
                    },
                    pendingComplaints: pendingComplaints
                };
            }).filter(t => t.total > 0);
        }
        
        return teams;
    },

    getTeamDetail(range, teamId, typeId = null) {
        const teams = this.getTeams(range, typeId);
        return teams.find(t => t.id === teamId) || null;
    },

    getPendingComplaints(range, teamId, typeId = null) {
        const complaints = this.getComplaints(range, typeId).filter(c => c.teamId === teamId);
        const pending = complaints.filter(c => c.status !== '已回复');
        
        return pending
            .sort((a, b) => b.similarCount - a.similarCount)
            .slice(0, 5);
    },

    getDispatchOverview(range, typeId = null) {
        const complaints = this.getComplaints(range, typeId);
        const teams = this.getTeams(range, typeId);
        
        const districtPressures = this.districts.map(district => {
            const districtComplaints = complaints.filter(c => c.districtId === district.id);
            const pending = districtComplaints.filter(c => c.status !== '已回复').length;
            
            let level = 'low';
            if (pending >= 15) level = 'high';
            else if (pending >= 8) level = 'medium';
            
            return {
                districtId: district.id,
                name: district.name,
                pendingCount: pending,
                totalCount: districtComplaints.length,
                level: level
            };
        }).sort((a, b) => b.pendingCount - a.pendingCount);
        
        const now = Date.now();
        const twoHoursAgo = 2 * 60 * 60 * 1000;
        const highRisk = complaints
            .filter(c => c.status !== '已回复' && (now - c.timestamp) > twoHoursAgo)
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 5);
        
        const suggestedTeams = teams
            .map(team => {
                const pending = team.total - team.replied;
                const riskScore = pending / (team.total || 1);
                return {
                    ...team,
                    pending,
                    riskScore
                };
            })
            .sort((a, b) => b.riskScore - a.riskScore)
            .slice(0, 4);
        
        return {
            districtPressures,
            highRisk,
            suggestedTeams
        };
    },

    getHotwordRelatedComplaints(range, keyword, typeId = null) {
        const complaints = this.getComplaints(range, typeId);
        const related = complaints.filter(c => 
            c.relatedKeywords && c.relatedKeywords.includes(keyword)
        );
        
        return related
            .sort((a, b) => b.similarCount - a.similarCount)
            .slice(0, 8);
    },

    getSimilarComplaintsGroup(complaint, range, typeId = null) {
        const allComplaints = this.getComplaints(range, typeId);
        
        const nearComplaints = allComplaints.filter(c => {
            if (c.id === complaint.id) return true;
            const dist = Math.sqrt(
                Math.pow(complaint.x - c.x, 2) + 
                Math.pow(complaint.y - c.y, 2)
            );
            return dist < 50 && c.typeId === complaint.typeId;
        });
        
        const recentComplaints = nearComplaints
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 6);
        
        const sourceDist = {};
        nearComplaints.forEach(c => {
            sourceDist[c.source] = (sourceDist[c.source] || 0) + 1;
        });
        
        const sourceArray = Object.entries(sourceDist)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
        
        const now = Date.now();
        const hourlyCounts = [0, 0, 0, 0, 0, 0];
        nearComplaints.forEach(c => {
            const hoursAgo = Math.floor((now - c.timestamp) / (60 * 60 * 1000));
            if (hoursAgo < 6) {
                hourlyCounts[5 - hoursAgo]++;
            }
        });
        
        return {
            recentComplaints,
            sourceDistribution: sourceArray,
            hourlyTrend: hourlyCounts,
            totalCount: nearComplaints.length
        };
    },

    getDistrictStats(range, typeId = null) {
        const complaints = this.getComplaints(range, typeId);
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

    getSummaryStats(range, typeId = null) {
        const complaints = this.getComplaints(range, typeId);
        const teams = this.getTeams(range, typeId);
        
        const total = complaints.length;
        const dispatched = teams.reduce((sum, t) => sum + t.dispatched, 0);
        const arrived = teams.reduce((sum, t) => sum + t.arrived, 0);
        const replied = teams.reduce((sum, t) => sum + t.replied, 0);
        const pending = Math.max(0, total - replied);
        const trend = (Math.random() * 20 - 5).toFixed(1);
        
        return { total, dispatched, arrived, replied, pending, trend };
    }
};

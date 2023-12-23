/**
 * LOGS V1 API
 * @param {string} name 角色名
 * @param {string} area 服务器
 * @returns 
 */
function checkLogs_V1(name, area) {
    const apiKey = '1ae59857400102522a55fb53e8aba5d6';
    const url = `https://www.fflogs.com/v1/rankings/character/${encodeURIComponent(name)}/${encodeURIComponent(area)}/CN?metric=dps&api_key=${apiKey}`;
    function _avg(param) {
        if (typeof param === 'string') {
            param = JSON.parse(param)
        }

        // 过滤难度为100的日志并进行分组
        const groupedData = param.reduce((groups, item) => {
            if (item.difficulty !== 100) {
                const group = groups[item.encounterID] || [];
                group.push(item);
                groups[item.encounterID] = group;
            }
            return groups;
        }, {});

        // 获取每个分组中最大 percentile 的项
        const result = Object.values(groupedData).map(group => {
            const maxPercentileItem = group.reduce((maxItem, currentItem) => {
                return currentItem.percentile > maxItem.percentile ? currentItem : maxItem;
            }, { percentile: -1 });
            return maxPercentileItem;
        });

        // 计算平均分
        const avg = result.reduce((acc, current) => acc + Number(current.percentile), 0) / Math.max(result.length, 1);
        return avg
    }
    return new Promise(resolve => {
        fetch(url).then(r => {
            r.json().then(resp => {
                if (resp.error) {
                    resolve(`${name}${area}无零式记录`)
                }
                const avg = Math.round(_avg(resp) * 10) / 10
                resolve(`${name}${area}${avg}`)
            })
        })
    })
}

/**
 * LOGS V2 API
 * @param {string} name 用户名
 * @param {string} area 服务器
 * @param {string} token logs token
 */
function checkLogs_V2(name, area, token) {
    const url = "https://cn.fflogs.com/api/v2/client"
    const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    };
    const paylod = {
        "query": `{characterData{character(name:\"${name}\",serverRegion:\"cn\",serverSlug:\"${area}\"){zoneRankings(zoneID:54,difficulty:101,metric:rdps)}}}`
    }
    return new Promise((resolve, reject) => {
        // 使用 fetch 发送 POST 请求
        fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(paylod)
        })
            .then(response => response.json())
            .then(resp => {
                let best = resp.data.characterData.character.zoneRankings.bestPerformanceAverage
                if (best) {
                    best = `${name}${area}${best.toFixed(1)}`
                    resolve(`${name}${area}${best}`)
                } else {
                    resolve(`${name}${area}无零式记录`)
                }
            })
            .catch(error => {
                // 处理错误
                console.error("fetch error".error);
                reject("Error:", error);
            });
    })
}

const serverDir = [
    "水晶塔",
    "银泪湖",
    "太阳海岸",
    "伊修加德",
    "红茶川",
    "紫水栈桥",
    "延夏",
    "静语庄园",
    "摩杜纳",
    "海猫茶屋",
    "柔风海湾",
    "琥珀原",
    "潮风亭",
    "神拳痕",
    "白银乡",
    "白金幻象",
    "旅人栈桥",
    "拂晓之间",
    "龙巢神殿",
    "梦羽宝境",
    "拉诺西亚",
    "幻影群岛",
    "神意之地",
    "萌芽池",
    "红玉海",
    "宇宙和音",
    "沃仙曦染",
    "晨曦王座"
]

const getServer = (str) => {
    const serverStr = str.slice(-4);
    let name, server
    for (let i = 0; i < serverDir.length; i++) {
        if (serverStr.includes(serverDir[i])) {
            server = serverDir[i]
            name = str.replace(server, '')
        } else {
            name = str
        }
    }
    return [name, server]
}

const tts = (t) => callOverlayHandler({ call: "cactbotSay", text: t })

if (new URLSearchParams(location.search).get("alerts") !== "0" && !/raidboss_timeline_only/.test(location.href)) {
    console.log("查查你的 v1.0.0 已加载");
    Options.Triggers.push({
        id: "查查你的",
        zoneId: ZoneId.MatchAll,
        config: [
            {
                id: "查查你的",
                name: { en: "查查你的" },
                type: "select",
                options: { en: { "开": "开", "关": "关" } },
                default: "关",
            },
            {
                id: "API版本",
                name: { en: "API版本" },
                type: "select",
                options: { en: { "V1": "V1", "V2": "V2" } },
                default: "V1",
                comment: { cn: "V2准确性高，需设置token，默认token有过期时间" }
            },
            {
                id: "服务器",
                name: { en: "角色服务器" },
                type: "string",
                default: "海猫茶屋",
            },
            {
                id: "token",
                name: { en: "token(V2用)" },
                type: "string",
                default: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5YWVhZDIzYS0xNTcxLTRjOGMtOWEwZi00ZmViZTYwOTU0YzciLCJqdGkiOiIyMjM4MzdiNzdhYjM5YjljNWZkZDVhY2JhMGZlYzU1YTdmYWY0NGYxNDAxODI0ZjE4ZGNkYjEwNTc5ZDI4ZjJhODFlY2Q0ZmE1YzVmOTE4YSIsImlhdCI6MTcwMzMzNDgwNi40Njg2NzQsIm5iZiI6MTcwMzMzNDgwNi40Njg2NzcsImV4cCI6MTczNDQzODgwNi40NTkyMDYsInN1YiI6IiIsInNjb3BlcyI6WyJ2aWV3LXVzZXItcHJvZmlsZSIsInZpZXctcHJpdmF0ZS1yZXBvcnRzIl19.gVRChaRmZdZ45MJ2KsJfBgVZeyWFrH2aYA3FXflb73tMecmwEH3mmhAKPAfJQvHte-1kSR2qD9pTrFGUALd6EKNhOYjPoAiMPD8s2eL-7ZIS_iaoh7cbAOfR6yfbet9NCJeB0Oqf_UKQs3IFEv7eDxDufOoGlQMgE1iG2T-phIVSqqLcW-PejjNGKUbaxdy_9ksLpx9CvzDhFI_KIo5E8mvJeugy502eVIJCosYsoqSNveF6WTBf_90lEwYNgIcG-KpS7a1DS_PTpiOiwHgViOJRs8gtjYOKynJZ8FS1S9wwDj8CDCAweCziLgId_X7b20_XfMgCKEIvVtG11QArSkIP1doUYZFPN8uH2iP5rgJ6nDpkj62m11K_qUAjOaG9NbiD66swp3KxdOb4sBf74t-WCzw20GkENlLrth0o9j6pumivilbOnZHHvpltvplILK2EHRewQzImwUHOdDXvN78NF6B5XKiKdu29abOolvC8oM5gKuwqhL2q1PcQExudbCXVJxMZSCeXe-56cdw25aFUtTXFwTEg7_EuQxDnA5g5nTza2ffvQ2XoIJhkcCJs3wbgbK9ycHQdRke7ojUKHqcTwKhr8ZdlBLYpIvlpcuWxT16qQcF-yxvldNkspoUxYS3WQ2fRTJ4BMf5RfYLuHwMcGtQ1NryYBAZ9kBCcEf0",
            },
        ],
        triggers: [
            {
                id: "查查你的",
                type: "GameLog",
                regex: /\[.*\] ChatLog (00:\d{4})::(.+?)加入了小队。/,
                // netRegex: NetRegexes.startsUsing({ id: "加入了小队" }),
                // condition: (data) => {
                //     console.log("condition", data);
                // },
                run: (data, matches) => {
                    if (data.triggerSetConfig["查查你的"] === '开') {
                        let [name, server] = getServer(matches["2"])
                        if (!server) {
                            server = data.triggerSetConfig["服务器"]
                        }
                        if (data.triggerSetConfig["API版本"] === 'V2') {
                            const token = data.triggerSetConfig["token"]
                            checkLogs_V2(name, server, token).then(text => {
                                console.log("LOGS-V2:", text);
                                tts(text)
                            })
                        } else {
                            checkLogs_V1(name, server).then(text => {
                                console.log("LOGS-V1:", text);
                                tts(text)
                            })
                        }
                    }
                },
            },
        ],
    });
}
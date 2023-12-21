function checkLogs(name, area) {
    const apiKey = '1ae59857400102522a55fb53e8aba5d6';
    const url = `https://www.fflogs.com/v1/rankings/character/${encodeURIComponent(name)}/${encodeURIComponent(area)}/CN?metric=dps&api_key=${apiKey}`;
    function _avg(param) {
        if (typeof param === 'string') {
            param = JSON.parse(param)
        }
        // 过滤普通难度
        param = param.filter(e => {
            return e.difficulty !== 100
        })
        // 计算平均分
        const result = param.reduce((acc, current) => {
            return acc += current.percentile
        }, 0);
        return result / param.length
    }
    return new Promise(resolve => {
        fetch(url).then(r => {
            r.json().then(resp => {
                if (resp.error) {
                    resolve(`${name}${area}无零式记录`)
                }
                const avg = _avg(resp)
                resolve(`${name}${area}${parseInt(avg)}`)
            })
        })
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
                default: "开",
            },
            {
                id: "服务器",
                name: { en: "角色服务器" },
                type: "string",
                default: "海猫茶屋",
            },
        ],
        triggers: [
            {
                id: "查查你的",
                // type: "GameLog",
                regex: /\[.*\] ChatLog (00:\d{4})::(.+?)加入了小队。/,
                // netRegex: NetRegexes.startsUsing({ id: "加入了小队" }),
                // condition: (data) => {
                //     console.log("condition", data);
                // },
                run: (data, matches) => {
                    // console.log("data", data.triggerSetConfig["查查你的"]);
                    if (data.triggerSetConfig["查查你的"] === '开') {
                        // console.log("matches", JSON.stringify(matches["2"]));
                        let [name, server] = getServer(matches["2"])
                        if (!server) {
                            server = data.triggerSetConfig["服务器"]
                        }
                        checkLogs(name, server).then(text => {
                            console.log("LOGS:", text);
                            tts(text)
                        })
                    }
                },
            },
        ],
    });
}
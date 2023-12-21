
function checkLogs(name, area) {
    const https = require('https');
    const apiKey = '1ae59857400102522a55fb53e8aba5d6';
    const options = {
        hostname: 'www.fflogs.com',
        port: 443,
        path: `/v1/rankings/character/${encodeURIComponent(name)}/${encodeURIComponent(area)}/CN?metric=dps&api_key=${apiKey}`,
        method: 'GET'
    };
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
        // 发送HTTPS请求
        const req = https.request(options, (res) => {
            let data = '';
            // 接收响应数据
            res.on('data', (chunk) => {
                data += chunk;
            });
            // 当响应完成时，处理数据
            res.on('end', () => {
                resolve(_avg(data))
            });
        }).on('error', (error) => {
            console.error('请求错误：', error);
        });
        // 结束请求
        req.end();
    })

}


if (new URLSearchParams(location.search).get("alerts") !== "0" && /raidboss\.html/.test(location.href)) {
    console.log("成分查询已加载 2023.12.20");
    let area = "海猫茶屋" // TODO
    const tts = (t) => callOverlayHandler({ call: "cactbotSay", text: t })
    var joinLogReg = /\[.*\] ChatLog (00:\d{4})::(.+?)加入了小队。/;

    function join(e) {
        for (const log of e.detail.logs) {
            console.log("日志行", log)
            const match = log.match(joinLogReg)
            console.log("匹配结果", match);
            if (match) {
                const name = match[1]
                checkLogs(name, area).then(avg => {
                    const logs = `${name}:${parseInt(avg)}`
                    console.log("LOGS:", logs);
                    tts(logs)
                })
            }
        }
    }

    addOverlayListener("onLogEvent", join);
}


















const express = require('express');
const request = require('superagent');
const SSH = require('node-ssh');
const _ = require('lodash');

const config = require('./config.json');

const VPN_CLIENTS = {
    1: {
        hostname: 'ams-a54.ipvanish.com'
    },
    2: {
        hostname: 'fra-a57.ipvanish.com'
    },
    3: {
        hostname: 'par-a17.ipvanish.com'
    },
    4: {
        hostname: 'lon-a41.ipvanish.com'
    },
    5: {
        hostname: 'ams-c12.ipvanish.com'
    }
};

const until = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getSSHSession = async () => {
    const ssh = new SSH();
    const sshSession = await ssh.connect(config.asus);
    return sshSession;
};

const getIPVanishStatus = async () => {
    const ipvanishResponse = await request
        .get(config.ipvanish.servers);
    const hostnames = _.map(_.values(VPN_CLIENTS), client => client.hostname);
    return _.filter(
        JSON.parse(ipvanishResponse.text),
        server => _.includes(hostnames, _.get(server, 'properties.hostname')));
};

const getStatus = async () => {
    const status = [];
    const sshSession = await getSSHSession();
    const servers = await getIPVanishStatus();
    for (let i of _.keys(VPN_CLIENTS)) {
        const result = await sshSession.execCommand(`nvram get vpn_client${i}_state`);
        const server = _.find(servers, server => _.get(server, 'properties.hostname') === VPN_CLIENTS[i].hostname);
        const info = {
            client: i,
            online: _.get(server, 'properties.online'),
            title: _.get(server, 'properties.title'),
            country: _.get(server, 'properties.country'),
            city: _.get(server, 'properties.city'),
            hostname: _.get(server, 'properties.hostname'),
            ip: _.get(server, 'properties.ip'),
            visible: _.get(server, 'properties.visible'),
            capacity: _.get(server, 'properties.capacity'),
            status: result.stdout === '0' ? 'OFF' : 'ON'
        };
        status.push(info);
    }
    sshSession.dispose();
    return status;
};

const stopClient = async (client) => {
    const sshSession = await getSSHSession();
    const result = await sshSession.execCommand(`service stop_vpnclient${client}`);
    console.log(result);
    sshSession.dispose();
    return result;
};

const startClient = async (client) => {
    const sshSession = await getSSHSession();
    const result = await sshSession.execCommand(`service start_vpnclient${client}`);
    console.log(result);
    sshSession.dispose();
    return result;
};

const getRunningClient = async (status) => {
    const runningClient = _.chain(status)
        .find(client => client.status === 'ON')
        .get('client', 'none')
        .value();
    console.log('Running: ' + runningClient);
    return runningClient;
};

const stopRunningClient = async () => {
    const status = await getStatus();
    const runningClient = await getRunningClient(status);
    if (runningClient !== 'none') {
        await stopClient(runningClient);
        await until(15000);
    }
    return runningClient;
}

const switchToBestClient = async () => {
    const status = await getStatus();
    const runningClient = await getRunningClient(status);
    if (runningClient !== 'none') {
        await stopClient(runningClient);
        await until(2000);
        return await switchToBestClient();
    } else {
        const bestServer = _.chain(status)
            .filter(server => server.online && server.visible)
            .orderBy('capacity', 'asc')
            .first()
            .value();
       await startClient(bestServer.client);
       return bestServer;
    }
};

const app = express();
const port = config.express.port;

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
});

app.use('/', express.static('webapp/build'))

app.get('/vpn/status', async (req, res) => {
    const status = await getStatus();
    res.json(status);
});

app.post('/vpn/best', async (req, res) => {
    const bestCient = await switchToBestClient();
    res.json({ switchedTo: bestCient });
});

app.post('/vpn/stop', async (req, res) => {
    const stoppedCient = await stopRunningClient();
    res.json({ stopped: stoppedCient });
});

app.listen(port, () => console.log(`Asus WRT VPN configure app listening at http://localhost:${port}`))
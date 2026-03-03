import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

console.log("Resolving SRV...");
dns.resolveSrv('_mongodb._tcp.dorteltedarik.ysqtiqi.mongodb.net', (err, addresses) => {
    console.log('SRV:', err ? err.message : addresses);
});

console.log("Resolving TXT...");
dns.resolveTxt('dorteltedarik.ysqtiqi.mongodb.net', (err, addresses) => {
    console.log('TXT:', err ? err.message : addresses);
});

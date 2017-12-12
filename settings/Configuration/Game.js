const config = require('../config.json');
const MarketGame = require('./Game.json');
let appID = 0;
const fs = require('fs');
const fileName = './Game.json';
const file = require(fileName);

if (typeof config.Game === 'number' && (a % 1) === 0)
{
    appID = config.Game;
}
else if (config.Game === "CSGO")
{
    appID = 730;
}
else if (config.Game === "TF2")
{
    appID = 440;
}
else if (config.Game === "Dota 2")
{
    appID = 570;
}
else if (config.Game === "Unturned")
{
    appID = 304930;
}
else if (config.Game === "steam")
{
    appID = 753;
}

file.GameID = appID;
fs.writeFile(fileName, JSON.stringify(file, null, 2), function (err)
{
    if (err) return console.log(err);
    console.log(config.Game + " Activated");
});
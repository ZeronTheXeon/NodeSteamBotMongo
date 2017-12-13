// TheXeon
// 12/11/17

const config = require('./settings/config.json');

const SteamTotp = require('steam-totp');
const SteamUser = require('steam-user');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');
const fs = require('fs');
const colors = require('colors'); // Is supposedly used
const jsonfile = require('jsonfile');
const market = require('steam-market-pricing');

const adminConfig = require('./AdminOptions/Config.json');
const creatorConfig = require('./CreatorProperties/Config.json');
const gameConfig = require('./settings/games.json');
const commentConfig = require('./settings/Comments/comments.json');
const messageConfig = require('./settings/Messages/messages.json');

const SkinPrices = require('./settings/Prices/SkinPrices.json');
const CurrencyPrices = require('./settings/Prices/Currency Prices.json');

const TradeLog = require('./Logs/Trade.log');

const client = new SteamUser();
const community = new SteamCommunity();
const manager = new TradeOfferManager({
    steam: client,
    community: community,
    language: 'en',
});

function timeStamp(x)
{
    const date = new Date();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    const hour = date.getHours();
    if (x) return ("[".green + hour.yellow + ":".cyan + minute.yellow + ":".cyan + second.yellow + "]".green);
    else return ("[" + hour + ":" + minute + ":" + second + "]");
}

console.log("\x1b[8m SteamTrade Bot");
console.log("\x1b[33m Current Version:\x1b[35m 0.0.1");
console.log("\x1b[33mForked from:\x1b[35m https://github.com/Lonster_Monster\n\n");
console.log(timeStamp(true) + " This is a test of colors :)");

const logOnOptions = {
    accountName: config.username,
    password: config.password,
    twoFactorCode: SteamTotp.generateAuthCode(config.sharedSecret)
};

client.logOn(logOnOptions);

client.on('loggedOn', () =>
{
    console.log(timeStamp(true) + ' successfully logged on.');
    client.setPersona(SteamUser.Steam.EPersonaState.Online, config.SteamName);
    client.gamesPlayed(gameConfig.games.randItem());
});


client.on('friendRelationship', (steamID, relationship) =>
{
    if (relationship === 2)
    {
        client.addFriend(steamID);
        client.chatMessage(steamID, messageConfig.WELCOME);
        client.chatMessage(steamID, messageConfig.WELCOME2);
    }
});

client.on('webSession', (sessionid, cookies) =>
{
    manager.setCookies(cookies);
    community.setCookies(cookies);
    community.startConfirmationChecker(20000, config.IdentitySecret);
});

client.on("friendMessage", function (steamID, message)
{
    logToFile('.//Logs/Message.log', "\r\n" + timeStamp() + "'" + steamID + "'" + message + "--");
    message.toLowerCase();
    let replyMessage = "Sorry, I don't know that command! Type !help for more info :)";
    switch (message)
    {
        case "hi":
            replyMessage = messageConfig.hi;
            break;
        case "!help":
            replyMessage = messageConfig.help;
            break;
        case "!group":
            replyMessage = messageConfig.Group;
            break;
    }
    if (config.SpecialItems)
    {
        switch (message)
        {
            case "!buy trading cards":
                replyMessage = messageConfig.BuyCards;
                break;
            case "!sell trading cards":
                replyMessage = messageConfig.SellCards;
                break;
            case "!buy backgrounds":
                replyMessage = messageConfig.BuyBackgrounds;
                break;
            case "!sell backgrounds":
                replyMessage = messageConfig.SellBackgrounds;
                break;
            case "!buy emoticons":
                replyMessage = messageConfig.BuyEmoticons;
                break;
            case "!sell emoticons":
                replyMessage = messageConfig.SellEmoticons;
                break;
        }
    }
    client.chatMessage(steamID, replyMessage);
    logToFile('./Logs/Message.log', "\r\n" + timeStamp() + replyMessage + "--");
});

function acceptOffer(offer)
{
    offer.accept((err) =>
    {
        community.checkConfirmations();
        console.log(timeStamp(true) + " We Accepted an offer");
        if (err) console.log(timeStamp(true) + " There was an error accepting the offer.");
    });
}

function StockManagerOffer(offer)
{
    let ourItems = offer.itemsToGive;
    let theirItems = offer.itemsToReceive;
    let ourValue = 0;
    let theirValue = 0;
    let currentstock = 0;
    let StockLimit = 0;
    if (config.Enable_Dev_Stock_Manager)
    {
        for (let i in ourItems)
        {
            let item = ourItems[i].market_name;
            if (filestock[item])
            {
                currentstock = filestock[item].instock;
                fs.readFile(filestockname, (err, data) =>
                {
                    if (err) throw err;
                    console.log('File read');
                    console.log('writing to ' + filestockname);
                    filestock[item].instock = currentstock--;
                    fs.writeFile(filestockname, JSON.stringify(filestock, null, 2), function (err)
                    {
                        if (err) return console.log(err);
                        console.log('writing to ' + filestockname);
                    });
                });
            }
        }
        for (let i in theirItems)
        {
            let item = theirItems[i].market_name;
            if (filestock[item])
            {
                currentstock = processOffer.filestock[item].instock;
                fs.readFile(processOffer.filestockname, (err, data) =>
                {
                    if (err) throw err;
                    console.log('File read');
                    console.log('writing to ' + processOffer.filestockname);
                    processOffer.filestock[item].instock = processOffer.currentstock++;
                    fs.writeFile(filestockname, JSON.stringify(processOffer.filestock, null, 2), function (err)
                    {
                        if (err) return console.log(err);
                    });
                })
            }
        }
    }
    else
    {
        processOffer(offer);
    }
}

function declineOffer(offer)
{
    console.log(timeStamp(true) + "We declined an offer.");
    offer.decline((err) =>
    {
        if (err) console.log(timeStamp(true) + "There was an error declining the offer.");
    });
}

function processOffer(offer)
{
    if (offer.isGlitched() || offer.state === 11)
    {
        console.log(timeStamp(true) + "Offer was glitched, declining.");
        declineOffer(offer);
    }
    else if (offer.partner.getSteamID64() === config.OwnerID)
    {
        acceptOffer(offer);
    }
    else
    {
        let ourItems = offer.itemsToGive;
        let theirItems = offer.itemsToReceive;
        let ourValue = 0;
        let theirValue = 0;
        let currentstock = 0;
        let StockLimit = 0;
        let DataValue = 0;
        let filestockname = './/settings/Prices/DefaultPrice.json';
        let filestock = require(filestockname);
        for (let i in ourItems)
        {
            let item = ourItems[i].market_hash_name;
            if (CurrencyPrices[item])
            {
                currentstock = CurrencyPrices[item].instock;
                StockLimit = CurrencyPrices[item].stocklimit;
                filestockname = './/settings/Prices/Currency Prices.json';
            }
            else if (SkinPrices[item])
            {
                currentstock = SkinPrices[item].instock;
                StockLimit = SkinPrices[item].stocklimit;
                filestockname = './/settings/Prices/SkinPrices.json';
            }
            if (fs.readFileSync(filestockname))
            {
                console.log(timeStamp(true) + "Our " + item + " - stock number: " + currentstock + " / " + StockLimit + ".")
            }
            if (currentstock < StockLimit)
            {
                if (CurrencyPrices[item])
                {
                    ourValue += CurrencyPrices[item].sell;
                }
                else if (SkinPrices[item])
                {
                    market.getItemsPrice(730, item, function (data)
                    {
                        console.log(data);
                        ourValue += parseFloat(data[item].lowest_price.replace("$", '').trim());
                    })
                }
                else
                {
                    console.log(timestamp() + "Invalid Value.");
                    ourValue += 99999;
                }
            }
            else if (currentstock >= StockLimit)
            {
                console.log(timeStamp(true) + item + " Stock Limit Reached");
                manager.on('receivedOfferChanged', (offer) =>
                {
                    if (adminConfig.disableAdminComments)
                    {
                        community.postUserComment(offer.partner.toString(), item + " - Stock Limit Reached", (err) =>
                        {
                            if (err) throw err.message
                        });
                    }
                })
            }
        }
        for (let i in theirItems)
        {
            let item = theirItems[i].market_hash_name;
            if (CurrencyPrices[item])
            {
                currentstock = CurrencyPrices[item].instock;
                StockLimit = CurrencyPrices[item].stocklimit;
                filestockname = './/settings/Prices/Currency Prices.json';
            }
            else if (SkinPrices[item])
            {
                currentstock = SkinPrices[item].instock;
                StockLimit = SkinPrices[item].stocklimit;
                filestockname = './/settings/Prices/SkinPrices.json';
            }
            if (fs.readFileSync(filestockname))
            {
                console.log(timeStamp(true) + "Their " + item + " - stock number: " + currentstock + " / " + StockLimit + ".")
            }
            if (currentstock < StockLimit)
            {
                if (CurrencyPrices[item])
                {
                    theirValue += CurrencyPrices[item].buy;
                }
                else if (SkinPrices[item])
                {
                    market.getItemsPrice(730, item, function (data)
                    {
                        console.log(data);
                        theirValue += parseFloat(data[item].lowest_price.replace("$", '').trim());
                    })
                }
            }
            else if (currentstock >= StockLimit)
            {
                console.log(timeStamp(true) + item + " Stock Limit Reached")
                manager.on('receivedOfferChanged', (offer) =>
                {
                    community.postUserComment(offer.partner.toString(), item + " Stock Limit Reached", (err) =>
                    {
                        if (err) throw err.message
                    })
                })
            }
        }
        
        setTimeout(function ()
        {
            console.log(timeStamp(true) + "Our value: " + ourValue)
        }, 2000);
        setTimeout(function ()
        {
            console.log(timeStamp(true) + "Their value: " + theirValue)
        }, 2000);
        if (ourValue <= theirValue)
        {
            acceptOffer(offer);
            StockManagerOffer(offer)
        }
        else if (ourValue > theirValue)
        {
            console.log(timeStamp(true) + "Their value was different.");
            declineOffer(offer);
        }
    }
}

manager.on('receivedOfferChanged', (offer) =>
{
    let partnerString = offer.partner.toString();
    if (offer.state === 7 && community.postUserComment(partnerString))
    {
        if (community.postUserComment(partnerString, "Your trade value was different, sorry!"), (err) =>
            {
                if (err) throw err.message;
            })
        {
            console.log("Commented on " + partnerString + "'s Profile")
        }
    }
    if (offer.state === 3 && config.Comments)
    {
        if (adminConfig.disableAdminComments)
        {
            if (partnerString === creatorConfig.CreatorID)
            {
            }
        }
        else
        {
            if (community.postUserComment(partnerString))
            {
                if (community.postUserComment(partnerString, commentConfig.comments.randItem()), (err) =>
                    {
                        if (err) throw err.message;
                    })
                {
                    console.log(timeStamp(true) + "Commented on " + partnerString + "'s Profile")
                }
            }
        }
    }
});

function logToFile(file, str)
{
    fs.appendFile(file, str, (err) =>
    {
        if (err) throw err;
    });
}

Array.prototype.randItem = function ()
{
    if (this.length === 0) return null;
    return this[Math.floor(Math.random() * this.length)];
};

Array.prototype.randItemDiff = function (last)
{
    if (this.length === 0) return null;
    else if (this.length === 1) return this[0];
    else
    {
        let item = null;
        do item = this.randItem();
        while (item === last);
        return item;
    }
};

// TODO: Possibly remove \/
client.setOption("promptSteamGuardCode", false);

manager.on('newOffer', (offer) =>
{
    processOffer(offer);
});

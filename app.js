// TheXeon
// 12/11/17

'use strict';

const request = require('request');
const SteamTOTP = require('steam-totp');
const SteamUser = require('steam-user');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');
const fs = require('fs');
const market = require('steam-market-pricing');
const bptf = require('backpacktf');
const raven = require('raven');

const config = require('./settings/config.json');
const adminConfig = require('./settings/admin.json');
const gameConfig = require('./settings/games.json');
const commentConfig = require('./settings/comments.json');
const messageConfig = require('./settings/messages.json');

const bptfkey = config.BackpackTFKey;

const pricesFileName = './settings/Prices/Prices.json';
const PlayerSetPrices = require(pricesFileName);

const TradeLog = require('./Logs/Trade.log');

const client = new SteamUser();
const community = new SteamCommunity();
const manager = new TradeOfferManager({
    steam: client,
    community: community,
    language: 'en',
});

console.log("===[NodeSteamBotMongo]===");
console.log("Current Version: " + require('./package.json').version);
console.log("Forked from: https://github.com/Lonster_Monster\n\n");

if (config.IssueTrackingAndCrashReporting) {
    raven.config('https://ea74549f4ec44b998cd61b6ca29db142@sentry.io/1259236').install();
}

const logOnOptions = {
    accountName: config.username,
    password: config.password,
    twoFactorCode: SteamTOTP.generateAuthCode(config.sharedSecret)
};

try {
    client.logOn(logOnOptions);
} catch (e) {
    raven.captureException(e);
    if (e.toString() === "InvalidPassword") {
        console.log("You have an invalid password!");
    }
}

client.on('loggedOn', () => {
    console.log(timeStamp() + ' successfully logged on.');
    client.setPersona(SteamUser.EPersonaState.Online, config.SteamName);
    client.gamesPlayed(gameConfig.games.randItem());
    getTF2CommunityPrices();
    getTF2CurrencyPrices();
    setInterval(getTF2CommunityPrices, 600000);
    setInterval(getTF2CurrencyPrices, 600000);
});

function getTF2CommunityPrices() {
    console.log("Getting community prices from backpack.tf!");
    bptf.getCommunityPrices(bptfkey, "440", function (err, data) {
        if (err) {
            console.log("Error: " + err.message);
        } else {
            writeToFile("data/tf2communityprices.json", JSON.stringify(data));
        }
    });
}

function getTF2CurrencyPrices() {
    console.log("Getting currency prices from backpack.tf!");
    // This should be implemented in the base backpack tf package sometime
    getCurrencies(bptfkey, function (data) {
        writeToFile("data/tf2currencyprices.json", JSON.stringify(data));
    });
}


client.on('friendRelationship', (steamID, relationship) => {
    if (relationship === 2) {
        client.addFriend(steamID);
        messageConfig.WELCOME.forEach((item) => {
            client.chatMessage(steamID, item);
        });
    }
});

client.on("webSession", (sessionid, cookies) => {
    manager.setCookies(cookies);
    community.setCookies(cookies);
    community.startConfirmationChecker(20000, config.IdentitySecret);
});

client.on("friendMessage", function (steamID, message) {
    appendToFile('./Logs/Message.log', "\r\n" + timeStamp() + " '" + steamID + "'" + message + "--");
    message.toLowerCase();
    let replyMessage = "Sorry, I don't know that command! Type !help for more info :)";
    switch (message) {
        case "hi":
        case "hello":
            replyMessage = messageConfig.hi;
            break;
        case "!help":
            replyMessage = messageConfig.help;
            break;
        case "!group":
            replyMessage = messageConfig.Group;
            break;
    }
    if (config.SpecialItems) {
        switch (message) {
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
    appendToFile('./Logs/Message.log', "\r\n" + timeStamp() + replyMessage + "--");
});

function acceptOffer(offer) {
    offer.accept((err) => {
        community.checkConfirmations();
        if (err) {
            console.log(timeStamp() + " There was an error accepting the offer.");
        } else {
            console.log(timeStamp() + " We Accepted an offer");
        }
    });
}

function StockManagerOffer(offer) {
    let ourItems = offer.itemsToGive;
    let theirItems = offer.itemsToReceive;
    let ourValue = 0;
    let theirValue = 0;
    let currentstock = 0;
    let StockLimit = 0;
    if (config.Enable_Dev_Stock_Manager) {
        ourItems.forEach((item) => {
            let itemName = item.market_name;
            if (PlayerSetPrices[itemName]) {
                currentstock = PlayerSetPrices[itemName].instock;
                writeToFile(PlayerSetPrices, JSON.stringify(PlayerSetPrices, null, 2));
                // TODO: Change to keep track of stock in MongoDB. This function subtracts from our stock.
            }
        });
        theirItems.forEach((item) => {
            let itemName = item.market_name;
            if (PlayerSetPrices[itemName]) {
                currentstock = PlayerSetPrices[itemName].instock;
                writeToFile(PlayerSetPrices, JSON.stringify(PlayerSetPrices, null, 2));
                // TODO: Change to keep track of stock in MongoDB. This function adds to our stock.
            }
        });
    } else {
        processOffer(offer);
    }
}

function declineOffer(offer) {
    console.log(timeStamp() + "We declined an offer.");
    offer.decline((err) => {
        if (err) {
            console.log(timeStamp() + "There was an error declining the offer.");
        }
    });
}

function processOffer(offer) {
    if (offer.isGlitched() || offer.state === 11) {
        console.log(timeStamp() + " Offer was glitched, declining.");
        declineOffer(offer);
    }
    else if (offer.partner.getSteamID64() === config.OwnerID) {
        acceptOffer(offer);
        // TODO: retake stock here to prevent stock issues
    }
    else {

        let ourItems = offer.itemsToGive;
        let theirItems = offer.itemsToReceive;
        let ourValue = 0;
        let theirValue = 0;
        processItemsFromOffer(theirItems, theirValue, true);
        processItemsFromOffer(ourItems, ourValue, false);
        setTimeout(function () {
            console.log(timeStamp() + " Our value: " + ourValue);
        }, 2000);
        setTimeout(function () {
            console.log(timeStamp() + " Their value: " + theirValue);
        }, 2000);
        if (ourValue <= theirValue) {
            acceptOffer(offer);
            StockManagerOffer(offer);
        }
        else if (ourValue > theirValue) {
            console.log(timeStamp() + " Their value was different.");
            declineOffer(offer);
        }
    }
}

function processItemsFromOffer(items, valueVar, theirs) {
    let itemType = 'basictype';
    let currentStock = 0;
    let stockLimit = 0;
    let sellPrice = 0;
    let buyPrice = 0;
    items.forEach((item) => {
        let itemName = item.market_hash_name;
        if (PlayerSetPrices[itemName]) {
            currentStock = PlayerSetPrices[itemName].currentStock;
            stockLimit = PlayerSetPrices[itemName].stocklimit;
            itemType = PlayerSetPrices[itemName].type;
            sellPrice = PlayerSetPrices[itemName].sell;
            buyPrice = PlayerSetPrices[itemName].buy;
        } // TODO: Add else check if not in file
        if (fs.readFile(pricesFileName)) {
            console.log(timeStamp() + (theirs ? " Their " : " Our ") + itemName + " - stock number: " + currentStock + " / " + stockLimit + ".");
        }
        if (currentStock < stockLimit) {
            switch (itemType) {
                case "csgocurrency":
                    valueVar += sellPrice;
                    break;
                case "csgoskin":
                    valueVar += marketPrice(730, itemName);
                    break;
                default:
                    //TODO Get backpack.tf price or other from here
                    console.log(timeStamp() + " Invalid Value.");
                    valueVar += 99999;
                    break;
            }
        }
        else if (currentStock >= stockLimit) {
            console.log(timeStamp() + itemName + " Stock Limit Reached");
            manager.on('receivedOfferChanged', (offer) => {
                if (!theirs) {
                    if (adminConfig.disableAdminComments) {
                        community.postUserComment(offer.partner.toString(), itemName + " - Stock Limit Reached", (err) => {
                            if (err) {
                                throw err.message;
                            }
                        });
                    }
                }
                else {
                    community.postUserComment(offer.partner.toString(), itemName + " has reached stock limit!", (err) => {
                        if (err) {
                            throw err.message;
                        }
                    });
                }
            });
        }
    }); // end for loop
}

manager.on('receivedOfferChanged', (offer) => {
    let partnerString = offer.partner.toString();
    if (offer.state === 7 && community.postUserComment(partnerString, "Your trade value was different, sorry!", (err) => {
        if (err) {
            throw err.message;
        }
    })) {
        console.log("Commented on " + partnerString + "'s Profile");
    }
    if (offer.state === 3 && config.Comments) {
        if (community.postUserComment(partnerString, randItem(commentConfig.comments), (err) => {
            if (err) {
                throw err.message;
            }
        })) {
            console.log(timeStamp() + "Commented on " + partnerString + "'s Profile");
        }
    }
});

function marketPrice(appid, item) {
    market.getItemsPrice(appid, item, function (data) {
        console.log(data);
        if (!data.success) {
            throw new Error("ItemPrice was not successfully obtained!");
        }
        return parseFloat(data[item].lowest_price.replace("$", '').trim());
    });
}

function appendToFile(file, str) {
    fs.appendFile(file, str, 'a', (err) => {
        if (err) {
            throw err;
        }
    });
}

function writeToFile(file, str) {
    fs.writeFile(file, str, (err) => {
        if (err) {
            throw err;
        }
    });
}


function timeStamp() {
    const date = new Date();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    const hour = date.getHours();
    return ("[" + hour + ":" + minute + ":" + second + "]");
}

function randItem(arr) {
    if (arr.length === 0) {
        return null;
    }
    return arr[Math.floor(Math.random() * arr.length)];
}

function randItemDiff(arr, last) {
    if (arr.length === 0) {
        return null;
    } else if (arr.length === 1) {
        return arr[0];
    } else {
        let item = null;
        do {
            item = randItem(arr);
        }
        while (item === last);
        return item;
    }
}

// TODO: Possibly remove \/
client.setOption("promptSteamGuardCode", false);

manager.on('newOffer', (offer) => {
    processOffer(offer);
});


// Next two functions are adapted from https://www.npmjs.com/package/backpacktf unused parts
// TODO: Will be implemented in backpacktf package sometime
function queryAPI(method, v, key, format, adds, callback) {
    let urlToUse = "https://backpack.tf/api/" + method + "/" + v + "?key=" + key + "&format=" + format + adds;
    request({url: urlToUse, method: 'GET', json: true}, function (err, res, body) {
        callback(body);
    });
}


function getCurrencies(key, callback) {
    queryAPI("IGetCurrencies", "v1", key, "json", "", function (data) {
        if (data.response.success === 0) {
            throw new Error(data.response.message);
        } else {
            callback(data);
        }
    });
}

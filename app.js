const config = require('.//settings/config.json')
if (config.IssueTracking == "Enable"){
var Raven = require('raven');
Raven.config('https://0a6d1f872b464102ad9b86e4d12113b7:37f5be982d9e476c9e681ced933031c0@sentry.io/207208').install();
} else {
    console.log ("\x1b[33m WARNING\x1b[37m: IssueTracking Disabled please enable issue tracking to get help faster when you are having problems.")
}
if (config.DevCode == "True"){
	console.log('\x1b[33m WARNING\x1b[37m: DEVEOPER OPTIONS ENABLED, DEVELOPER OPTIONS IS FOR EXPIRAMENTAL USE ONLY AND SHOULD BE FOR DEVELOPERS ONLY')
}

const SteamTotp = require('steam-totp');
const SteamUser = require('steam-user');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');
const math = require('mathjs');
const fs = require('fs');
const colors = require('colors');
const jsonfile = require('jsonfile');
const market = require('steam-market-pricing');

const adminConfig = require('.//AdminOptions/Config.json')
const CreatorConfig = require('.//CreatorProperties/Config.json');
const Name = require('.//settings/config.json');
const Games = require('.//settings/Games.json');
const Comments = require('.//settings/Comments/comments.json');
const Game = require('.//settings/Configuration/Game.js')


const SkinPrices = require('.//settings/Prices/SkinPrices.json');
const CurrencyPrices = require('.//settings/Prices/Currency Prices.json');


const AdminCurrency = require('.//AdminOptions/Prices/AdminCurrencyPrices.json')
const AdminCard = require('.//AdminOptions/Prices/Admin_Card_Prices.json');
const AdminEmoticon = require('.//AdminOptions/Prices/Admin_Emotes_Prices.json')
const AdminBackground = require('.//AdminOptions/Prices/Admin_Backgrounds_Prices.json')


const messages = require('.//settings/Messages/messages.json');

const TradeLog = require('.//Logs/Trade.log')

const SteamID = TradeOfferManager.SteamID;
const client = new SteamUser();
const community = new SteamCommunity();
const manager = new TradeOfferManager ({
	steam: client,
	community: community,
	language: 'en',
});

	var date = new Date();
	var minute = date.getMinutes()
	var second = date.getSeconds()
	var hour = date.getHours()
	var h = hour
	var m = minute
	var s = second
	var timestamp = "[".green+colors.yellow(h)+":".cyan+colors.yellow(m)+":".cyan+colors.yellow(s)+"]".green
	var RegTimestamp = "["+h+":"+m+":"+s+"]"
	
	
console.log("\x1b[8m SteamTrade Bot")
console.log("\x1b[33m Current Version:\x1b[35m 2.5.0")
console.log("\x1b[33mCreator:\x1b[35m http://Github.com/Lonster_Monster")
console.log("\x1b[33mIssues with the Bot:\x1b[35m https://github.com/LonsterMonster/Steam-Trade-Node-Bot/issues")
console.log("\x1b[33mIdeas for the Bot:\x1b[35m http://steamcommunity.com/groups/MarketWH/discussions/0/\x1b[0m")
console.log(" ")
console.log(" ")

const logOnOptions = {
	accountName: config.username,
	password: config.password,
	twoFactorCode: SteamTotp.generateAuthCode(config.sharedSecret)
};

client.logOn(logOnOptions);

client.on('loggedOn', () => {
    console.log('succesfully logged on.');
    client.setPersona(SteamUser.Steam.EPersonaState.Online,config.SteamName);
    client.gamesPlayed([Games.Game1,Games.Game2]);
});


client.on('friendRelationship', (steamID, relationship) => {
    if (relationship === 2) {
        client.addFriend(steamID);
        client.chatMessage(steamID, messages.WELCOME);
	    client.chatMessage(steamID, messages.WELCOME2);
    }
});


client.on('webSession', (sessionid, cookies) => {
	manager.setCookies(cookies);

	community.setCookies(cookies);
	community.startConfirmationChecker(20000, config.identitySecret);
});

messages
client.on("friendMessage", function(steamID, message) {
	if (message == "hi") {
		client.chatMessage(steamID, messages.hi);
		saveMessage = messages.hi
	fs.readFile('.//Logs/Message.txt', "UTF8", function(err, data) {
	if (err) { throw err };
		global_data = data;
	fs.writeFile('.//Logs/Message.txt', global_data+"\r\n"+RegTimestamp+"'"+steamID+"'"+message+"--", (err) => {
	if (err) throw err;
	});
	});
	fs.readFile('.//Logs/Message.txt', "UTF8", function(err, data) {
		if (err) { throw err };
		global_data = data;
	fs.writeFile('.//Logs/Message.txt', global_data+"\r\n"+RegTimestamp+saveMessage+"--", (err) => {
	if (err) throw err;
	});
	});
		}
    	if (message == "!Help") {
		client.chatMessage(steamID, messages.help);
		saveMessage = messages.help
	fs.readFile('.//Logs/Message.txt', "UTF8", function(err, data) {
	if (err) { throw err };
		global_data = data;
	fs.writeFile('.//Logs/Message.txt', global_data+"\r\n"+RegTimestamp+"'"+steamID+"'"+message+"--", (err) => {
	if (err) throw err;
	});
	});
	fs.readFile('.//Logs/Message.txt', "UTF8", function(err, data) {
		if (err) { throw err };
		global_data = data;
	fs.writeFile('.//Logs/Message.txt', global_data+"\r\n"+RegTimestamp+saveMessage+"--", (err) => {
	if (err) throw err;
	});
	});
		}
    	if (message == "!Group") {
		client.chatMessage(steamID, messages.Group);
		saveMessage = messages.Group
		fs.readFile('.//Logs/Message.txt', "UTF8", function(err, data) {
	if (err) { throw err };
		global_data = data;
	fs.writeFile('.//Logs/Message.txt', global_data+"\r\n"+RegTimestamp+"'"+steamID+"'"+message+"--", (err) => {
	if (err) throw err;
	});
	});
	fs.readFile('.//Logs/Message.txt', "UTF8", function(err, data) {
		if (err) { throw err };
		global_data = data;
	fs.writeFile('.//Logs/Message.txt', global_data+"\r\n"+RegTimestamp+saveMessage+"--", (err) => {
	if (err) throw err;
	});
	});
		}
//works

if (config.TradingCards == "True" || "true" || "Enable" || "enable"){
			 if (message == "!Buy Trading Cards") {
	 client.chatMessage(steamID, messages.BuyCards);
			saveMessage = messages.BuyCards
			fs.readFile('.//Logs/Message.txt', "UTF8", function(err, data) {
	if (err) { throw err };
		global_data = data;
	fs.writeFile('.//Logs/Message.txt', global_data+"\r\n"+RegTimestamp+"'"+steamID+"'"+message+"--", (err) => {
	if (err) throw err;
	});
	});
	fs.readFile('.//Logs/Message.txt', "UTF8", function(err, data) {
		if (err) { throw err };
		global_data = data;
	fs.writeFile('.//Logs/Message.txt', global_data+"\r\n"+RegTimestamp+saveMessage+"--", (err) => {
	if (err) throw err;
	});
	});
			 }
			 if (message == "!Sell Trading Cards") {
	 client.chatMessage(steamID, messages.SellCards);
			saveMessage = messages.SellCards
			fs.readFile('.//Logs/Message.txt', "UTF8", function(err, data) {
	if (err) { throw err };
		global_data = data;
	fs.writeFile('.//Logs/Message.txt', global_data+"\r\n"+RegTimestamp+"'"+steamID+"'"+message+"--", (err) => {
	if (err) throw err;
	});
	});
	fs.readFile('.//Logs/Message.txt', "UTF8", function(err, data) {
		if (err) { throw err };
		global_data = data;
	fs.writeFile('.//Logs/Message.txt', global_data+"\r\n"+RegTimestamp+saveMessage+"--", (err) => {
	if (err) throw err;
	});
	});
			 }
			 if (message == "!Buy Backgounds") {
	 client.chatMessage(steamID, messages.BuyBackgrounds);
			saveMessage = messages.BuyBackgrounds
			fs.readFile('.//Logs/Message.txt', "UTF8", function(err, data) {
	if (err) { throw err };
		global_data = data;
	fs.writeFile('.//Logs/Message.txt', global_data+"\r\n"+RegTimestamp+"'"+steamID+"'"+message+"--", (err) => {
	if (err) throw err;
	});
	});
	fs.readFile('.//Logs/Message.txt', "UTF8", function(err, data) {
		if (err) { throw err };
		global_data = data;
	fs.writeFile('.//Logs/Message.txt', global_data+"\r\n"+RegTimestamp+saveMessage+"--", (err) => {
	if (err) throw err;
	});
	});
			 }
			 if (message == "!Sell Backgrounds") {
	 client.chatMessage(steamID, messages.SellBackgrounds);
			saveMessage = messages.SellBackgrounds
			fs.readFile('.//Logs/Message.txt', "UTF8", function(err, data) {
	if (err) { throw err };
		global_data = data;
	fs.writeFile('.//Logs/Message.txt', global_data+"\r\n"+RegTimestamp+"'"+steamID+"'"+message+"--", (err) => {
	if (err) throw err;
	});
	});
	fs.readFile('.//Logs/Message.txt', "UTF8", function(err, data) {
		if (err) { throw err };
		global_data = data;
	fs.writeFile('.//Logs/Message.txt', global_data+"\r\n"+RegTimestamp+saveMessage+"--", (err) => {
	if (err) throw err;
	});
	});
			 }
			if (message == "!Buy Emoticons") {
	 client.chatMessage(steamID, messages.BuyEmoticons);
			saveMessage = messages.BuyEmoticons
			fs.readFile('.//Logs/Message.txt', "UTF8", function(err, data) {
	if (err) { throw err };
		global_data = data;
	fs.writeFile('.//Logs/Message.txt', global_data+"\r\n"+RegTimestamp+"'"+steamID+"'"+message+"--", (err) => {
	if (err) throw err;
	});
	});
	fs.readFile('.//Logs/Message.txt', "UTF8", function(err, data) {
		if (err) { throw err };
		global_data = data;
	fs.writeFile('.//Logs/Message.txt', global_data+"\r\n"+RegTimestamp+saveMessage+"--", (err) => {
	if (err) throw err;
	});
	});
			}
			if (message == "!Sell Emoticons") {
	 client.chatMessage(steamID, messages.SellEmoticons);
			saveMessage = messages.SellEmoticons
			fs.readFile('.//Logs/Message.txt', "UTF8", function(err, data) {
	if (err) { throw err };
		global_data = data;
	fs.writeFile('.//Logs/Message.txt', global_data+"\r\n"+RegTimestamp+"'"+steamID+"'"+message+"--", (err) => {
	if (err) throw err;
	});
	});
	fs.readFile('.//Logs/Message.txt', "UTF8", function(err, data) {
		if (err) { throw err };
		global_data = data;
	fs.writeFile('.//Logs/Message.txt', global_data+"\r\n"+RegTimestamp+saveMessage+"--", (err) => {
	if (err) throw err;
	});
	});
			}
}
});


function acceptOffer(offer) {
	offer.accept((err) => {
		community.checkConfirmations();
		console.log(timestamp+"We Accepted an offer");
		if (err) console.log(timestamp+"There was an error accepting the offer.");
	});

}


function StockManagerOffer(offer){
		var ourItems = offer.itemsToGive;
		var theirItems = offer.itemsToReceive;
		var ourValue = 0;
		var theirValue = 0;
		var currentstock = 0;
		var StockLimit = 0;
			if (config.Enable_Dev_Stock_Manager== "True"){
				for (var i in processOffer.ourItems) {
					var item = processOffer.ourItems[i].market_name;
						if (processOffer.filestock[item]){
							currentstock = processOffer.filestock[item].instock;
							fs.readFile(processOffer.filestockname, (err, data) => {
							 if (err) throw err;
							 console.log('File read');
							console.log('writing to ' + filestockname);
							processOffer.filestock[item].instock = math.subtract(processOffer.currentstock, 1);
							fs.writeFile(processOffer.filestockname, JSON.stringify(processOffer.filestock, null, 2), function (err) {
							  if (err) return console.log(err);
							  console.log('writing to ' + processOffer.filestockname);
							});
							});
						}
				}
				for (var i in processOffer.theirItems) {
				var item = processOffer.theirItems[i].market_name;
					if (processOffer.filestock[item]){
						currentstock = processOffer.filestock[item].instock;
						fs.readFile(processOffer.filestockname, (err, data) => {
						 if (err) throw err;
						 console.log('File read');
						console.log('writing to ' + processOffer.filestockname);
						processOffer.filestock[item].instock = math.add(processOffer.currentstock, 1)
						fs.writeFile(filestockname, JSON.stringify(processOffer.filestock, null, 2), function (err) {
						  if (err) return console.log(err);
						});
						})
					}
				}
			}
	
}
function declineOffer(offer) {
		console.log(timestamp+"We Declined an offer");
	offer.decline((err) => {
		if (err) console.log(timestamp+"There was an error declining the offer.");
	});
}

function processOffer(offer){
	if (offer.isGlitched() || offer.state === 11) {
		console.log(timestap+"Offer was glitched, declining.");
		declineOffer(offer);
	} else if (offer.partner.getSteamID64() === config.ownerID) {
		acceptOffer(offer);
	} else {
		var ourItems = offer.itemsToGive;
		var theirItems = offer.itemsToReceive;
		var ourValue = 0;
		var theirValue = 0;
		var currentstock = 0;
		var StockLimit = 0;
		var DataValue = 0;
		var filestockname = './/settings/Prices/DefaultPrice.json';
		var filestock = require(filestockname);
		for (var i in ourItems) {
		var item = ourItems[i].market_hash_name;
			if (CurrencyPrices[item]){
				currentstock = CurrencyPrices[item].instock;
				StockLimit = CurrencyPrices[item].stocklimit;
				filestockname = './/settings/Prices/Currency Prices.json';
			} else if (SkinPrices[item]) {
				currentstock = SkinPrices[item].instock;
				StockLimit = SkinPrices[item].stocklimit;
				filestockname = './/settings/Prices/SkinPrices.json';
			}
			if (fs.readFileSync(filestockname)){
			console.log(timestamp+"Our " +item+" - stock number: " +currentstock+ " / " +StockLimit+ ".")
			}
			if (currentstock < StockLimit){
				if(CurrencyPrices[item]) {
					ourValue += CurrencyPrices[item].sell;
				} else if (SkinPrices[item]){
					var names = [
						item
					];
					market.getItemsPrice(730, item, function(data) {
							console.log(data);
							lowest_value = data.lowest_price.replace("$",'').trim();
							ourValue += lowest_value
					})
				} else {
					console.log(timestamp+"Invalid Value.");
					ourValue += 99999;
				}
			} else if (currentstock >= StockLimit){
				console.log(timestamp+item +" Stock Limit Reached")
				manager.on('receivedOfferChanged', (offer)=>{
					if (adminConfig.disableAdminComments == "Enable") {
						community.postUserComment(offer.partner.toString(), item+ " - Stock Limit Reached", (err)=>{
							if(err) throw err.message
						});
					}
				})
			}
		};		
		for(var i in theirItems) {
		var item= theirItems[i].market_hash_name;
			if (CurrencyPrices[item]){
				currentstock = CurrencyPrices[item].instock;
				StockLimit = CurrencyPrices[item].stocklimit;
				filestockname = './/settings/Prices/Currency Prices.json';
			} else if (SkinPrices[item]){
				currentstock = SkinPrices[item].instock;
				StockLimit = SkinPrices[item].stocklimit;
				filestockname = './/settings/Prices/SkinPrices.json';
			}
			if (fs.readFileSync(filestockname)){
			console.log(timestamp+"Thier " +item+" - stock number: " +currentstock+ " / " +StockLimit+ ".")
			}
			if (currentstock < StockLimit){
				if(CurrencyPrices[item]) {
					theirValue += CurrencyPrices[item].buy;
				} else if (SkinPrices[item]){
					market.getItemsPrice(730, item, function(data) {
							console.log(data);
							lowest_value = data.lowest_price.replace("$",'').trim();
							theirValue += lowest_value
					})
				} else if (currentstock >= StockLimit){
				console.log(timestamp+item +" Stock Limit Reached")
					manager.on('receivedOfferChanged', (offer)=>{
						community.postUserComment(offer.partner.toString(), item+ " Stock Limit Reached", (err)=>{
						if(err) throw err.message
						})
					})
				}				
			}
		}
	setTimeout(function(){console.log(timestamp+"Our value: "+ourValue)},2000)
	setTimeout(function(){console.log(timestamp+"Their value: "+theirValue)},2000)
		setTimeout(function(){if(ourValue <= theirValue){
			acceptOffer(offer)
			StockManagerOffer(offer)
		} else if (ourValue > theirValue) {
			console.log(timestamp+"Their value was different.")
			declineOffer(offer);
		}}, 4000)
	}
}
manager.on('receivedOfferChanged', (offer)=>{
	if (offer.state === 7){
		if (community.postUserComment(offer.partner.toString())) {
			if (community.postUserComment(offer.partner.toString(),"Your trade value was different"), (err)=>{
				if(err) throw err.message
			}){
				console.log("Commented on "+offer.partner.toString()+"'s Profile")
			}
		}
	}
	if(offer.state === 3){
		if (config.Comments == "Enable") {
			if (adminConfig.disableAdminComments == "Enable") {
				if (offer.partner.toString() === CreatorConfig.CreatorID){
				}
			} else {
				if (community.postUserComment(offer.partner.toString())) {
					if (community.postUserComment(offer.partner.toString(), math.pickRandom([Comments.comments0, Comments.comments1, Comments.comments2, Comments.comments3, Comments.comments4, Comments.comments5])), (err)=>{
						if(err) throw err.message
						}){
							console.log(timestamp+"Commented on "+offer.partner.toString()+"'s Profile")
						}
					}
				};
		} else {
console.log('\x1b[33m WARNING\x1b[37m: Cannot comment on user profiles becasue config.Comments is set to false. ');
		}
	}
})

client.setOption("promptSteamGuardCode", false);

manager.on('newOffer', (offer) => {
  processOffer(offer);
});

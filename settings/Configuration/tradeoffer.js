const app = require('../../app.js');
const config = require('../config.json');
const Game = require('.//Game.js');
const SteamTotp = require('steam-totp');
const SteamUser = require('steam-user');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');

function acceptOffer(offer) {
	offer.accept((err) => {
		community.checkConfirmations();
		console.log(timestamp + "We Accepted an offer");
		if (err) console.log(timestamp + "There was an error accepting the offer.");
	});

}

function declineOffer(offer) {
	console.log(timestamp + "We Declined an offer");
	offer.decline((err) => {
		if (err) console.log(timestamp + "There was an error declining the offer.");
	});
}

function Manager(offer) {
	if (config.Enable_Dev_Stock_Manager) {
		for (var i in processOffer.ourItems) {
			var item = processOffer.ourItems[i].market_name;
			if (processOffer.filestock[item]) {
				currentstock = processOffer.filestock[item].instock;
				fs.readFile(filestockname, (err, data) => {
					if (err) throw err;
					console.log('File read');
					console.log('writing to ' + filestockname);
					processOffer.filestock[item].instock = math.subtract(currentstock, 1);
					fs.writeFile(filestockname, JSON.stringify(filestock, null, 2), function (err) {
						if (err) return console.log(err);
						console.log('writing to ' + filestockname);
					});
				});
			}
		}
		for (var i in theirItems) {
			var item = theirItems[i].market_name;
			if (filestock[item]) {
				currentstock = filestock[item].instock;
				fs.readFile(filestockname, (err, data) => {
					if (err) throw err;
					console.log('File read');
					console.log('writing to ' + filestockname);
					filestock[item].instock = math.add(currentstock, 1);
					fs.writeFile(filestockname, JSON.stringify(filestock, null, 2), function (err) {
						if (err) return console.log(err);
					});
				})
			}
		}
	}
}

function processOffer(offer) {
	if (offer.isGlitched() || offer.state === 11) {
		console.log("Offer was glitched, declining.");
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
		var filestockname = './/settings/Prices/DefaultPrice.json';
		var filestock = require(filestockname);
		for (var i in ourItems) {
			var item = ourItems[i].market_name;
			if (CurrencyPrices[item]) {
				currentstock = CurrencyPrices[item].instock;
				StockLimit = CurrencyPrices[item].stocklimit;
				filestockname = './/settings/Prices/Currency Prices.json';
			} else if (SkinPrices[item]) {
				currentstock = SkinPrices[item].instock;
				StockLimit = SkinPrices[item].stocklimit;
				filestockname = './/settings/Prices/SkinPrices.json';
			}
			if (fs.readFileSync(filestockname)) {
				console.log(timestamp + "Our " + item + " - stock number: " + currentstock + " / " + StockLimit + ".");
			}
			if (currentstock < StockLimit) {
				if (CurrencyPrices[item]) {
					ourValue += CurrencyPrices[item].sell;
				} else if (SkinPrices[item]) {
					market.getItemPrice(Game.MarketGame, item, function (err, data) {
						if (!err) {
							setTimeout(function () { DataValue = data.median_price.replace("$", '').trim(); }, 1000);
							setTimeout(function () { ourValue += DataValue; }, 1100);
						}
					});
				} else {
					console.log(timestamp + "Invalid Value.");
					ourValue += 99999;
				}
			} else if (currentstock >= StockLimit) {
				console.log(timestamp + item + " Stock Limit Reached")
				manager.on('receivedOfferChanged', (offer) => {
					if (adminConfig.disableAdminComments == "Enable") {
						community.postUserComment(offer.partner.toString(), item + " - Stock Limit Reached", (err) => {
							if (err) throw err.message
						});
					}
				})
			}
		};
		for (var i in theirItems) {
			var item = theirItems[i].market_name;
			if (CurrencyPrices[item]) {
				currentstock = CurrencyPrices[item].instock;
				StockLimit = CurrencyPrices[item].stocklimit;
				filestockname = './/settings/Prices/Currency Prices.json';
			} else if (SkinPrices[item]) {
				currentstock = SkinPrices[item].instock;
				StockLimit = SkinPrices[item].stocklimit;
				filestockname = './/settings/Prices/SkinPrices.json';
			}
			if (fs.readFileSync(filestockname)) {
				console.log(timestamp + "Thier " + item + " - stock number: " + currentstock + " / " + StockLimit + ".")
			}
			if (currentstock < StockLimit) {
				if (CurrencyPrices[item]) {
					theirValue += CurrencyPrices[item].buy;
				} else if (SkinPrices[item]) {
					market.getItemPrice(Game.MarketGame, item, function (err, data) {
						if (!err) {
							setTimeout(function () { DataValue = data.median_price.replace("$", '').trim() }, 1000)
							setTimeout(function () { theirValue += DataValue }, 1100)
						}
					});
				} else if (currentstock >= StockLimit) {
					console.log(timestamp + item + " Stock Limit Reached")
					manager.on('receivedOfferChanged', (offer) => {
						community.postUserComment(offer.partner.toString(), item + " Stock Limit Reached", (err) => {
							if (err) throw err.message
						})
					})
				}
			}
		}
		setTimeout(function () { console.log(timestamp + "Our value: " + ourValue); }, 2000);
		setTimeout(function () { console.log(timestamp + "Their value: " + theirValue); }, 2000);
		if (ourValue <= theirValue) {
			acceptOffer(offer);
			StockManager.managerOffer(offer);
		} else if (ourValue > theirValue) {
			console.log(timestamp + "Their value was different.");
			declineOffer(offer);
		}
	}
}

manager.on('receivedOfferChanged', (offer) => {
	if (offer.state === 7) {
		var partner = offer.partner.toString()
		if (community.postUserComment(partner)) {
			if (community.postUserComment(partner, "Your trade value was different"), (err) => {
				if (err) throw err.message
			}) {
				console.log("Commented on " + partner + "'s Profile")
			}
		}
	}
	if (offer.state === 3 && config.Comment) {
		if (adminConfig.disableAdminComments == "Enable") {
			if (offer.partner.toString() === CreatorConfig.CreatorID) {
			}
		} else {
			if (community.postUserComment(offer.partner.toString())) {
				if (community.postUserComment(offer.partner.toString(), math.pickRandom(Comments)), (err) => {
					if (err) throw err.message
				}) {
					console.log(timestamp + "Commented on " + offer.partner.toString() + "'s Profile")
				}
			}
		}
	}
})
exports.findQuery = "SELECT user_id FROM `cj_bitcoin_address` WHERE address='##ADDRESS##'";
exports.updateQuery = "UPDATE `cj_coin_wallet` SET ##UPDATE_FIELDS## WHERE  userId = ##USER##;";
exports.updateFields = [{
    'value':'ETH', 
}]
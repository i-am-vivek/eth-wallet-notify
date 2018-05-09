let mysql, connection, web3;
let Web3 = require('web3');
const queryHelper = require('./query');
mysql = require('mysql');


if (web3 !== undefined) {
    web3 = new Web3(web3.currentProvider);
} else {
    web3 = new Web3(new Web3.providers.WebsocketProvider("ws://127.0.0.1:8546"));
}
connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'globocrypt'
});
connection.connect();
function twoDigits(d) {
    if (0 <= d && d < 10) return "0" + d.toString();
    if (-10 < d && d < 0) return "-0" + (-1 * d).toString();
    return d.toString();
}
Date.prototype.toMysqlFormat = function () {
    return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
};
function generateUpdateQuery(user, amount) {
    var query = queryHelper.updateQuery.replace('##UPDATE_FIELDS##', 'ETH=ETH+' + web3.utils.fromWei(amount));
    query = query.replace(' ##USER##', user);
    console.log(query)
    return query;
}
function generateFindQuery(address) {
    return queryHelper.findQuery.replace('##ADDRESS##', address);
}
function processTransaction(transaction) {
    console.log(generateFindQuery(transaction.to))
    connection.query(generateFindQuery(transaction.to), function (error, results) {
        if (error) throw error;
        if (results && results.length > 0) {
            connection.query(generateUpdateQuery(results[0].user_id, transaction.value), function (error, result) {
                if (error) throw error;
                console.log('Transaction inserted = ', result);
            });
        } else {
            console.log("NO RESULTS FOUND");
        }
    });
}
function storeTransactionIfNotExist(error, result) {
    if (!error && result !== null && result) {
        console.log("RESULT WITH TRANSACTIONS ADDED");
        var transactions = result.transactions;
        transactions.forEach(processTransaction);
    } else {
        console.log(error);
    }
}
module.exports = { storeTransactionIfNotExist };

let mysql, connection, web3;
var Web3 = require('web3');
mysql = require('mysql');

if (web3 !== undefined) {
    web3 = new Web3(web3.currentProvider);
} else {
    web3 = new Web3(new Web3.providers.WebsocketProvider("ws://127.0.0.1:8546"));
}
connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'dbname'
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
function generateInsertQuery(transaction) {
    console.log('TRANSACTION BLOCK 3', transaction)
    var transaction_id = transaction.hash;
    var amount = transaction.value;
    var date = new Date();
    var fromAddress = transaction.from;
    var toAddress = transaction.to;
    var blockNumber = transaction.blockNumber;
    var query = "INSERT INTO ethereum_txn (trasaction_id, amount, date, fromAddress, toAddress, blockNumber) VALUES (";
    query = query + "'" + transaction_id + "',";
    amount = web3.utils.fromWei(amount);
    query = query + amount + ",";
    query = query + "'" + date.toMysqlFormat() + "',";
    query = query + "'" + fromAddress + "',";
    query = query + "'" + toAddress + "',";
    query = query + "'" + blockNumber + "'";
    query = query + ")";
    console.log('\nINSERTION QUERY = ' + query);
    return query;
}
function generateFindQuery(transaction) {
    var fromAddress = transaction.from;
    var toAddress = transaction.to;
    console.log('TRANSACTION BLOCK 2', transaction)
    var findQuery = "SELECT * from bitcoin_addresses WHERE address = ";
    findQuery = findQuery + "'" + toAddress + "'";
    console.log('\nFIND QUERY = ' + findQuery);
    return findQuery;
}
function processTransaction(transaction) {
    console.log('TRANSACTION BLOCK 1', transaction)
    connection.query(generateFindQuery(transaction), function (error, results) {
        if (error) throw error;
        if (results && results.length > 0) {
            connection.query(generateInsertQuery(transaction), function (error, result) {
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
        console.log("RESULT WITH TRANSACTIONS = ", result);
        var transactions = result.transactions;
        transactions.forEach(processTransaction);
    } else {
        console.log(error);
    }
}
module.exports = { storeTransactionIfNotExist };
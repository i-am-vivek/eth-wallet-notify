
let mysql, connection, web3;
let Web3 = require('web3');
let queryHelper = require('./query');
const db = require('mysql-node-query-builder');

if (web3 !== undefined) {
    web3 = new Web3(web3.currentProvider);
} else {
    web3 = new Web3(new Web3.providers.WebsocketProvider("ws://127.0.0.1:8546"));
}


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
const getAddressObj = async (address) => {
    return await db.table('cj_bitcoin_address').where('address', address).get();
}
const processTransaction = async (transaction) => {
    try {
        let addressObj = await getAddressObj(transaction.to);
        let result;
        if (addressObj && addressObj.length) {
            result = await db.update(
                { ETH: web3.utils.fromWei(transaction.value) },
                { user_id: addressObj[0].user_id }
            );
            console.log('\nUPDATE INFORMATION = ', result);
        }
        else {
            console.log('NO ADDRESS FOUND\n');

        }
    }
    catch (ex) {
        console.log('\nPROCESS TRANSACTION ERROR = ', ex);
    }
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
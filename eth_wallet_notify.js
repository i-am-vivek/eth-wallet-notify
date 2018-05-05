var Web3 = require('web3');
var storageHelper = require('./storageHelper');
//console.log("FRIST = ",web3) ;
var web3 ;
 

if(web3 !== undefined){
    web3 = new Web3(web3.currentProvider) ;
}else{
    web3 = new Web3(new Web3.providers.WebsocketProvider("ws://104.247.79.1:8546")) ;
}
web3.eth.getAccounts().then(console.log) ;
web3.eth.subscribe('newBlockHeaders',function(error,result){
    if(!error){
        console.log('result = ',result) ;
    }else{
        console.log("ERROR= ",error) ;
    }
}).on("data", function(blockHeader){
    // will return the block number.
   console.log(blockHeader);
   var blockNumber = blockHeader.number ;
   web3.eth.getBlock(blockNumber,true, storageHelper.storeTransactionIfNotExist)
});



 
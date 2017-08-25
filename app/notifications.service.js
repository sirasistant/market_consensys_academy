var Promise = require("bluebird");
web3.eth.getTransactionReceiptMined = require("./lib/getTransactionReceiptMined.js");

module.exports = ['$rootScope', '$timeout', function ($rootScope, $timeout) {
    $rootScope.notifications = [];

    return {
        addTransactionNotification:function(txHash){
            var notification = {type:"warning",hash:txHash.substring(0,25),mined:false,error:null};
            $rootScope.notifications.unshift(notification);
            web3.eth.getTransactionReceiptMined(txHash).then((receipt)=>{
                notification.type = "success";
                notification.mined = true;
                $rootScope.$apply();
            }).catch(error=>{
                notification.type = "danger";
                notification.error = error.toString();
                $rootScope.$apply();
            })
        }
    };
}];    
var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', 'market','notifications', function ($rootScope, $timeout, market,notifications) {
    return {
        restrict: 'E',
        scope: {
            account: "=account",
            instance: "=instance"
        },
        templateUrl: './money/money.html',
        link: function (scope, element, attrs) {
            var instance = scope.instance;
            var account = scope.account;

            function reloadMoney(){
                instance.balances(account).then((balance)=>{
                    scope.balance = web3.fromWei(balance,"ether").toNumber();
                    scope.$apply();
                })
            }

            var moneyAddedListener = $rootScope.$on("LogMoneyAdded", (event, args) => {
                reloadMoney();
            });

            var withdrawListener = $rootScope.$on("LogWithdraw", (event, args) => {
                reloadMoney();
            });

            var transferListener = $rootScope.$on("LogTransfer", (event, args) => {
                reloadMoney();
            });

            reloadMoney();

            scope.withdraw = ()=>{
                instance.withdraw.sendTransaction({from:account}).then((hash) => {
                    notifications.addTransactionNotification(hash);
                    $rootScope.$apply();
                }).catch(err => console.error(err));;
            }

            scope.$on("destroy", () => {
                moneyAddedListener();
                withdrawListener();
                transferListener();
            })
        }
    };
}];

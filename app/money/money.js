var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', 'market', function ($rootScope, $timeout, market) {
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

            reloadMoney();

            scope.withdraw = ()=>{
                instance.withdraw({from:account});
            }

            scope.$on("destroy", () => {
                moneyAddedListener();
                withdrawListener();
            })
        }
    };
}];

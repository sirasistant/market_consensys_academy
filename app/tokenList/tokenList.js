var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', 'market', 'notifications','$location','$uibModal', function ($rootScope, $timeout, market, notifications,$location,$uibModal) {
    return {
        restrict: 'E',
        scope: {
            account: "=account",
            instance: "=instance"
        },
        templateUrl: './tokenList/tokenList.html',
        link: function (scope, element, attrs) {

            var instance = scope.instance;

          
            function reloadTokens() {
                market.getAllowedTokens(instance,scope.account).then(tokens => {
                    scope.tokens = tokens;
                    scope.$apply();
                })
            };

            var moneyAddedListener = $rootScope.$on("LogTokenAdded", (event, args) => {
                reloadTokens();
            });

            var withdrawListener = $rootScope.$on("LogWithdrawToken", (event, args) => {
                reloadTokens();
            });

            var transferListener = $rootScope.$on("LogTokenTransfer", (event, args) => {
                reloadTokens();
            });

            var allowedTokenAddedListener =$rootScope.$on("LogAddAllowedToken", (event, args) => {
                reloadTokens();
            });

            reloadTokens();

            scope.formatAmountWithDecimals = function(amount,decimalUnits,decimalsToShow){
                return (amount/Math.pow(10,decimalUnits)).toFixed(decimalsToShow);
            }

            scope.deposit = (token) => {
                var modalInstance = $uibModal.open({
                    animation: true,
                    component: 'depositToken',
                    resolve: {
                        token:()=>token
                    }
                });

                modalInstance.result.then(() => {

                }, () => { });
            };

            scope.withdraw =async (token) => {
                var hash = await instance.withdrawTokens.sendTransaction(token.instance.address,{from:scope.account,gas:300000});
                notifications.addTransactionNotification(hash);
                scope.$apply();
            };

            scope.$on("destroy", () => {
                moneyAddedListener();
                withdrawListener();
                transferListener();
                allowedTokenAddedListener();
            })
        }
    };
}];

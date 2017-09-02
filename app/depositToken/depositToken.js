var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', 'market','notifications', function ($rootScope, $timeout, market,notifications) {
    return {
        restrict: 'E',
        scope: {
            
        },
        templateUrl: './depositToken/depositToken.html',
        link: function (scope, element, attrs) {
            var instance = scope.$root.marketInstance;
            var account = scope.$root.account;
            scope.token = scope.$parent.$resolve.token;
            scope.amount = 1;

            scope.deposit = ()=>{
                var amount = (scope.amount * Math.pow(10,scope.token.decimalUnits)).toFixed(0);
                scope.token.instance.approveAndCall.sendTransaction(instance.address,amount,"",{from:account,gas:300000}).then((hash) => {
                    notifications.addTransactionNotification(hash);
                    scope.$parent.$uibModalInstance.close();
                    $rootScope.$apply();
                }).catch(err => console.error(err));
            }

            scope.cancel = ()=>{
                scope.$parent.$uibModalInstance.dismiss();
            }

        }
    };
}];

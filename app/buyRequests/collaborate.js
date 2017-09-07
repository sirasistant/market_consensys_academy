var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', 'market','notifications', function ($rootScope, $timeout, market,notifications) {
    return {
        restrict: 'E',
        scope: {
            
        },
        templateUrl: './buyRequests/collaborate.html',
        link: function (scope, element, attrs) {
            var hubInstance = scope.$parent.$resolve.hubInstance;
            var groupBuyInstance = scope.$parent.$resolve.groupBuyInstance;
            var shopInstances = scope.$parent.$resolve.shopInstances;
            var account = scope.$parent.$resolve.account;
            scope.request = scope.$parent.$resolve.request;

            scope.amount = 1;

            scope.collaborate = ()=>{
                var amount = web3.toWei(scope.amount,"ether");
                groupBuyInstance.joinBuyRequest.sendTransaction(scope.request.id,{from:account,value:amount}).then((hash) => {
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

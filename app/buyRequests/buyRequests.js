var Promise = require("bluebird");

module.exports = ['$rootScope', '$timeout', 'market', 'groupBuy','notifications', '$uibModal','$location', function ($rootScope, $timeout, market,groupBuy, notifications,$uibModal, $location) {
    return {
        restrict: 'E',
        scope: {
            account: "=account",
            marketInstance: "=marketInstance",
            groupBuyInstance: "=groupBuyInstance"
        },
        templateUrl: './buyRequests/buyRequests.html',
        link: function (scope, element, attrs) {

            var idSearch = $location.search().requestId;

            scope.search = { id: idSearch,paid:false };

            var marketInstance = scope.marketInstance;
            var groupBuyInstance = scope.groupBuyInstance;

            async function reload(){
                var requests = await groupBuy.getRequests(groupBuyInstance);
                var products = await market.getProductsWithTokens(marketInstance,scope.account);
                requests = requests.map(request=>{
                    var product = products.filter(product=>product.id.equals(request.productId))[0];
                    request.product = product;
                    return request;
                });
                scope.requests = requests;
                scope.$apply();
            }

            var addBuyRequestListener = $rootScope.$on("LogBuyRequestAdded", (event, args) => {
                reload();
            })

            var joinBuyRequestListener = $rootScope.$on("LogJoinedBuyRequest", (event, args) => {
                reload();
            });

            var executedBuyRequestListener = $rootScope.$on("LogBuyRequestExecuted", (event, args) => {
                reload();
            })

            var exitedBuyRequestListener = $rootScope.$on("LogExitedBuyRequest", (event, args) => {
                reload();
            });

            reload();

            scope.collaborate = async (request)=>{
                var modalInstance = $uibModal.open({
                    animation: true,
                    component: 'collaborate',
                    resolve: {
                        request:()=>request
                    }
                });

                modalInstance.result.then(() => {

                }, () => { });
            }

            scope.exit = async (request)=>{
                var hash = await marketInstance.exitBuyRequest.sendTransaction(request.id, { from: scope.account });
                notifications.addTransactionNotification(hash);
                $rootScope.$apply();
            }

            scope.$on("destroy", () => {
                addBuyRequestListener();
                joinBuyRequestListener();
                executedBuyRequestListener();
                exitedBuyRequestListener();
            })
        }
    };
}];

    (function() {

        "use strict";

        angular
            .module("TendrlModule")
            .component("globalTaskDetail", {

                restrict: "E",
                templateUrl: "/modules/tasks/global-task-detail/global-task-detail.html",
                bindings: {},
                controller: globalTaskDetailController,
                controllerAs: "glbTaskDetailCntrl"
            });

        /*@ngInject*/
        function globalTaskDetailController($rootScope, $scope, $interval, $state, $stateParams, taskStore, config, utils, clusterStore) {

            var vm = this,
                statusTimer,
                msgTimer,
                isMessagesLoading;

            vm.isDataLoading = true;
            vm.isMessagesLoading = true;
            vm.goToClusterTask = goToClusterTask;
            vm.goToClusterDetail = goToClusterDetail;

            init();

            function _getTaskLogs() {
                taskStore.getTaskLogs($stateParams.taskId)
                    .then(function(response) {
                        $interval.cancel(msgTimer);

                        if (typeof vm.taskDetail !== "undefined") {

                            vm.taskDetail.logs = response;
                            vm.isMessagesLoading = false;
                        }
                        startMessageTimer();
                    });
            }

            function init() {

                $rootScope.selectedClusterOption = "";
                vm.clusterId = $stateParams.clusterId;
                if ($rootScope.clusterData) {
                    _getTaskList();
                } else {
                    clusterStore.getClusterList()
                        .then(function(data) {
                            $rootScope.clusterData = clusterStore.formatClusterData(data);
                            _getTaskList();
                        });
                }

            }

            function startStatusTimer() {

                statusTimer = $interval(function() {

                    if (vm.taskDetail && (vm.taskDetail.status === "processing" || vm.taskDetail.status === "new")) {
                        taskStore.getTaskStatus($stateParams.taskId)
                            .then(function(data) {
                                $interval.cancel(statusTimer);
                                vm.taskDetail.status = data.status;
                                startStatusTimer();
                            });
                    }

                }, 1000 * config.msgRefreshIntervalTime, 1);
            }


            function goToClusterTask() {
                $state.go("cluster-tasks", { clusterId: vm.clusterId });
            }

            function startMessageTimer() {
                msgTimer = $interval(function() {

                    if (vm.taskDetail && (vm.taskDetail.status === "processing" || vm.taskDetail.status === "new")) {
                        _getTaskLogs();
                    }

                }, 1000 * config.msgRefreshIntervalTime, 1);
            }

            function goToClusterDetail() {
                $state.go("cluster-hosts", { clusterId: vm.taskDetail.parameters["TendrlContext.integration_id"] });
            }

            $scope.$on("$destroy", function() {
                $interval.cancel(statusTimer);
                $interval.cancel(msgTimer);
            });

            function _getTaskList() {

                taskStore.getJobDetail($stateParams.taskId)
                    .then(function(data) {
                        vm.taskDetail = data;
                        vm.isDataLoading = false;

                        _getTaskLogs();
                        startStatusTimer();
                        startMessageTimer();
                    });
            }
        }

    })();

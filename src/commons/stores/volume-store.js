(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .service("volumeStore", volumeStore);

    /*@ngInject*/
    function volumeStore($state, $q, $rootScope, $stateParams, utils, nodeStore, volumeFactory) {
        var store = this;

        store.volumeList = [];
        /**
         * @name getVolumeList
         * @desc store for getVolumeList
         * @memberOf volumeStore
         */
        store.getVolumeList = function(clusterId) {
            var list,
                deferred;

            deferred = $q.defer();
            volumeFactory.getVolumeList(clusterId)
                .then(function(data) {
                    list = data ? _formatVolumeData(data) : [];
                    store.volumeList = list;
                    deferred.resolve(list);
                });

            return deferred.promise;

            function _formatVolumeData(data) {
                var volumeList = [],
                    len = data.length,
                    temp = {},
                    i;

                for (i = 0; i < len; i++) {
                    temp = {};
                    if (data[i].deleted !== "True") {
                        temp.volumeId = data[i].vol_id;
                        //temp.status = data[i].status !== "Stopped" ? "Running": data[i].status;
                        temp.status = data[i].status;
                        temp.name = data[i].name;
                        temp.type = data[i].vol_type;
                        temp.clusterId = data[i].cluster_id;
                        temp.rebalStatus = data[i].rebal_status;
                        temp.brickCount = data[i].brick_count;
                        temp.alertCount = data[i].alert_counters ? data[i].alert_counters.warning_count : "No Data";
                        volumeList.push(temp);
                    }
                }
                return volumeList;
            }
        };

        /**
         * @name getRebalStatus
         * @desc returns rebalance status text
         * @memberOf volumeStore
         */
        store.getRebalStatus = function(volume) {
            switch (volume.rebalStatus) {
                case "completed":
                    return "Completed";
                    break;

                case "not_started":
                case "not started":
                    return "Not Started";
                    break;

                case "in progress":
                case "in_progress":
                    return "In Progress";
                    break;

                case "failed":
                    return "Failed";
                    break;

                case "stopped":
                    return "Stopped";
                    break;

                default:
                    return "NA";
            }
        };

        store.getVolumeObject = function(volId) {
            var len = store.volumeList.length,
                i;

            for (i = 0; i < len; i++) {
                if (store.volumeList[i].volumeId === volId) {
                    return store.volumeList[i];
                }
            }

            return null;

        };
    }

})();

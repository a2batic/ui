(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("login", {

            restrict: "E",
            templateUrl: "/modules/login/login.html",
            bindings: {},
            controller: LoginController,
            controllerAs: "loginCntrl"
        });

    /*@ngInject*/
    function LoginController($state, $rootScope, $interval, AuthManager, eventStore, config, menuService, userStore) {

        /* Controller instance */
        var vm = this,
            noticeTimer;

        $rootScope.isAPINotFoundError = false;

        if (AuthManager.isUserLoggedIn) {
            $state.go("clusters")
        }

        vm.user = {};
        vm.showPassword = "password";
        vm.errorMsg = "";
        vm.login = login;

        function login() {

            vm.formSubmitInProgress = true;

            if (validateUiFields()) {

                AuthManager.authenticateUser(vm.user)
                    .then(function(data) {
                        AuthManager.isUserLoggedIn = true;
                        AuthManager.setAuthHeader();
                    })
                    .catch(function(error) {
                        AuthManager.isUserLoggedIn = false;

                        if (error.status === 503) {
                            vm.errorMsg = "Tendrl API is not reachable. Please restart the Tendrl API server by before logging in.";
                        } else {
                            vm.errorMsg = "The username or password you entered does not match our records. Please try again.";
                        }

                        vm.user.password = "";
                    })
                    .then(function() {
                        return userStore.getUserInfo();
                    })
                    .catch(function() {
                        console.log("error in getting user details");
                    })
                    .then(function() {
                        menuService.setMenus();
                        $state.go("clusters");
                    })
                    .then(function() {
                        getNotificationList();
                    })
                    .finally(function() {
                        vm.formSubmitInProgress = false;
                    });
            } else {
                vm.formSubmitInProgress = false;
            }
        }

        function validateUiFields() {
            var isFormValid = true,
                form = vm.signInForm;

            if (form.username.$invalid) {
                vm.invalidFormMessage = "Please specify valid email id.";
                isFormValid = false;
            } else if (form.password.$invalid) {
                vm.invalidFormMessage = "Please specify valid password.";
                isFormValid = false;
            }

            return isFormValid;

        }

        function getNotificationList() {
            eventStore.getNotificationList()
                .then(function(notificationList) {
                    $interval.cancel(noticeTimer);
                    $rootScope.notificationList = notificationList;
                    $rootScope.$broadcast("GotNoticationData", $rootScope.notificationList);
                    startNotificationTimer();
                })
                .catch(function(error) {
                    $rootScope.notificationList = null;
                });
        }

        function startNotificationTimer() {
            noticeTimer = $interval(function() {
                getNotificationList();
            }, 1000 * config.eventsRefreshIntervalTime, 1);
        }

        $rootScope.$on("UserLogsOut", function() {
            $interval.cancel(noticeTimer);
        });

    }

})();

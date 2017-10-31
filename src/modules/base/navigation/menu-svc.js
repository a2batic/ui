(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .service("menuService", menuService);

    /*@ngInject*/
    function menuService($state, $rootScope, $http, AuthManager, userStore) {

        /* Cache the reference to this pointer */
        var vm = this;
        vm.menus = [];
        vm.setMenus = function() {
            vm.menus = [{

                label: "Hosts",
                id: "hosts",
                href: "hosts",
                icon: "pficon pficon-container-node",
                active: false,
                hasSubMenus: false,
                show: true
            }, {
                label: "Volumes",
                id: "volumes",
                href: "volumes",
                //href: "cluster-volumes",
                //stateParams: { clusterId: vm.clusterId },
                icon: "pficon pficon-container-node",
                active: false,
                hasSubMenus: false,
                show: true
            }, {
                label: "Tasks",
                id: "tasks",
                href: "tasks",
                //stateParams: { clusterId: vm.clusterId },
                icon: "fa fa-cog",
                active: false,
                hasSubMenus: false,
                show: true
            }, {
                label: "Events",
                id: "events",
                href: "events",
                //href: "cluster-events",
                //stateParams: { clusterId: vm.clusterId },
                icon: "fa fa-cog",
                active: false,
                hasSubMenus: false,
                show: true
            }];
        };

        vm.setActive = function(menuId) {

            if (JSON.parse(localStorage.getItem("userInfo"))) {
                vm.menus.map(function(menu) {
                    if (menu.hasSubMenus === true) {
                        menu.subMenus.map(function(submenu) {
                            submenu.active = submenu.id === menuId
                        });
                    }
                    menu.active = menu.id === menuId;
                    return menu;
                });
            } else if ($http.defaults.headers.common["Authorization"]) {
                AuthManager.logout();
                $state.go("login");
                AuthManager.setFlags();
                AuthManager.isUserLoggedIn = false;
            }
        };


        vm.getMenus = function(clusterId) {
            if (clusterId !== vm.clusterId) {
                vm.clusterId = clusterId;
                vm.setMenus();
            }
            return vm.menus;
        };

    }

})();

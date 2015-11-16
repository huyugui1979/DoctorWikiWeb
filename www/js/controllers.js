/**
 * Created by jie on 15/7/2.
 */
var registerData = {
    name: '',
    trueName: '',
    password: '',
    phone: '',
    vcode: '',
    selected: [],
    image: 'default.jpg',
    age: '23'
};
angular.module('starter.controllers', ['ionic.utils', 'ionic-datepicker', 'ngCordova', 'ti-segmented-control'])

    .controller('AppCtrl', function ($scope, $http, $rootScope, $ionicLoading, $ionicPopup, SERVER) {
        //
        $http.get(SERVER.url + '/category').success(function (data) {
            $rootScope.category = data;
        }).error(function (reason) {
            //
            $ionicPopup.alert({
                title: '错误',
                template: reason
            });
            //
        }).finally(function () {
            $ionicLoading.hide();
        });

        //

    })
    //浏览
    .controller('BrowseCtrl', function ($scope, $localstorage, $state, $http, $ionicScrollDelegate, $rootScope, $timeout, $ionicLoading, QuestionService, $ionicModal, $ionicPopup, SERVER) {
        //
        //if(window.Alert != null)
        //{
        //    window.Alert.alert('ok','ok','ok');
        //    console.log("editor");
        //}
        //$scope.image_url = SERVER.url + "/images/" + $rootScope.user.image;
        //后台检查更新

        if (ionic.Platform.isWebView == false) {
            $http.get(SERVER.url + '/versions').success(function (data) {
                console.log("update ver is " + JSON.stringify(data));
                var currentVersion = $localstorage.getObject('currentVersion');
                console.log("current ver is " + JSON.stringify(currentVersion));

                if (currentVersion == null) {
                    console.log("currentVersion is null");
                    currentVersion = data;
                    $localstorage.setObject('currentVersion', currentVersion);
                } else if (currentVersion.toString() != data.toString()) {
                    console.log("have currentViersion");
                    $ionicPopup.confirm({
                        title: "通知",
                        template: "软件有新的更新，是否前去更新"
                    }).then(function (res) {
                        if (res) {
                            if (ionic.Platform.isIOS())
                                cordova.InAppBrowser.open(data.iosUpdateUrl, '_system', 'location=yes');
                            else
                                cordova.InAppBrowser.open(data.androidUpdateUrl, '_system', 'location=yes');
                        }
                    })
                }
            }).error(function (reason) {
                //
                console.log("error " + reason);
                //
            }).finally(function () {

            });
        }
        $scope.$on('$ionicView.enter', function () {
            //
            loadQuestion(true);
            //
            // do what you want to do
        })
        $scope.isActive = [];
        $scope.images = [{name: 'a', title: 'b', src: 'img/question.jpg'}, {
            name: 'a',
            title: 'b',
            src: 'img/question.jpg'
        }, {name: 'a', title: 'b', src: 'img/question.jpg'}, {name: 'a', title: 'b', src: 'img/question.jpg'}];
        $scope.answer = function ($index) {
            //
            $ionicLoading.show();

            var v = $scope.questions[$index];


            delete v.$$hashKey;
            if (v.doctor == null) {
                v.doctor = $rootScope.user;
                v.answerTime = Date.now();
                $http.put(SERVER.url + '/questions', v).success(function (data) {

                }).error(function (reason) {
                    //

                    $ionicPopup.alert({
                        title: '错误',
                        template: reason
                    });
                    //
                }).finally(function () {
                    $ionicLoading.hide();
                });
            } else {

                v.doctor = null;
                v.answerTime = null;
                $http.put(SERVER.url + '/questions', v).success(function (data) {


                }).error(function (reason) {
                    //
                    $ionicPopup.alert({
                        title: '错误',
                        template: reason
                    });
                    //
                }).finally(function () {
                    $ionicLoading.hide();
                });
            }
            //
        }
        //
        $scope.expand = function ($index) {
            $scope.questions[$index].shrink = !$scope.questions[$index].shrink;
            $ionicScrollDelegate.resize();
        }
        var loadQuestion = function (loading) {


            $ionicLoading.show();
            $http.get(SERVER.url + '/questions/unanswered', {
                params: {
                    "categorys[]": $rootScope.user.selected,
                    doctor: $rootScope.user._id
                }
            }).success(function (data) {

                $scope.questions = data;

                //$scope.shrink =[];
                $scope.questions.forEach(function (e, i, a) {
                    e.shrink = true;
                    //$scope.shrink.push(true);
                })

                QuestionService.setData(data);

            }).error(function (reason) {
                //
                $ionicPopup.alert({
                    title: '错误',
                    template: reason
                });
                //
            }).finally(function () {
                // Stop the ion-refresher from spinning

                $ionicLoading.hide();


            });
        }
        $scope.doRefresh = function () {
            loadQuestion(false);
        };

    })
    .controller('LoginCtrl', function ($scope, $http, $state, $rootScope, $ionicPopup, $cordovaFile, $cordovaFileTransfer, $localstorage, $ionicLoading, SERVER) {
        $scope.data = {phone: "", password: ""};

        $scope.$on('$ionicView.beforeEnter', function () {

            var user = $localstorage.getObject('user');

            console.log(JSON.stringify(user));
            if (user != null) {
                console.log("check user");
                $ionicLoading.show();
                $http.get(SERVER.url + '/doctors/id', {params: {_id: user._id}}).success(function (data) {
                    console.log("login:" + data);
                    $rootScope.user = data;

                    $state.go('app.browse', {}, {reload: true});
                }).error(function (reason) {
                    $ionicPopup.alert({
                        title: '错误',
                        template: reason
                    });
                }).finally(function () {
                    $ionicLoading.hide();
                });

            }
        });
        //
        var loadImage = function () {
            var targetPath = cordova.file.dataDirectory + $rootScope.user.image;
            $cordovaFileTransfer.download(SERVER.url + "/images/" + $rootScope.user.image, targetPath, {}, true)
                .then(function (result) {

                    console.log(JSON.stringify($rootScope.user));
                    // $ionicLoading.hide();
                    console.log("begin goto borwoser");
                    $state.go('app.browse');
                    console.log("goto borwoser")
                }, function (reason) {
                    console.log("loadimage error");
                    $ionicPopup.alert({
                        title: '错误',
                        template: reason
                    });
                    $ionicLoading.hide();
                }, function (progress) {

                });
        }

        $scope.login = function () {
            //
            $ionicLoading.show({content: '正在登录'});
            $http.get(SERVER.url + '/doctor/login', {params: $scope.data}).success(function (data) {
                if (data != null) {
                    //
                    $localstorage.setObject('user', data[0]);
                    $rootScope.user = data[0];
                    if (ionic.Platform.isWebView == false)
                        loadImage();
                    $state.go('app.browse');
                }
            }).error(function (reason) {
                //
                console.log("login error");
                $ionicPopup.alert({
                    title: '错误',
                    template: reason
                });

                //
            }).finally(function () {
                $ionicLoading.hide();
            });

        }
        $scope.register = function () {
            $state.go('register')
        }
    })

    .controller('CommentDetailCtrl', function ($scope, $state, QuestionService, $ionicPopover, $stateParams, $timeout, $rootScope, $http, $ionicPopup, $ionicLoading, SERVER) {
        //
        var index = angular.fromJson($stateParams.params);
        $scope.question = QuestionService.getQuestionByIndex(index);
        //
        //var configs = {
        //    readOnly: false,
        //    theme: 'snow'
        //};
        //var quill = new Quill('#editor',configs);
        //quill.addModule('toolbar', { container: '#toolbar' });

        var loadComments = function () {
            //
            $ionicLoading.show({content: ''});
            //

            $http.get(SERVER.url + '/comments/question', {params: {question: $scope.question._id}}).success(function (data) {
                //
                $scope.comments = data;
                //
            }).error(function (reason) {
                //
                $ionicPopup.alert({
                    title: '错误',
                    template: reason
                });
            }).finally(function () {
                // Stop the ion-refresher from spinning
                //
                $ionicLoading.hide();
                $scope.$broadcast('scroll.refreshComplete');
            });
        }
        loadComments();
        //
        $scope.goDetail = function ($index) {
            //window.location.href="editor.html";
            $state.go('app.questionDetail', {params: index});
        }
        $scope.MyModify = function () {
            //
            //if ($rootScope.user._id != $scope.question.doctor._id)
            //    return;
            //$scope.edit = !$scope.edit;
            //if ($scope.edit == false) {
            //    $ionicLoading.show({content: '正在修改'});
            //    $scope.question.answerTime = Date.now();
            //    $http.put(SERVER.url + '/questions', $scope.question).success(function (data) {
            //        //
            //        $ionicPopup.alert({
            //            title: '',
            //            template: '修改成功'
            //        });
            //        //
            //    }).error(function (reason) {
            //        //
            //        $ionicPopup.alert({
            //            title: '错误',
            //            template: reason
            //        });
            //        //
            //    }).finally(function () {
            //        // Stop the ion-refresher from spinning
            //        //
            //        $ionicLoading.hide();
            //    });
            //}

            //
        }
        $scope.collection = function () {
            //
            $ionicLoading.show({content: '正在修改'});
            if ($rootScope.user.collections.indexOf($scope.question._id) != -1) {
                var index = $rootScope.user.collections.indexOf($scope.question._id);
                $rootScope.user.collections.splice(index, 1);
                $scope.question.collectionNumber -= 1;
            } else {
                $rootScope.user.collections.push($scope.question._id);
                $scope.question.collectionNumber += 1;
            }
            $http.put(SERVER.url + '/doctors', $rootScope.user).success(function (data) {

                $http.put(SERVER.url + '/questions', $scope.question).success(function (data) {

                }).error(function (reason) {

                }).finally(function () {
                    // Stop the ion-refresher from spinning
                    $ionicLoading.hide();
                });
            }).error(function (reason) {
                //
                $ionicPopup.alert({
                    title: '错误',
                    template: reason
                });
                //
            }).finally(function () {
                // Stop the ion-refresher from spinning

            });
        }
        //
        // $scope.comments = question.comments;
        $scope.data = {};
        $scope.sendComment = function () {
            //
            if ($scope.data.content == null) {
                $ionicPopup.alert({
                    title: '错误',
                    template: '请输入评论内容'
                });
                return;
            }
            if ($scope.question.doctor == $rootScope.user._id) {
                $ionicPopup.alert({
                    title: '错误',
                    template: '你不能对自己的问题进行评论'
                });
                return;
            }

            $scope.data.doctor = $rootScope.user;
            $scope.data.time = Date.now();
            $scope.data.question = $scope.question._id;
            $ionicLoading.show({content: '正在发送'});
            var j = 3;
            $http.post(SERVER.url + '/comments', $scope.data).success(function (data) {
                //
                $scope.question.comments.push(data._id);
                $scope.data.content = null;
                loadComments();
                //
            }).error(function (reason) {
                //
                $ionicPopup.alert({
                    title: '错误',
                    template: '服务器错误:' + reason
                });
                //
            }).finally(function () {
                // Stop the ion-refresher from spinning
                //
                $ionicLoading.hide();
            });
        }

        $scope.doRefresh = function () {
            loadComments();
        };
        //
        $scope.modify = function () {
            $scope.edit = !$scope.edit;
            if ($scope.edit == false) {

            }
        }
        //
        $scope.edit = false;


    })
    //

    //
    .controller('MyCollectionCtrl', function ($state, $http, QuestionService, $rootScope, $timeout, $ionicLoading, $ionicPopup, $scope, SERVER) {

        $scope.questions = [];
        $scope.goDetail = function ($index) {

            $state.go('app.commentDetail', {'params': $index});
        }
        var download = function () {

            $http.get(SERVER.url + '/questions/ids', {params: {'ids[]': $rootScope.user.collections}}).success(function (data) {
                //
                $scope.questions = data;
                QuestionService.setData($scope.questions);

                //
            }).error(function (reason) {
                //
                $ionicPopup.alert({
                    title: '错误',
                    template: '服务器错误:' + reason
                });
                //
            }).finally(function () {
                $scope.$broadcast('scroll.refreshComplete');
            });
        }
        download();
        $scope.doRefresh = function () {
            download();
        };
        $scope.$on('$ionicView.enter', function () {
            QuestionService.setData($scope.questions);
            // do what you want to do
        })
        //
    })
    //审核

    .controller('AuditCtrl', function ($scope, $http, $rootScope, QuestionService, $state, $timeout, $ionicLoading, $ionicPopup, SERVER,
                                       $cordovaDevice, NewMedia, $cordovaFile, $cordovaCapture) {
        //
        var weekDaysList = ['日', '一', '二', '三', '四', '五', '六'];
        var monthList = ['一月', '二月', '三月', '四月', '五朋', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
        var startDate = null;
        var endDate = null;
        $scope.beginDatepickerObject = {
            titleLabel: '选择时间',  //Optional
            todayLabel: '今日',  //Optional
            closeLabel: '关闭',  //Optional
            setLabel: '设置',  //Optional

            weekDaysList: weekDaysList, //Optional
            monthList: monthList, //Optional
            callback: function (val) {  //Mandatory
                //
                startDate = val;
                LoadQuestion();
                //
            },
            dateFormat: 'yyyy-MM-dd', //Optional
            closeOnSelect: false, //Optional
        };
        $scope.endDatepickerObject = {
            titleLabel: '选择时间',  //Optional
            todayLabel: '今日',  //Optional
            closeLabel: '关闭',  //Optional
            setLabel: '设置',  //Optional

            weekDaysList: weekDaysList, //Optional
            monthList: monthList, //Optional
            callback: function (val) {  //Mandatory
                endDate = val;
                LoadQuestion();
            },
            dateFormat: 'yyyy-MM-dd', //Optional
            closeOnSelect: false, //Optional
        };
        $scope.goDetail = function ($index) {
            //$ionicViewSwitcher.nextTransition('none');

            $state.go('app.commentDetail', {'params': $index});
        }

        $scope.data = {search_string: ""};
        $scope.cancel = function () {
            console.log("cancel");
            $scope.data.search_string = "";
            startDate = null;
            endDate = null;
            pageNo = 0;
            LoadQuestion();
        }
        $scope.search = function () {
            //
            $ionicLoading.show({content: '正在查找'});
            $http.get(SERVER.url + '/questions/search', {params: {"search": $scope.data.search_string}}).success(function (data) {
                $scope.questions = data;
                QuestionService.setData($scope.questions);

            }).error(function (reason) {
                //
                $ionicPopup.alert({
                    title: '错误',
                    template: reason
                });
                //
            }).finally(function () {
                // Stop the ion-refresher from spinning
                $ionicLoading.hide();

            });
            //
        }//
        var LoadQuestion = function () {
            $ionicLoading.show();
            $http.get(SERVER.url + '/questions/answered', {
                params: {
                    "categorys[]": $rootScope.user.selected, startDate: startDate,
                    endDate: endDate
                }
            }).success(function (data) {

                $scope.questions = data;
                //
                QuestionService.setData($scope.questions);


            }).error(function (reason) {
                //
                $ionicPopup.alert({
                    title: '错误',
                    template: reason
                });
                //
            }).finally(function () {
                // Stop the ion-refresher from spinning
                $ionicLoading.hide();
            });
        }
        $scope.doRefresh = function () {

            LoadQuestion();
        };
        LoadQuestion();
        $scope.$on('$ionicView.enter', function () {
            QuestionService.setData($scope.questions);
            // do what you want to do
        })

    }
).controller('ModifyCtrl', function ($scope, $state, $rootScope, $http, $ionicLoading, $timeout, $ionicPopup, QuestionService, SERVER) {
        //加载

        var weekDaysList = ['日', '一', '二', '三', '四', '五', '六'];
        var monthList = ['一月', '二月', '三月', '四月', '五朋', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
        var startDate = null;
        var endDate = null;
        $scope.beginDatepickerObject = {
            titleLabel: '选择时间',  //Optional
            todayLabel: '今日',  //Optional
            closeLabel: '关闭',  //Optional
            setLabel: '设置',  //Optional

            weekDaysList: weekDaysList, //Optional
            monthList: monthList, //Optional
            callback: function (val) {  //Mandatory
                //
                startDate = val;
                LoadQuestion();
                //
            },
            dateFormat: 'yyyy-MM-dd', //Optional
            closeOnSelect: false, //Optional
        };
        $scope.endDatepickerObject = {
            titleLabel: '选择时间',  //Optional
            todayLabel: '今日',  //Optional
            closeLabel: '关闭',  //Optional
            setLabel: '设置',  //Optional

            weekDaysList: weekDaysList, //Optional
            monthList: monthList, //Optional
            callback: function (val) {  //Mandatory
                endDate = val;
                LoadQuestion();
            },
            dateFormat: 'yyyy-MM-dd', //Optional
            closeOnSelect: false, //Optional
        };
        $scope.goDetail = function ($index) {

            $scope.questions[$index].unReadCommentNumber = 0;

            $http.put(SERVER.url + '/questions', $scope.questions[$index]).success(function (data) {

            }).error(function (reason) {
                //
                //
            }).finally(function () {

            });
            $state.go('app.commentDetail', {'params': $index});
        }
        //
        $scope.data = {search_string: ""};
        $scope.cancel = function () {
            $scope.data.search_string = "";
            startDate = null;
            endDate = null;
            LoadQuestion();
        }
        $scope.search = function () {
            //
            $ionicLoading.show({content: '正在查找'});
            $http.get(SERVER.url + '/questions/search', {
                params: {
                    "search": $scope.data.search_string,
                    modifyType: 1,
                    doctor: $rootScope.user._id
                }
            }).success(function (data) {
                $scope.questions = data;
                QuestionService.setData($scope.questions);

            }).error(function (reason) {
                //
                $ionicPopup.alert({
                    title: '错误',
                    template: reason
                });
                //
            }).finally(function () {
                // Stop the ion-refresher from spinning
                $ionicLoading.hide();

            });
            //
        }
        //
        var LoadQuestion = function () {

            $http.get(SERVER.url + '/questions/doctor/modify', {
                params: {
                    doctor: $rootScope.user._id,
                    startDate: startDate,
                    endDate: endDate
                }
            }).success(function (data) {
                $scope.questions = data;
                QuestionService.setData($scope.questions);

            }).error(function (reason) {
                //
                $ionicPopup.alert({
                    title: '错误',
                    template: error
                });
                //
            }).finally(function () {

                }
            );
        }
        $scope.$on('$ionicView.beforeEnter', function () {
            LoadQuestion();
        });
        $scope.questions = [];

    })
    .
    controller('HistoryCtrl', function ($scope, $state, $rootScope, $http, $ionicLoading, $timeout, $ionicPopup, QuestionService, SERVER) {
        //加载

        var weekDaysList = ['日', '一', '二', '三', '四', '五', '六'];
        var monthList = ['一月', '二月', '三月', '四月', '五朋', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
        var startDate = null;
        var endDate = null;
        $scope.beginDatepickerObject = {
            titleLabel: '选择时间',  //Optional
            todayLabel: '今日',  //Optional
            closeLabel: '关闭',  //Optional
            setLabel: '设置',  //Optional

            weekDaysList: weekDaysList, //Optional
            monthList: monthList, //Optional
            callback: function (val) {  //Mandatory
                //
                startDate = val;
                LoadQuestion();
                //
            },
            dateFormat: 'yyyy-MM-dd', //Optional
            closeOnSelect: false, //Optional
        };
        $scope.endDatepickerObject = {
            titleLabel: '选择时间',  //Optional
            todayLabel: '今日',  //Optional
            closeLabel: '关闭',  //Optional
            setLabel: '设置',  //Optional

            weekDaysList: weekDaysList, //Optional
            monthList: monthList, //Optional
            callback: function (val) {  //Mandatory
                endDate = val;
                LoadQuestion();
            },
            dateFormat: 'yyyy-MM-dd', //Optional
            closeOnSelect: false, //Optional
        };
        $scope.goDetail = function ($index) {

            $scope.questions[$index].unReadCommentNumber = 0;

            $http.put(SERVER.url + '/questions', $scope.questions[$index]).success(function (data) {

            }).error(function (reason) {
                //
                //
            }).finally(function () {

            });
            $state.go('app.commentDetail', {'params': $index});
        }
        //
        $scope.data = {search_string: ""};
        $scope.cancel = function () {
            $scope.data.search_string = "";
            startDate = null;
            endDate = null;
            LoadQuestion();
        }
        $scope.search = function () {
            //
            $ionicLoading.show({content: '正在查找'});
            $http.get(SERVER.url + '/questions/search', {
                params: {
                    "search": $scope.data.search_string,
                    modifyType: 0,
                    doctor: $rootScope.user._id
                }
            }).success(function (data) {
                $scope.questions = data;
                QuestionService.setData($scope.questions);

            }).error(function (reason) {
                //
                $ionicPopup.alert({
                    title: '错误',
                    template: reason
                });
                //
            }).finally(function () {
                // Stop the ion-refresher from spinning
                $ionicLoading.hide();

            });
            //
        }
        //
        var LoadQuestion = function () {

            $http.get(SERVER.url + '/questions/doctor/accept', {
                params: {
                    doctor: $rootScope.user._id,
                    modifyType: 0,
                    startDate: startDate,
                    endDate: endDate
                }
            }).success(function (data) {
                $scope.questions = data;
                QuestionService.setData($scope.questions);

            }).error(function (reason) {
                //
                $ionicPopup.alert({
                    title: '错误',
                    template: error
                });
                //
            }).finally(function () {

                }
            );
        }
        $scope.$on('$ionicView.beforeEnter', function () {
            LoadQuestion();
        });
        $scope.questions = [];

    })
    .controller('CategoryCtrl', function ($scope, $ionicScrollDelegate, $ionicHistory, $rootScope, $http, $state, SERVER) {
        //
        //$rootScope.user.selected["外科"][0]=false;
        //k=2;
        $scope.ok = function () {
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $state.go('app.browse')
        }
        $scope.toggleGroup = function (group) {
            if ($scope.isGroupShown(group)) {
                $scope.shownGroup = null;
            } else {
                $scope.shownGroup = group;
            }
            $ionicScrollDelegate.resize();
        };
        $scope.isGroupShown = function (group) {
            return $scope.shownGroup === group;
        };
        $scope.selected = new Array();
        $scope.$on('$ionicView.beforeEnter', function () {
            console.log("cate:" + $rootScope.category);
            $rootScope.category.forEach(function (e, i, a) {
                $scope.selected[e.name] = new Array();
                $scope.selected[e.name][e.child_depart.length] = 'NO';
                e.child_depart.forEach(function (e1, i1, a1) {

                    $rootScope.user.selected.forEach(function (e2, i2, a2) {
                        if (e1 == e2) {

                            $scope.selected[e.name][i1] = 'YES';
                        }

                    })
                });
            });
        });
        $scope.$on('$ionicView.beforeLeave', function () {
            //
            $rootScope.user.selected = [];
            $rootScope.category.forEach(function (e, i, a) {

                e.child_depart.forEach(function (e1, i1, a1) {

                    if ($scope.selected[e.name][i1] == 'YES') {
                        //
                        $rootScope.user.selected.push(e1);

                        //
                    }

                });
            });
            $http.put(SERVER.url + '/doctors', $rootScope.user).success(function (data) {
            }).error(function (reason) {
                //
                $ionicPopup.alert({
                    title: '错误',
                    template: reason
                });
                //
            }).finally(function () {
                // Stop the ion-refresher from spinning

            });

            //
        });


    })
    //首页
    .controller('QuestionDetailCtrl', function ($scope, $stateParams, $ionicLoading, SERVER, $http, QuestionService) {
        //

        var index = angular.fromJson($stateParams.params);
        $scope.question = QuestionService.getQuestionByIndex(index);
        //
        var editor = null;
        $scope.myfocuse = function () {
            //setTimeout(function() { editor.focus(); }, 2000);
            editor.focus(true);
        }
        ionic.DomUtil.ready(function () {
            editor = new wysihtml5.Editor('editor', {
                supportTouchDevices: true,
                parserRules: wysihtml5ParserRulesDefaults
            });

            //editor.composer.element.ownerDocument.addEventListener("touchstart", function() {
            //    console.log('hell');
            //    setTimeout(function() {
            //        editor.composer.iframe.focus();
            //    }, 500); // do not use 0, window will get blur in a short time after touchstart.
            //});
            editor.setValue($scope.question.answer);


        });
        $scope.$on('$ionicView.enter', function () {
            //$("editor").click();
            //setTimeout(function() {
            //   var ele =  document.getElementById("editor");
            //    console.log("ele"+ele);
            //    ele.click();
            //
            //}, 500);
            //editor.focus();
            // do what you want to do
        })
        $scope.modify = function () {
            $ionicLoading.show();
            $scope.question.answer = editor.getValue();
            $scope.question.numberOfModify = $scope.question.numberOfModify==null?1:$scope.question.numberOfModify + 1;
            $scope.question.modifyTime = Date.now();
            $http.put(SERVER.url + '/questions', $scope.question).success(function (data) {

            }).error(function (reason) {
                //
                $ionicPopup.alert({
                    title: '错误',
                    template: reason
                });
                //
            }).finally(function () {
                $ionicLoading.hide();
            });
        }


    })
    //注册
    //("http://iapp.iiyi.com/zlzs/v7/ext/register/", param);

    .controller('RegisterCtrl', function ($scope, $ionicLoading, $rootScope, $ionicPopup, $http, $state, SERVER) {
        $scope.data = registerData;
        $scope.getVcode = function () {
            //
            $ionicLoading.show({content: '正在发送验证码'});
            $http.post(SERVER.url + '/vcode/register', $scope.data).success(function (data) {
                //
                $state.go("register2")
                //
            }).error(function (reason) {
                //
                $ionicPopup.alert({
                    title: '错误',
                    template: reason
                });
                //
            }).finally(function () {
                $ionicLoading.hide();
            });
            ;
            //
        }
        $scope.register = function () {

            if ($scope.data.trueName == "" ||
                $scope.data.name == "" || $scope.data.password == "" || $scope.data.vcode == "") {
                $ionicPopup.alert({
                    title: '错误',
                    template: '请输入完整的数据'
                });
                return;
            }
            //
            //
            $ionicLoading.show({content: '正在注册'});

            $http.get(SERVER.url + '/vcode/register', {params: $scope.data}).success(function (data) {
                $ionicPopup.alert({
                    title: '',
                    template: '注册成功'
                }).then(function (res) {
                    $state.go('app.category');
                });
                $rootScope.user = data;

            }).error(function (reason) {
                //
                $ionicPopup.alert({
                    title: '错误',
                    template: reason
                });
                //
            }).finally(function () {
                $ionicLoading.hide();
            });
        }
    })
    .controller('change-password-ctrl', function ($scope, $rootScope, $state, $http, $ionicPopup, $ionicLoading, SERVER) {
        $scope.data = {oldPassword: '', newPassword: ''};
        $scope.changePassword = function () {
            //
            $ionicLoading.show({});
            $http.post(SERVER.url + '/doctor/changePassword', {
                _id: $rootScope.user._id,
                data: $scope.data
            }).success(function (data) {
                //
                $ionicPopup.alert({
                    title: '',
                    template: '更改成功'
                });
                //
            }).error(function (reason) {
                //
                $ionicPopup.alert({
                    title: '错误',
                    template: reason
                });
                //
            }).finally(function () {
                // Stop the ion-refresher from spinning
                $ionicLoading.hide();
            });
            //
        }
    })
    .controller('PersonalCtrl', function ($scope, $rootScope, $state, $http, $ionicHistory, $ionicLoading, $localstorage, SERVER, $cordovaFile, $cordovaFileTransfer) {
        //
        if (ionic.Platform.isWebView == false)
            $rootScope.userImageUrl = cordova.file.dataDirectory + $rootScope.user.image;
        else
            $rootScope.userImageUrl = "/images/" + $rootScope.user.image;
        $scope.logout = function () {
            //
            $rootScope.user = null;
            $localstorage.setObject('user', null);
            $state.go('login')
            //
        }
        $scope.update = function () {
            //
            $http.put(SERVER.url + '/doctors', $rootScope.user).success(function (data) {

            }).error(function (reason) {
                //
                //
            }).finally(function () {
                // Stop the ion-refresher from spinning

            });
        }
        $scope.changePassword = function ($scope, $http) {
            //

            $state.go('app.change-password');
            //
        }
        $scope.changeImage = function () {
            //
            if (ionic.Platform.isWebView == false) {
                navigator.camera.getPicture(function (imageData) {
                    console.log(imageData);
                    //var idx =  imageData.lastIndexOf("/")+1;
                    //
                    //var filename = filepath.slice(idx);
                    //var path = imageData.substring(0,idx);
                    //alert(filename);
                    //alert(path);
                    //$cordovaFile.copyFile(path,filename,cordova.file.dataDirectory, $rootScope.user.phone + "_" + Date.now() + '.png');
                    //$rootScope.userImageUrl = imageData;

                    var fileURI = imageData;
                    var options = new FileUploadOptions();
                    options.fileKey = "file";
                    options.fileName = $rootScope.user.phone + "_" + Date.now() + '.png';
                    options.mimeType = "image/png";

                    console.log($rootScope.user.image);
                    var ft = new FileTransfer();
                    $ionicLoading.show();
                    ft.upload(fileURI, encodeURI(SERVER.url + "/portrait"), function (result) {
                        //
                        //alert(options.fileName);
                        $rootScope.user.image = options.fileName;
                        // console.log(options.fileName);
                        var targetPath = cordova.file.dataDirectory + $rootScope.user.image;
                        $scope.update();
                        $cordovaFileTransfer.download(SERVER.url + "/images/" + $rootScope.user.image, targetPath, {}, true)
                            .then(function (result) {

                                $rootScope.userImageUrl = targetPath;
                                $ionicLoading.hide();
                            });
                    }, function (error) {
                        console.log("image upload failed");

                    }, options);
                }, function (message) {
                    console.log('Failed because: ' + message);
                    $ionicLoading.hide();
                }, {
                    destinationType: Camera.DestinationType.FILE_URI,
                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                    allowEdit: false,
                    quality: 50,
                    targetWidth: 100,
                    targetHeight: 100,
                    encodingType: Camera.EncodingType.PNG
                });
                //
            }
        }
        var myupdate = function () {
            //
            $http.get(SERVER.url + '/questions/statics', {params: {doctor: $rootScope.user._id}}).success(function (data) {
                $rootScope.user.questionCount = data.questionCount;
                $rootScope.user.commentCount = data.commentCount;
                $rootScope.user.monthQuesetionCount = data.monthQuesetionCount;
                $rootScope.user.monthCommentCount = data.monthCommentCount;

            }).error(function (reason) {
                //
                //
            }).finally(function () {
                // Stop the ion-refresher from spinning


            });
        }
        $scope.$on('$ionicView.enter', function () {
            myupdate();
        })
    })
    .controller('MyCommentCtrl', function ($scope, $state, $rootScope, $http, $ionicLoading, $timeout, $ionicPopup, QuestionService, SERVER) {
        //
        $scope.goDetail = function ($index) {
            $state.go('app.commentDetail', {'params': $index});
        }
        //

        $scope.questions = [];
        //
        $scope.doRefresh = function () {

            $http.get(SERVER.url + '/comments/doctor', {
                params: {
                    doctor: $rootScope.user._id
                }
            }).success(function (data) {
                $scope.questions = data;
                $scope.noMoreItemsAvailable = false;
                QuestionService.setData($scope.questions);

            }).error(function (reason) {
                //
                $ionicPopup.alert({
                    title: '错误',
                    template: error
                });
                //
            }).finally(function () {
                    $scope.$broadcast('scroll.refreshComplete');
                }
            );
        }

        $scope.noMoreItemsAvailable = false;


        $scope.loadMore = function () {
            console.log("load more");
            var minCommentTime = null;
            if ($scope.questions.length != 0) {
                minCommentTime = $scope.questions[$scope.questions.length - 1].commentTime;
            }
            $http.get(SERVER.url + '/comments/doctor', {
                params: {
                    doctor: $rootScope.user._id,
                    minCommentTime: minCommentTime
                }
            }).success(function (data) {
                if (data.length == 0)
                    $scope.noMoreItemsAvailable = true;
                $scope.questions = $scope.questions.concat(data);
                QuestionService.setData($scope.questions);

            }).error(function (reason) {
                //
                $ionicPopup.alert({
                    title: '错误',
                    template: error
                });
            }).finally(function () {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        }
        $scope.$on('$ionicView.enter', function () {
            //$scope.doRefresh();
            QuestionService.setData($scope.questions);
            // do what you want to do
        })
        //
    })
    .controller('ForgetpasswordCtrl', function ($scope, $http, $ionicPopup, $rootScope, $state, $ionicLoading, SERVER) {

        //
        $scope.data = forgetData;
        $scope.next = function () {
            //
            $ionicLoading.show({content: '正在发送验证码'});
            $http.get(SERVER.url + '/vcode/forget', {params: $scope.data}).success(function (data) {
                //
                $state.go("forget2");
                //
            }).error(function (reason) {
                //
                $ionicPopup.alert({
                    title: '错误',
                    template: reason
                });
                //
            }).finally(function () {
                $ionicLoading.hide();
            });
            //
        }
        $scope.reset = function () {

            $ionicLoading.show({content: '正在重设'});
            $http.post(SERVER.url + '/vcode/forget', $scope.data).success(function (data) {
                $ionicPopup.alert({
                    title: '',
                    template: '重设成功'
                }).then(function (res) {
                    $state.go('app.browse');
                });
                $rootScope.user = data;
            }).error(function (reason) {
                //
                $ionicPopup.alert({
                    title: '错误',
                    template: reason
                });
                //
            }).finally(function () {
                $ionicLoading.hide();
            });
        }

    });
var forgetData = {vcode: '', phone: '', password: ''};
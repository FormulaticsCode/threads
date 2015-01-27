'use strict';

angular.module('starter.controllers', ['firebase', 'ngCordova'])

.controller('DashCtrl', function ($scope, $firebase, fireBaseData, $cordovaGeolocation) {
    var ref = new Firebase("https://threadstsa.firebaseio.com/userThreads/");
    var sync = $firebase(ref);
    var pos;
    var onSuccess = function (position) {
        pos = new google.maps.LatLng(position.coords.latitude,
            position.coords.longitude);
    };

    // onError Callback receives a PositionError object
    //
    function onError(error) {
        alert('code: ' + error.code + '\n' +
            'message: ' + error.message + '\n');
    }

    $scope.user = fireBaseData.ref().getAuth();

    $scope.userThreads = sync.$asArray();

    $scope.$watch('userThreads', function () {
        console.log("It changed");
    })



    navigator.geolocation.getCurrentPosition(onSuccess, onError);

    //    if (navigator.geolocation) {
    //        navigator.geolocation.getCurrentPosition(function (position) {
    //            pos = new google.maps.LatLng(position.coords.latitude,
    //                position.coords.longitude);
    //        }, function () {
    //            handleNoGeolocation(true);
    //        });
    //    } else {
    //        // Browser doesn't support Geolocation
    //        handleNoGeolocation(false);
    //        pos = 0;
    //    }
    //
    //    function handleNoGeolocation(errorFlag) {
    //        if (errorFlag) {
    //            var content = 'Error: The Geolocation service failed.';
    //        } else {
    //            var content = 'Error: Your browser doesn\'t support geolocation.';
    //        }
    //    }

    $scope.add = function (userThread) {
        if (userThread.title && userThread.desc) {

            $scope.userThreads.$add({
                creator: $scope.user.password.email,
                title: userThread.title,
                desc: userThread.desc,
                location: pos,
                date: 0,
                category: 'Soon to come'
            })
            userThread.title = "";
            userThread.desc = "";
        }
    }

    $scope.joinThread = function (thread) {
        var childRef = new Firebase("https://threadstsa.firebaseio.com/userThreads/" + thread.$id + "/members");
        childRef.push($scope.user.password.email);
    }

    $scope.checkIfMember = function (thread) {
        var childRef = new Firebase("https://threadstsa.firebaseio.com/userThreads/" + thread.$id + "/members");
        var exists = false;
        childRef.on('value', function (snapshot) {
            snapshot.forEach(function (secondSnapshot) {
                if ($scope.user.password.email === secondSnapshot.val()) {
                    exists = true;
                }
            });
        });
        if (!exists) {
            childRef = new Firebase("https://threadstsa.firebaseio.com/userThreads/" + thread.$id + "/creator");
            childRef.on('value', function (snapshot) {
                if ($scope.user.password.email === snapshot.val()) {
                    exists = true;
                }
            });
        }
        return exists;
    }
})

.controller('ChatsCtrl', function ($scope, $firebase, fireBaseData) {
    var pos;
    var onSuccess = function (position) {
        pos = new google.maps.LatLng(position.coords.latitude,
            position.coords.longitude);
        console.log(pos);
    };

    // onError Callback receives a PositionError object
    //
    function onError(error) {
        alert('code: ' + error.code + '\n' +
            'message: ' + error.message + '\n');
    }
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
    var ref = new Firebase("https://threadstsa.firebaseio.com/nearbyThreads/");
    var sync = $firebase(ref);

    $scope.user = fireBaseData.ref().getAuth();

    $scope.nearbyThreads = sync.$asArray();

    $scope.add = function (userThread) {

        if (userThread.title && userThread.desc) {
            $scope.nearbyThreads.$add({
                creator: $scope.user.password.email,
                title: userThread.title,
                desc: userThread.desc,
                location: pos,
                date: 0,
                category: 'Soon to come'
            });
            userThread.title = "";
            userThread.desc = "";
        }
    }
    $scope.findDistance = function (thread) {
        //        console.log(thread.location);
        var pos;
        var onSuccess = function (position) {
            pos = new google.maps.LatLng(position.coords.latitude,
                position.coords.longitude);
            console.log(pos);
            distance(pos, thread);
        };

        // onError Callback receives a PositionError object
        //
        function onError(error) {
            alert('code: ' + error.code + '\n' +
                'message: ' + error.message + '\n');
        }
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
        var distance = function (pos, thread) {
            var rad = function (x) {
                return x * (Math.PI / 180);
            };
            var R = 6371; // Earth’s mean radius in meter
            var dLat = rad(thread.location.D - pos.D);
            var dLong = rad(thread.location.k - pos.k);
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(rad(thread.location.D)) * Math.cos(rad(pos.D)) *
                Math.sin(dLong / 2) * Math.sin(dLong / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c;
            console.log(d);
            console.log(thread.location);
        }
    }

})

.controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
})

.controller('FriendsCtrl', function ($scope, Friends) {
    $scope.friends = Friends.all();
})

.controller('FriendDetailCtrl', function ($scope, $stateParams, Friends, $ionicPopup) {
    $scope.friend = Friends.get($stateParams.friendId);
})

.controller('AccountCtrl', function ($scope, fireBaseData) {
    $scope.showLoginForm = false;
    $scope.user = fireBaseData.ref().getAuth();
    if (!$scope.user) {
        $scope.showLoginForm = true; //checks if the user has logged in; if true, the user is not logged in and the login form will be displayed
    }

    //Login method
    $scope.login = function (em, pwd) {
        loginFunction(em, pwd);
    };

    //Logout method
    $scope.logout = function () {
        fireBaseData.ref().unauth();
        $scope.showLoginForm = true;
        $scope.hideCreateaccount = false;
    };


    $scope.createAccount = function (em, pwd) {
        fireBaseData.ref().createUser({
            email: em,
            password: pwd
        }, function (error) {
            if (error == null) {
                console.log("User created successfully.");
                loginFunction(em, pwd);
            } else {
                console.log("Error creating user: ", error);
            }
        });
    };

    var loginFunction = function (em, pwd) {
        if (em && pwd) {
            fireBaseData.ref().authWithPassword({
                email: em,
                password: pwd
            }, function (error, authData) {
                if (error === null) {
                    $scope.showError = false;
                    console.log("User ID: " + authData.uid + ", Provider: " + authData.provider);
                    $scope.user = fireBaseData.ref().getAuth();
                    $scope.showLoginForm = false;
                    $scope.login.em = null;
                    $scope.login.pwd = null;
                    $scope.$apply();
                } else {
                    console.log("Error authenticating user: ", error);
                    $scope.showError = true;
                    $scope.$apply();
                }
            });
        } else {
            $scope.showError = true;
        };
    }

})

.controller('ThreadViewCtrl', function ($scope, $firebase, $stateParams) {
    var a = $stateParams.threadId;
    console.log(a);
    var ref = new Firebase("https://threadstsa.firebaseio.com/userThreads/" + a + "/comments/");
    var sync = $firebase(ref);
    $scope.comments = sync.$asArray();
    
    $scope.submitPost = function (post) {
        $scope.comments.$add({
            user: $scope.user.password.email,
            message: post.content
        });
    };
})
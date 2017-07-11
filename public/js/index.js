(function() {
var app = angular.module('dream', ['ngRoute', 'ngFileUpload'])
angular.module('dream')
.controller('mainController', [
	'$scope', 
	'$http', 
	'Upload', 
	'$timeout', function($scope, $http, Upload, $timeout) {
	(function initialize() {
		(function getAllUsers() {
			$http.get('/api/users/get').then(function(response) {
			});
		}());
	}());
	(function userInfo() {
		const getSessionUser = function() {
			$http.get('/api/me').then(function(response) {
				$scope.user = response.data;
				$scope.user.image = $scope.user.image;
			});
		
		};
		getSessionUser();
		$scope.updateFirstName = function() {
			const data = {
				userId: $scope.user._id,
				firstName: $scope.user.firstName
			};
			$http.post('/api/profile/updateFirstName', data).then(function(){});
		};
		$scope.updateLastName = function() {
			const data = {
				userId: $scope.user._id,
				lastName: $scope.user.lastName
			};
			$http.post('/api/profile/updateLastName', data).then(function(){});
		};
		$scope.updateCity = function() {
			const data = {
				userId: $scope.user._id,
				city: $scope.user.city
			};
			$http.post('/api/profile/updateCity', data).then(function(){});
		};
		$scope.updateState = function() {
			const data = {
				userId: $scope.user._id,
				state: $scope.user.state
			};
			$http.post('/api/profile/updateState', data).then(function(){});
		};
		$scope.updateDream = function() {
			const data = {
				userId: $scope.user._id,
				dream: $scope.user.dream
			};
			$http.post('/api/profile/updateDream', data).then(function(){});
		};
		$scope.uploadFiles = function(file, errFiles) {
	        $scope.f = file;
	        $scope.errFile = errFiles && errFiles[0];
	        if (file) {
	            file.upload = Upload.upload({
	                url: '/api/profile/updatePhoto',
	                method: 'POST',
	                data: {file: file, userId: $scope.user._id}
	            });
	            file.upload.then(function (response) {
	                $timeout(function () {
	                    file.result = response.data;
	                    getSessionUser();
	                });
	            }, function (response) {
	                if (response.status > 0)
	                    $scope.errorMsg = response.status + ': ' + response.data;
	            }, function (evt) {
	                file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
	            });
	        };  
       	};   	
	}());
	(function goals() {
		const data = {}
		var getUserGoals = function(id) {
			$http.get('/api/goals/get/' + $scope.userId, data).then(function(response) {
				$scope.userGoalsArray = response.data;
			});
		};
		var getAllGoals = function() {
			$http.get('/api/goals/get', data).then(function(response) {
				$scope.allGoalsArray = response.data;
			});
		};
		$scope.postPublicGoal = function(goal) {
			$scope.goal = goal;
			$scope.allGoalsArray = [];
			$scope.userGoalsArray = [];
			const data = {
				content: $scope.goal.content,
				timeStamp: $scope.goal.timeStamp,
				rating: $scope.goal.rating,
				usersRated: $scope.goal.usersRated,
				userSubmitted: $scope.user._id,
				userId: $scope.user._id,
				public: true,
				accomplished: false
			}
			$http.post('/api/goals/post', data).then(function(response) {
				$scope.allGoalsArray.push(response);
				$scope.userGoalsArray.push(response);
				getAllGoals();
				getUserGoals();
				$scope.goal.content = "";
			});
		};
		$scope.postPrivateGoal = function(goal) {
			$scope.goal = goal;
			$scope.allGoalsArray = [];
			$scope.userGoalsArray = [];
			const data = {
				content: $scope.goal.content,
				timeStamp: $scope.goal.timeStamp,
				rating: $scope.goal.rating,
				usersRated: $scope.goal.usersRated,
				userSubmitted: $scope.user._id,
				userId: $scope.user._id,
				public: false,
				accomplished: false
			}
			$http.post('/api/goals/post', data).then(function(response) {
				$scope.allGoalsArray.push(response);
				$scope.userGoalsArray.push(response);
				getAllGoals();
				getUserGoals();
				$scope.goal.content = "";
			});
		};
		$scope.deleteGoal = function(id) {
			$http.delete('/api/goals/delete/' + id).then(function(response) {
				getUserGoals();
				getAllGoals();
			})
		};
		$scope.accomplishedGoal = function(goal) {
			$http.post('/api/goals/accomplished', {
				goalId: goal._id
			})
			getUserGoals();
			getAllGoals();
		};
		$scope.rateGoal = function(goal, scoreSelect) {
			$scope.scoreSelect = scoreSelect;
			$http.post('/api/rate', {
				goalId: goal._id, x: parseInt(scoreSelect)
			})
			getAllGoals();	
		};
		$scope.hasRated = function(scoreSelect) {
			$scope.scoreSelect = scoreSelect;
			return scoreSelect !== undefined;
		};
		(function belongsToUser() {
			$http.get('api/me').then(function(response) {
				$scope.user = response.data;
				$scope.belongsToUser = function(goal, user) {
					$scope.user = user;
					return goal.userSubmitted._id !== user._id;
				};
			});
		}());
		getUserGoals();
		getAllGoals();
	}());
	(function userCoords() {
		var userHasCoords = false;
		$http.get('/api/me').then(function(response) {
			(function doesUserHaveCoords() {
				if(response.data.lati === undefined && response.data.long === undefined) {
					$('#mapModal').modal('toggle');
				}
				else {
					userHasCoords = true;
				}
				return userHasCoords;
			}())
		})
		$scope.denyLocation = function() {
			const data = {
				userId: $scope.user._id,
				lati: 26.228771,
				long: -90.010520
			}
			$http.post('/api/profile/updateLocation', data).then(function(response){});
		}
		$scope.allowLocation = function() {
			const getLocation = function() {
				if(navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(geoSuccess);
				}
			}
			getLocation();
			function geoSuccess(position) {
				const lat = position.coords.latitude;
				const lng = position.coords.longitude;
				const data = {
					userId: $scope.user._id,
					lati: lat,
					long: lng
				}
				$http.post('/api/profile/updateLocation', data).then(function(response){});
			}
			function geoError() {
				alert("geocoder failed.");
			}
		}
	}())
}]);
angular.module('dream') 
.controller('mapController', [
	'$scope',
	'$http' , '$compile', function($scope, $http, $compile) {
 		$(document).ready(function() {
			const latlng = new google.maps.LatLng("39.7392","-104.9903");
			const map = new google.maps.Map(document.getElementById('map'), {
				zoom: 5,
				center: latlng,
				styles: [
					{
						elementType: 'geometry', 
						stylers: [{color: '#242f3e'}]
					},
					{
						elementType: 'labels.text.stroke', 
						stylers: [{color: '#242f3e'}]
					},
					{
						elementType: 'labels.text.fill', 
						stylers: [{color: '#746855'}]
					},
					{
						featureType: 'administrative.locality',
						elementType: 'labels.text.fill',
						stylers: [{color: '#d59563'}]
					},
					{
						featureType: 'poi',
						elementType: 'labels.text.fill',
						stylers: [{color: '#d59563'}]
					},
					{
						featureType: 'poi.park',
						elementType: 'geometry',
						stylers: [{color: '#263c3f'}]
					},
					{
						featureType: 'poi.park',
						elementType: 'labels.text.fill',
						stylers: [{color: '#6b9a76'}]
					},
					{
						featureType: 'road',
						elementType: 'geometry',
						stylers: [{color: '#38414e'}]
					},
					{
						featureType: 'road',
						elementType: 'geometry.stroke',
						stylers: [{color: '#212a37'}]
					},
					{
						featureType: 'road',
						elementType: 'labels.text.fill',
						stylers: [{color: '#9ca5b3'}]
					},
					{
						featureType: 'road.highway',
						elementType: 'geometry',
						stylers: [{color: '#746855'}]
					},
					{
						featureType: 'road.highway',
						elementType: 'geometry.stroke',
						stylers: [{color: '#1f2835'}]
					},
					{
						featureType: 'road.highway',
						elementType: 'labels.text.fill',
						stylers: [{color: '#f3d19c'}]
					},
					{
						featureType: 'transit',
						elementType: 'geometry',
						stylers: [{color: '#2f3948'}]
					},
					{
						featureType: 'transit.station',
						elementType: 'labels.text.fill',
						stylers: [{color: '#d59563'}]
					},
					{
						featureType: 'water',
						elementType: 'geometry',
						stylers: [{color: '#17263c'}]
					},
					{
						featureType: 'water',
						elementType: 'labels.text.fill',
						stylers: [{color: '#515c6d'}]
					},
					{
						featureType: 'water',
						elementType: 'labels.text.stroke',
						stylers: [{color: '#17263c'}]
					}
				]			
			});
			var amap;
			var markers = [];
			$scope.locationsArray = [];
			$http.get('/api/users/get').then(function(response){ 
				//console.log('------------------------------------------------>',response);
				response.data.forEach(function(obj){ 
 					 var marker = new google.maps.Marker({
					  position: new google.maps.LatLng(obj.lati, obj.long),
					  map: amap,
					  title: obj.dream,
					  image: obj.image
					});
 					var path = 'http://localhost:3000';
 					var tempImg = path + '/images/placeholder.jpg';
 					var image = path + obj.image;
					var contentString = '<img style="height: 50px; width: 50px; border-radius: 8px; display: inline-block;" src="' + image + '"/>' + '<div style="display: inline-block; padding-left: 15px;">' + '@' + obj.username + '</div>' + '<div style="padding-top: 15px; width: 300px; line-height: 20px;">' + obj.dream + '</div>';
                    var infowindow = new google.maps.InfoWindow({
					  content: contentString
					});  
					marker.addListener('click', function() {
							  infowindow.open(amap, marker);
					});								 
					markers.push(marker);
                });
				var markerCluster = new MarkerClusterer(map, markers, {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
				markerCluster.addListener('click', function() {	
				})
			})
		})
	}
])
angular.module('dream') 
.controller('jqueryController', function() {
 	$(document).ready(function() {
 		$('.tabs-btn.mid').click(function() {
			$('.tabs-btn.mid').addClass('active');
			$('.tabs-btn.left').removeClass('active');

			$('.selection.mid').addClass('show');
			$('.selection.left').removeClass('show');
		})
		$('.tabs-btn.right').click(function() {
			$('.tabs-btn.right').addClass('active');
			$('.tabs-btn.left').removeClass('active');

			$('.selection.right').addClass('show');
			$('.selection.left').removeClass('show');
		})
		$('.tabs-btn.left').click(function() {
			$('.tabs-btn.left').addClass('active');
			$('.tabs-btn.mid').removeClass('active');

			$('.selection.left').addClass('show');
			$('.selection.mid').removeClass('show')
		})
		$('.tabs-btn.right').click(function() {
			$('.tabs-btn.right').addClass('active');
			$('.tabs-btn.mid').removeClass('active');

			$('.selection.right').addClass('show');
			$('.selection.mid').removeClass('show');
		})
		$('.tabs-btn.mid').click(function() {
			$('.tabs-btn.mid').addClass('active');
			$('.tabs-btn.right').removeClass('active');

			$('.selection.mid').addClass('show');
			$('.selection.right').removeClass('show');
		})
		$('.tabs-btn.left').click(function() {
			$('.tabs-btn.left').addClass('active');
			$('.tabs-btn.right').removeClass('active');

			$('.selection.left').addClass('show');
			$('.selection.right').removeClass('show');
		})
		$('.goals-feed').mouseenter(function() {
			$(this).addClass('toggled');
		});
		$('.goals-feed').mouseleave(function() {
			$(this).removeClass('toggled');
			$('.goal-actions-con').removeClass('btn-toggled');
		});
		$('.goal-actions-con').click(function() {
			$('.goal-actions-con').addClass('btn-toggled');
		});
		$('.goal-actions-con.u').click(function() {
			$(this).removeClass('btn-toggled');
			$('.goal-actions-con.d').removeClass('btn-toggled');
		});	
	})
})

angular.module('dream')
.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
		$routeProvider
		.when('/', {
			templateUrl: '/html/map.html', 
			controller: 'mapController'
		})
		.when('/profile', {
			templateUrl: '/html/profile.html',
			controller: 'jqueryController' 
		})
		.when('/editProfile', {
			templateUrl: '/html/editProfile.html', 
		})
		.when('/map', {
			templateUrl: '/html/map.html',
			controller: 'mapController'
		})
		.when('/feed', {
			templateUrl: '/html/feed.html',
			controller: 'jqueryController' 
		})
		$locationProvider
		.html5Mode(false)
		.hashPrefix('');
	}]);
}());































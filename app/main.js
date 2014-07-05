angular.module("ttl", [])

.run(function ($rootScope) {
	$rootScope.safeApply = function(fn) {
		var phase = this.$root.$$phase;
		if(phase == '$apply' || phase == '$digest') {
			if(fn && (typeof(fn) === 'function')) {
				fn();
			}
		} else {
			this.$apply(fn);
		}
	};
})

.run(function ($rootScope) {

	Ceres = new Asteroid("meteor.mondora.com");
	Tasks = Ceres.getCollection("tasks");
	Users = Ceres.getCollection("users");
	Ceres.subscribe("tasks");

	Ceres.on("login", function () {
		$rootScope.safeApply(function () {
			$rootScope.user = Users.reactiveQuery({}).result[0];
			$rootScope.loggedIn = true;
		});
	});

	Ceres.on("logout", function () {
		$rootScope.safeApply(function () {
			delete $rootScope.user;
			$rootScope.loggedIn = false;
		});
	});

})

.controller("MainController", function ($scope) {

	var tasksRQ = Tasks.reactiveQuery({});
	tasksRQ.on("change", function () {
		$scope.safeApply(function () {
			$scope.tasks = tasksRQ.result;
		});
	});
	$scope.tasks = tasksRQ.result;

	$scope.login = function () {
		Ceres.loginWithGithub();
	};

	$scope.input = {};

	$scope.add = function () {
		var task = {
			name: $scope.user.profile.name,
			userId: $scope.user._id,
			description: $scope.input.description,
			status: "todo"
		};
		Tasks.insert(task);
		$scope.input.description = "";
	};
	$scope.delete = function (index) {
		var id = $scope.tasks[index]._id;
		Tasks.remove(id);
	};
	$scope.done = function (index) {
		var id = $scope.tasks[index]._id;
		Ceres.call("markAsDone", id);
	};

	$scope.ownsTask = function (userId) {
		return $scope.user && $scope.user._id === userId;
	};
	$scope.isDone = function (status) {
		return status === "done";
	};

});

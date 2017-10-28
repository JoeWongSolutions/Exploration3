//Joe Wong
//CS4830 Exploration 3
//10/26/2017

angular.module('studentApp', [])
    .controller('MainController', ["$scope", function($scope){
        
        $scope.title = "Pick A";
        $scope.stuModule = false;
        $scope.bookModule = false;
        
        $scope.switch = function(t){
            $scope.title = t;
            
            if(t === "Student"){
                $scope.bookModule = false;
                $scope.stuModule = true;
            } else {
                $scope.stuModule = false;
                $scope.bookModule = true;
            }
        }
    }])
	.controller('StudentController',["$scope", "$http", function($scope,$http) {
        
        $scope.population = "";
        $scope.active = "";
        $scope.students = [];
        var url = "http://joewong.me:3000";
        
        //Refresh is a helper function to refresh the view
        $scope.refresh = function () {
            $http.get(url).then(function(results){
                $scope.students = results.data ? results.data : [];
                $scope.population = results.data.length ? results.data.length : 0;
                
                var active = 0;
                angular.forEach(results.data, function(student){
                    active += (student.status == "active") ? 1:0;
                })
                
                $scope.active = active ? active : 0;
            });
        };
        $scope.refresh();
        
    
        $scope.addStudent = function() {
            console.log("\n[Insert into DB]");

            var studentInput = {
                "stuID": document.getElementById("stuId").value,
                "fname": document.getElementById("fname").value,
                "lname": document.getElementById("lname").value,
                "phone": document.getElementById("phone").value,
                "addr": document.getElementById("addr").value,
                "gpa": document.getElementById("gpa").value,
                "major": document.getElementById("major").value,
                "level": document.getElementById("level").value,
                "status": "active"
            };

            $http.post(url, studentInput)
            .then(function(event) {
                document.getElementById("stuId").value = null;
                document.getElementById("fname").value = null;
                document.getElementById("lname").value = null;
                document.getElementById("phone").value = null;
                document.getElementById("addr").value = null;
                document.getElementById("gpa").value = null;
                document.getElementById("major").value = null;
                document.getElementById("level").value = null;

                $scope.refresh();

                console.log("The following was added to db");
                console.dir(studentInput);
            })
            .then(function(err) {
                console.log("Insert Failed:");
                console.dir(err);
            });
        };
    
        $scope.remove = function (student) {
            console.log("\n[Delete from DB]");

            $http.delete(url+"?stuID="+student.stuID)
                .then(function() {
                $scope.refresh();
                console.log(student.fname + " was deleted.");
            });
        };
        
        $scope.statusTog = function (student) {
            student.status = (student.status == "active") ? "inactive" : "active";
            
            $http.put(url, student)
                .then(function (result) {
                    $scope.refresh();
                    console.log(result.data.value.fname + " " + result.data.value.lname + " was changed.");
                })
                .then(function(event) {
                    console.log("Status Change Failed:");
                    console.dir(event);
                });
        };
        
        $scope.removeAll = function(){
            console.log("\n[Delete All from Collection]");
            
            $http.delete(url+"?stuID=all")
                .then(function() {
                $scope.refresh();
                console.log("All students were deleted.");
            });
        }

}]);
//.controller('BookController',["$scope", "$indexedDB", function($scope,$indexedDB) {
//	    
//        var storeName = "books",
//        mode = "readwrite",
//        db = $indexedDB,
//        store = db.objectStore(storeName);
//        
//        $scope.population = "";
//        $scope.available = "";
//        $scope.books = [];
//        $scope.refresh = function () {
//            store.getAll().then(function(results){
//                $scope.books = results ? results : [];
//                $scope.population = results ? results.length : 0;
//                
//                var available = 0;
//                angular.forEach(results, function(book){
//                    available += (book.status == "available") ? 1:0;
//                })
//                
//                $scope.available = available ? available : 0;
//            });
//        };
//        $scope.refresh();
//        
//    
//        $scope.addBook = function() {
//            console.log("\n[Insert into DB]");
//
//            if (store) {
//                var bookInput = {
//                    "ISBN": document.getElementById("ISBN").value,
//                    "name": document.getElementById("name").value,
//                    "author": document.getElementById("author").value,
//                    "publisher": document.getElementById("publisher").value,
//                    "year": document.getElementById("year").value,
//                    "type": document.getElementById("type").value,
//                    "edition": document.getElementById("edition").value,
//                    "status": "available"
//                }
//                
//                var request = store.insert(bookInput)
//                .then(function(event) {
//                    document.getElementById("ISBN").value = null;
//                    document.getElementById("name").value = null;
//                    document.getElementById("author").value = null;
//                    document.getElementById("publisher").value = null;
//                    document.getElementById("year").value = null;
//                    document.getElementById("type").value = null;
//                    document.getElementById("edition").value = null;
//                
//                    $scope.refresh();
//
//                    console.log("The following was added to " + storeName);
//                    console.dir(bookInput);
//                });
//                request.onerror = function(event) {
//                    console.log("Insert Failed:");
//                    console.dir(event);
//                };
//            }
//            else {
//                console.log("Error: Failed to open DB.");
//            }
//        }
//    
//        $scope.remove = function (book) {
//            console.log("\n[Delete from DB]");
//
//            if (store) {
//                var request = store.delete(book.ISBN)
//                    .then(function() {
//                    $scope.refresh();
//                    console.log( book.name + " was deleted.");
//                });
//            }
//            else {
//                console.log("Error: Failed to open DB.");
//            }
//        }
//        
//        $scope.statusTog = function (book) {
//            book.status = (book.status == "available") ? "unavailable" : "available";
//            
//            var request = store.upsert(book)
//                .then(function () {
//                    $scope.refresh();
//                    console.log(book.name + " was changed.");
//                });
//            request.onerror = function(event) {
//                    console.log("Status Change Failed:");
//                    console.dir(event);
//                };
//        }
//        
//        $scope.removeAll = function(){
//            console.log("\n[Delete All from Collection]");
//            
//            if(store) {
//                var request = store.clear()
//                    .then(function () {
//                        $scope.refresh();
//                        console.log("Successfully CLeared Collection: Books");
//                    });
//                request.onerror = function(event) {
//                    console.log("Collection Clear Failed:");
//                    console.dir(event);
//                };
//            }
//        }
//
//}]);
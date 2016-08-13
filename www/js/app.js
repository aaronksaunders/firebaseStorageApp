// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova'])

  .controller('AppController', function ($scope, $cordovaImagePicker, $cordovaFile, $ionicPlatform, $q, $timeout) {

    // MOVE LOGIN TO START OF CONTROLLER
    // using anonymous auth for this example
    firebase.auth().signInAnonymously()
      .then(function (_auth) {
        alert("Logged In!")

        // after we login, we want to load up any data
        loadData();

      })
      .catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;

        alert(errorMessage)

      });

    /**
     * query firebase database for a list of images stored in the 
     * firebase storage. You cannot query firebase storage for a list
     * of objects.
     * 
     */
    function loadData() {

      firebase.database().ref('assets').on('value', function(_snapshot){

        // need to reset array each time
        var result = [];

        // loop through the snapshot to get the objects
        // to display in the list
        _snapshot.forEach(function (childSnapshot) {
          // get key & data...
          // var element = Object.assign({ id: childSnapshot.key }, childSnapshot.val());
          var element = childSnapshot.val();
          element.id = childSnapshot.key;

          // add to array object
          result.push(element);
        }); 

        // put the array on the $scope for display in the UI,
        // we will wrap it in a $timeout to ensure the screen is
        // updated   
        $timeout(function () {
          $scope.assetCollection = result;
        }, 2);    
      })
    }

    /** 
     *  from documentation:
     *  https://firebase.google.com/docs/storage/web/upload-files
     * 
     * This function returns a promise now to better process the
     * image data.
     */
    function saveToFirebase(_imageBlob, _filename) {

      return $q(function (resolve, reject) {
        // Create a root reference to the firebase storage
        var storageRef = firebase.storage().ref();

        // pass in the _filename, and save the _imageBlob
        var uploadTask = storageRef.child('images/' + _filename).put(_imageBlob);

        // Register three observers:
        // 1. 'state_changed' observer, called any time the state changes
        // 2. Error observer, called on failure
        // 3. Completion observer, called on successful completion
        uploadTask.on('state_changed', function (snapshot) {
          // Observe state change events such as progress, pause, and resume
          // See below for more detail
        }, function (error) {
          // Handle unsuccessful uploads, alert with error message
          alert(error.message)
          reject(error)
        }, function () {
          // Handle successful uploads on complete
          var downloadURL = uploadTask.snapshot.downloadURL;

          // when done, pass back information on the saved image
          resolve(uploadTask.snapshot)
        });
      });
    }


    function saveReferenceInDatabase(_snapshot) {
      var ref = firebase.database().ref('assets');

      // see information in firebase documentation on storage snapshot and metaData
      var dataToSave =  {
        'URL': _snapshot.downloadURL, // url to access file
        'name': _snapshot.metadata.name, // name of the file
        'owner': firebase.auth().currentUser.uid, 
        'email': firebase.auth().currentUser.email,
        'lastUpdated': new Date().getTime(),
      };

      return ref.push(dataToSave).catch(function(_error){
        alert("Error Saving to Assets " + _error.message);
      })
    }

    /** 
     * copied directly from documentation
     * http://ngcordova.com/docs/plugins/imagePicker/
     */
    $scope.doGetImage = function () {
      var options = {
        maximumImagesCount: 1, // only pick one image
        width: 800,
        height: 800,
        quality: 80
      };

      var fileName, path;

      $cordovaImagePicker.getPictures(options)
        .then(function (results) {
          console.log('Image URI: ' + results[0]);

          // lets read the image into an array buffer..
          // see documentation:
          // http://ngcordova.com/docs/plugins/file/
          fileName = results[0].replace(/^.*[\\\/]/, '');

          // modify the image path when on Android
          if ($ionicPlatform.is("android")) {
            path = cordova.file.cacheDirectory
          } else {
            path = cordova.file.tempDirectory
          }

          return $cordovaFile.readAsArrayBuffer(path, fileName);
        }).then(function (success) {
          // success - get blob data
          var imageBlob = new Blob([success], { type: "image/jpeg" });

          // missed some params... NOW it is a promise!!
          return saveToFirebase(imageBlob, fileName);
        }).then(function (_responseSnapshot) {
          // we have the information on the image we saved, now 
          // let's save it in the realtime database
          return saveReferenceInDatabase(_responseSnapshot)
        }).then(function (_response) {
          alert("Saved Successfully!!")
        }, function (error) {
          // error
          console.log(error)
        });
    }

  })

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      if (window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }

    });

    // INITIALIZE FIREBASE...
    // copied from the Firebase console
    var config = {
      apiKey: "AIzaSyBb0yc3UWwQPy_dvkcRLThNfQZuNx9jZ-g",
      authDomain: "fir-starterapp.firebaseapp.com",
      databaseURL: "https://fir-starterapp.firebaseio.com",
      storageBucket: "fir-starterapp.appspot.com",
    };
    firebase.initializeApp(config);
  })

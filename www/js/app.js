// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova'])

  .controller('AppController', function ($scope, $cordovaImagePicker, $cordovaFile, $ionicPlatform) {


    /** 
     *  from documentation:
     *  https://firebase.google.com/docs/storage/web/upload-files
     */
    function saveToFirebase(_imageBlob, _filename, _callback) {

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
        _callback(null)
      }, function () {
        // Handle successful uploads on complete
        var downloadURL = uploadTask.snapshot.downloadURL;

        // when done, pass back information on the saved image
        _callback(uploadTask.snapshot)
      });
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

      $cordovaImagePicker.getPictures(options)
        .then(function (results) {
          console.log('Image URI: ' + results[0]);

          // lets read the image into an array buffer..
          // see documentation:
          // http://ngcordova.com/docs/plugins/file/
          var fileName = results[0].replace(/^.*[\\\/]/, '');

          var path = "";

          // modify the image path when on Android
          if ($ionicPlatform.is("android")) {
            path = cordova.file.cacheDirectory
          } else {
            path = cordova.file.tempDirectory
          }

          $cordovaFile.readAsArrayBuffer(path, fileName)
            .then(function (success) {
              // success - get blob data
              var imageBlob = new Blob([success], { type: "image/jpeg" });

              // missed some params... probably should be a promise.. :-(
              saveToFirebase(imageBlob, fileName, function (_response) {
                if (_response) {
                  alert(_response.downloadURL)
                }
              })
            }, function (error) {
              // error
              console.log(error)
            });


        }, function (error) {
          // error getting photos
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

      // INITIALIZE FIREBASE...
      // copied from the Firebase console
      // Initialize Firebase
      var config = {

      };
      firebase.initializeApp(config);

      // using anonymous auth for this example
      firebase.auth().signInAnonymously()
        .then(function (_auth) {
          alert("Logged In!")
        })
        .catch(function (error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;

          alert(errorMessage)

        });
    });
  })

# firebaseStorageApp
Source Code From YouTube Video on IonicFramework and Firebase Storage

**Ionic Framework 1 - Firebase Storage File Upload Video**
- [https://www.youtube.com/watch?v=Z1F-0PnLgb8](https://www.youtube.com/watch?v=Z1F-0PnLgb8)
 
  [![Alt text](https://img.youtube.com/vi/Z1F-0PnLgb8/0.jpg)](https://www.youtube.com/watch?v=Z1F-0PnLgb8)

Demonstrating file upload to Firebase with the Image Picker Plugin, Cordova File Plugin and ngCordova

- Installation information for ngCordova - http://ngcordova.com/docs/install/
- Cordova imagePicker Plugin - http://ngcordova.com/docs/plugins/ima...
- Cordova File Manager Plugin - http://ngcordova.com/docs/plugins/file/
- Firebase Documentation - https://console.firebase.google.com


## Android Specific Changes
---
The plugin does not properly specify the permissions for android so the picker might not get the images, see this PR.
I just installed the alternate plugin from this location - https://github.com/poocart/cordova-imagePicker

Instead of getting the path from the URI, in the code, I assume the following...

```JavaScript
  // modify the image path when on Android
  if ($ionicPlatform.is("android")) {
    path = cordova.file.cacheDirectory
  } else {
    path = cordova.file.tempDirectory
  }
```
feel free to parse the path to get the directory
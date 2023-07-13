import {Platform, PermissionsAndroid, Alert, Linking} from 'react-native';
export const requestMultiPermission = async () => {
  try {
    let granted;
    let sdkVersion = Platform.constants['Release'];
    if (Platform.OS != 'ios') {
      if (sdkVersion >= 13) {
        granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        ]);
      } else {
        granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);
      }
    } else {
      return true;
    }
    console.log(granted);
    if (
      sdkVersion >= 13 &&
      granted['android.permission.READ_MEDIA_IMAGES'] &&
      granted['android.permission.READ_MEDIA_VIDEO'] === 'granted'
    ) {
      console.log('You can use the external storage');
      return true;
    } else if (
      sdkVersion < 13 &&
      granted['android.permission.READ_EXTERNAL_STORAGE'] &&
      granted['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted'
    ) {
      console.log('You can use the external storage');
      return true;
    } else {
      console.log('You cannot use the external storage');

      Alert.alert(
        'Permission Required',
        'Please enable the permission in app settings.',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Open Settings', onPress: openAppSettings},
        ],
      );
      return false;
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
};

// Function to open app settings
const openAppSettings = () => {
  Linking.openSettings();
};

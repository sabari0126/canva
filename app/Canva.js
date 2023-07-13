import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  BackHandler,
} from 'react-native';
import {requestMultiPermission} from './AppUtility';
import RNSketchCanvas from '@kichiyaki/react-native-sketch-canvas';
import Share from 'react-native-share';

export default class Canva extends Component {
  constructor() {
    super();
    this.state = {
      permissionGranted: false,
      path: '',
    };
    this.sketchRef = React.createRef();
    this.shareDoc = false;
  }

  componentDidMount() {
    requestMultiPermission()
      .then(response => {
        if (response) {
          this.setState({permissionGranted: true});
        }
      })
      .catch(error => {
        this.setState({permissionGranted: false});
        console.log('err', error);
      });
  }

  closeApp = () => {
    Alert.alert(
      'Exit App',
      'Are you sure you want to exit?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Exit', onPress: () => BackHandler.exitApp()},
      ],
      {cancelable: false},
    );

    return true;
  };

  sharDocument = () => {
    if (this.state.permissionGranted) {
      this.checkDownloadStatus();
    } else {
      requestMultiPermission()
        .then(response => {
          if (response) {
            this.setState({permissionGranted: true}, () => {
              this.checkDownloadStatus();
            });
          }
        })
        .catch(error => {
          this.setState({permissionGranted: false});
          console.log('err', error);
        });
    }
  };

  checkDownloadStatus = () => {
    if (this.state.path !== '') {
      this.shareDocumentFromStorage();
    } else {
      this.downloadDoc();
    }
  };

  downloadDoc = () => {
    if (this.sketchRef.current) {
      this.shareDoc = true;
      this.sketchRef.current.save();
    }
  };

  shareDocumentFromStorage = async () => {
    const shareOptions = {
      title: 'Canva',
      subject: 'Drawing',
      message: 'Picture from canva app',
      social: null,
      url: 'file://' + this.state.path,
    };
    console.log('options ', shareOptions);
    Share.open(shareOptions).catch(error => {
      //Alert.alert("Alert", "App not installed. Please check it");
    });
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={{flex: 1, flexDirection: 'row'}}>
          <RNSketchCanvas
            ref={this.sketchRef}
            containerStyle={{backgroundColor: 'transparent', flex: 1}}
            canvasStyle={{backgroundColor: 'transparent', flex: 1}}
            defaultStrokeIndex={0}
            defaultStrokeWidth={5}
            onClosePressed={() => {
              this.closeApp();
            }}
            closeComponent={
              <View style={styles.functionButton}>
                <Text style={{color: 'white'}}>Close</Text>
              </View>
            }
            undoComponent={
              <View style={styles.functionButton}>
                <Text style={{color: 'white'}}>Undo</Text>
              </View>
            }
            clearComponent={
              <View style={styles.functionButton}>
                <Text style={{color: 'white'}}>Clear</Text>
              </View>
            }
            eraseComponent={
              <View style={styles.functionButton}>
                <Text style={{color: 'white'}}>Eraser</Text>
              </View>
            }
            strokeComponent={color => {
              return (
                <View
                  style={[{backgroundColor: color}, styles.strokeColorButton]}
                />
              );
            }}
            strokeSelectedComponent={(color, index, changed) => {
              return (
                <View
                  style={[
                    {backgroundColor: color, borderWidth: 2},
                    styles.strokeColorButton,
                  ]}
                />
              );
            }}
            strokeWidthComponent={w => {
              return (
                <View style={styles.strokeWidthButton}>
                  <View
                    style={{
                      backgroundColor: 'white',
                      marginHorizontal: 2.5,
                      width: Math.sqrt(w / 3) * 10,
                      height: Math.sqrt(w / 3) * 10,
                      borderRadius: (Math.sqrt(w / 3) * 10) / 2,
                    }}
                  />
                </View>
              );
            }}
            saveComponent={
              <View style={styles.functionButton}>
                <Text style={{color: 'white'}}>Save</Text>
              </View>
            }
            savePreference={() => {
              return {
                folder: 'RNSketchCanvas',
                filename: String(Math.ceil(Math.random() * 100000000)),
                transparent: false,
                imageType: 'png',
              };
            }}
            onSketchSaved={(success, path) => {
              if (success) {
                this.setState({path}, () => {
                  if (this.shareDoc) {
                    this.sharDocument();
                    this.shareDoc = false;
                  } else {
                    Alert.alert(
                      'Document saved successfully',
                      `Location - ${path}`,
                    );
                  }
                });
              }
            }}
            permissionDialogMessage="Please granted storage persmission"
            permissionDialogTitle="Permission"
          />
        </View>
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={() => {
            this.sharDocument();
          }}>
          <Text style={styles.shareBtnText}>Share</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  strokeColorButton: {
    marginHorizontal: 2.5,
    marginVertical: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  strokeWidthButton: {
    marginHorizontal: 2.5,
    marginVertical: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#39579A',
  },
  functionButton: {
    marginHorizontal: 2.5,
    marginVertical: 8,
    height: 30,
    width: 60,
    backgroundColor: '#39579A',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  shareBtn: {
    width: '90%',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'blue',
    marginTop: 10,
  },
  shareBtnText: {
    fontSize: 10,
    color: 'white',
  },
});

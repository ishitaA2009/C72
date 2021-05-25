import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, TextInput, Image, KeyboardAvoidingView, ToastAndroid } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as firebase from 'firebase';
import db from "../config.js"
export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedBookId: '',
        buttonState: 'normal',
        scannedStudentId: '',
        transactionMessage: '',
      }
    }

  handleTransaction=async()=>{
    var transactionMsg
    db.collection("books")
    .doc(this.state.scannedBookId)
    .get()
    .then((doc)=>{
      var book=doc.data()
      if(book.bookAvailability){
        this.initiateBookIssue();
        transactionMsg="Books Issued"
        ToastAndroid.show(transactionMsg, ToastAndroid.SHORT)
      }
      else{
        this.initiateBookReturn();
        transactionMsg="Book Returned"
        ToastAndroid.show(transactionMsg, ToastAndroid.SHORT)
      }
    })
    this.setState({
      transactionMessage: transactionMsg
    })
  }
    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }
    initiateBookIssue=async()=>{
      //add a transaction
      db.collection("transaction")
      .add({
          'studentId': this.state.scannedStudentId,
          'bookId':this.state.scannedBookId,
        'transactionType': 'Issue',
        'date': firebase.firestore.Timestamp.now().toDate()
      })    
      
      //change book status
      db.collection("books")
      .doc(this.state.scannedBookId)
      .update({
        'bookAvailability':false
      })
      //change the number of books issued by student
      db.collection("students")
      .doc(this.state.scannedStudentId)
      .update({
        'booksIssued': firebase.firestore.FieldValue.increment(1)
      })

      

    }

    initiateBookReturn=async()=>{
      //add a transaction
      db.collection("transaction")
      .add({
          'studentId': this.state.scannedStudentId,
          'bookId':this.state.scannedBookId,
          'transactionType': 'Return',
          'date': firebase.firestore.Timestamp.now().toDate()
      })    
      
      //change book status
      db.collection("books")
      .doc(this.state.scannedBookId)
      .update({
        'bookAvailability':true
      })
      //change the number of books issued by student
      db.collection("students")
      .doc(this.state.scannedStudentId)
      .update({
        'booksIssued': firebase.firestore.FieldValue.increment(-1)
      })

    }

    handleBarCodeScanned = async({type, data})=>{
      const {buttonState} = this.state
      if(buttonState === 'bookId'){
        this.setState({
        scanned: true,
        scannedBookId: data,
        buttonState: 'normal'
        });
      }
      else if(buttonState === 'studentId'){
        this.setState({
          scanned: true,
          scannedStudentId: data,
          buttonState: 'normal',
        })
      }
      
    }

    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
            <View>
              <Image
                source = {require('../assets/mainBook.jpg')}
                style = {{width:200, height:200}}
              />
              <Text>Wily App</Text>
            </View>
            <View style={styles.inputView}>
              <TextInput
                placeholder = "Book ID"
                onChangeText={text=>{this.setState({scannedBookId:text})}}
                value = {this.state.scannedBookId}
              />
              <TouchableOpacity 
                style={styles.scanButton} 
                onPress = {()=>{
                  this.getCameraPermissions('bookId')
                }}
              >
                <Text> Scan Book ID</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputView}>
              <TextInput
                placeholder = "Student ID"
                onChangeText={text=>{this.setState({scannedStudentId: text})}}
                value = {this.state.scannedStudentId}
              />
              <TouchableOpacity
               style={styles.scanButton}
               onPress= {()=>{
                 this.getCameraPermissions('studentId')
               }}
              >
                <Text> Scan Student ID</Text>
              </TouchableOpacity>
            </View>
            <View>
              <TouchableOpacity
               style = {styles.submitButton}
               onPress={async()=>{
                 this.handleTransaction();
                 this.setState({
                  scannedBookId:'',
                  scannedStudentId:''
                 })
               }}>
                <Text> Submit </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 20,
    },
    inputView:{
      flexDirection:'row',
      margin:20
    },
    submitButton:{
      backgroundColor: 'yellow',
      padding: 10,
      margin: 10
    }
  });
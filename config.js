import firebase from 'firebase';
require('@firebase/firestore')
var firebaseConfig = {
    apiKey: "AIzaSyASWI5I1ZzBO31WzNmSe2P36TroCO4ABIM",
    authDomain: "project-36-feed-dog-d3683.firebaseapp.com",
    databaseURL: "https://project-36-feed-dog-d3683-default-rtdb.firebaseio.com",
    projectId: "project-36-feed-dog-d3683",
    storageBucket: "project-36-feed-dog-d3683.appspot.com",
    messagingSenderId: "1020993105722",
    appId: "1:1020993105722:web:0763655ea56d2eb6afea03"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

export default firebase.firestore();
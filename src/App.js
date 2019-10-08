import React, { Component } from 'react';
import './App.css';
import firebase, { auth, provider } from './firebase.js';

class App extends Component {

  constructor() {
    super();
    this.state = {
      currentItem: '',
      username: '',
      items: [],
      user: null // <-- add this line
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this); 
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    //binds functions to constructor 
  }

  // triggered by onChange to updated the state and store what the users input
  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  login() {
    auth.signInWithPopup(provider) 
      .then((result) => {
        const user = result.user;
        this.setState({
          user
        });
      });
  }

  logout() {
    auth.signOut()
      .then(() => {
        this.setState({
          user: null
        });
      });
  }

  // triggered by onSubmit and pushes updated state to the database
  handleSubmit(e) {
    e.preventDefault();
    const itemsRef = firebase.database().ref('items');
    const item = {
      title: this.state.currentItem,
      user: this.state.username// remembers what the users input
    }
    itemsRef.push(item);
    // resets the states of current item and username for the next user's input
    this.setState({
      currentItem: '',
      username: ''
    });
  }

  componentDidMount() {
    const itemsRef = firebase.database().ref('items');
    itemsRef.on('value', (snapshot) => {
      let items = snapshot.val();
      console.log("items include:",items)
      let newState = [];
      for (let item in items) {
        // console.log('item is ', item)
        // updates new state with every iteration
        newState.push({
          id: item,
          title: items[item].title,
          user: items[item].user  
        });
        console.log("new state: ", newState)
      }
      this.setState({
        items: newState
      });
      });

      // keeps user signed in by checking user's state
      auth.onAuthStateChanged((user) => {
        if (user) {
          this.setState({ user });
        } 
      });
  }

  // removes item from database triggered by the onClick button
  removeItem(itemId) {
    const itemRef = firebase.database().ref(`/items/${itemId}`);
    itemRef.remove();
  }

  render() {
    return (
      <div className='app'>
        <header>
            <div className='wrapper'>
              <h1>Fun Food Friends</h1>
              
            </div>
        </header>
        <div className='container'>
          <section className='add-item'>
              <form onSubmit={this.handleSubmit}>
                <input type="text" name="username" placeholder="What's your name?" onChange={this.handleChange} value={this.state.username} />
                <input type="text" name="currentItem" placeholder="What are you bringing?" onChange={this.handleChange} value={this.state.currentItem} />
                <button>Add Item</button>
              </form>
          </section>
          <section className='display-item'>
            <div className='wrapper'>
              <h1>Fun Food Friends</h1>
              {this.state.user ?
                <button onClick={this.logout}>Log Out</button>                
                :
                <button onClick={this.login}>Log In</button>              
              }
              <ul>
                {/* this displays the items and names from the database */}
                 {this.state.items.map((item) => {
                    return (
                      <li key={item.id}>
                        <h3>{item.title}</h3>
                        <p>brought by: {item.user}</p>
                        <button onClick={() => this.removeItem(item.id)}>Remove Item</button>
                      </li>
                    )
                  })}
              </ul>
            </div>
          </section>
        </div>
      </div>
    );
  }
}
export default App;

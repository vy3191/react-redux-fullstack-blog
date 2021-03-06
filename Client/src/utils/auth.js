import history from './history';
import auth0 from 'auth0-js';


export default class Auth  {
    auth0 = new auth0.WebAuth({
      domain: 'webapp1.auth0.com',
      clientID: 'PrWygZJKHrk2hev5CKGWevMBs2Jb0v4J',
      redirectUri:   'http://localhost:3000/callback',
      responseType: 'token id_token',
      scope: 'openid profile email',
  });

  userProfile = {}

  constructor() {
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
    this.getAccessToken = this.getAccessToken.bind(this);
    this.getProfile = this.getProfile.bind(this);
  }


  login() {
    this.auth0.authorize();
   }

  handleAuthentication() {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
        this.getProfile();
        setTimeout( function() { history.replace('/authcheck') }, 2000);
      } else if (err) {
        history.replace('/');
        console.log(err);
        alert(`Error: ${err.error}. Check the console for further details.`);
      }
    });
   }

  setSession(authResult) {
    // Set the time that the access token will expire at
    let expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
    // navigate to the home route

  }


  logout() {
    // Clear access token and ID token from local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    this.userProfile = null;
    console.log("Logged Out")
    // navigate to the home route
    history.replace('/authcheck')
  }

  getAccessToken() {
    if (localStorage.getItem('access_token')) {
      const accessToken = localStorage.getItem('access_token')
      return accessToken
    }
    else {
      console.log("No accessToken")
      return null
    }
   }

  getProfile() {
    let accessToken = this.getAccessToken();
    if(accessToken) {
      this.auth0.client.userInfo(accessToken, (err, profile) => {
        if (profile) {
          this.userProfile = { profile };
          console.log(this.userProfile)
         }
       });
     }
   }

  isAuthenticated() {
    // Check whether the current time is past the
    // access token's expiry time
    let expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }

}

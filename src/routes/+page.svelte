<script>
  import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
  import { firebaseConfig } from "$lib/firebaseConfig";
  import { initializeApp, getApps, getApp } from "firebase/app";

  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const auth = getAuth(app);

  let email = '';
  let password = '';
  let message = ''; // Message content
  let messageType = ''; // Message type: success or error

  // Function to handle login logic using Firebase Authentication
  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', userCredential.user);

      // Display success toast
      showMessage('Login successful!', 'success');

      // Redirect to home page after a short delay
      setTimeout(() => {
        window.location.href = '/Add-Recipe';
      }, 2000);
    } catch (error) {
      // @ts-ignore
      console.error('Error logging in:', error.message);
      // Display error toast
      showMessage('Invalid email or password!', 'error');
    }
  };

  // Function to redirect to signup page
  const redirectToSignup = () => {
    window.location.href = '/Signup';
  };

  // Function to show toast message
  // @ts-ignore
  const showMessage = (msg, type) => {
    message = msg;
    messageType = type;
    setTimeout(() => {
      message = '';
      messageType = '';
    }, 3000); // Toast disappears after 3 seconds
  };
</script>

  

<!-- src/app.html -->
<head>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
</head>

<style>
:global(html, body) {
  margin: 0;
  font-family: 'Inter', sans-serif;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(0deg, #31578d, #AB6C82);
  background-size: cover;
  background-position: center center;
}
.login-container {
  text-align: center;
  color: white;
  width: 100%;
  padding: 0 20px;
}

.login-box {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  padding: 20px 30px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 350px;
  margin: 0 auto;
}

.login-box h2 {
  margin-bottom: 20px;
  color: #404a4c;
  font-weight: bold;
  font-size: 18px;
  padding-top: 20px;
}

.input-group {
  margin-bottom: 15px;
  text-align: left;
}

.input-group input {
  width: 100%;
  padding: 10px 10px 10px 40px;
  font-size: 14px;
  border: none;
  border-radius: 5px;
  background: #fff;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  color: #000;
}

.input-group input[type="text"] {
  background: #fff url('/assets/user.png') no-repeat 10px center;
  background-size: 20px 20px;
}

.input-group input[type="password"] {
  background: #fff url('/assets/padlock.png') no-repeat 10px center;
  background-size: 20px 20px;
}

.login-btn {
  width: 100%;
  padding: 10px;
  background: #476C7A;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  font-weight: bold;
  margin-bottom: 15px;
}

.login-btn:hover {
  background: #336a92;
}

.signup-link {
  font-size: 14px;
  color: #404a4c;
}

.signup-link a {
  color: #476C7A;
  text-decoration: none;
  font-weight: bold;
  cursor: pointer;
}

.signup-link a:hover {
  text-decoration: underline;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .login-container {
    width: 90%;
  }

  .login-box {
    padding: 15px 20px;
  }

  .input-group input {
    padding: 12px 10px 12px 35px;
    font-size: 16px;
  }

  .login-btn {
    padding: 12px;
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .login-container {
    width: 100%;
    padding: 0 15px;
  }

  .login-box {
    width: 100%;
    max-width: none;
  }

  .input-group input {
    font-size: 14px;
  }

  .login-btn {
    font-size: 16px;
    padding: 15px;
  }
}
/* Toast Notification */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  padding: 15px 20px;
  border-radius: 5px;
  font-size: 16px;
  color: #fff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  animation: fadein 0.5s, fadeout 0.5s 2.5s;
}

.toast.success {
  background-color: #4caf50; /* Green for success */
}

.toast.error {
  background-color: #f44336; /* Red for error */
}

@keyframes fadein {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeout {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}

</style>
<div class="login-container">
  <!-- Toast Notification -->
  {#if message}
    <div class="toast {messageType}">
      {message}
    </div>
  {/if}

  <div class="login-box">
    <h2>LOGIN</h2>
    <form on:submit|preventDefault={handleLogin}>
      <div class="input-group">
        <input
          type="text"
          id="username"
          bind:value={email}
          placeholder="Username"
          required
        />
      </div>
      <div class="input-group">
        <input
          type="password"
          id="password"
          bind:value={password}
          placeholder="Password"
          required
        />
      </div>
      <button type="submit" class="login-btn">LOGIN</button>
    </form>
    <div class="signup-link">
      <p>Not yet signed up? <a href="/Signup" on:click|preventDefault={redirectToSignup}>Sign up</a></p>
    </div>
  </div>
</div>

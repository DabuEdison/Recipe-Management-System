<script>
  import { getFirestore, collection, addDoc } from 'firebase/firestore';
  import { firebaseConfig } from "$lib/firebaseConfig";
  import { initializeApp, getApps, getApp } from "firebase/app";
  import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
  
  // Initialize Firebase app
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const db = getFirestore(app);
  const auth = getAuth(app);
  
  let username = '';
  let email = '';
  let password = '';
  let confirmPassword = '';
  
  const handleSignup = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // Show confirmation dialog before proceeding
    const confirmation = confirm("Are you sure you want to sign up with this information?");
    
    if (!confirmation) {
      console.log("User canceled the signup process.");
      return; // Exit if the user cancels
    }

    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update user profile with username
      await updateProfile(userCredential.user, { displayName: username });

      // Save user details in Firestore
      const userDocRef = await addDoc(collection(db, "users"), {
        uid: userCredential.user.uid,
        username: username,
        email: email,
        createdAt: new Date()
      });

      console.log('User created with ID:', userDocRef.id);
      alert('Signup successful!');
      
      // Redirect to login or another page
      window.location.href = '/';
    } catch (error) {
      console.error("Error signing up:", error);
      // @ts-ignore
      alert(error.message);
    }
  };

  const redirectToLogin = () => {
    window.location.href = '/';
  };
</script>

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
    background: linear-gradient(0deg, #475C7A, #AB6C82);
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
  
  .input-group input[type="text"],
  .input-group input[type="email"] {
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
    margin-top: 10px;
  }
  
  .login-btn:hover {
    background: #336a92;
  }
  
  .signup-link {
    font-size: 14px;
    color: #404a4c;
    margin-top: 15px;
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
  </style>
  
  <div class="login-container">
    <div class="login-box">
      <h2>SIGN UP</h2>
      <form on:submit|preventDefault={handleSignup}>
        <div class="input-group">
          <input
            type="text"
            id="username"
            bind:value={username}
            placeholder="Username"
            required
          />
        </div>
        <div class="input-group">
          <input
            type="email"
            id="email"
            bind:value={email}
            placeholder="Email"
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
        <div class="input-group">
          <input
            type="password"
            id="confirmPassword"
            bind:value={confirmPassword}
            placeholder="Confirm Password"
            required
          />
        </div>
        <button type="submit" class="login-btn">SIGN UP</button>
      </form>
      <div class="signup-link">
        <p>Already signed up? <a href="/" on:click|preventDefault={redirectToLogin}>Login</a></p>
      </div>
    </div>
  </div>
  

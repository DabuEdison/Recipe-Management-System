<script lang="ts">
  import { getFirestore, collection, addDoc } from 'firebase/firestore';
  import { firebaseConfig } from "$lib/firebaseConfig";
  import { initializeApp, getApps, getApp } from "firebase/app";
  import { getAuth, signOut } from 'firebase/auth';

  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const db = getFirestore(app);
  const auth = getAuth();

  let recipeName = '';
  let ingredients = '';
  let category = '';
  let isSidebarVisible = true;
  let message = '';
  let messageType = '';

  const submitForm = async () => {
    if (!recipeName || !ingredients || !category) {
      showMessage('All fields are required!', 'error');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      showMessage('You must be logged in to add a recipe.', 'error');
      return;
    }

    try {
      await addDoc(collection(db, 'recipes'), {
        category,
        recipeName,
        ingredients,
        userId: user.uid,
        timestamp: new Date(),
      });
      showMessage('Recipe added successfully!', 'success');
      resetForm();
    } catch (error) {
      console.error('Error adding document:', error);
      showMessage('Failed to add recipe. Please try again.', 'error');
    }
  };

  const resetForm = () => {
    recipeName = '';
    ingredients = '';
    category = '';
  };

  const showMessage = (msg: string, type: string) => {
    message = msg;
    messageType = type;
    setTimeout(() => {
      message = '';
      messageType = '';
    }, 3000);
  };

  const toggleSidebar = () => {
    isSidebarVisible = !isSidebarVisible;
  };

  const logout = async () => {
  const confirmation = confirm('Are you sure you want to log out?');
  if (!confirmation) {
    return; // Exit if the user cancels
  }
  try {
    await signOut(auth);
    showMessage('Logged out successfully!', 'success'); // Show success toast
    setTimeout(() => {
      window.location.href = '/'; // Redirect after the toast disappears
    }, 3000); // Delay to let the toast display
  } catch (error) {
    console.error('Error logging out:', error);
    showMessage('Failed to log out. Please try again.', 'error'); // Show error toast
  }
  };
</script>


  
  <style>
    /* Main Layout */
    .app {
      display: flex;
      height: 100vh;
      font-family: 'Arial', sans-serif;
      transition: margin-left 0.3s ease-in-out;
    }
    
    /* Sidebar Styling */
    .sidebar {
      width: 200px;
      background: rgba(255, 255, 255, 0.28); /* Semi-transparent white */
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); /* Enhanced shadow */
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      border-top-right-radius: 20px;   
      border-bottom-right-radius: 20px;
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      transform: translateX(0); /* Sidebar visible */
      transition: transform 0.3s ease-in-out;
    }
  
    .sidebar.hidden {
      transform: translateX(-100%); /* Sidebar hidden */
    }
  
    .logo {
      width: 150px;
      margin-bottom: 20px;
      border-radius: 100%;
    }
  
    nav ul {
      list-style: none;
      padding: 0;
      width: 100%;
    }
  
    nav ul li {
      margin: 15px 0;
      text-align: center;
    }
  
    nav ul li a {
      text-decoration: none;
      font-size: 18px;
      color: #000;
      padding: 10px 15px;
      display: flex;
      align-items: center; /* Align icon and text horizontally */
      justify-content: flex-start;
      border-radius: 5px;
      transition: background 0.3s;
      background-color: transparent; /* Normal state background */
      white-space: nowrap; /* Prevent text from wrapping to the next line */
      font-weight: 500;
    }
  
    /* Active Link Styling */
    nav ul li a.active {
      background-color: rgb(44, 61, 60);
      font-weight: 500;
      width: 200px;
      border-top-right-radius: 10px;   
      border-bottom-right-radius: 10px; 
    }
  
    .logout {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px; 
      margin-top: auto;
      color: #000;
      font-weight: bold;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 20px;
    }
  
    .logout-icon {
      width: 20px; /* Adjust the icon size */
      height: 20px;
    }
  
    /* Hamburger Icon for Toggling */
    .hamburger {
      display: none;
      position: absolute;
      top: 20px;
      left: 20px;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      width: 30px;
      height: 25px;
      cursor: pointer;
    }
  
    .hamburger div {
      width: 30px;
      height: 5px;
      background-color: #000;
      border-radius: 10px;
    }
  
    /* Form Section Styling */
    .content {
      flex: 1;
        background-image: url('/assets/bg1.jpg'); /* Path to your PNG file */
       background-size: cover; /* Ensures the image covers the entire background */
       background-repeat: no-repeat; /* Prevents tiling of the image */
       background-position: center; /* Centers the image */
      display: flex;
      align-items: center;
      justify-content: center;
      transition: margin-left 0.3s ease-in-out;
    }
  
    .form-container {
  width: 500px;
  padding: 30px;
  background: rgba(255, 255, 255, 0.26); /* Semi-transparent white */
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); /* Enhanced shadow */
  backdrop-filter: blur(10px); /* Adds a glassy blur effect */
  border: 1px solid rgba(255, 255, 255, 0.4); /* Optional border for emphasis */
}

  
    .form-group {
      margin-bottom: 20px;
    }
  
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
  
    select,
    input,
    textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 5px;
      font-size: 16px;
    }
  
    form button {
      display: block;
      width: 100%;
      padding: 10px;
      background: #293635;
      color: #fff;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.3s;
    }
  
    form button:hover {
      background: rgb(44, 61, 60);
    }
  
    .nav-icon {
      width: 18px; /* Smaller icon size */
      height: 18px;
      margin-right: 10px; /* Adjust space between icon and text */
      flex-shrink: 0; /* Prevent the icon from shrinking */
    }
    nav ul li a {
  text-decoration: none;
  font-size: 18px;
  color: #000;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  border-radius: 5px;
  transition: background 0.3s, color 0.3s; /* Smooth transition for background and color */
  background-color: transparent;
  white-space: nowrap;
  font-weight: 500;
}

nav ul li a:hover {
  background-color: rgb(44, 61, 60); /* Change background color on hover */
  color: #fff; /* Change text color on hover */
}

    /* Media Query for Small Screens */
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%); /* Sidebar hidden initially */
        background-color: rgba(71, 108, 122, 0.8);
      }
  
      .sidebar.hidden {
        transform: translateX(0); /* Sidebar shown on toggle */
      }
  
      .app {
        flex-direction: column;
      }
  
      .content {
        margin-left: 0;
      }
  
      .hamburger {
        display: flex;
      }
    .hamburger div {
    width: 30px;
    height: 5px;
    background-color: white; /* Changed to white */
    border-radius: 10px;
    }

  
      .form-container {
        width: 100%;
        padding: 20px;
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


<div class="app">
  <!-- Feedback Toast -->
  {#if message}
    <div class="toast {messageType}">
      {message}
    </div>
  {/if}

  <!-- Sidebar -->
  <div class="sidebar {isSidebarVisible ? '' : 'hidden'}">
    <img class="logo" src="/assets/EDG.png" alt="Logo" />
    <nav>
      <ul>
        <li>
          <a href="#" class="active">
            <img src="/assets/add.png" alt="Add Icon" class="nav-icon" />
            Add Recipe
          </a>
        </li>
        <li>
          <a href="View-Recipes">
            <img src="/assets/view.png" alt="View Icon" class="nav-icon" />
            View Recipes
          </a>
        </li>
      </ul>
    </nav>
    <!-- Logout button -->
    <button class="logout" on:click={logout}>
      <img src="/assets/logout.png" alt="Logout Icon" class="logout-icon" />
      Logout
    </button>
  </div>

  <!-- Hamburger Icon -->
  <div class="hamburger" on:click={toggleSidebar}>
    <div></div>
    <div></div>
    <div></div>
  </div>

  <!-- Form Content -->
  <div class="content">
    <div class="form-container">
      <form on:submit|preventDefault={submitForm}>
        <div class="form-group">
          <label for="category">Category</label>
          <select id="category" bind:value={category}>
            <option value="">Select a Category</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </div>

        <div class="form-group">
          <label for="recipeName">Recipe Name:</label>
          <input id="recipeName" type="text" bind:value={recipeName} placeholder="Enter recipe name" />
        </div>

        <div class="form-group">
          <label for="ingredients">Ingredients:</label>
          <textarea id="ingredients" rows="5" bind:value={ingredients} placeholder="Enter ingredients"></textarea>
        </div>
        
        <button type="submit">Submit</button>
      </form>
    </div>
  </div>
</div>

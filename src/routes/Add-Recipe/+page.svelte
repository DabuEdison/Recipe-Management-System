<script lang="ts">
    import { getFirestore, collection, addDoc } from 'firebase/firestore';
    import { firebaseConfig } from "$lib/firebaseConfig";
    import { initializeApp, getApps, getApp } from "firebase/app";
    import { getAuth, signOut } from 'firebase/auth'; // Importing Firebase Authentication

    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app);
    const auth = getAuth(); // Getting Firebase auth instance

    let recipeName = '';
    let ingredients = '';
    let category = '';
    let isSidebarVisible = true;
    let message = ''; // For displaying feedback to the user
    let messageType = ''; // "success" or "error"

    // Submit form and add recipe to Firestore
    const submitForm = async () => {
      if (!recipeName || !ingredients || !category) {
        showMessage('All fields are required!', 'error');
        return;
      }

      const user = auth.currentUser; // Get the current logged-in user
      if (!user) {
        showMessage('You must be logged in to add a recipe.', 'error');
        return;
      }

      try {
        const docRef = await addDoc(collection(db, 'recipes'), {
          category,
          recipeName,
          ingredients,
          userId: user.uid, // Add the user ID to the recipe
          timestamp: new Date(),
        });
        showMessage('Recipe added successfully!', 'success');
        resetForm();
      } catch (error) {
        console.error('Error adding document:', error);
        showMessage('Failed to add recipe. Please try again.', 'error');
      }
    };

    // Reset form fields
    const resetForm = () => {
      recipeName = '';
      ingredients = '';
      category = '';
    };

    // Show feedback message
    const showMessage = (msg: string, type: string) => {
      message = msg;
      messageType = type;
      setTimeout(() => {
        message = '';
        messageType = '';
      }, 3000); // Clear the message after 3 seconds
    };

    // Toggle sidebar visibility
    const toggleSidebar = () => {
      isSidebarVisible = !isSidebarVisible;
    };

      // Logout functionality
  const logout = async () => {
    try {
      await signOut(auth); // Sign out the current user
      console.log('User logged out successfully');
      
      // Redirect to the login page after successful logout
      window.location.href = '/'; // Change this to your login page path
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
</script>

  
  <style>
    /* Main Layout */
    .app {
      display: flex;
      height: 100vh;
      font-family: 'Arial', sans-serif;
      background: linear-gradient(to bottom, #FCBB6D, #D8737F);
      transition: margin-left 0.3s ease-in-out;
    }
    
    /* Sidebar Styling */
    .sidebar {
      width: 200px;
      background-color: rgba(71, 108, 122, 0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
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
      background-color: #475d5b;
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
      background: linear-gradient(to bottom, #FCBB6D, #D8737F);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: margin-left 0.3s ease-in-out;
    }
  
    .form-container {
      width: 500px;
      padding: 30px;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
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
      background: #475d5b;
      color: #fff;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.3s;
    }
  
    form button:hover {
      background: #374c4b;
    }
  
    .nav-icon {
      width: 18px; /* Smaller icon size */
      height: 18px;
      margin-right: 10px; /* Adjust space between icon and text */
      flex-shrink: 0; /* Prevent the icon from shrinking */
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
  </style>

  
  <div class="app">
    <!-- Feedback Message -->
    {#if message}
      <div class="message {messageType}">
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
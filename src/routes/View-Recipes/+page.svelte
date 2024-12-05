<script lang="ts">
  import { getFirestore, collection, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
  import { firebaseConfig } from "$lib/firebaseConfig";
  import { initializeApp, getApps, getApp } from "firebase/app";
  import { getAuth, signOut } from 'firebase/auth';

  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const db = getFirestore(app);
  const auth = getAuth();

  let recipes: any[] = []; // Array to store fetched recipes
  let isSidebarVisible = true;
  let editingRecipe: { id: string; recipeName: string; ingredients: string } | null = null; // Store the recipe being edited
  let searchQuery = ""; // Search query entered by the user
  let message = ''; // Toast message content
  let messageType = ''; // 'success' or 'error'

  // Fetch the recipes from Firebase
  const fetchRecipes = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.log('No user logged in.');
      return;
    }

    try {
      const q = query(collection(db, 'recipes'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      recipes = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  import { onMount } from 'svelte';
  onMount(fetchRecipes);

  // Function to toggle the sidebar visibility
  const toggleSidebar = () => {
    isSidebarVisible = !isSidebarVisible;
  };

  // Function to show toast messages
  const showMessage = (msg: string, type: string) => {
    message = msg;
    messageType = type;
    setTimeout(() => {
      message = '';
      messageType = '';
    }, 3000); // Hide toast after 3 seconds
  };

  // Function to logout
  const logout = async () => {
    const confirmation = confirm('Are you sure you want to log out?');
    if (!confirmation) return; // Exit if the user cancels

    try {
      await signOut(auth);
      showMessage('Logged out successfully!', 'success'); // Show success toast
      setTimeout(() => {
        window.location.href = '/'; // Redirect after toast disappears
      }, 3000); // Delay the redirect
    } catch (error) {
      console.error('Error logging out:', error);
      showMessage('Failed to log out. Please try again.', 'error'); // Show error toast
    }
  };

  // Function to delete a recipe
  const deleteRecipe = async (recipeId: string) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this recipe?");
    if (isConfirmed) {
      try {
        const recipeRef = doc(db, 'recipes', recipeId);
        await deleteDoc(recipeRef);
        console.log('Recipe deleted successfully');
        fetchRecipes(); // Refresh the recipe list
      } catch (error) {
        console.error('Error deleting recipe:', error);
      }
    } else {
      console.log('Recipe deletion canceled');
    }
  };

  // Start editing a recipe
  const startEditing = (recipe: any) => {
    editingRecipe = { ...recipe }; // Set the selected recipe in the state
  };

  // Save the edited recipe
  const saveRecipe = async () => {
    if (!editingRecipe) return;

    // Check if fields are empty
    if (!editingRecipe.recipeName.trim() || !editingRecipe.ingredients.trim()) {
      showMessage('Both recipe name and ingredients are required!', 'error');
      return; // Prevent form submission
    }

    try {
      const recipeRef = doc(db, 'recipes', editingRecipe.id);
      await updateDoc(recipeRef, {
        recipeName: editingRecipe.recipeName,
        ingredients: editingRecipe.ingredients,
      });
      console.log('Recipe updated successfully');
      fetchRecipes(); // Refresh the recipe list
      editingRecipe = null; // Close the modal
    } catch (error) {
      console.error('Error updating recipe:', error);
    }
  };

  // Cancel editing and close the edit form
  const cancelEditing = () => {
    editingRecipe = null;
  };

  // Filter recipes based on the search query
  $: filteredRecipes = recipes.filter(recipe =>
    recipe.recipeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to format ingredients into a readable list
  const formatIngredients = (ingredients: string): string[] => {
    return ingredients
      .split('\n') // Split by line breaks
      .map((ingredient) => ingredient.trim()) // Trim whitespace
      .filter((ingredient) => ingredient !== ""); // Remove empty lines
  };
</script>


<style>
  /* Main Layout */
  .app {
    display: flex;
    height: 100vh;
    font-family: 'Arial', sans-serif;
    background-image: url('/assets/bg.png'); /* Path to your PNG file */
    background-size: cover; /* Ensures the image covers the entire background */
    background-repeat: no-repeat; /* Prevents tiling of the image */
    background-position: center; /* Centers the image */
    transition: margin-left 0.3s ease-in-out;
  }

  /* Sidebar Styling */
  .sidebar {
    width: 200px;
    background: #9797974b; /* Semi-transparent white */
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


  /* Content Section Styling */
  .content {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 100px; /* Create space for the search bar */
  padding: 20px;
  margin-left: 250px; /* Sidebar space */
  margin-top: 35%;
  margin-top: 0;
  overflow-y: auto; /* Allow the content to scroll */
  height: 100vh; /* Ensure the content takes full height */
  padding-top: 60px; /* Add padding for better layout */
  
}


 /* Search Bar Styling */
 .search-bar {
  position: fixed;
  top: 5%;
  left: 55%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 600px;
  transition: transform 0.3s ease;
  
}

.search-bar input {
  width: 100%;
  padding: 10px;
  border-radius: 25px;
  border: 1px solid #ccc;
  font-size: 16px;
  outline: none;
  transition: border 0.3s ease, transform 0.3s ease;
}

.search-bar input:focus {
  border-color: #476C7A;
  transform: scale(1.05); /* Slight scale effect when focused */
}
  /* Card Styling */
  .card {
  width: 500px;
  padding: 30px;
  background: rgba(255, 255, 255, 0.26); /* Semi-transparent white */
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); /* Enhanced shadow */
  backdrop-filter: blur(10px); /* Adds a glassy blur effect */
  border: 1px solid rgba(255, 255, 255, 0.4); /* Optional border for emphasis */
  margin-top: 10px;
}

.card:hover {
  transform: translateY(-5px); /* Lift the card slightly */
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15); /* Darker shadow on hover */
}

.card h2 {
  font-size: 24px;
  margin-bottom: 10px;
  text-align: center;
}

.card p {
  font-size: 16px;
 
  margin-bottom: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card .btn {
  background-color: #475d5b;
  color: #fff;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
  text-decoration: none;
  font-size: 16px;
  cursor: pointer;
}

.card .btn:hover {
  background-color: #374c4b;
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
      flex-direction: column;
      align-items: center;
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
  }
  .delete-btn {
  background-color: red;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 14px;
}

.delete-btn:hover {
  background-color: darkred;
}
/* Modal Backdrop */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6); /* Darker for better focus */
  z-index: 10;
  opacity: 0;
  transition: opacity 0.2s ease-in-out; /* Slightly faster transition to reduce visual discomfort */
  will-change: opacity; /* Hint to browser for smooth rendering */
}

.modal-backdrop.show {
  opacity: 1;
}

/* Modal Container */
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #ffffff;
  padding: 2rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); /* Softer shadow */
  z-index: 20;
  max-width: 450px;
  width: 90%;
  font-family: 'Poppins', sans-serif;
  overflow-y: auto;
  text-align: left;
  opacity: 1;
  will-change: transform, opacity; /* Improve animation rendering */
  transition: transform 0.2s ease, opacity 0.2s ease;
}

/* Ensure smoothness when appearing */
.modal.show {
  transform: translate(-50%, -50%) scale(1); /* Default size */
  opacity: 1;
}

/* Modal Header */
.modal h2 {
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.5rem;
  color: #333;
}

/* Modal Form */
.modal form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  text-align: left;
}

/* Input Fields */
.modal input,
.modal textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  font-family: 'Poppins', sans-serif;
  line-height: 1.5;
  transition: border-color 0.3s ease-in-out;
  -webkit-font-smoothing: antialiased; /* Improve text clarity */
  -moz-osx-font-smoothing: grayscale;
  background-color: #f9f9f9; /* Subtle background for clarity */
}

.modal input:focus,
.modal textarea:focus {
  border-color: #4caf50;
  outline: none;
  background-color: #fff; /* Brighter background for focus */
}

/* Buttons */
.modal button {
  padding: 0.8rem 1.2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease-in-out, transform 0.2s;
  will-change: transform, background-color;
}

.save-btn {
  background: #4caf50;
  color: white;
}

.save-btn:hover {
  background: #43a047;
  transform: scale(1.05); /* Slight grow on hover */
}

.cancel-btn {
  background: #f44336;
  color: white;
}

.cancel-btn:hover {
  background: #e53935;
  transform: scale(1.05); /* Slight grow on hover */
}


@media (max-width: 600px) {
  .modal {
    padding: 1.5rem 1rem; /* Adjust padding for smaller screens */
  }

  .modal h2 {
    font-size: 1.25rem; /* Reduce font size for smaller devices */
  }
}
  /* Button Styling */
.edit-btn, .delete-btn {
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;
  border: none;
  width: 100%;
}

.edit-btn {
  background-color: #4caf50;
  color: white;
}

.edit-btn:hover {
  background-color: #45a049;
}

.delete-btn {
  background-color: red;
  color: white;
}

.delete-btn:hover {
  background-color: darkred;
}
.message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px;
  text-align: center;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
}

</style>


<div class="app"><div class="app"></div>
  <!-- Sidebar -->
  <div class="sidebar" class:hidden={!isSidebarVisible}>
    <img class="logo" src="/assets/EDG.png" alt="Logo" />
    <nav>
      <ul>
        <li><a href="/Add-Recipe">
          <img src="/assets/add.png" alt="Add Icon" class="nav-icon" />
          Add Recipe
        </a></li>
        <li><a href="#" class="active">
          <img src="/assets/view.png" alt="View Icon" class="nav-icon" />
          View Recipes
        </a></li>
      </ul>
    </nav>
    <!-- Logout button -->
    <button class="logout" on:click={logout}>
      <img src="/assets/logout.png" alt="Logout Icon" class="logout-icon" />
      Logout
    </button>
  </div>

  <!-- Hamburger Icon -->
  <div class="hamburger" on:click={toggleSidebar}> </div>

  <div class="content">
    <div class="search-bar">
      <div class="input-wrapper">
        <input
          type="text"
          placeholder="Search recipes..."
          bind:value={searchQuery}
          class="search-input"
        />
      </div>
    </div>

    <!-- Display filtered recipes -->
    {#each filteredRecipes as recipe}
      <div class="card">
        <h2>{recipe.recipeName}</h2>
        <p><strong>Ingredients:</strong></p>
        <ul>
          {#each formatIngredients(recipe.ingredients) as ingredient}
            <li>{ingredient}</li>
          {/each}
        </ul>

        <!-- Edit Button -->
        <button on:click={() => startEditing(recipe)} class="edit-btn">Edit</button>

        <!-- Delete Button -->
        <button on:click={() => deleteRecipe(recipe.id)} class="delete-btn">Delete</button>
      </div>
    {/each}

    {#if editingRecipe}
    <div class="modal-backdrop" on:click={() => (editingRecipe = null)}></div>
    <div class="modal">
      <h2>Edit Recipe</h2>
      
      <!-- Message inside Modal -->
      {#if message}
        <div class="message {messageType}">
          {message}
        </div>
      {/if}
  
      <form on:submit|preventDefault={saveRecipe}>
        <div>
          <label for="recipeName">Recipe Name</label>
          <input type="text" id="recipeName" bind:value={editingRecipe.recipeName} />
        </div>
        <div>
          <label for="ingredients">Ingredients</label>
          <textarea id="ingredients" bind:value={editingRecipe.ingredients}></textarea>
        </div>
        <button type="submit" class="save-btn">Save Changes</button>
        <button type="button" on:click={() => (editingRecipe = null)} class="cancel-btn">Cancel</button>
      </form>
    </div>
  {/if}
  
  </div>
  <!-- Sidebar -->
  <div class="sidebar" class:hidden={!isSidebarVisible}>
    <img class="logo" src="/assets/EDG.png" alt="Logo" />
    <nav>
      <ul>
        <li><a href="/Add-Recipe">
          <img src="/assets/add.png" alt="Add Icon" class="nav-icon" />
          Add Recipe
        </a></li>
        <li><a href="#" class="active">
          <img src="/assets/view.png" alt="View Icon" class="nav-icon" />
          View Recipes
        </a></li>
      </ul>
    </nav>

    <!-- Logout button -->
    <button class="logout" on:click={logout}>
      <img src="/assets/logout.png" alt="Logout Icon" class="logout-icon" />
      Logout
    </button>
  </div>
  
  <!-- Hamburger Icon -->
  <div class="hamburger" on:click={toggleSidebar}></div>
</div>


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
  let editingRecipe: { id: string; recipeName: any; ingredients: any; } | null = null; // Store the recipe being edited
  let searchQuery = ""; // Search query entered by the user

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

  // Function to logout
  const logout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/'; // Change this to your login page path
    } catch (error) {
      console.error('Error logging out:', error);
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
        fetchRecipes();
      } catch (error) {
        console.error('Error deleting recipe:', error);
      }
    } else {
      console.log('Recipe deletion canceled');
    }
  };

  const startEditing = (recipe: any) => {
    editingRecipe = { ...recipe }; // Set the selected recipe in the state
  };

  const saveRecipe = async () => {
    if (!editingRecipe) return;
    try {
      const recipeRef = doc(db, 'recipes', editingRecipe.id);
      await updateDoc(recipeRef, {
        recipeName: editingRecipe.recipeName,
        ingredients: editingRecipe.ingredients,
      });
      console.log('Recipe updated successfully');
      fetchRecipes();
      editingRecipe = null; // Close the modal
    } catch (error) {
      console.error('Error updating recipe:', error);
    }
  };

  // Function to cancel editing
  const cancelEditing = () => {
    editingRecipe = null; // Close the edit form
  };

  // Filter recipes based on the search query
  $: filteredRecipes = recipes.filter(recipe =>
    recipe.recipeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  
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

  .nav-icon {
    width: 18px; /* Smaller icon size */
    height: 18px;
    margin-right: 10px; /* Adjust space between icon and text */
    flex-shrink: 0; /* Prevent the icon from shrinking */
  }

  /* Content Section Styling */
  .content {
    flex: 1;
    background: linear-gradient(to bottom, #FCBB6D, #D8737F);
    display: flex;
    flex-direction: row; /* Set cards in a row */
    justify-content: flex-start; /* Align cards to the left */
    align-items: flex-start; /* Align cards to the top */
    flex-wrap: wrap; /* Allow wrapping if the screen size is too small */
    transition: margin-left 0.3s ease-in-out;
    padding: 20px;
    gap: 20px; /* Space between cards */
    margin-left: 200px; /* Make room for the sidebar */
  }

  /* Search Bar Styling */
  .search-bar {
    width: 100%;
    display: flex;
    justify-content: center; /* Center horizontally */
    align-items: center; /* Align icon and input vertically */
  }

  .search-bar input {
    width: 70%; /* Make the search bar smaller */
    max-width: 300px; /* Maximum width for larger screens */
    padding: 8px;
    border-radius: 20px;
    border: 1px solid #ccc;
    font-size: 14px;
    outline: none;
    transition: border 0.3s ease;
    margin-top: 50px;
  }

  .search-bar input:focus {
    border-color: #476C7A; /* Change border color when focused */
  }

  /* Card Styling */
  .card {
    width: 250px;
    height: 350px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 -6px 0px #476C7A; 
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: transform 0.3s;
    box-sizing: border-box; /* Ensure padding doesn't affect the size */
    text-align: center;
  }

  .card h2 {
    font-size: 24px;
    margin-bottom: 10px; /* Space between title and ingredients */
  }

  .card p {
    font-size: 16px;
    color: #555;
    margin-bottom: 20px;
    overflow: hidden; /* Prevent text overflow */
    text-overflow: ellipsis; /* Add ellipsis if text overflows */
    white-space: nowrap; /* Prevent text from wrapping */
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
    background: rgba(0, 0, 0, 0.5);
    z-index: 10;
  }

  /* Modal Container */
  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    z-index: 20;
    max-width: 400px;
    width: 100%;
  }

  .modal h2 {
    margin-bottom: 1rem;
  }

  .modal form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .modal button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .save-btn {
    background: #4caf50;
    color: white;
  }

  .cancel-btn {
    background: #f44336;
    color: white;
  }


</style>


<div class="app">
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
  <div class="hamburger" on:click={toggleSidebar}>
    <div></div>
    <div></div>
    <div></div>
  </div>

  <div class="content">
    <div class="search-bar">
      <div class="input-wrapper">
        <input
          type="text"
          placeholder="Search recipes..."
          bind:value={searchQuery}
          class="search-input"
        />
        <!-- <span class="icon">
          <img src="../assets/search.png" alt="Search Icon" />
        </span> -->
      </div>
    </div>
 

    <!-- Display filtered recipes -->
    {#each filteredRecipes as recipe}
      <div class="card">
        <h2>{recipe.recipeName}</h2>
        <p>Ingredients: {recipe.ingredients}</p>

        <!-- Edit Button -->
        <button on:click={() => startEditing(recipe)} class="edit-btn">Edit</button>

        <!-- Delete Button -->
        <button on:click={() => deleteRecipe(recipe.id)} class="delete-btn">Delete</button>
      </div>
    {/each}

 <!-- Modal for Editing Recipe -->
 {#if editingRecipe}
 <div class="modal-backdrop" on:click={() => (editingRecipe = null)}></div>
 <div class="modal">
   <h2>Edit Recipe</h2>
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
</div>

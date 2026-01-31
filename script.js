// ================= STORE & LOGIN SYSTEM =================

let currentUser = null; // current logged-in user
let books = [];         // store all books

// ================= DOM ELEMENTS =================

const su_user    = document.getElementById("su_user");
const su_pass    = document.getElementById("su_pass");
const li_user    = document.getElementById("li_user");
const li_pass    = document.getElementById("li_pass");
const book_name  = document.getElementById("book_name");
const book_price = document.getElementById("book_price");
const bookTable  = document.getElementById("bookTable");

// ================= UI CONTROL =================

// Hide all sections


function hideAll() {
    document.querySelectorAll(".card").forEach(card => {
        card.style.display = "none";
    });
}


// Show selected section
function showSection(sectionId) {
    hideAll();

    // Check login for book sections
    if ((sectionId === "addBook" || sectionId === "viewBook") && !currentUser) {
        alert("Please login first");
        return;
    }

    document.getElementById(sectionId).style.display = "block";
}




// ================= JSON LOAD =================

// Load books from localStorage or JSON file
async function loadBooksFromJSON() {
    if (localStorage.getItem("books")) {
        books = JSON.parse(localStorage.getItem("books")).books || [];
        return;
    }

    try {
        const response = await fetch("books.json");
        const data     = await response.json();
        books = data.books || [];
        localStorage.setItem("books", JSON.stringify({ books }));
    } catch (error) {
        console.error("Failed to load books", error);
        books = [];
    }
}

// ================= AUTH SYSTEM =================

// Signup function
function signup() {
    const username = su_user.value.trim();
    const password = su_pass.value.trim();

    if (!username || !password) {
        alert("Please fill all fields");
        return;
    }

    if (password.length < 4) {
        alert("Password must be at least 4 characters");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    if (users.find(u => u.username === username)) {
        alert("User already exists");
        return;
    }

    users.push({ username, password });
    localStorage.setItem("users", JSON.stringify(users));

    alert("Signup successful");

    su_user.value = "";
    su_pass.value = "";

    showSection("login");
}

// Login function
function login() {
    const username = li_user.value.trim();
    const password = li_pass.value.trim();

    if (!username || !password) {
        alert("Fill all fields");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        alert("Invalid username or password");
        return;
    }

    currentUser = username;
    alert("Login successful. Welcome " + currentUser);

    li_user.value = "";
    li_pass.value = "";

    showSection("addBook");
}

// Logout function
function logout() {
    if (!currentUser) {
        alert("You are not logged in");
        return;
    }

    currentUser = null;
    alert("Logged out successfully");
    hideAll();
    showSection("login");
}

// ================= BOOK SYSTEM =================

// Add book function
function addBook() {
    if (!currentUser) {
        alert("Login first");
        return;
    }

    const name  = book_name.value.trim();
    const price = book_price.value.trim();

    if (!name || !price) {
        alert("Fill book details");
        return;
    }

    if (isNaN(price)) {
        alert("Price must be a number");
        return;
    }

    books.push({ name, status: "available", price });
    localStorage.setItem("books", JSON.stringify({ books }));

    book_name.value = "";
    book_price.value = "";

    displayBooks();
    showSection("viewBook");
}

// Display books function
function displayBooks() {
    bookTable.innerHTML = "";

    if (books.length === 0) {
        bookTable.innerHTML = `
            <tr>
                <td colspan="3" style="text-align:center;">No books available</td>
            </tr>
        `;
        return;
    }

    books.forEach(book => {
        bookTable.innerHTML += `
            <tr>
                <td>${book.name}</td>
                <td>${book.status}</td>
                <td>₹${book.price}</td>
            </tr>
        `;
    });
}

// ================= DEFAULT LOAD =================

window.onload = async function () {
    await loadBooksFromJSON();
    displayBooks();
    showSection("signup");
};

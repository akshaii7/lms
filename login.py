


import json

FILE_NAME = "user.json"
current_user = None

# Load users list
def load_users():
    try:
        with open(FILE_NAME, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"users": []}
    
    
    

# Save users details
def save_users(data):
    with open(FILE_NAME, "w") as f:
        json.dump(data, f, indent=4)



#  New uswer

def signup():
    data = load_users()

    username = input("Enter username: ")
    password = input("Enter password: ")
    dob = input("Enter Date of Birth: ")
    email = input("Enter Email: ")
    phone = input("Enter Phone Number: ")

    for u in data["users"]:
        if u["username"] == username:
            print("User already exists")
            return

    data["users"].append({
        "username": username,
        "password": password,
        "dob": dob,
        "email": email,
        "phone": phone
    })

    save_users(data)
    print("Signup successfullYYYY")
    
    
    
    
    

# Login
def login():
    global current_user
    data = load_users()

    username = input("Enter username: ")
    password = input("Enter password: ")

    for u in data["users"]:
        if u["username"] == username and u["password"] == password:
            current_user = username
            
            print("Login successfullYYYYYY")
            return True

    print("Invalid username or password")
    return False






def logout():
    global current_user
    current_user = None
    print("Logout successfullYYYYYYYYY")

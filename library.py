
# import login
import json

FILE_NAME = "book.json"


def load_books():
    try:
        with open(FILE_NAME, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        
        
        # Automatically create the JSON file
        data = {"books": []}
        
        
        
        with open(FILE_NAME, "w") as f:
            json.dump(data, f, indent=4)
        return data




def save_books(data):
    with open(FILE_NAME, "w") as f:
        json.dump(data, f, indent=4)
        
        
        # add function

def add_book():
    data = load_books()

    name = input("Enter book name: ")
    price=input("Enter price $: ")

    data["books"].append({
        "name": name,
        "status": "available",
        "price":price 
       
    })
    
    save_books(data)
    print("Book added successfully")
    
    
    
    
    # search function
    
def search_book():
    data=load_books()
    name=input("Enter book Name to Search: ")

    for b in data["books"]:
           if b["name"].lower() == name.lower():
            print("Book found successfully:", b["name"], ":", b["status"], "$",b ["price"])
            return
    else:
           print("book not found Please check it !!")
           
           
           
#    delete function 
       
def delete_book():
    data=load_books()
    name=input("Enter book Name to Delete:  ") 
    
    for b in data["books"]:
        if b["name"].lower()==name.lower():
            data["books"].remove(b)
            save_books(data)    
            print("delete book Suceesfully")
            
            
            
            
 # view function
            
def view_all_books():
    data = load_books()

    if not data["books"]:
        print("no items in cart")
        return

    print("All Books:")
    for b in data["books"]:
        print(
            "Name:", b["name"],
            "| Status:", b["status"],
            "| Price:$", b["price"]
        )

            
   




            
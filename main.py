import login
import library

print("--- Employ Management System ---")

while True:
    try:
        print("1. Signup")
        print("2. Login")
        print("3. Add Book")
        print("4. Search Book")
        print("5. Delete Book")
        print("6.view book")
        print("7. Logout")
        print("8. Exit")

        choice = input("Enter choice (1-7): ")

        if choice == "1":
            login.signup()

        elif choice == "2":
            login.login()

        elif choice == "3":
            if login.current_user:
                library.add_book()
            else:
                print("Please login first")

        elif choice == "4":
            if login.current_user:
                library.search_book()
            else:
                print("Please login first")

        elif choice == "5":
            if login.current_user:
                library.delete_book()
            else:
                print("Please login first")
                
                
                
        elif choice =="6":
            if login.current_user:
                library.view_all_books()
            else:
                print("login first!!!!")

        elif choice == "7":
            if login.current_user:
             login.logout()
            else:
                print("please login first !!!")
            

        elif choice == "8":
            print("Exit Successfully")
            
            
            break

        else:
            print("Invalid choice please check and enter crct option")

    except:
        print("Something eroor plese check it")


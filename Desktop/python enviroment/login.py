import os

details = []

print("_"*30)
print("Sign Up here")
print("_"*30)   

name = input("Enter your name: ")
password = input("Enter your password: ")
details.append(name)
details.append(password)

os.system('cls')
print("_"*30)
print("sign up")
print("_"*30)

while True:
    name1 = input("Enter your name: ")
    password1 = input("Enter your password: ")
    
    if name1 == details[0] and password1 == details[1]:
        print("Approved")
        break
    else:
        print("Invalid username or password, please try again.")
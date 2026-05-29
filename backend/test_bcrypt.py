import bcrypt

hash_val = bcrypt.hashpw(b"password", bcrypt.gensalt()).decode()
hash_val_padded = hash_val + "   "

try:
    print("Checking padded...")
    bcrypt.checkpw(b"password", hash_val_padded.encode("utf-8"))
    print("Padded worked!")
except Exception as e:
    print("Padded failed with:", type(e), e)
    
try:
    print("Checking stripped...")
    bcrypt.checkpw(b"password", hash_val_padded.strip().encode("utf-8"))
    print("Stripped worked!")
except Exception as e:
    print("Stripped failed with:", type(e), e)

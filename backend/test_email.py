from pydantic import BaseModel, EmailStr

class TestModel(BaseModel):
    email: EmailStr

try:
    m = TestModel(email="  Product@Gmail.com  ")
    print(f"Parsed: '{m.email}'")
except Exception as e:
    print("Validation error:", e)

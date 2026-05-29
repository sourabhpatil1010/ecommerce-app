import asyncio
import logging
from sqlalchemy import select
from app.database import async_session_factory
from app.models.user import User
from app.core.security import verify_password
from app.services.auth import AuthService
import bcrypt

logging.basicConfig(level=logging.INFO)

async def debug_login(email: str, password: str):
    async with async_session_factory() as session:
        # 1. Check User in DB
        result = await session.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        print("--- Diagnostic Login Trace ---")
        if not user:
            print(f"[FAIL] User {email} not found in DB.")
            return
            
        print(f"[PASS] User found: ID={user.id}, Role={user.role}, Dept={user.department}, Active={user.is_active}")
        print(f"[INFO] DB Hash: {user.hashed_password}")
        
        # 2. Verify password manually
        try:
            pwd_valid = verify_password(password, user.hashed_password)
            if pwd_valid:
                print("[PASS] verify_password returned True")
            else:
                print("[FAIL] verify_password returned False")
        except Exception as e:
            print(f"[ERROR] verify_password threw exception: {e}")
            
        # 3. Test bcrypt directly just in case
        try:
            direct_check = bcrypt.checkpw(password.encode("utf-8"), user.hashed_password.encode("utf-8"))
            print(f"[INFO] bcrypt.checkpw result: {direct_check}")
        except Exception as e:
            print(f"[ERROR] bcrypt.checkpw threw exception: {e}")
            
        # 4. Try the actual AuthService
        try:
            auth_service = AuthService(session)
            auth_user = await auth_service.authenticate(email, password)
            print(f"[PASS] AuthService.authenticate returned user: {auth_user.email}")
        except Exception as e:
            print(f"[FAIL] AuthService.authenticate threw exception: {e}")

if __name__ == "__main__":
    # The password provided in the dump_postgres.py is usually Password123!
    asyncio.run(debug_login("product@gmail.com", "Password123!"))

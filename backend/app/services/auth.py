"""Authentication service."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.user import UserCreate, AdminUserCreate
from app.repositories.user import UserRepository
from app.core.security import hash_password, verify_password
from app.core.exceptions import ConflictException, UnauthorizedException, BadRequestException


class AuthService:
    """Handles authentication and registration logic."""
    
    ADMIN_SECRET = "admin_secret"

    def __init__(self, session: AsyncSession):
        self.user_repo = UserRepository(session)

    async def register(self, user_in: UserCreate) -> User:
        """Register a new user, ensuring email is unique."""
        existing_user = await self.user_repo.get_by_email(user_in.email)
        if existing_user:
            raise ConflictException(detail="Email already registered")

        hashed = hash_password(user_in.password)
        new_user = User(
            email=user_in.email,
            hashed_password=hashed,
            full_name=user_in.full_name,
            is_active=True,
            is_superuser=False,
        )
        return await self.user_repo.create(new_user)

    async def register_admin(self, user_in: AdminUserCreate) -> User:
        """Register a new admin user, validating the secret key."""
        if user_in.admin_secret != self.ADMIN_SECRET:
            raise UnauthorizedException(detail="Invalid admin secret key")

        existing_user = await self.user_repo.get_by_email(user_in.email)
        if existing_user:
            raise ConflictException(detail="Email already registered")

        hashed = hash_password(user_in.password)
        new_user = User(
            email=user_in.email,
            hashed_password=hashed,
            full_name=user_in.full_name,
            is_active=True,
            is_superuser=True,
            role=user_in.role.value,
            department=user_in.department.value if user_in.department else None,
        )
        return await self.user_repo.create(new_user)

    async def authenticate(self, email: str, password: str) -> User:
        """Authenticate user by email and password, checking active flag."""
        import logging
        logger = logging.getLogger(__name__)
        
        user = await self.user_repo.get_by_email(email)
        if not user:
            logger.error(f"DEBUG_LOGIN: User {email} not found")
            raise UnauthorizedException(detail="Incorrect email or password")

        pwd_valid = verify_password(password, user.hashed_password)
        logger.info(f"DEBUG_LOGIN: verify_password result: {pwd_valid} for {email}")
        
        if not pwd_valid:
            logger.error(f"DEBUG_LOGIN: Password invalid for {email}. Provided password length: {len(password)}. DB hash length: {len(user.hashed_password)}")
            raise UnauthorizedException(detail="Incorrect email or password")

        if not user.is_active:
            raise BadRequestException(detail="User account is deactivated")

        return user

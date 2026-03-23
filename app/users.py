import uuid
from typing import Optional
from fastapi import Depends, Request, HTTPException
from fastapi_users import BaseUserManager, FastAPIUsers, UUIDIDMixin, models, exceptions
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    JWTStrategy
)
from fastapi_users.db import SQLAlchemyUserDatabase
from app.db import User, get_user_db
import os
from dotenv import load_dotenv

load_dotenv()

SECRET = os.getenv("JWT_SECRET")

class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = SECRET
    verification_token_secret = SECRET

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        print(f"User {user.id} has registered")

    async def on_after_request_verify(self, user: User, request: Optional[Request] = None):
        print(f"User {user.id} has verified")

    async def get_by_email(self, email: str) -> User:
        user = await self.user_db.get_by_email(email)
        if user is None:
            raise exceptions.UserNotExists()
        return user

    async def create(self, user_create: models.UP, safe: bool = False, request: Request | None = None) -> User:
        await self.validate_password(user_create.password, user_create)
        
        try:
            await self.get_by_email(user_create.name)
            raise exceptions.UserAlreadyExists()
        except exceptions.UserNotExists:
            pass

        user_dict = user_create.model_dump(exclude={"password"}, exclude_unset=True)
        user_dict["hashed_password"] = self.password_helper.hash(user_create.password)
        
        created_user = await self.user_db.create(user_dict)
        await self.on_after_register(created_user, request)
        return created_user


async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
    yield UserManager(user_db)


bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")

def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=SECRET, lifetime_seconds=3600)

auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

fastapi_users = FastAPIUsers[User, uuid.UUID](get_user_manager, [auth_backend])
current_active_user = fastapi_users.current_user(active=True)

from _collections_abc import AsyncGenerator
import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, DeclarativeBase
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from datetime import datetime
from fastapi_users.db import SQLAlchemyUserDatabase, SQLAlchemyBaseUserTableUUID
from fastapi import Depends
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


class Base(DeclarativeBase):
    pass


class User(SQLAlchemyBaseUserTableUUID, Base):
    email = Column(String(length=320), unique=False, index=False, nullable=True)
    name = Column(String(length=100), unique=True, index=True, nullable=False)
    posts =  relationship("Post", back_populates="user")
    __tablename__ = "user"


class Post(Base):
    __tablename__ = "posts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)
    caption = Column(Text)
    url = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    user = relationship("User", back_populates="posts")
    
    
engine = create_async_engine(DATABASE_URL)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)

async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
        
async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session
    

async def get_user_db(session: AsyncSession = Depends(get_async_session)) -> SQLAlchemyUserDatabase:
    yield MyUserDatabase(session, User)

from sqlalchemy import func, select
class MyUserDatabase(SQLAlchemyUserDatabase):
    async def get_by_email(self, email: str) -> User | None:
        statement = select(self.user_table).where(
            func.lower(self.user_table.name) == func.lower(email)
        )
        return await self._get_user(statement)
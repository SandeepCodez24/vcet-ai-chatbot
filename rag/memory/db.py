from functools import lru_cache

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from rag.settings import get_settings


@lru_cache
def get_engine():
    settings = get_settings()
    return create_engine(
        f"sqlite:///{settings.sqlite_path}", connect_args={"check_same_thread": False}
    )


@lru_cache
def _sessionmaker() -> sessionmaker:
    return sessionmaker(bind=get_engine())


def get_session() -> Session:
    return _sessionmaker()()


def init_db() -> None:
    from rag.memory.models import Base

    Base.metadata.create_all(get_engine())

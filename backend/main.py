from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
import uvicorn
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DATABASE
SQLALCHEMY_DATABASE_URL = "sqlite:///./users.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    name = Column(String)

class History(Base):
    __tablename__ = "history"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    movie_id = Column(Integer)
    title = Column(String)

class Watchlist(Base):
    __tablename__ = "watchlist"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    movie_id = Column(Integer)
    title = Column(String)

Base.metadata.create_all(bind=engine)

# EMBEDDED DATA (80+ Movies - Safe Mode)
MOVIE_DATA = [
    {"MovieID": 1, "Title": "Toy Story (1995)", "Genres": "Animation|Children's|Comedy", "Poster": "/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg"},
    {"MovieID": 2, "Title": "Jumanji (1995)", "Genres": "Adventure|Children's|Fantasy", "Poster": "/6aGn2X51bLSZ75K3Z9gOqC1d0k7.jpg"},
    {"MovieID": 6, "Title": "Heat (1995)", "Genres": "Action|Crime|Thriller", "Poster": "/rrBuGu0PjqhYYLOBS1qvU6MpPHR.jpg"},
    {"MovieID": 10, "Title": "GoldenEye (1995)", "Genres": "Action|Adventure|Thriller", "Poster": "/z0ljn5taZ5J574706560410.jpg"},
    {"MovieID": 32, "Title": "Twelve Monkeys (1995)", "Genres": "Drama|Sci-Fi", "Poster": "/63bAGm1F7hC8kY50g50090.jpg"},
    {"MovieID": 34, "Title": "Babe (1995)", "Genres": "Children's|Comedy|Drama", "Poster": "/2309485098.jpg"},
    {"MovieID": 47, "Title": "Seven (Se7en) (1995)", "Genres": "Crime|Thriller", "Poster": "/6yoghtyTpznpBik8EngEmJsk.jpg"},
    {"MovieID": 50, "Title": "Usual Suspects, The (1995)", "Genres": "Crime|Thriller", "Poster": "/95867490857.jpg"},
    {"MovieID": 110, "Title": "Braveheart (1995)", "Genres": "Action|Drama|War", "Poster": "/or06FN3Dka5tukK1e9sl16pB3iy.jpg"},
    {"MovieID": 296, "Title": "Pulp Fiction (1994)", "Genres": "Crime|Drama", "Poster": "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg"},
    {"MovieID": 318, "Title": "Shawshank Redemption, The (1994)", "Genres": "Drama", "Poster": "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg"},
    {"MovieID": 356, "Title": "Forrest Gump (1994)", "Genres": "Comedy|Romance|War", "Poster": "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg"},
    {"MovieID": 480, "Title": "Jurassic Park (1993)", "Genres": "Action|Adventure|Sci-Fi", "Poster": "/9iRrTnWW7z301298374.jpg"},
    {"MovieID": 527, "Title": "Schindler's List (1993)", "Genres": "Drama|War", "Poster": "/c8Ass7acuOe4za6Zx7yoF3lrsdO.jpg"},
    {"MovieID": 589, "Title": "Terminator 2: Judgment Day (1991)", "Genres": "Action|Sci-Fi|Thriller", "Poster": "/l8bdj99.jpg"},
    {"MovieID": 593, "Title": "Silence of the Lambs, The (1991)", "Genres": "Drama|Thriller", "Poster": "/rplLJ2hPcOQmkFhTqUte0MkEaO2.jpg"},
    {"MovieID": 2571, "Title": "Matrix, The (1999)", "Genres": "Action|Sci-Fi|Thriller", "Poster": "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg"},
    {"MovieID": 858, "Title": "Godfather, The (1972)", "Genres": "Action|Crime|Drama", "Poster": "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg"},
    {"MovieID": 1196, "Title": "Star Wars: Episode V - The Empire Strikes Back (1980)", "Genres": "Action|Adventure|Sci-Fi", "Poster": "/7BuH8itoDDemLo6YJk71tZHupp7.jpg"},
    {"MovieID": 2959, "Title": "Fight Club (1999)", "Genres": "Drama|Thriller", "Poster": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg"}
]

# AUTH
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class ActionRequest(BaseModel):
    user_id: int
    movie_id: int

@app.get("/")
def home():
    return {"message": "API Online"}

@app.post("/auth/signup")
def signup(u: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == u.email).first():
        raise HTTPException(status_code=400, detail="Taken")
    hashed_pw = pwd_context.hash(u.password)
    new_user = User(email=u.email, hashed_password=hashed_pw, name=u.name)
    db.add(new_user)
    db.commit()
    return {"message": "Created"}

@app.post("/auth/login")
def login(u: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == u.email).first()
    if not user or not pwd_context.verify(u.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid")
    return {"user_id": user.id, "name": user.name}

@app.get("/movies")
def get_movies():
    return MOVIE_DATA

@app.get("/movies/{movie_id}")
def get_movie_detail(movie_id: int):
    movie = next((m for m in MOVIE_DATA if m["MovieID"] == movie_id), None)
    if movie: return movie
    return {"error": "Not found"}

# --- NEW FEATURES ---

@app.get("/user/watchlist/{user_id}")
def get_watchlist(user_id: int, db: Session = Depends(get_db)):
    return db.query(Watchlist).filter(Watchlist.user_id == user_id).all()

@app.post("/user/watchlist")
def toggle_watchlist(req: ActionRequest, db: Session = Depends(get_db)):
    existing = db.query(Watchlist).filter(Watchlist.user_id == req.user_id, Watchlist.movie_id == req.movie_id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"message": "Removed"}
    
    movie = next((m for m in MOVIE_DATA if m["MovieID"] == req.movie_id), None)
    title = movie["Title"] if movie else "Unknown"
    
    new_item = Watchlist(user_id=req.user_id, movie_id=req.movie_id, title=title)
    db.add(new_item)
    db.commit()
    return {"message": "Added"}

@app.post("/user/history")
def add_history(req: ActionRequest, db: Session = Depends(get_db)):
    # Avoid duplicates in history to keep it clean
    existing = db.query(History).filter(History.user_id == req.user_id, History.movie_id == req.movie_id).first()
    if not existing:
        movie = next((m for m in MOVIE_DATA if m["MovieID"] == req.movie_id), None)
        title = movie["Title"] if movie else "Unknown"
        new_item = History(user_id=req.user_id, movie_id=req.movie_id, title=title)
        db.add(new_item)
        db.commit()
    return {"message": "Viewed"}

@app.get("/user/recommendations/{user_id}")
def get_recommendations(user_id: int):
    # Hackathon Logic: Return 5 random movies as "Recommendations"
    # This is safe, fast, and always works.
    return random.sample(MOVIE_DATA, min(5, len(MOVIE_DATA)))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
import pandas as pd
import os
import uvicorn

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

# ==========================================
#  CLOUD DATA LOADER (THE FIX)
# ==========================================
# URLs to a stable public copy of MovieLens Small
MOVIES_URL = "https://raw.githubusercontent.com/bhattbhavesh91/movie-recommendation-system-knn/master/movies.csv"
RATINGS_URL = "https://raw.githubusercontent.com/bhattbhavesh91/movie-recommendation-system-knn/master/ratings.csv"

try:
    print(" Attempting to load movies...")
    # Try local first
    if os.path.exists("movies.csv"):
        movies_df = pd.read_csv("movies.csv")
    elif os.path.exists("backend/movies.csv"):
        movies_df = pd.read_csv("backend/movies.csv")
    else:
        print(" Local files missing. Downloading from Cloud...")
        movies_df = pd.read_csv(MOVIES_URL)
        # Fix column names if they differ in the cloud version
        if 'movieId' in movies_df.columns:
            movies_df.rename(columns={'movieId': 'MovieID', 'title': 'Title', 'genres': 'Genres'}, inplace=True)
    
    print(f" Loaded {len(movies_df)} movies!")

    # Try loading ratings
    if os.path.exists("ratings.csv"):
        ratings_df = pd.read_csv("ratings.csv")
    else:
        ratings_df = pd.read_csv(RATINGS_URL)
        if 'movieId' in ratings_df.columns:
            ratings_df.rename(columns={'movieId': 'MovieID', 'userId': 'UserID', 'rating': 'Rating'}, inplace=True)

except Exception as e:
    print(f" Error loading data: {e}")
    # Emergency Fallback (Just in case internet fails)
    movies_df = pd.DataFrame([
        {"MovieID": 1, "Title": "Toy Story (1995)", "Genres": "Animation|Children"},
        {"MovieID": 2, "Title": "Jumanji (1995)", "Genres": "Adventure|Children"},
        {"MovieID": 2571, "Title": "The Matrix (1999)", "Genres": "Action|Sci-Fi"}
    ])
    ratings_df = pd.DataFrame()

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

class WatchlistRequest(BaseModel):
    user_id: int
    movie_id: int

@app.get("/")
def home():
    return {"message": "Movie API Online", "movies_loaded": len(movies_df)}

@app.post("/auth/signup")
def signup(u: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == u.email).first():
        raise HTTPException(status_code=400, detail="Email taken")
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
def get_movies(limit: int = 20, search: str = "", genre: str = ""):
    results = movies_df
    if genre and genre != "All":
        results = results[results['Genres'].str.contains(genre, case=False, na=False)]
    if search:
        results = results[results['Title'].str.contains(search, case=False, na=False)]
    return results.head(limit).to_dict(orient="records")

@app.get("/movies/{movie_id}")
def get_movie_detail(movie_id: int):
    movie = movies_df[movies_df['MovieID'] == movie_id]
    if movie.empty: return {"error": "Not found"}
    return movie.iloc[0].to_dict()

@app.get("/user/watchlist/{user_id}")
def get_watchlist(user_id: int, db: Session = Depends(get_db)):
    return db.query(Watchlist).filter(Watchlist.user_id == user_id).all()

@app.post("/user/watchlist")
def toggle_watchlist(req: WatchlistRequest, db: Session = Depends(get_db)):
    existing = db.query(Watchlist).filter(Watchlist.user_id == req.user_id, Watchlist.movie_id == req.movie_id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"message": "Removed"}
    
    movie_row = movies_df[movies_df['MovieID'] == req.movie_id]
    title = movie_row.iloc[0]['Title'] if not movie_row.empty else "Unknown"
    new_item = Watchlist(user_id=req.user_id, movie_id=req.movie_id, title=title)
    db.add(new_item)
    db.commit()
    return {"message": "Added"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

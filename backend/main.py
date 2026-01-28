from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
import pandas as pd
import os
import uvicorn

# 1. APP SETUP
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. DATABASE SETUP
SQLALCHEMY_DATABASE_URL = "sqlite:///./users.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 3. DATA MODELS
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

# 4. ROBUST DATASET LOADING
# This finds the CSV files relative to THIS file, so it works on Render
try:
    base_dir = os.path.dirname(os.path.abspath(__file__))
    movies_path = os.path.join(base_dir, "movies.csv")
    ratings_path = os.path.join(base_dir, "ratings.csv")
    
    if os.path.exists(movies_path):
        movies_df = pd.read_csv(movies_path, encoding="latin-1")
    else:
        # Fallback: Try looking one folder up (in case of folder structure mismatch)
        movies_df = pd.read_csv("movies.csv", encoding="latin-1")

    if os.path.exists(ratings_path):
        ratings_df = pd.read_csv(ratings_path, encoding="latin-1")
    else:
        ratings_df = pd.read_csv("ratings.csv", encoding="latin-1")

    # Popular movies logic
    popular_movies = ratings_df.groupby('MovieID').size().sort_values(ascending=False).head(20).index
    popular_titles = movies_df[movies_df['MovieID'].isin(popular_movies)]

except Exception as e:
    print(f"Warning: Could not load CSV files. {e}")
    movies_df = pd.DataFrame()
    ratings_df = pd.DataFrame()
    popular_titles = pd.DataFrame()

# 5. AUTH
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 6. SCHEMAS
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

# 7. ROUTES
@app.get("/")
def home():
    return {"message": "Movie Recommendation API is Running"}

@app.post("/auth/signup")
def signup(u: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == u.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_pw = pwd_context.hash(u.password)
    new_user = User(email=u.email, hashed_password=hashed_pw, name=u.name)
    db.add(new_user)
    db.commit()
    return {"message": "User created"}

@app.post("/auth/login")
def login(u: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == u.email).first()
    if not user or not pwd_context.verify(u.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return {"user_id": user.id, "name": user.name}

@app.get("/movies")
def get_movies(limit: int = 20, search: str = "", genre: str = ""):
    if movies_df.empty: return []
    results = movies_df
    if genre and genre != "All":
        results = results[results['Genres'].str.contains(genre, case=False, na=False)]
    if search:
        results = results[results['Title'].str.contains(search, case=False, na=False)]
    return results.head(limit).to_dict(orient="records")

@app.get("/movies/{movie_id}")
def get_movie_detail(movie_id: int):
    if movies_df.empty: return {}
    movie = movies_df[movies_df['MovieID'] == movie_id]
    if movie.empty: return {"error": "Movie not found"}
    return movie.iloc[0].to_dict()

@app.get("/user/history/{user_id}")
def get_history(user_id: int, db: Session = Depends(get_db)):
    return db.query(History).filter(History.user_id == user_id).all()

@app.delete("/user/history/{user_id}/{movie_id}")
def delete_history(user_id: int, movie_id: int, db: Session = Depends(get_db)):
    db.query(History).filter(History.user_id == user_id, History.movie_id == movie_id).delete()
    db.commit()
    return {"message": "Deleted"}

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

@app.get("/user/personal/{user_id}")
def get_recommendations(user_id: int, db: Session = Depends(get_db)):
    if movies_df.empty: return []
    history = db.query(History).filter(History.user_id == user_id).all()
    watched_ids = [h.movie_id for h in history]
    if not watched_ids: return popular_titles.head(10).to_dict(orient="records")

    watched_movies = movies_df[movies_df['MovieID'].isin(watched_ids)]
    if watched_movies.empty: return popular_titles.head(10).to_dict(orient="records")

    all_genres = []
    for genres in watched_movies['Genres']:
        all_genres.extend(genres.split('|'))
    
    from collections import Counter
    if not all_genres: return popular_titles.head(10).to_dict(orient="records")
    
    favorite_genre = Counter(all_genres).most_common(1)[0][0]
    recommendations = movies_df[
        (movies_df['Genres'].str.contains(favorite_genre, na=False)) & 
        (~movies_df['MovieID'].isin(watched_ids))
    ]
    return recommendations.head(10).to_dict(orient="records")

# 8. STARTUP COMMAND (THIS WAS MISSING!)
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

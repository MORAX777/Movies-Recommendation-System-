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

# ==========================================
# 4. DATA LOADING (WITH EMERGENCY BACKUP)
# ==========================================
EMERGENCY_MOVIES = [
    {"MovieID": 1, "Title": "Toy Story (1995)", "Genres": "Animation|Children's|Comedy"},
    {"MovieID": 2, "Title": "Jumanji (1995)", "Genres": "Adventure|Children's|Fantasy"},
    {"MovieID": 3, "Title": "Grumpier Old Men (1995)", "Genres": "Comedy|Romance"},
    {"MovieID": 4, "Title": "Waiting to Exhale (1995)", "Genres": "Comedy|Drama"},
    {"MovieID": 5, "Title": "Father of the Bride Part II (1995)", "Genres": "Comedy"},
    {"MovieID": 6, "Title": "Heat (1995)", "Genres": "Action|Crime|Thriller"},
    {"MovieID": 7, "Title": "Sabrina (1995)", "Genres": "Comedy|Romance"},
    {"MovieID": 8, "Title": "Tom and Huck (1995)", "Genres": "Adventure|Children's"},
    {"MovieID": 9, "Title": "Sudden Death (1995)", "Genres": "Action"},
    {"MovieID": 10, "Title": "GoldenEye (1995)", "Genres": "Action|Adventure|Thriller"},
    {"MovieID": 260, "Title": "Star Wars: Episode IV - A New Hope (1977)", "Genres": "Action|Adventure|Sci-Fi"},
    {"MovieID": 1196, "Title": "Star Wars: Episode V - The Empire Strikes Back (1980)", "Genres": "Action|Adventure|Sci-Fi"},
    {"MovieID": 1198, "Title": "Raiders of the Lost Ark (1981)", "Genres": "Action|Adventure"},
    {"MovieID": 2571, "Title": "Matrix, The (1999)", "Genres": "Action|Sci-Fi|Thriller"},
    {"MovieID": 858, "Title": "Godfather, The (1972)", "Genres": "Action|Crime|Drama"}
]

try:
    base_dir = os.path.dirname(os.path.abspath(__file__))
    movies_path = os.path.join(base_dir, "movies.csv")
    
    if os.path.exists(movies_path):
        print(f" Loading movies from: {movies_path}")
        movies_df = pd.read_csv(movies_path, encoding="latin-1")
    else:
        # Check one level up (Render structure fallback)
        movies_path_up = os.path.join(base_dir, "..", "movies.csv")
        if os.path.exists(movies_path_up):
            print(f" Loading movies from root: {movies_path_up}")
            movies_df = pd.read_csv(movies_path_up, encoding="latin-1")
        else:
            print(" CSV NOT FOUND! USING EMERGENCY DATA.")
            movies_df = pd.DataFrame(EMERGENCY_MOVIES)

except Exception as e:
    print(f" Error loading CSV: {e}. USING EMERGENCY DATA.")
    movies_df = pd.DataFrame(EMERGENCY_MOVIES)

# 5. AUTH UTILS
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

# 6. ROUTES
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
    if movies_df.empty:
        return EMERGENCY_MOVIES
    
    results = movies_df
    
    if genre and genre != "All":
        results = results[results['Genres'].str.contains(genre, case=False, na=False)]

    if search:
        results = results[results['Title'].str.contains(search, case=False, na=False)]
    
    return results.head(limit).to_dict(orient="records")

@app.get("/movies/{movie_id}")
def get_movie_detail(movie_id: int):
    movie = movies_df[movies_df['MovieID'] == movie_id]
    if movie.empty:
        # Check emergency data
        fallback = next((m for m in EMERGENCY_MOVIES if m["MovieID"] == movie_id), None)
        return fallback if fallback else {"error": "Movie not found"}
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
    if not movie_row.empty:
        title = movie_row.iloc[0]['Title']
    else:
        # Fallback title from emergency data
        fallback = next((m for m in EMERGENCY_MOVIES if m["MovieID"] == req.movie_id), None)
        title = fallback['Title'] if fallback else "Unknown"

    new_item = Watchlist(user_id=req.user_id, movie_id=req.movie_id, title=title)
    db.add(new_item)
    db.commit()
    return {"message": "Added"}

@app.get("/user/personal/{user_id}")
def get_recommendations(user_id: int, db: Session = Depends(get_db)):
    # Simple random sample from available movies as a basic recommendation
    if movies_df.empty:
        return EMERGENCY_MOVIES[:5]
    return movies_df.sample(n=min(10, len(movies_df))).to_dict(orient="records")

@app.get("/check-users")
def view_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return {"count": len(users), "users": [{"id": u.id, "email": u.email} for u in users]}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

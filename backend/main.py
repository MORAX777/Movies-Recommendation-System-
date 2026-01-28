from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
import pandas as pd
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
# ?? EMBEDDED MOVIE DATABASE (80+ Movies)
# ==========================================
# This data is HARDCODED so it CANNOT be missing.
MOVIE_DATA = [
    {"MovieID": 1, "Title": "Toy Story (1995)", "Genres": "Animation|Children's|Comedy"},
    {"MovieID": 2, "Title": "Jumanji (1995)", "Genres": "Adventure|Children's|Fantasy"},
    {"MovieID": 3, "Title": "Grumpier Old Men (1995)", "Genres": "Comedy|Romance"},
    {"MovieID": 5, "Title": "Father of the Bride Part II (1995)", "Genres": "Comedy"},
    {"MovieID": 6, "Title": "Heat (1995)", "Genres": "Action|Crime|Thriller"},
    {"MovieID": 7, "Title": "Sabrina (1995)", "Genres": "Comedy|Romance"},
    {"MovieID": 10, "Title": "GoldenEye (1995)", "Genres": "Action|Adventure|Thriller"},
    {"MovieID": 11, "Title": "American President, The (1995)", "Genres": "Comedy|Drama|Romance"},
    {"MovieID": 16, "Title": "Casino (1995)", "Genres": "Drama|Thriller"},
    {"MovieID": 17, "Title": "Sense and Sensibility (1995)", "Genres": "Drama|Romance"},
    {"MovieID": 19, "Title": "Ace Ventura: When Nature Calls (1995)", "Genres": "Comedy"},
    {"MovieID": 21, "Title": "Get Shorty (1995)", "Genres": "Action|Comedy|Crime|Drama"},
    {"MovieID": 25, "Title": "Leaving Las Vegas (1995)", "Genres": "Drama|Romance"},
    {"MovieID": 32, "Title": "Twelve Monkeys (1995)", "Genres": "Drama|Sci-Fi"},
    {"MovieID": 34, "Title": "Babe (1995)", "Genres": "Children's|Comedy|Drama"},
    {"MovieID": 39, "Title": "Clueless (1995)", "Genres": "Comedy|Romance"},
    {"MovieID": 47, "Title": "Seven (Se7en) (1995)", "Genres": "Crime|Thriller"},
    {"MovieID": 50, "Title": "Usual Suspects, The (1995)", "Genres": "Crime|Thriller"},
    {"MovieID": 110, "Title": "Braveheart (1995)", "Genres": "Action|Drama|War"},
    {"MovieID": 111, "Title": "Taxi Driver (1976)", "Genres": "Drama|Thriller"},
    {"MovieID": 153, "Title": "Batman Forever (1995)", "Genres": "Action|Adventure|Comedy|Crime"},
    {"MovieID": 161, "Title": "Crimson Tide (1995)", "Genres": "Drama|Thriller|War"},
    {"MovieID": 165, "Title": "Die Hard: With a Vengeance (1995)", "Genres": "Action|Thriller"},
    {"MovieID": 260, "Title": "Star Wars: Episode IV - A New Hope (1977)", "Genres": "Action|Adventure|Sci-Fi"},
    {"MovieID": 293, "Title": "Professional, The (a.k.a. Leon: The Professional) (1994)", "Genres": "Crime|Drama|Romance|Thriller"},
    {"MovieID": 296, "Title": "Pulp Fiction (1994)", "Genres": "Crime|Drama"},
    {"MovieID": 318, "Title": "Shawshank Redemption, The (1994)", "Genres": "Drama"},
    {"MovieID": 356, "Title": "Forrest Gump (1994)", "Genres": "Comedy|Romance|War"},
    {"MovieID": 364, "Title": "Lion King, The (1994)", "Genres": "Animation|Children's|Musical"},
    {"MovieID": 367, "Title": "Mask, The (1994)", "Genres": "Comedy|Crime|Fantasy"},
    {"MovieID": 377, "Title": "Speed (1994)", "Genres": "Action|Romance|Thriller"},
    {"MovieID": 380, "Title": "True Lies (1994)", "Genres": "Action|Adventure|Comedy|Romance"},
    {"MovieID": 457, "Title": "Fugitive, The (1993)", "Genres": "Action|Thriller"},
    {"MovieID": 480, "Title": "Jurassic Park (1993)", "Genres": "Action|Adventure|Sci-Fi"},
    {"MovieID": 527, "Title": "Schindler's List (1993)", "Genres": "Drama|War"},
    {"MovieID": 541, "Title": "Blade Runner (1982)", "Genres": "Film-Noir|Sci-Fi"},
    {"MovieID": 588, "Title": "Aladdin (1992)", "Genres": "Animation|Children's|Comedy|Musical"},
    {"MovieID": 589, "Title": "Terminator 2: Judgment Day (1991)", "Genres": "Action|Sci-Fi|Thriller"},
    {"MovieID": 592, "Title": "Batman (1989)", "Genres": "Action|Adventure|Crime|Drama"},
    {"MovieID": 593, "Title": "Silence of the Lambs, The (1991)", "Genres": "Drama|Thriller"},
    {"MovieID": 595, "Title": "Beauty and the Beast (1991)", "Genres": "Animation|Children's|Musical"},
    {"MovieID": 608, "Title": "Fargo (1996)", "Genres": "Crime|Drama|Thriller"},
    {"MovieID": 780, "Title": "Independence Day (ID4) (1996)", "Genres": "Action|Sci-Fi|War"},
    {"MovieID": 858, "Title": "Godfather, The (1972)", "Genres": "Action|Crime|Drama"},
    {"MovieID": 912, "Title": "Casablanca (1942)", "Genres": "Drama|Romance|War"},
    {"MovieID": 924, "Title": "2001: A Space Odyssey (1968)", "Genres": "Drama|Mystery|Sci-Fi|Thriller"},
    {"MovieID": 1036, "Title": "Die Hard (1988)", "Genres": "Action|Thriller"},
    {"MovieID": 1097, "Title": "E.T. the Extra-Terrestrial (1982)", "Genres": "Children's|Drama|Fantasy|Sci-Fi"},
    {"MovieID": 1193, "Title": "One Flew Over the Cuckoo's Nest (1975)", "Genres": "Drama"},
    {"MovieID": 1196, "Title": "Star Wars: Episode V - The Empire Strikes Back (1980)", "Genres": "Action|Adventure|Sci-Fi"},
    {"MovieID": 1197, "Title": "Princess Bride, The (1987)", "Genres": "Action|Adventure|Comedy|Romance"},
    {"MovieID": 1198, "Title": "Raiders of the Lost Ark (1981)", "Genres": "Action|Adventure"},
    {"MovieID": 1200, "Title": "Aliens (1986)", "Genres": "Action|Sci-Fi|Thriller|War"},
    {"MovieID": 1210, "Title": "Star Wars: Episode VI - Return of the Jedi (1983)", "Genres": "Action|Adventure|Romance|Sci-Fi|War"},
    {"MovieID": 1214, "Title": "Alien (1979)", "Genres": "Action|Horror|Sci-Fi|Thriller"},
    {"MovieID": 1240, "Title": "Terminator, The (1984)", "Genres": "Action|Sci-Fi|Thriller"},
    {"MovieID": 1265, "Title": "Groundhog Day (1993)", "Genres": "Comedy|Romance"},
    {"MovieID": 1270, "Title": "Back to the Future (1985)", "Genres": "Comedy|Sci-Fi"},
    {"MovieID": 1580, "Title": "Men in Black (1997)", "Genres": "Action|Adventure|Comedy|Sci-Fi"},
    {"MovieID": 1704, "Title": "Good Will Hunting (1997)", "Genres": "Drama"},
    {"MovieID": 1721, "Title": "Titanic (1997)", "Genres": "Drama|Romance"},
    {"MovieID": 2028, "Title": "Saving Private Ryan (1998)", "Genres": "Action|Drama|War"},
    {"MovieID": 2329, "Title": "American History X (1998)", "Genres": "Drama"},
    {"MovieID": 2396, "Title": "Shakespeare in Love (1998)", "Genres": "Comedy|Romance"},
    {"MovieID": 2571, "Title": "Matrix, The (1999)", "Genres": "Action|Sci-Fi|Thriller"},
    {"MovieID": 2706, "Title": "American Pie (1999)", "Genres": "Comedy"},
    {"MovieID": 2716, "Title": "Ghostbusters (1984)", "Genres": "Comedy|Horror"},
    {"MovieID": 2762, "Title": "Sixth Sense, The (1999)", "Genres": "Thriller"},
    {"MovieID": 2858, "Title": "American Beauty (1999)", "Genres": "Comedy|Drama"},
    {"MovieID": 2916, "Title": "Total Recall (1990)", "Genres": "Action|Adventure|Sci-Fi|Thriller"},
    {"MovieID": 2959, "Title": "Fight Club (1999)", "Genres": "Drama|Thriller"},
    {"MovieID": 3114, "Title": "Toy Story 2 (1999)", "Genres": "Animation|Children's|Comedy"},
    {"MovieID": 3578, "Title": "Gladiator (2000)", "Genres": "Action|Drama"},
    {"MovieID": 3793, "Title": "X-Men (2000)", "Genres": "Action|Sci-Fi"}
]

# Load into DataFrame directly
movies_df = pd.DataFrame(MOVIE_DATA)
print(f"? LOADED {len(movies_df)} EMBEDDED MOVIES.")

# AUTH UTILS
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# SCHEMAS (NO COMMAS!)
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

# ROUTES
@app.get("/")
def home():
    return {"message": "API Online", "movies_loaded": len(movies_df)}

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
def get_movies(limit: int = 50, search: str = "", genre: str = ""):
    results = movies_df
    if genre and genre != "All":
        results = results[results['Genres'].str.contains(genre, case=False, na=False)]
    if search:
        results = results[results['Title'].str.contains(search, case=False, na=False)]
    return results.head(limit).to_dict(orient="records")

@app.get("/movies/{movie_id}")
def get_movie_detail(movie_id: int):
    movie = movies_df[movies_df['MovieID'] == movie_id]
    if not movie.empty:
        return movie.iloc[0].to_dict()
    return {"error": "Not found"}

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

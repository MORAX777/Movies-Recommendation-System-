from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, Text, desc
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from passlib.context import CryptContext
from collections import Counter
import pandas as pd
import os
import random

# --- DATABASE SETUP ---
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
    history = relationship("History", back_populates="owner")
    watchlist = relationship("Watchlist", back_populates="owner")

class History(Base):
    __tablename__ = "history"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    movie_id = Column(Integer)
    owner = relationship("User", back_populates="history")

class Watchlist(Base):
    __tablename__ = "watchlist"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    movie_id = Column(Integer)
    owner = relationship("User", back_populates="watchlist")

# NEW: Feedback Table
class Feedback(Base):
    __tablename__ = "feedback"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    user_name = Column(String)
    message = Column(Text)

Base.metadata.create_all(bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# --- DATA LOADING ---
movies_df = None
@app.on_event("startup")
def load_data():
    global movies_df
    try:
        movies_df = pd.read_csv("data/movies.dat", sep="::", engine="python", header=None, names=["MovieID", "Title", "Genres"], encoding="latin-1")
        movies_df["Rating"] = movies_df["MovieID"].apply(lambda x: round(random.uniform(6.0, 9.5), 1))
        movies_df["Year"] = movies_df["Title"].str.extract(r"\((\d{4})\)")
    except:
        movies_df = pd.DataFrame()

# --- AUTH ---
class UserAuth(BaseModel):
    email: str; password: str; name: str = None

@app.post("/auth/signup")
def signup(u: UserAuth, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == u.email).first(): raise HTTPException(400, "Email exists")
    user = User(email=u.email, hashed_password=pwd_context.hash(u.password), name=u.name)
    db.add(user); db.commit(); db.refresh(user)
    return {"user": user.name}

@app.post("/auth/login")
def login(u: UserAuth, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == u.email).first()
    if not user or not pwd_context.verify(u.password, user.hashed_password): raise HTTPException(400, "Invalid auth")
    return {"name": user.name, "email": user.email, "id": user.id}

# --- HISTORY & WATCHLIST ROUTES ---
class ActionReq(BaseModel):
    user_id: int
    movie_id: int

@app.post("/user/history")
def add_history(req: ActionReq, db: Session = Depends(get_db)):
    exists = db.query(History).filter(History.user_id == req.user_id, History.movie_id == req.movie_id).first()
    if exists: db.delete(exists); db.commit()
    new_h = History(user_id=req.user_id, movie_id=req.movie_id)
    db.add(new_h); db.commit()
    return {"status": "added"}

@app.get("/user/history/{user_id}")
def get_user_history(user_id: int, db: Session = Depends(get_db)):
    items = db.query(History).filter(History.user_id == user_id).order_by(desc(History.id)).all() # Get ALL for library
    ids = [i.movie_id for i in items]
    result = []
    seen = set()
    for mid in ids:
        if mid in seen: continue
        seen.add(mid)
        row = movies_df[movies_df["MovieID"] == mid]
        if not row.empty: result.append(row.iloc[0].to_dict())
    return result

@app.delete("/user/history/{user_id}/{movie_id}")
def delete_history_item(user_id: int, movie_id: int, db: Session = Depends(get_db)):
    # Delete all instances of this movie in history for this user
    db.query(History).filter(History.user_id == user_id, History.movie_id == movie_id).delete()
    db.commit()
    return {"status": "deleted"}

@app.get("/user/personal/{user_id}")
def get_personal_recs(user_id: int, db: Session = Depends(get_db)):
    history_items = db.query(History).filter(History.user_id == user_id).all()
    watched_ids = [h.movie_id for h in history_items]
    if not watched_ids:
        return movies_df.sort_values(by="Rating", ascending=False).head(10).to_dict(orient="records")
    
    watched_movies = movies_df[movies_df["MovieID"].isin(watched_ids)]
    all_genres = []
    for g in watched_movies["Genres"]: all_genres.extend(g.split("|"))
    most_common = [g[0] for g in Counter(all_genres).most_common(3)]
    
    candidates = movies_df[~movies_df["MovieID"].isin(watched_ids)].copy()
    candidates["Score"] = candidates["Genres"].apply(lambda x: sum(1 for g in most_common if g in x))
    return candidates.sort_values(by=["Score", "Rating"], ascending=False).head(15).to_dict(orient="records")

@app.post("/user/watchlist")
def toggle_watchlist(req: ActionReq, db: Session = Depends(get_db)):
    item = db.query(Watchlist).filter(Watchlist.user_id == req.user_id, Watchlist.movie_id == req.movie_id).first()
    if item: db.delete(item); db.commit(); return {"status": "removed"}
    else: db.add(Watchlist(user_id=req.user_id, movie_id=req.movie_id)); db.commit(); return {"status": "added"}

@app.get("/user/watchlist/{user_id}")
def get_watchlist(user_id: int, db: Session = Depends(get_db)):
    items = db.query(Watchlist).filter(Watchlist.user_id == user_id).all()
    ids = [i.movie_id for i in items]
    result = []
    for mid in ids:
        row = movies_df[movies_df["MovieID"] == mid]
        if not row.empty: result.append(row.iloc[0].to_dict())
    return result

# --- NEW: FEEDBACK ROUTE ---
class FeedbackReq(BaseModel):
    user_id: int
    user_name: str
    message: str

@app.post("/user/feedback")
def submit_feedback(req: FeedbackReq, db: Session = Depends(get_db)):
    fb = Feedback(user_id=req.user_id, user_name=req.user_name, message=req.message)
    db.add(fb); db.commit()
    return {"status": "received"}

# --- MOVIE ROUTES ---
@app.get("/movies")
def get_movies(limit: int = 50, genre: str = None, search: str = None):
    if movies_df is None: return []
    d = movies_df
    if search: d = d[d["Title"].str.contains(search, case=False, na=False)]
    if genre and genre != "All": d = d[d["Genres"].str.contains(genre, case=False, na=False)]
    return d.head(limit).to_dict(orient="records")

@app.get("/movie/{movie_id}")
def get_movie(movie_id: int):
    row = movies_df[movies_df["MovieID"] == movie_id]
    if row.empty: raise HTTPException(404, "Not Found")
    return row.iloc[0].to_dict()

@app.get("/recommend/{movie_id}")
def recommend_similar(movie_id: int):
    target = movies_df[movies_df["MovieID"] == movie_id]
    if target.empty: return []
    genres = target.iloc[0]["Genres"]
    recs = movies_df[(movies_df["Genres"] == genres) & (movies_df["MovieID"] != movie_id)]
    if len(recs) < 3:
        primary = genres.split("|")[0]
        recs = movies_df[movies_df["Genres"].str.contains(primary) & (movies_df["MovieID"] != movie_id)]
    return recs.sort_values(by="Rating", ascending=False).head(10).to_dict(orient="records")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


# ==========================================
# 🛠️ ADMIN DEBUG ROUTE (View All Users)
# ==========================================
@app.get("/check-users")
def view_all_users(db: Session = Depends(get_db)):
    all_users = db.query(User).all()
    return {
        "total_users": len(all_users),
        "users_list": [
            {"id": u.id, "name": u.name, "email": u.email} 
            for u in all_users
        ]
    }

# ==========================================
# ⭐ STAR RATING SYSTEM
# ==========================================
class UserRating(Base):
    __tablename__ = "user_ratings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    movie_id = Column(Integer)
    rating = Column(Integer)

# Create the table
Base.metadata.create_all(bind=engine)

class RatingRequest(BaseModel):
    user_id: int
    movie_id: int
    rating: int

@app.post("/rate")
def rate_movie(req: RatingRequest, db: Session = Depends(get_db)):
    try:
        # Check if user already rated this movie
        existing = db.query(UserRating).filter(UserRating.user_id == req.user_id, UserRating.movie_id == req.movie_id).first()
        
        if existing:
            existing.rating = req.rating # Update existing
        else:
            new_rating = UserRating(user_id=req.user_id, movie_id=req.movie_id, rating=req.rating)
            db.add(new_rating)
            
        db.commit()
        return {"message": "Rating saved!", "rating": req.rating}
    except Exception as e:
        print("Error saving rating:", e)
        raise HTTPException(status_code=500, detail="Failed to save rating")

@app.get("/rate/{user_id}/{movie_id}")
def get_user_rating(user_id: int, movie_id: int, db: Session = Depends(get_db)):
    existing = db.query(UserRating).filter(UserRating.user_id == user_id, UserRating.movie_id == movie_id).first()
    return {"rating": existing.rating if existing else 0}
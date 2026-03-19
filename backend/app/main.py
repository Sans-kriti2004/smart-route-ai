from fastapi import FastAPI
from routing_engine import get_route_coords
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
@app.get("/")
def home():
    return {"message": "Welcome to the Smart Route AI API!"}

@app.get("/route")
def get_route(start: str, end: str, mode: str = "fastest"):
    route = get_route_coords(start, end, mode)
    return {
        "start": start,
        "end": end,
        "mode": mode,
        "route": route
    }
    
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],

)
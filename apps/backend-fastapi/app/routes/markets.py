from fastapi import APIRouter, Depends
from app.auth import get_current_user

router = APIRouter()

@router.get("/markets")
def get_markets(user=Depends(get_current_user)):
    return [
        {
            "id": "1",
            "name": "Mojara Central",
            "location": "CDMX",
        },
        {
            "id": "2",
            "name": "Mercado Norte",
            "location": "Guadalajara",
        },
    ]

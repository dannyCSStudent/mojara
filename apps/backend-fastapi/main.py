from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import markets, vendors, products

app = FastAPI(title="Mojara API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "backend-fastapi",
        "version": "0.1.0"
    }


app.include_router(markets.router)
app.include_router(vendors.router)
app.include_router(products.router)
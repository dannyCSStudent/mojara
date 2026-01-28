from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import markets, vendors, products, orders, prices, admin_prices

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
app.include_router(orders.router)
app.include_router(prices.router)
app.include_router(admin_prices.router, prefix="/admin", tags=["admin"])

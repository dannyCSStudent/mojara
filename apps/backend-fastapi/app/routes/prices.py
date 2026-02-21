# routers/prices.py
from fastapi import APIRouter, Depends, Query
from app.db import get_user_client
from app.auth import get_current_user
from app.schemas.prices import PriceSignalIn, ActivePriceAgreementOut
from app.repositories.prices import get_active_price_agreements
from app.auth import get_current_jwt
from typing import List

router = APIRouter(prefix="/prices", tags=["Prices"])


@router.get("/current")
def get_current_prices(
    market_id: str = Query(...),
    db=Depends(get_user_client),
    user=Depends(get_current_user),
):
    rows = db.execute(
        """
        SELECT
          pa.market_id,
          m.name AS market_name,
          pa.size_band_id,
          sb.name AS size_band,
          pa.reference_price,
          pa.confidence_score,
          pa.sample_count,
          pa.valid_from,
          pa.valid_until
        FROM public.active_price_agreements pa
        JOIN public.markets m ON m.id = pa.market_id
        JOIN public.price_size_bands sb ON sb.id = pa.size_band_id
        WHERE pa.market_id = :market_id
        ORDER BY sb.min_grams
        """,
        {"market_id": market_id},
    ).fetchall()

    return rows

@router.get("/explain")
def explain_prices(
    market_id: str = Query(...),
    db=Depends(get_user_client),
    user=Depends(get_current_user),
):
    return db.execute(
        """
        SELECT *
        FROM public.price_agreement_explain
        WHERE market_id = :market_id
        ORDER BY size_band
        """,
        {"market_id": market_id},
    ).fetchall()


@router.post("/signal")
def submit_price_signal(

    payload: PriceSignalIn,
    db=Depends(get_user_client),
    user=Depends(get_current_user),
):
    db.execute(
        """
        INSERT INTO public.price_signals (
          market_id,
          vendor_id,
          size_band_id,
          price_per_kg,
          expires_at
        )
        VALUES (
          :market_id,
          (
            SELECT id FROM public.vendors
            WHERE user_id = :user_id
            LIMIT 1
          ),
          :size_band_id,
          :price_per_kg,
          now() + interval '3 hours'
        )
        """,
        {
            "market_id": payload.market_id,
            "size_band_id": payload.size_band_id,
            "price_per_kg": payload.price_per_kg,
            "user_id": user["sub"],
        },
    )

    return {"status": "signal_submitted"}


@router.get(
    "/active",
    response_model=List[ActivePriceAgreementOut],
    summary="Get active locked price agreements"
)
def read_active_prices(jwt: str = Depends(get_current_jwt)):
    return get_active_price_agreements(jwt)
"""Asset metadata endpoint."""

from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field

from api.limiter import limiter
from api.security import get_current_user


class AssetOut(BaseModel):
    """Response model for asset metadata."""

    symbol: str = Field(..., description="Asset ticker symbol")
    name: str = Field(..., description="Human-readable asset name")
    type: str = Field(..., description="Normalized asset type (crypto or ngx)")
    asset_type: str = Field(..., description="Backward-compatible asset type (crypto or ngx)")


ASSET_METADATA: List[AssetOut] = [
    AssetOut(symbol="BTC", name="Bitcoin", type="crypto", asset_type="crypto"),
    AssetOut(symbol="ETH", name="Ethereum", type="crypto", asset_type="crypto"),
    AssetOut(symbol="BNB", name="BNB", type="crypto", asset_type="crypto"),
    AssetOut(symbol="SOL", name="Solana", type="crypto", asset_type="crypto"),
    AssetOut(symbol="ADA", name="Cardano", type="crypto", asset_type="crypto"),
    AssetOut(symbol="XRP", name="XRP", type="crypto", asset_type="crypto"),
    AssetOut(symbol="DOGE", name="Dogecoin", type="crypto", asset_type="crypto"),
    AssetOut(symbol="LTC", name="Litecoin", type="crypto", asset_type="crypto"),
    AssetOut(symbol="TRX", name="TRON", type="crypto", asset_type="crypto"),
    AssetOut(symbol="DOT", name="Polkadot", type="crypto", asset_type="crypto"),
    AssetOut(symbol="DANGCEM", name="Dangote Cement", type="ngx", asset_type="ngx"),
    AssetOut(symbol="MTNN", name="MTN Nigeria", type="ngx", asset_type="ngx"),
    AssetOut(symbol="AIRTELAFRI", name="Airtel Africa", type="ngx", asset_type="ngx"),
    AssetOut(symbol="BUACEMENT", name="BUA Cement", type="ngx", asset_type="ngx"),
    AssetOut(symbol="GTCO", name="GTCO", type="ngx", asset_type="ngx"),
    AssetOut(symbol="ZENITHBANK", name="Zenith Bank", type="ngx", asset_type="ngx"),
    AssetOut(symbol="SEPLAT", name="Seplat Energy", type="ngx", asset_type="ngx"),
    AssetOut(symbol="FBNH", name="FBN Holdings", type="ngx", asset_type="ngx"),
    AssetOut(symbol="NB", name="Nigerian Breweries", type="ngx", asset_type="ngx"),
    AssetOut(symbol="ACCESSCORP", name="Access Holdings", type="ngx", asset_type="ngx"),
    AssetOut(symbol="UBA", name="United Bank for Africa", type="ngx", asset_type="ngx"),
    AssetOut(symbol="STANBIC", name="Stanbic IBTC", type="ngx", asset_type="ngx"),
    AssetOut(symbol="FIDELITYBK", name="Fidelity Bank", type="ngx", asset_type="ngx"),
    AssetOut(symbol="FCMB", name="FCMB Group", type="ngx", asset_type="ngx"),
    AssetOut(symbol="UCAP", name="United Capital", type="ngx", asset_type="ngx"),
    AssetOut(symbol="TRANSCORP", name="Transcorp", type="ngx", asset_type="ngx"),
    AssetOut(symbol="OANDO", name="Oando", type="ngx", asset_type="ngx"),
    AssetOut(symbol="PRESCO", name="Presco", type="ngx", asset_type="ngx"),
    AssetOut(symbol="WAPCO", name="Lafarge Africa", type="ngx", asset_type="ngx"),
    AssetOut(symbol="NESTLE", name="Nestle Nigeria", type="ngx", asset_type="ngx"),
    AssetOut(symbol="FLOURMILL", name="Flour Mills", type="ngx", asset_type="ngx"),
    AssetOut(symbol="GUINNESS", name="Guinness Nigeria", type="ngx", asset_type="ngx"),
    AssetOut(symbol="TOTAL", name="TotalEnergies Marketing", type="ngx", asset_type="ngx"),
    AssetOut(symbol="INTBREW", name="International Breweries", type="ngx", asset_type="ngx"),
    AssetOut(symbol="JBERGER", name="Julius Berger", type="ngx", asset_type="ngx"),
]

router = APIRouter(prefix="/api/v1", tags=["assets"])


@router.get("/assets", response_model=List[AssetOut], dependencies=[Depends(get_current_user)])
@limiter.limit("5/second")
def list_assets(request: Request) -> List[AssetOut]:
    """Return the static list of supported assets."""
    return ASSET_METADATA

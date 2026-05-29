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
]

router = APIRouter(prefix="/api/v1", tags=["assets"])


@router.get("/assets", response_model=List[AssetOut], dependencies=[Depends(get_current_user)])
@limiter.limit("5/second")
def list_assets(request: Request) -> List[AssetOut]:
    """Return the static list of supported assets."""
    return ASSET_METADATA

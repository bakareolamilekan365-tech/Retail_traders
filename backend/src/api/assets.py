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
    asset_type: str = Field(..., description="Asset type (crypto or stock)")


ASSET_METADATA: List[AssetOut] = [
    AssetOut(symbol="BTC", name="Bitcoin", asset_type="crypto"),
    AssetOut(symbol="ETH", name="Ethereum", asset_type="crypto"),
    AssetOut(symbol="BNB", name="BNB", asset_type="crypto"),
    AssetOut(symbol="SOL", name="Solana", asset_type="crypto"),
    AssetOut(symbol="ADA", name="Cardano", asset_type="crypto"),
    AssetOut(symbol="DANGCEM", name="Dangote Cement", asset_type="stock"),
    AssetOut(symbol="MTNN", name="MTN Nigeria", asset_type="stock"),
    AssetOut(symbol="AIRTELAFRI", name="Airtel Africa", asset_type="stock"),
    AssetOut(symbol="BUACEMENT", name="BUA Cement", asset_type="stock"),
    AssetOut(symbol="GTCO", name="GTCO", asset_type="stock"),
    AssetOut(symbol="ZENITHBANK", name="Zenith Bank", asset_type="stock"),
    AssetOut(symbol="SEPLAT", name="Seplat Energy", asset_type="stock"),
    AssetOut(symbol="FBNH", name="FBN Holdings", asset_type="stock"),
    AssetOut(symbol="NB", name="Nigerian Breweries", asset_type="stock"),
    AssetOut(symbol="ACCESSCORP", name="Access Holdings", asset_type="stock"),
]

router = APIRouter(prefix="/api/v1", tags=["assets"])


@router.get("/assets", response_model=List[AssetOut], dependencies=[Depends(get_current_user)])
@limiter.limit("5/second")
def list_assets(request: Request) -> List[AssetOut]:
    """Return the static list of supported assets."""
    return ASSET_METADATA

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import logic
import logging

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error", "details": str(exc)},
    )

class VRCRequest(BaseModel):
    data: str
    even_parity: bool = True

class LRCRequest(BaseModel):
    data_blocks: List[str]
    even_parity: bool = True

class CRCRequest(BaseModel):
    data: str
    divisor: str

class ChecksumRequest(BaseModel):
    data: str
    block_size: int = 8

class HammingRequest(BaseModel):
    data: str

@app.get("/")
def read_root():
    return {"message": "Error Detection API is running"}

@app.post("/api/vrc")
def get_vrc(req: VRCRequest):
    try:
        # Basic validation
        if not all(c in '01' for c in req.data):
             raise ValueError("Input must be binary (0s and 1s only)")
        return logic.calculate_vrc(req.data, req.even_parity)
    except Exception as e:
        logger.error(f"VRC Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/lrc")
def get_lrc(req: LRCRequest):
    try:
        if not req.data_blocks:
             raise ValueError("No data blocks provided")
        for block in req.data_blocks:
             if not all(c in '01' for c in block):
                 raise ValueError(f"Block '{block}' must be binary")
        return logic.calculate_lrc(req.data_blocks, req.even_parity)
    except Exception as e:
        logger.error(f"LRC Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/crc")
def get_crc(req: CRCRequest):
    try:
        if not all(c in '01' for c in req.data) or not all(c in '01' for c in req.divisor):
            raise ValueError("Data and Divisor must be binary")
        return logic.calculate_crc(req.data, req.divisor)
    except Exception as e:
        logger.error(f"CRC Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/checksum")
def get_checksum(req: ChecksumRequest):
    try:
        if not all(c in '01' for c in req.data):
             raise ValueError("Input must be binary")
        return logic.calculate_checksum(req.data, req.block_size)
    except Exception as e:
        logger.error(f"Checksum Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/hamming")
def get_hamming(req: HammingRequest):
    try:
        if not all(c in '01' for c in req.data):
             raise ValueError("Input must be binary")
        return logic.hamming_encode(req.data)
        # Actually logic.py has `hamming_encode`. Let me fix that name below.
    except Exception as e:
        logger.error(f"Hamming Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

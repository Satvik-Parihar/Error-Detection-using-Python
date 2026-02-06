from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import logic

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    return logic.calculate_vrc(req.data, req.even_parity)

@app.post("/api/lrc")
def get_lrc(req: LRCRequest):
    return logic.calculate_lrc(req.data_blocks, req.even_parity)

@app.post("/api/crc")
def get_crc(req: CRCRequest):
    return logic.calculate_crc(req.data, req.divisor)

@app.post("/api/checksum")
def get_checksum(req: ChecksumRequest):
    try:
        return logic.calculate_checksum(req.data, req.block_size)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/hamming")
def get_hamming(req: HammingRequest):
    return logic.hamming_encode(req.data)

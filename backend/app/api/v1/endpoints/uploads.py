"""File upload endpoints."""

import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from typing import Any

from app.api.v1.deps import require_roles
from app.models.user import User
from app.config import settings

router = APIRouter()

# Allow common image extensions
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

def get_file_extension(filename: str) -> str:
    if "." not in filename:
        return ""
    return filename.rsplit(".", 1)[1].lower()

@router.post("/products/images", response_model=list[str], status_code=status.HTTP_201_CREATED)
async def upload_product_images(
    files: list[UploadFile] = File(...),
    current_user: User = Depends(require_roles(["SUPER_ADMIN", "PRODUCT_ADMIN"])),
) -> Any:
    """Upload multiple product images."""
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
        
    urls = []
    
    # Create directory if it doesn't exist
    # Use absolute or relative path that maps to static mount
    upload_dir = os.path.join(os.getcwd(), "uploads", "products")
    os.makedirs(upload_dir, exist_ok=True)
    
    for file in files:
        ext = get_file_extension(file.filename or "")
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400, 
                detail=f"File extension '{ext}' not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
            )
            
        # File size check - reading chunks
        # In a real app we might use SpooledTemporaryFile size or just check size as we read
        file.file.seek(0, 2) # go to end
        size = file.file.tell() # get size
        file.file.seek(0) # go back to start
        
        if size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File {file.filename} exceeds maximum size of 5MB"
            )
            
        # Generate unique filename
        new_filename = f"{uuid.uuid4().hex}.{ext}"
        file_path = os.path.join(upload_dir, new_filename)
        
        # Save file asynchronously using shutil
        with open(file_path, 'wb') as out_file:
            import shutil
            shutil.copyfileobj(file.file, out_file)
            
        # Add to urls list (the relative path from the server root)
        urls.append(f"/uploads/products/{new_filename}")
        
    return urls

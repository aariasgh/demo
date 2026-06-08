"""Lead CRUD endpoints for the Mini CRM API"""

import logging
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select

from app.database import get_db
from app.models.lead import Lead
from app.models.audit import LeadAuditLog
from app.schemas.lead import LeadCreate, LeadResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/leads", tags=["leads"])


@router.post("", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
async def create_lead(
    lead_data: LeadCreate,
    db: AsyncSession = Depends(get_db),
) -> LeadResponse:
    """
    Create a new lead with complete validation and audit trail.
    
    - Validates all input fields (name, company, email, phone, notes)
    - Checks for email uniqueness in the database
    - Creates lead and audit log in a single atomic transaction
    - Returns 201 Created with full lead details including timestamps
    
    **Raises:**
        HTTPException 400: Validation error (handled by Pydantic)
        HTTPException 409: Email already exists in the database
        HTTPException 500: Unexpected database error
    
    **Example request:**
    ```json
    {
        "name": "Juan García",
        "company": "TechCorp SL",
        "email": "juan@techcorp.com",
        "phone": "+34917777777",
        "notes": "Lead muy interesado"
    }
    ```
    
    **Example response (201 Created):**
    ```json
    {
        "id": 1,
        "name": "Juan García",
        "company": "TechCorp SL",
        "email": "juan@techcorp.com",
        "phone": "+34917777777",
        "status": "Nuevo",
        "notes": "Lead muy interesado",
        "created_at": "2026-06-08T14:30:45.123000",
        "updated_at": "2026-06-08T14:30:45.123000"
    }
    ```
    """
    
    try:
        # Step 1: Check email uniqueness BEFORE creating lead
        # Pre-check provides better error message than IntegrityError
        stmt = select(Lead).where(Lead.email == lead_data.email)
        result = await db.execute(stmt)
        existing_lead = result.scalars().first()
        
        if existing_lead:
            logger.warning(
                f"Attempted duplicate email creation",
                extra={
                    "email": lead_data.email,
                    "existing_lead_id": existing_lead.id,
                }
            )
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email ya existe en el sistema",
                headers={"X-Error-Code": "EMAIL_DUPLICATE"},
            )
        
        # Step 2: Create new lead with timestamps
        now = datetime.now(timezone.utc)
        new_lead = Lead(
            name=lead_data.name,
            company=lead_data.company,
            email=lead_data.email,
            phone=lead_data.phone,
            status="Nuevo",  # Always default status for new leads
            notes=lead_data.notes,
            created_at=now,
            updated_at=now,
        )
        
        db.add(new_lead)
        await db.flush()  # Get the auto-generated ID without committing
        
        # Step 3: Create audit log entry in same transaction
        # Captures complete lead data for audit trail
        audit_log = LeadAuditLog(
            lead_id=new_lead.id,
            event_type="CREATED",
            old_value=None,  # No previous value for creation
            new_value={
                "name": new_lead.name,
                "company": new_lead.company,
                "email": new_lead.email,
                "phone": new_lead.phone,
                "status": new_lead.status,
                "notes": new_lead.notes,
            },
            description=f"Lead created: {new_lead.name} from {new_lead.company}",
            created_by_id=None,  # Future: from authentication context
            meta={"ip_address": None, "user_agent": None},  # Future: from request context
        )
        
        db.add(audit_log)
        
        # Step 4: Commit transaction (atomic: both lead and audit log succeed or both rollback)
        await db.commit()
        
        # Step 5: Refresh to ensure all fields are populated from DB
        await db.refresh(new_lead)
        
        logger.info(
            f"Lead created successfully",
            extra={
                "lead_id": new_lead.id,
                "email": new_lead.email,
                "name": new_lead.name,
                "company": new_lead.company,
            }
        )
        
        return new_lead
        
    except IntegrityError as e:
        # Fallback catch for database constraint violations
        # Should be rare due to pre-check, but defensive programming
        await db.rollback()
        logger.error(
            f"Database integrity error during lead creation",
            extra={"error": str(e), "email": lead_data.email},
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email ya existe en el sistema",
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions (email duplicate, etc)
        raise
        
    except Exception as e:
        # Catch unexpected errors
        await db.rollback()
        logger.error(
            f"Unexpected error creating lead",
            extra={"error": str(e), "email": lead_data.email},
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al crear el lead",
        )

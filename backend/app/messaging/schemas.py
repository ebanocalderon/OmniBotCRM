from pydantic import BaseModel, Field, UUID4
from typing import Optional, List, Dict, Any
from datetime import datetime

class InboxBase(BaseModel):
    name: str = Field(..., max_length=255)
    channel_type: str = Field(..., max_length=50)
    active: bool = True
    channel_config: Optional[Dict[str, Any]] = Field(default_factory=dict)
    chatwoot_inbox_id: Optional[int] = None

class InboxCreate(InboxBase):
    pass

class InboxUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    active: Optional[bool] = None
    channel_config: Optional[Dict[str, Any]] = None

class InboxResponse(InboxBase):
    id: UUID4
    tenant_id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ConversationBase(BaseModel):
    contact_id: UUID4
    inbox_id: UUID4
    status: str = Field(default="open", max_length=20)
    priority: Optional[str] = Field(None, max_length=20)
    chatwoot_conversation_id: Optional[int] = None
    custom_data: Optional[Dict[str, Any]] = Field(default_factory=dict)
    assigned_agent_id: Optional[UUID4] = None

class ConversationCreate(ConversationBase):
    pass

class ConversationUpdate(BaseModel):
    status: Optional[str] = Field(None, max_length=20)
    priority: Optional[str] = Field(None, max_length=20)
    assigned_agent_id: Optional[UUID4] = None

class ConversationResponse(ConversationBase):
    id: UUID4
    tenant_id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MessageBase(BaseModel):
    conversation_id: UUID4
    sender_type: str = Field(..., max_length=20) # contact | agent | ai_agent | system
    sender_id: Optional[UUID4] = None
    content: Optional[str] = None
    content_type: str = Field(default="text", max_length=30)
    source: str = Field(default="platform", max_length=30)
    private: bool = False
    custom_data: Optional[Dict[str, Any]] = Field(default_factory=dict)
    channel_metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    chatwoot_message_id: Optional[int] = None

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: UUID4
    tenant_id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

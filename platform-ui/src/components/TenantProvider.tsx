"use client";

import React, { createContext, useContext, useState } from "react";

// For development, we use a hardcoded default tenant ID
// In production, this would be fetched from auth/session
const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000000";

interface TenantContextType {
  tenantId: string;
  setTenantId: (id: string) => void;
}

const TenantContext = createContext<TenantContextType>({
  tenantId: DEFAULT_TENANT_ID,
  setTenantId: () => {},
});

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenantId, setTenantId] = useState(DEFAULT_TENANT_ID);

  return (
    <TenantContext.Provider value={{ tenantId, setTenantId }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
}

/**
 * Custom hook to wrap fetch calls and automatically inject the tenant ID header
 */
export function useApi() {
  const { tenantId } = useTenant();

  const apiFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers || {});
    
    // Always append the Tenant ID to the headers for multi-tenant isolation
    if (tenantId) {
      headers.set("X-Tenant-ID", tenantId);
    }
    
    // Ensure content-type is json if body is provided and not already set
    if (init?.body && typeof init.body === "string" && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    return fetch(input, {
      ...init,
      headers,
    });
  };

  return { apiFetch };
}

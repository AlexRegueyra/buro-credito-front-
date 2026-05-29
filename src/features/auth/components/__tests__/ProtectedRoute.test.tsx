import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { useAuth } from "../../hooks/useAuth";
import { ProtectedRoute } from "../ProtectedRoute";

vi.mock("../../hooks/useAuth");
const mockUseAuth = vi.mocked(useAuth);

describe("ProtectedRoute", () => {
  const ChildComponent = () => <div>Protected Content</div>;

  const baseAuthMock = {
    user: null,
    isAuthenticated: false,
    isLoading: false,

    initialize: vi.fn().mockResolvedValue(undefined),
    login: vi.fn(),
    logout: vi.fn().mockResolvedValue(undefined),
    checkSession: vi.fn().mockResolvedValue(false),

    hasPermission: vi.fn(() => true),
    hasRole: vi.fn(() => true),
    hasAnyPermission: vi.fn(() => true),
    hasAllPermissions: vi.fn(() => true),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render children when user is authenticated", () => {
    mockUseAuth.mockReturnValue({
      ...baseAuthMock,
      isAuthenticated: true,
      user: {
        usrId: "1",
        usrNombre: "Test User",
        usrEmail: "test@test.com",
        usrEstatus: "A",
        rolId: "admin",
      },
    });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <ChildComponent />
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("should redirect when user is not authenticated", () => {
    mockUseAuth.mockReturnValue({
      ...baseAuthMock,
      isAuthenticated: false,
      user: null,
    });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <ChildComponent />
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("should show access denied when user lacks required role", () => {
    mockUseAuth.mockReturnValue({
      ...baseAuthMock,
      isAuthenticated: true,
      user: {
        usrId: "1",
        usrNombre: "Test User",
        usrEmail: "test@test.com",
        usrEstatus: "A",
        rolId: "user",
      },
      hasRole: vi.fn(() => false),
    });

    render(
      <BrowserRouter>
        <ProtectedRoute requiredRole="admin">
          <ChildComponent />
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText("Acceso Denegado")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("should render children when user has required role", () => {
    mockUseAuth.mockReturnValue({
      ...baseAuthMock,
      isAuthenticated: true,
      user: {
        usrId: "1",
        usrNombre: "Test User",
        usrEmail: "test@test.com",
        usrEstatus: "A",
        rolId: "admin",
      },
      hasRole: vi.fn(() => true),
    });

    render(
      <BrowserRouter>
        <ProtectedRoute requiredRole="admin">
          <ChildComponent />
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("should show access denied when user lacks required permissions", () => {
    mockUseAuth.mockReturnValue({
      ...baseAuthMock,
      isAuthenticated: true,
      user: {
        usrId: "1",
        usrNombre: "Test User",
        usrEmail: "test@test.com",
        usrEstatus: "A",
        rolId: "user",
      },
      hasAnyPermission: vi.fn(() => false),
      hasAllPermissions: vi.fn(() => false),
    });

    render(
      <BrowserRouter>
        <ProtectedRoute requiredPermissions={["users.delete"]}>
          <ChildComponent />
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText("Acceso Denegado")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("should render children when user has required permissions", () => {
    mockUseAuth.mockReturnValue({
      ...baseAuthMock,
      isAuthenticated: true,
      user: {
        usrId: "1",
        usrNombre: "Test User",
        usrEmail: "test@test.com",
        usrEstatus: "A",
        rolId: "admin",
        permissions: ["users.delete"],
      },
      hasAnyPermission: vi.fn(() => true),
      hasAllPermissions: vi.fn(() => true),
    });

    render(
      <BrowserRouter>
        <ProtectedRoute requiredPermissions={["users.delete"]}>
          <ChildComponent />
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});

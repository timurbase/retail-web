/**
 * RetailFlow API — single import surface.
 *
 *   import { products, documents, supplierPortal, ApiError } from "@/lib/api";
 *
 * All resource methods are server-only. Client components must invoke them
 * through Server Actions in `lib/actions/*`.
 */

export { apiFetch, type ApiInit, type Json } from "./client";
export { ApiError, type ApiErrorBody } from "./errors";

export { auth } from "./resources/auth";
export type {
  AuthUser,
  Membership,
  SendOtpResponse,
  VerifyOtpResponse,
  RegisterStoreInput,
  MeResponse,
} from "./resources/auth";

export { company } from "./resources/company";
export { users } from "./resources/users";
export type { UserInviteInput, UserPatch, UsersListResult } from "./resources/users";

export { suppliers } from "./resources/suppliers";
export type {
  SuppliersListParams,
  SuppliersListResult,
  SupplierCreateInput,
  SupplierPatch,
  StirLookupResult,
} from "./resources/suppliers";

export { products } from "./resources/products";
export type {
  ProductsListParams,
  ProductsListResult,
  ProductCreateInput,
  ProductPatch,
  ProductStats,
  StockAdjustInput,
  StockAdjustKind,
} from "./resources/products";

export { documents } from "./resources/documents";
export type {
  DocumentsListParams,
  DocumentsListResult,
  ManualDocInput,
  ManualDocRowInput,
  DocumentStats,
} from "./resources/documents";

export { audit } from "./resources/audit";
export type { AuditListParams, AuditListResult } from "./resources/audit";

export { supplierPortal } from "./resources/supplier-portal";
export type {
  SupplierStoresListParams,
  SupplierStoreCreateInput,
  SupplierStorePatch,
  SupplierProductsListParams,
  SupplierProductCreateInput,
  SupplierProductPatch,
  InvoicesListParams,
  CreateInvoiceInput,
  OrdersListParams,
  PaymentsListParams,
  AgingBucket,
  DemandSignalsListParams,
  DemandSignalCreateInput,
  DemandSignalPatch,
  RoutesListParams,
  RouteCreateInput,
  RoutePatch,
  SupplierKpiDashboard,
  SupplierInsights,
} from "./resources/supplier-portal";

export type { AuthClaims } from "./auth-cookies";

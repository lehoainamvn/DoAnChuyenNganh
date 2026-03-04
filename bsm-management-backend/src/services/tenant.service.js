import {
  findTenantByEmail,
  createTenant,
  assignTenantToRoom,
  getTenantDashboardRepo,
  getLatestInvoiceRepo,
  getTenantNotificationsRepo,
} from "../repositories/tenant.repo.js";

import { getInvoiceDetailByTenantId } 
from "../repositories/invoice.repo.js";

import sql, { poolPromise } from "../config/db.js";

import { getTenantStatisticsRepo } 
from "../repositories/invoice.repo.js";

export async function getTenantStatisticsService(tenantId) {
  const rows = await getTenantStatisticsRepo(tenantId);

  return {
    electric: rows.map(r => ({
      month: r.month,
      used: r.electric_used
    })),
    water: rows.map(r => ({
      month: r.month,
      used: r.water_used
    }))
  };
}
export function getTenantInvoiceDetailService(tenantId, invoiceId) {
  return getInvoiceDetailByTenantId(tenantId, invoiceId);
}
/* ===============================
   GÁN NGƯỜI THUÊ
================================ */
export async function assignTenantService(roomId, payload) {
  let tenantId;

  // ===== ĐÃ CÓ TÀI KHOẢN =====
  if (payload.tenantType === "EXISTING") {
    const tenant = await findTenantByEmail(payload.email);
    if (!tenant) {
      throw new Error("Không tìm thấy người thuê");
    }
    tenantId = tenant.id;
  }

  // ===== CHƯA CÓ TÀI KHOẢN =====
  if (payload.tenantType === "NEW") {
    if (!payload.name || !payload.email) {
      throw new Error("Thiếu thông tin người thuê");
    }

    // Kiểm tra email đã tồn tại - nếu có thì dùng người đó
    const existingTenant = await findTenantByEmail(payload.email);
    if (existingTenant) {
      tenantId = existingTenant.id;
    } else {
      // Email chưa tồn tại - tạo mới
      tenantId = await createTenant({
        name: payload.name,
        email: payload.email,
        phone: payload.phone
      });
    }
  }

  await assignTenantToRoom(roomId, tenantId, payload.start_date);
}

/* ===============================
   TÌM NGƯỜI THUÊ THEO EMAIL
================================ */
export async function findTenantByEmailService(email) {
  const tenant = await findTenantByEmail(email);
  if (!tenant) {
    throw new Error("Không tìm thấy người thuê");
  }
  return tenant;
}

/* ===============================
   TRẢ PHÒNG
================================ */
export async function removeTenantFromRoomService(ownerId, roomId) {
  const pool = await poolPromise;

  const currentTenant = await pool.request()
    .input("room_id", sql.Int, roomId)
    .query(`
      SELECT TOP 1 *
      FROM tenant_rooms
      WHERE room_id = @room_id
        AND end_date IS NULL
    `);

  if (currentTenant.recordset.length === 0) {
    throw new Error("Phòng này không có người thuê");
  }

  await pool.request()
    .input("room_id", sql.Int, roomId)
    .query(`
      UPDATE tenant_rooms
      SET end_date = GETDATE()
      WHERE room_id = @room_id
        AND end_date IS NULL
    `);

  await pool.request()
    .input("room_id", sql.Int, roomId)
    .input("owner_id", sql.Int, ownerId)
    .query(`
      UPDATE rooms
      SET status = 'EMPTY'
      WHERE id = @room_id
        AND owner_id = @owner_id
    `);
}
/* ===============================
   DASHBOARD TENANT
================================ */
export async function getTenantDashboardService(tenantId) {
  const dashboard = await getTenantDashboardRepo(tenantId);

  if (!dashboard) {
    throw new Error("Tenant chưa được gán phòng");
  }

  const latestInvoice = await getLatestInvoiceRepo(tenantId);
  const notifications = await getTenantNotificationsRepo(tenantId);

  return {
    profile: {
      id: dashboard.tenant_id,
      name: dashboard.tenant_name,
      email: dashboard.email,
      phone: dashboard.phone
    },
    room: {
      id: dashboard.room_id,
      name: dashboard.room_name,
      price: dashboard.room_price,
      electric_price: dashboard.electric_price,
      water_type: dashboard.water_type,
      water_price: dashboard.water_price,
      water_price_per_person: dashboard.water_price_per_person,
      people_count: dashboard.people_count,
      status: dashboard.status
    },
    house: {
      id: dashboard.house_id,
      name: dashboard.house_name,
      address: dashboard.address
    },
    latest_invoice: latestInvoice || null,
    notifications
  };
}
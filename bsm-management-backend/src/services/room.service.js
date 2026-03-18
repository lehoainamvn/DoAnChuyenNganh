import {
  getRoomsByHouse,
  getRoomById,
  updateRoom,
  createRoom,
  getCurrentTenantByRoom,
  deleteRoom
} from "../repositories/room.repo.js";

import sql, { poolPromise } from "../config/db.js";

export async function deleteRoomService(ownerId, roomId) {
  const pool = await poolPromise;

  // Kiểm tra hóa đơn chưa thanh toán
  const unpaidInvoices = await pool.request()
    .input("room_id", sql.Int, roomId)
    .query(`
      SELECT COUNT(*) as count
      FROM invoices
      WHERE room_id = @room_id
        AND status != 'PAID'
    `);

  if (unpaidInvoices.recordset[0].count > 0) {
    throw new Error("Không thể xóa phòng vì còn hóa đơn chưa thanh toán");
  }

  const success = await deleteRoom(ownerId, roomId);
  if (!success) {
    throw new Error("Không thể xóa phòng (có thể đang có người thuê)");
  }
}
export async function createRoomService(ownerId, data) {
  if (!data.room_name) {
    throw new Error("Thiếu tên phòng");
  }

  const pool = await poolPromise;

  // Kiểm tra tên phòng trùng trong cùng nhà
  const existingRoom = await pool.request()
    .input("owner_id", sql.Int, ownerId)
    .input("house_id", sql.Int, Number(data.house_id))
    .input("room_name", sql.NVarChar(50), data.room_name.trim())
    .query(`
      SELECT COUNT(*) as count
      FROM rooms
      WHERE owner_id = @owner_id
        AND house_id = @house_id
        AND room_name = @room_name
    `);

  if (existingRoom.recordset[0].count > 0) {
    throw new Error("Tên phòng đã tồn tại trong nhà này");
  }

  return createRoom(ownerId, data);
}
/* =========================
   DANH SÁCH PHÒNG
========================= */
export async function getRoomsByHouseService(ownerId, houseId) {
  return getRoomsByHouse(ownerId, houseId);
}

/* =========================
   CHI TIẾT PHÒNG + NGƯỜI THUÊ
========================= */
export async function getRoomDetailService(ownerId, roomId) {
  const room = await getRoomById(ownerId, roomId);
  if (!room) {
    throw new Error("Không tìm thấy phòng");
  }

  const tenant = await getCurrentTenantByRoom(roomId);

  return {
    ...room,
    tenant
  };
}

/* =========================
   UPDATE PHÒNG
========================= */
export async function updateRoomService(ownerId, roomId, data) {
  return updateRoom(ownerId, roomId, data);
}

import { assignTenantToRoomRepo } from "../repositories/room.repo.js";

export async function assignTenantService(ownerId, roomId, tenantId) {
  await assignTenantToRoomRepo(ownerId, roomId, tenantId);
}
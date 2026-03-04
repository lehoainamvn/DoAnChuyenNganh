import { getMessagesByRoom, sendMessageRepo, getOwnerRooms } from "../repositories/message.repo.js";

export function getMessagesService(roomId) {
  return getMessagesByRoom(roomId);
}

export function getOwnerRoomsService(ownerId) {
  return getOwnerRooms(ownerId);
}
export async function sendMessageService(data) {
  if (!data.content) {
    throw new Error("Tin nhắn trống");
  }

  await sendMessageRepo(data);
}
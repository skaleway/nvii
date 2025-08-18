import { AuthUser } from "@/types/auth";
import { db } from "@nvii/db";

export async function validateCliAuth(
  headers: Headers,
): Promise<AuthUser | null> {
  const userId = headers.get("X-User-Id");
  const deviceId = headers.get("X-Device-Id");
  const authCode = headers.get("X-Auth-Code");

  if (!userId || !deviceId || !authCode) {
    return null;
  }

  // Verify the device exists and belongs to the user
  const device = await db.device.findFirst({
    where: {
      userId,
      id: deviceId,
      code: authCode,
    },
  });

  if (!device) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user as AuthUser | null;
}

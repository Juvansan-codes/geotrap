import { timingSafeEqual } from "node:crypto";
import { sql } from "@vercel/postgres";

function hasValidSecret(request) {
  const configuredSecret = process.env.ADMIN_SECRET;
  const providedSecret = request.headers["x-admin-secret"];

  if (!configuredSecret || typeof providedSecret !== "string") {
    return false;
  }

  const configured = Buffer.from(configuredSecret);
  const provided = Buffer.from(providedSecret);

  return (
    configured.length === provided.length &&
    timingSafeEqual(configured, provided)
  );
}

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed." });
  }

  if (!hasValidSecret(request)) {
    return response.status(401).json({ error: "Unauthorized." });
  }

  try {
    const result = await sql`
      SELECT id, latitude, longitude, accuracy, created_at
      FROM locations
      WHERE created_at > NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC
    `;
    return response.status(200).json({ locations: result.rows });
  } catch (error) {
    console.error("Unable to read locations.", error);
    return response.status(500).json({ error: "Unable to read locations." });
  }
}

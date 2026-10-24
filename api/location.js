import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.POSTGRES_URL);

const schema = `
  CREATE TABLE IF NOT EXISTS locations (
    id BIGSERIAL PRIMARY KEY,
    latitude DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    accuracy DOUBLE PRECISION NOT NULL CHECK (accuracy >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed." });
  }

  const { latitude, longitude, accuracy } = request.body || {};

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    !Number.isFinite(accuracy) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180 ||
    accuracy < 0
  ) {
    return response.status(400).json({ error: "Invalid location data." });
  }

  try {
    await sql.query(schema);
    await sql`
      INSERT INTO locations (latitude, longitude, accuracy)
      VALUES (${latitude}, ${longitude}, ${accuracy})
    `;
    return response.status(201).json({ saved: true });
  } catch (error) {
    console.error("Unable to save location.", error);
    return response.status(500).json({ error: "Unable to save location." });
  }
}

import type { Db } from "mongodb";

const OBSERVATION_TYPES_COLLECTION = "observationtypes";
const STALE_NORMALIZED_NAME_INDEX = "projectId_1_normalizedName_1";
const CURRENT_NAME_INDEX = "projectId_1_name_1";

export async function migrateObservationTypeIndexes(db: Db) {
  const collection = db.collection(OBSERVATION_TYPES_COLLECTION);
  let indexes: Array<{ name?: string }> = [];

  try {
    indexes = await collection.listIndexes().toArray();
  } catch (error: any) {
    // A fresh database may not have the collection yet; createIndex below creates it.
    if (error?.code !== 26 && error?.codeName !== "NamespaceNotFound") throw error;
  }

  if (indexes.some(index => index.name === STALE_NORMALIZED_NAME_INDEX)) {
    try {
      await collection.dropIndex(STALE_NORMALIZED_NAME_INDEX);
      console.log(`Dropped stale MongoDB index ${STALE_NORMALIZED_NAME_INDEX}`);
    } catch (error: any) {
      // Another serverless cold start may have removed it after our inspection.
      if (error?.code !== 27 && error?.codeName !== "IndexNotFound") throw error;
    }
  }

  // createIndex is idempotent when the existing index has the same definition.
  await collection.createIndex(
    { projectId: 1, name: 1 },
    {
      name: CURRENT_NAME_INDEX,
      unique: true,
      collation: { locale: "en", strength: 2 },
    },
  );
}

export async function runStartupMigrations(db: Db) {
  await migrateObservationTypeIndexes(db);
}

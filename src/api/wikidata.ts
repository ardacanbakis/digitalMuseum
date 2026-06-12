import { cacheGet, cacheSet } from "./cache";
import { chunk, fetchJson } from "./http";

const API = "https://www.wikidata.org/w/api.php";
const BATCH_SIZE = 50; // wbgetentities limit for anonymous requests

// Properties we read from each artwork entity
const P_IMAGE = "P18";
const P_CREATOR = "P170";
const P_INCEPTION = "P571";
const P_MATERIAL = "P186";
const P_HEIGHT = "P2048";
const P_WIDTH = "P2049";
const P_COLLECTION = "P195";
const P_LOCATION = "P276";
const P_MOVEMENT = "P135";

/** Raw structured facts for one entity; linked entities still as Q-IDs. */
export interface WikidataFacts {
  imageFilename?: string;
  creatorIds: string[];
  /** Display year, e.g. "1872" or "c. 1500". */
  inceptionYear?: string;
  materialIds: string[];
  heightCm?: number;
  widthCm?: number;
  collectionIds: string[];
  locationIds: string[];
  movementIds: string[];
}

// --- minimal wbgetentities response types -------------------------------

interface Snak {
  snaktype: string;
  datavalue?: {
    type: string;
    value: unknown;
  };
}

interface Claim {
  mainsnak: Snak;
  rank: "preferred" | "normal" | "deprecated";
}

interface Entity {
  id: string;
  claims?: Record<string, Claim[]>;
  labels?: Record<string, { value: string }>;
}

interface EntitiesResponse {
  entities?: Record<string, Entity>;
}

// --- claim value extraction ----------------------------------------------

/** Best claims for a property: preferred rank if present, else normal. */
function bestClaims(entity: Entity, pid: string): Claim[] {
  const claims = (entity.claims?.[pid] ?? []).filter(
    (c) => c.rank !== "deprecated" && c.mainsnak.snaktype === "value",
  );
  const preferred = claims.filter((c) => c.rank === "preferred");
  return preferred.length > 0 ? preferred : claims;
}

function entityIdValues(entity: Entity, pid: string): string[] {
  return bestClaims(entity, pid)
    .map((c) => {
      const v = c.mainsnak.datavalue?.value as { id?: string } | undefined;
      return v?.id;
    })
    .filter((id): id is string => typeof id === "string");
}

function stringValue(entity: Entity, pid: string): string | undefined {
  const v = bestClaims(entity, pid)[0]?.mainsnak.datavalue?.value;
  return typeof v === "string" ? v : undefined;
}

function yearValue(entity: Entity, pid: string): string | undefined {
  const v = bestClaims(entity, pid)[0]?.mainsnak.datavalue?.value as
    | { time?: string; precision?: number }
    | undefined;
  const match = v?.time?.match(/^([+-])(\d+)/);
  if (!match) return undefined;
  const year = parseInt(match[2], 10) * (match[1] === "-" ? -1 : 1);
  const display = year < 0 ? `${-year} BC` : String(year);
  // Precision 9 = year; anything coarser is approximate
  return (v?.precision ?? 9) >= 9 ? display : `c. ${display}`;
}

const UNIT_TO_CM: Record<string, number> = {
  "http://www.wikidata.org/entity/Q11573": 100, // metre
  "http://www.wikidata.org/entity/Q174728": 1, // centimetre
  "http://www.wikidata.org/entity/Q174789": 0.1, // millimetre
  "http://www.wikidata.org/entity/Q218593": 2.54, // inch
};

function lengthCmValue(entity: Entity, pid: string): number | undefined {
  const v = bestClaims(entity, pid)[0]?.mainsnak.datavalue?.value as
    | { amount?: string; unit?: string }
    | undefined;
  if (!v?.amount) return undefined;
  const factor = UNIT_TO_CM[v.unit ?? ""];
  if (factor === undefined) return undefined;
  const cm = parseFloat(v.amount) * factor;
  return Number.isFinite(cm) ? Math.round(cm * 10) / 10 : undefined;
}

function parseFacts(entity: Entity): WikidataFacts {
  return {
    imageFilename: stringValue(entity, P_IMAGE),
    creatorIds: entityIdValues(entity, P_CREATOR),
    inceptionYear: yearValue(entity, P_INCEPTION),
    materialIds: entityIdValues(entity, P_MATERIAL),
    heightCm: lengthCmValue(entity, P_HEIGHT),
    widthCm: lengthCmValue(entity, P_WIDTH),
    collectionIds: entityIdValues(entity, P_COLLECTION),
    locationIds: entityIdValues(entity, P_LOCATION),
    movementIds: entityIdValues(entity, P_MOVEMENT),
  };
}

// --- public API -----------------------------------------------------------

/**
 * Fetch structured facts for artwork entities, batched (≤50 per request)
 * and cached per entity.
 */
export async function fetchWikidataFacts(
  ids: string[],
): Promise<Record<string, WikidataFacts>> {
  const result: Record<string, WikidataFacts> = {};
  const misses: string[] = [];

  for (const id of ids) {
    const hit = cacheGet<WikidataFacts>(`wd:${id}`);
    if (hit !== undefined) result[id] = hit;
    else misses.push(id);
  }

  for (const batch of chunk(misses, BATCH_SIZE)) {
    const url = `${API}?action=wbgetentities&ids=${batch.join("|")}&format=json&props=claims&origin=*`;
    const json = await fetchJson<EntitiesResponse>(url);
    for (const id of batch) {
      const entity = json.entities?.[id];
      if (!entity?.claims) continue;
      const facts = parseFacts(entity);
      result[id] = facts;
      cacheSet(`wd:${id}`, facts);
    }
  }
  return result;
}

/**
 * Resolve entity labels (artists, museums, materials, movements) in
 * batched calls, cached per entity.
 */
export async function fetchLabels(
  ids: string[],
): Promise<Record<string, string>> {
  const unique = [...new Set(ids)];
  const result: Record<string, string> = {};
  const misses: string[] = [];

  for (const id of unique) {
    const hit = cacheGet<string>(`wdl:${id}`);
    if (hit !== undefined) result[id] = hit;
    else misses.push(id);
  }

  for (const batch of chunk(misses, BATCH_SIZE)) {
    const url = `${API}?action=wbgetentities&ids=${batch.join("|")}&format=json&props=labels&languages=en&origin=*`;
    const json = await fetchJson<EntitiesResponse>(url);
    for (const id of batch) {
      const label = json.entities?.[id]?.labels?.en?.value;
      if (label) {
        result[id] = label;
        cacheSet(`wdl:${id}`, label);
      }
    }
  }
  return result;
}

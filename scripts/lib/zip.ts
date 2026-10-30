/**
 * A small, strict reader for the Interior Ministry's results archives
 * (`02202307_MUNI.zip`): stored or deflated members, no encryption, no ZIP64,
 * read from the central directory and checked against each member's CRC-32.
 * Node built-ins only (`node:zlib`), so the importer adds no dependency.
 * Nothing is ever written to disk: members are returned as bytes.
 */
import { crc32, inflateRawSync } from "node:zlib";

export interface ZipMember {
  name: string;
  /** Modification date of the member, ISO (from its MS-DOS timestamp). */
  modified: string;
  size: number;
  read: () => Buffer;
}

/** Far above the largest Interior archive (the 2023 Senate file holds 9 MB). */
export const MAX_MEMBER_BYTES = 200 * 1024 * 1024;

const EOCD = 0x06054b50;
const CENTRAL = 0x02014b50;
const LOCAL = 0x04034b50;

export class ZipError extends Error {
  override name = "ZipError";
}

function fail(message: string): never {
  throw new ZipError(message);
}

/** MS-DOS date: day in bits 0-4, month 5-8, year since 1980 in 9-15. */
export function dosDate(value: number): string {
  const day = value & 0x1f;
  const month = (value >> 5) & 0x0f;
  const year = 1980 + (value >> 9);
  if (day < 1 || day > 31 || month < 1 || month > 12) fail(`invalid date in the archive (${value})`);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function readZip(buffer: Buffer): ZipMember[] {
  // The end-of-central-directory record sits in the last 22 + 65,535 bytes.
  let end = -1;
  for (let i = buffer.length - 22; i >= Math.max(0, buffer.length - 22 - 0xffff); i--) {
    if (buffer.readUInt32LE(i) === EOCD) {
      end = i;
      break;
    }
  }
  if (end < 0) fail("not a zip archive (no end of central directory)");
  const count = buffer.readUInt16LE(end + 10);
  const size = buffer.readUInt32LE(end + 12);
  const offset = buffer.readUInt32LE(end + 16);
  if (count === 0xffff || size === 0xffffffff || offset === 0xffffffff) fail("ZIP64 archives are not supported");
  if (offset + size > end) fail("central directory outside the archive");

  const members: ZipMember[] = [];
  let p = offset;
  for (let i = 0; i < count; i++) {
    if (buffer.readUInt32LE(p) !== CENTRAL) fail(`central directory entry ${i + 1} is damaged`);
    const flags = buffer.readUInt16LE(p + 8);
    const method = buffer.readUInt16LE(p + 10);
    const date = buffer.readUInt16LE(p + 14);
    const crc = buffer.readUInt32LE(p + 16);
    const compressed = buffer.readUInt32LE(p + 20);
    const uncompressed = buffer.readUInt32LE(p + 24);
    const nameLength = buffer.readUInt16LE(p + 28);
    const extraLength = buffer.readUInt16LE(p + 30);
    const commentLength = buffer.readUInt16LE(p + 32);
    const localOffset = buffer.readUInt32LE(p + 42);
    const name = buffer.toString("latin1", p + 46, p + 46 + nameLength);
    p += 46 + nameLength + extraLength + commentLength;

    if (name.endsWith("/")) continue;
    if (flags & 0x1) fail(`${name}: encrypted members are not supported`);
    if (method !== 0 && method !== 8) fail(`${name}: compression method ${method} is not supported`);
    if (uncompressed > MAX_MEMBER_BYTES) fail(`${name}: ${uncompressed} bytes, over the ${MAX_MEMBER_BYTES}-byte limit`);
    if (buffer.readUInt32LE(localOffset) !== LOCAL) fail(`${name}: local header is damaged`);
    const start = localOffset + 30 + buffer.readUInt16LE(localOffset + 26) + buffer.readUInt16LE(localOffset + 28);
    if (start + compressed > buffer.length) fail(`${name}: data runs past the end of the archive`);

    members.push({
      name,
      modified: dosDate(date),
      size: uncompressed,
      read: () => {
        const raw = buffer.subarray(start, start + compressed);
        const data = method === 0 ? Buffer.from(raw) : inflateRawSync(raw, { maxOutputLength: MAX_MEMBER_BYTES });
        if (data.length !== uncompressed) fail(`${name}: ${data.length} bytes, the directory says ${uncompressed}`);
        if (crc32(data) >>> 0 !== crc) fail(`${name}: CRC-32 mismatch, the archive is damaged`);
        return data;
      },
    });
  }
  return members;
}

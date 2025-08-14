export interface Timezone {
  id: string; // IANA id, e.g. Europe/Madrid
  altName?: string | null;
  utcOffset?: string | null;
}

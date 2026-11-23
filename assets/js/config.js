/*
 * New Exodus Radio: site configuration
 * ------------------------------------------------------------
 * This is the one file to edit when connecting real services.
 * Nothing secret belongs here: everything in this file is
 * visible to every visitor. API keys, passwords and private
 * listener data must live on a secure server (Phase 7).
 */
window.NER_CONFIG = {
  siteName: "New Exodus Radio",
  siteUrl: "https://newexodusradio.com",
  tagline: "Faith. Unity. Truth. Preparedness.",

  /*
   * Live stream
   * Leave `url` empty until a streaming provider is chosen.
   * While it is empty, every player on the site shows OFFLINE
   * and the play button is disabled. No broadcast is simulated.
   *
   * Examples once a provider is connected:
   *   Icecast:   "https://stream.example.com:8000/live"
   *   SHOUTcast: "https://stream.example.com:8000/;"
   *
   * `metadataUrl` (optional): an Icecast status-json.xsl URL used
   * to read the current track or program title from the stream.
   */
  stream: {
    url: "",
    provider: "none",          // "icecast" | "shoutcast" | "other" | "none"
    metadataUrl: "",
    metadataIntervalSeconds: 30,
    stationName: "New Exodus Radio"
  },

  /*
   * Broadcast schedule time zone. Program times in data/schedule.json
   * are read in this zone.
   */
  timezone: "America/New_York",

  /*
   * Feature switches. A feature stays in demonstration mode until
   * a real, secure backend is connected and its switch is turned on.
   * Forms in demonstration mode never claim that anything was sent.
   */
  features: {
    prayerRequests: false,
    guestApplications: false,
    newsletter: false,
    contactForm: false,
    store: false,
    checkout: false,
    listenerAccounts: false,
    donations: false
  },

  /* Where the JSON content files live, relative to the site root. */
  dataPath: "data/"
};

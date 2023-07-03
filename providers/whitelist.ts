if (!process.env.WHITELIST) {
  console.error("WHITELIST is not set");
  process.exit(1);
}

const WHITELIST = process.env.WHITELIST.split(",");

export function isWhitelisted(username?: string) {
  return !!username && WHITELIST.includes(username);
}

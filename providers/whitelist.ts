const WHITELIST = ["Mosquid"];

export function isWhitelisted(username?: string) {
  return !!username && WHITELIST.includes(username);
}

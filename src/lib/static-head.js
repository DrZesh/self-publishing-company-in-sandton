let metadata;
export function setStaticHead(value) { metadata = value; }
export function resetStaticHead() { metadata = undefined; }
export function getStaticHead() { return metadata; }

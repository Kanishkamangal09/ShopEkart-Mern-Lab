// A MongoDB ObjectId is exactly 24 hexadecimal characters (0-9, a-f).
// (mongoose's ObjectId.isValid also accepts any 12-character string, so we check it ourselves)
function isValidId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

module.exports = isValidId;

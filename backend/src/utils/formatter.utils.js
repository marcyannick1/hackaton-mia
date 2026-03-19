exports.parseAmount = (val) => {
  if (!val) return null;
  return parseFloat(val.toString().replace(",", "."));
};

exports.parseDate = (val) => {
  if (!val) return null;
  const parts = val.split("/");
  if (parts.length === 3) {
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  }
  return null;
};

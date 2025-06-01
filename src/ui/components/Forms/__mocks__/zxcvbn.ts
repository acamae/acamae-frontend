module.exports = (password: string) => {
  if (!password) return { score: 0 };
  if (password === 'mediapass') return { score: 1 };
  if (password === 'goodpass') return { score: 1 };
  if (password === 'strongpass') return { score: 1 };
  if (password === 'A!9=123/dB*a.zvMS') return { score: 4 };
  return { score: 0 };
};

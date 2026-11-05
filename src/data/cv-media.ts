export function youtubeEmbed(href: string): string | null {
 try {
  const url = new URL(href);
  if (!['www.youtube.com','youtube.com','youtu.be'].includes(url.hostname)) return null;
  const id = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v');
  if (!id || !/^[\w-]{11}$/.test(id)) return null;
  const time = url.searchParams.get('t') ?? '0';
  const match = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/.exec(time);
  const start = match ? Number(match[1] ?? 0)*3600+Number(match[2] ?? 0)*60+Number(match[3] ?? 0) : 0;
  return `https://www.youtube-nocookie.com/embed/${id}?start=${start}&rel=0`;
 } catch { return null; }
}
export function inlineCvParts(text: string) {
 const scholar = 'Yuri Rykov (scholar profile)';
 return text.split(/(https?:\/\/[^\s]+|Yuri Rykov \(scholar profile\))/g).filter(Boolean).map(part =>
  part === scholar ? {text:'Yuri Rykov',href:'https://scholar.google.com/citations?user=hOxcaCcAAAAJ&hl=ru'} :
  /^https?:\/\//.test(part) ? {text:part,href:part} : {text:part,href:null});
}

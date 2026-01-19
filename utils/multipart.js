import PatternBuilder from "../pattern-builder/PatternBuilder.js";
const pattern = new PatternBuilder()
  .find("boundary=")
  .group(null, { capture: true })
  .not('; ').oneOrMore()
  .endGroup()
  .toRegex();

const NAME_PATTERN = new PatternBuilder()
  .find("name=")
  .cut('"')
  .toRegex();

const FILENAME_PATTERN = new PatternBuilder()
  .find("filename=")
  .cut('"')
  .toRegex();



export const getBoundary = (data) => {
  if (typeof data !== "string") return null;
  const match = data.match(pattern)
  return match ? match[1] : null;
};

function splitBuffer(buffer, separator) {
  const parts = [];
  let start = 0;

  let index = buffer.indexOf(separator, start);

  while (index !== -1) {
    let cut = buffer.subarray(start, index);
    parts.push(cut);
    start = index + separator.length;
    index = buffer.indexOf(separator, start);
  }
  parts.push(buffer.subarray(start));
  return parts;
}

export const parseMultipart = (bodyBuffer, boundary) => {
  const results = {
    files: {},
    fields: {}
  }

  const separator = Buffer.from(`--${boundary}`);
  let parts = splitBuffer(bodyBuffer, separator);

  for (const p of parts) {
    if (p.length < 4) continue;
    const headerIndex = p.indexOf(Buffer.from('\r\n\r\n'));
    if (headerIndex === -1) continue;

    const headerPart = p.subarray(0, headerIndex).toString('utf-8');
    let bodyPart = p.subarray(headerIndex + 4, p.length)

    if (bodyPart.length >= 2 && bodyPart[bodyPart.length - 2] === 13 && bodyPart[bodyPart.length - 1] === 10) {
      bodyPart = bodyPart.subarray(0, bodyPart.length - 2)
    }

    const nameMatch = headerPart.match(NAME_PATTERN);
    const filenameMatch = headerPart.match(FILENAME_PATTERN);
    if (filenameMatch) {
      const filename = filenameMatch[1];
      const name = nameMatch ? nameMatch[1] : 'file';

      results.files[name] = {
        filename,
        type: 'application/octet-stream',
        data: bodyPart,
        size: bodyPart.length
      }
    }
    else if (nameMatch) {
      const name = nameMatch[1];
      results.fields[name] = bodyPart.toString('utf-8');
    }
  }
  return results;
}
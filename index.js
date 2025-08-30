const fs = require('fs');
const path = process.argv[2] || 'input.json';

function parseInBase(str, base) {
  if (base < 2 || base > 36) throw new Error(`Unsupported base: ${base}`);
  let res = 0n;
  const B = BigInt(base);

  for (const ch0 of str.trim()) {
    const ch = ch0.toLowerCase();
    let v;
    if (ch >= '0' && ch <= '9') v = ch.charCodeAt(0) - '0'.charCodeAt(0);
    else if (ch >= 'a' && ch <= 'z') v = 10 + ch.charCodeAt(0) - 'a'.charCodeAt(0);
    else throw new Error(`Invalid digit '${ch0}' in value '${str}'`);

    if (v >= base) throw new Error(`Digit '${ch0}' >= base ${base} in value '${str}'`);
    res = res * B + BigInt(v);
  }
  return res;
}

function multiplyByLinear(coeffs, root) {
  const L = coeffs.length;
  const out = Array(L + 1).fill(0n);
  for (let i = 0; i < L; i++) {
    out[i] += -root * coeffs[i]; 
    out[i + 1] += coeffs[i];   
  }
  return out;
}
const raw = fs.readFileSync(path, 'utf8');
const data = JSON.parse(raw);


const { n, k } = data.keys;
const m = k - 1;

const rootKeys = Object.keys(data)
  .filter((key) => key !== 'keys')
  .sort((a, b) => Number(a) - Number(b));


const allRoots = rootKeys.map((rk) => {
  const base = Number(data[rk].base);
  const value = String(data[rk].value);
  return parseInBase(value, base);
});


if (allRoots.length < m) {
  throw new Error(`Not enough roots: have ${allRoots.length}, need ${m}`);
}
const selectedRoots = allRoots.slice(0, m);


let coeffs = [1n]; 
for (const r of selectedRoots) {
  coeffs = multiplyByLinear(coeffs, r);
}

const coeffsAsc = coeffs.map((c) => c.toString());         
const coeffsDesc = [...coeffs].reverse().map((c) => c.toString());

console.log(`Degree (m): ${m}`);
console.log(`Roots used (first ${m}): ${selectedRoots.map((r) => r.toString()).join(', ')}`);
console.log(`Coefficients (ascending degree a0..am):`);
console.log(JSON.stringify(coeffsAsc));
console.log(`Coefficients (descending degree a_m..a0):`);
console.log(JSON.stringify(coeffsDesc));

// Renders the master SVGs into the app icon set. Run with `pnpm icons`.
import { mkdir } from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const root = path.resolve(import.meta.dirname, "..")
const read = (rel) => path.join(root, rel)

const jobs = [
  { src: "public/icons/master.svg", out: "src/app/icon.png", size: 192 },
  {
    src: "public/icons/master.svg",
    out: "public/icons/icon-192.png",
    size: 192,
  },
  { src: "public/icons/master.svg", out: "src/app/apple-icon.png", size: 180 },
  {
    src: "public/icons/master.svg",
    out: "public/icons/icon-512.png",
    size: 512,
  },
  {
    src: "public/icons/master-maskable.svg",
    out: "public/icons/icon-maskable-512.png",
    size: 512,
  },
]

for (const job of jobs) {
  await mkdir(path.dirname(read(job.out)), { recursive: true })
  await sharp(read(job.src), { density: 384 })
    .resize(job.size, job.size)
    .png()
    .toFile(read(job.out))
  process.stdout.write(`wrote ${job.out} (${job.size}x${job.size})\n`)
}

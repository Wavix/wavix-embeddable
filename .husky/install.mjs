if (process.env.CI) {
  process.exit(0)
}

const husky = (await import("husky")).default
console.log(husky())

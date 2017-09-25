import sharp from 'sharp'

function getBackgroundColor(metadata, opts) {
  if (opts.background) {
    return opts.background
  }
  return metadata.hasAlpha ? { r: 0, g: 0, b: 0, alpha: 0 } : { r: 255, g: 255, b: 255 }
}

async function createNewImage(file1, file2, opts = {}) {
  const [metadata1, metadata2] = await Promise.all([sharp(file1).metadata(), sharp(file2).metadata()])
  const format = opts.format ? opts.format : metadata1.format

  const width = metadata1.width + metadata2.width
  const height = metadata1.height
  const channels = metadata1.channels
  const background = getBackgroundColor(metadata1, opts)

  return sharp({ create: { width, height, channels, background } })[format]()
}

async function matchImageSizes(file1, file2) {
  const [metadata1, metadata2] = await Promise.all([sharp(file1).metadata(), sharp(file2).metadata()])

  if (metadata1.height > metadata2.height) {
    const resized1 = await sharp(file1)
      .resize(null, metadata2.height).toBuffer()
    return [resized1, file2]
  }

  if (metadata2.height > metadata1.height) {
    const resized2 = await sharp(file2)
      .resize(null, metadata1.height).toBuffer()
    return [file1, resized2]
  }

  return [file1, file2]
}

export const merge = async (files, opts) => {
  if (files.filter(f => !!f).length !== 2) {
    throw new Error('merge should be called with two parameters')
  }

  const [file1, file2] = await matchImageSizes(files[0], files[1])

  let image = await createNewImage(file1, file2, opts)
  image = sharp(await image.toBuffer()).overlayWith(file1, { gravity: sharp.gravity.west })
  image = sharp(await image.toBuffer()).overlayWith(file2, { gravity: sharp.gravity.east })
  return image.toBuffer()
}
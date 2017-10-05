import sharp from 'sharp'

async function getMetadata(file) {
  const { width, height, channels, format, hasAlpha } = await sharp(file).metadata()
  return { width, height, channels, format, hasAlpha }
}

async function createFile(file1, file2, opts) {
  let image = sharp({ create: opts })[opts.format]()
  image = sharp(await image.toBuffer()).overlayWith(file1, { gravity: sharp.gravity.west })
  image = sharp(await image.toBuffer()).overlayWith(file2, { gravity: sharp.gravity.east })
  return image.toBuffer()
}

function getOptions(metadata1, metadata2, opts) {
  return {
    width: metadata1.width + metadata2.width,
    height: metadata1.height,
    channels: metadata1.channels,
    format: opts.format ? opts.format : metadata1.format,
    background: opts.background ? opts.background : metadata1.hasAlpha ? { r: 0, g: 0, b: 0, alpha: 0 } : {
      r: 255,
      g: 255,
      b: 255
    },
    quality: 100
  }
}

function resizeImage(file, height) {
  return sharp(file).resize(null, height).toBuffer()
}

export const merge = async (files, opts = {}) => {
  if (files.filter(f => !!f).length !== 2) {
    throw new Error('merge should be called with two parameters')
  }

  const [metadata1, metadata2] = await Promise.all([getMetadata(files[0]), getMetadata(files[1])])

  if (metadata1.height > metadata2.height) {
    const resized = await resizeImage(files[0], metadata2.height)
    const resizedMetadata = await getMetadata(resized)
    return createFile(resized, files[1], getOptions(resizedMetadata, metadata2, opts))
  } else if (metadata2.height > metadata1.height) {
    const resized = await sharp(files[1]).resize(null, metadata1.height).toBuffer()
    const resizedMetadata = await getMetadata(resized)
    return createFile(files[0], resized, getOptions(metadata1, resizedMetadata, opts))
  } else {
    return createFile(files[0], files[1], getOptions(metadata1, metadata2, opts))
  }
}
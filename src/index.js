import sharp from 'sharp'

async function getMetadata(file) {
  const { width, height, channels, format, hasAlpha } = await sharp(file).metadata()
  return { width, height, channels, format, hasAlpha }
}

async function createFile(file1, file2, opts) {
  const { output } = opts
  let image = sharp({ create: opts })[opts.format](output)
  image = sharp(await image.toBuffer()).overlayWith(file1, { gravity: sharp.gravity.west })[opts.format](output)
  image = sharp(await image.toBuffer()).overlayWith(file2, { gravity: sharp.gravity.east })[opts.format](output)
  return image[opts.format](output).toBuffer()
}

function getOptions(metadata1, metadata2, opts) {
  return {
    width: metadata1.width + metadata2.width,
    height: metadata1.height,
    channels: metadata1.channels,
    format: opts.format ? opts.format : metadata1.format,
    output: opts.output || {},
    background: opts.background ? opts.background : metadata1.hasAlpha ? { r: 0, g: 0, b: 0, alpha: 0 } : {
      r: 255,
      g: 255,
      b: 255
    }
  }
}

async function resizeImage(file, height) {
  const resizedFile = await sharp(file).resize(null, height).toBuffer()
  const metadata = await getMetadata(resizedFile)
  return { file: resizedFile, metadata }
}

export const merge = async (files, opts = {}) => {
  if (files.filter(f => !!f).length !== 2) {
    throw new Error('merge should be called with two parameters')
  }

  const [metadata1, metadata2] = await Promise.all([getMetadata(files[0]), getMetadata(files[1])])

  if (metadata1.height > metadata2.height) {
    const { file, metadata } = await resizeImage(files[0], metadata2.height)
    return createFile(file, files[1], getOptions(metadata, metadata2, opts))
  } else if (metadata2.height > metadata1.height) {
    const { file, metadata } = await resizeImage(files[1], metadata1.height)
    return createFile(files[0], file, getOptions(metadata1, metadata, opts))
  } else {
    return createFile(files[0], files[1], getOptions(metadata1, metadata2, opts))
  }
}

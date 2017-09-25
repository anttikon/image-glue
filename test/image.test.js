import fs from 'fs'
import { merge } from '../src/index'
import path from 'path'
import sharp from 'sharp'

async function expectImage(file) {
  const { width, height, format, hasAlpha, channels } = await sharp(file).metadata()
  expect({ width, height, format, hasAlpha, channels }).toMatchSnapshot()
}

describe('merge', () => {

  beforeAll(() => {
    if (!fs.existsSync(path.resolve(__dirname, 'results'))) {
      fs.mkdirSync(path.resolve(__dirname, 'results'))
    }
  })

  it('merge equal size images', async () => {
    const file1 = fs.readFileSync(path.resolve(__dirname, 'images/50x50_sun.jpg'))
    const file2 = fs.readFileSync(path.resolve(__dirname, 'images/50x50_v.jpg'))

    await expectImage(file1)
    await expectImage(file2)

    const mergedFile = await merge([file1, file2])
    fs.writeFileSync(path.resolve(__dirname, 'results/50x50_sun_v.jpg'), mergedFile)
    await expectImage(mergedFile)
  })

  it('merge smaller image with larger image', async () => {
    const file1 = fs.readFileSync(path.resolve(__dirname, 'images/50x50_sun.jpg'))
    const file2 = fs.readFileSync(path.resolve(__dirname, 'images/100x100_beer.jpg'))

    await expectImage(file1)
    await expectImage(file2)

    const mergedFile = await merge([file1, file2])
    fs.writeFileSync(path.resolve(__dirname, 'results/50x50_sun_beer.jpg'), mergedFile)
    await expectImage(mergedFile)
  })

  it('merge larger image with smaller image', async () => {
    const file1 = fs.readFileSync(path.resolve(__dirname, 'images/100x100_donut.jpg'))
    const file2 = fs.readFileSync(path.resolve(__dirname, 'images/50x50_sun.jpg'))

    await expectImage(file1)
    await expectImage(file2)

    const mergedFile = await merge([file1, file2])
    fs.writeFileSync(path.resolve(__dirname, 'results/50x50_donut_sun.jpg'), mergedFile)
    await expectImage(mergedFile)
  })

  it('from transparent', async () => {
    const file1 = fs.readFileSync(path.resolve(__dirname, 'images/100x100_donut.png'))
    const file2 = fs.readFileSync(path.resolve(__dirname, 'images/50x50_sun.jpg'))

    await expectImage(file1)
    await expectImage(file2)

    const mergedFile = await merge([file1, file2])
    fs.writeFileSync(path.resolve(__dirname, 'results/50x50_donut_sun.png'), mergedFile)
    await expectImage(mergedFile)
  })

  it('to transparent', async () => {
    const file1 = fs.readFileSync(path.resolve(__dirname, 'images/50x50_v.jpg'))
    const file2 = fs.readFileSync(path.resolve(__dirname, 'images/100x100_beer.png'))

    await expectImage(file1)
    await expectImage(file2)

    const mergedFile = await merge([file1, file2])
    fs.writeFileSync(path.resolve(__dirname, 'results/50x50_v_beer.jpg'), mergedFile)
    await expectImage(mergedFile)
  })

  it('should require two parameters', async () => {
    const file1 = fs.readFileSync(path.resolve(__dirname, 'images/50x50_v.jpg'))
    await expect(merge([file1])).rejects.toEqual(new Error('merge should be called with two parameters'))
    await expect(merge([null])).rejects.toEqual(new Error('merge should be called with two parameters'))
    await expect(merge([file1, null])).rejects.toEqual(new Error('merge should be called with two parameters'))
    await expect(merge([null, file1])).rejects.toEqual(new Error('merge should be called with two parameters'))
  })

  it('target filetype', async () => {
    const file1 = fs.readFileSync(path.resolve(__dirname, 'images/50x50_v.jpg'))
    const file2 = fs.readFileSync(path.resolve(__dirname, 'images/100x100_beer.png'))

    await expectImage(file1)
    await expectImage(file2)

    const mergedFile = await merge([file1, file2], { format: 'png' })
    fs.writeFileSync(path.resolve(__dirname, 'results/50x50_v_beer.png'), mergedFile)
    await expectImage(mergedFile)
  })
  it('target background color', async () => {
    const file1 = fs.readFileSync(path.resolve(__dirname, 'images/100x100_donut.png'))
    const file2 = fs.readFileSync(path.resolve(__dirname, 'images/100x100_beer.png'))

    await expectImage(file1)
    await expectImage(file2)

    const mergedFile = await merge([file1, file2], { format: 'png', background: { r: 150, g: 150, b: 150 } })
    fs.writeFileSync(path.resolve(__dirname, 'results/100x100_donut_beer.png'), mergedFile)
    await expectImage(mergedFile)
  })

})
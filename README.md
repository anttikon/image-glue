## image-glue

Library to combine two images:
![](https://raw.githubusercontent.com/anttikon/image-glue/master/misc/50x50_sun.jpg)
➕
![](https://raw.githubusercontent.com/anttikon/image-glue/master/misc/50x50_v.jpg)
🔜
![](https://raw.githubusercontent.com/anttikon/image-glue/master/misc/100x50_sun_v.jpg)

### Installation

```bash
npm i --save image-glue
```

### Use

```javascript
import fs from 'fs'
import {merge} from 'image-glue'

const image1 = fs.readFileSync('./image1.jpg')
const image2 = fs.readFileSync('./image2.jpg')
const opts = { format: 'jpg', background: { r: 150, g: 150, b: 150 } }
merge([image1, image2], opts).then(combinedImage => fs.writeFileSync('./combined-image.jpg', combinedImage))
```

#### opts

Property | Explanation
------------ | -------------
format | Output format. Defaults to the format of the first image.
background | Background color. Defaults to `{ r: 255, g: 255, b: 255 }` if first image does not have the alpha channel. Defaults to `{ r: 0, g: 0, b: 0, alpha: 0 }` if the first image does have the alpha channel
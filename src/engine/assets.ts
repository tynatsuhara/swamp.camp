import { Engine } from "./engine"

class Assets {

    private readonly map = new Map<string, HTMLImageElement>()

    loadImageFiles(relativePaths: string[]): Promise<any> {
        const promises = relativePaths.map(path => new Promise(resolve => {
            var loadingImage = new Image()
            loadingImage.onload = () => {
                this.map.set(path, loadingImage)
                resolve()
            }
            loadingImage.src = path
        }))

        return Promise.all(promises).then(() => console.log(this.map))
    }

    getImageByFileName(fileName: string): HTMLImageElement {
        const result = this.map.get(fileName)
        if (!result) {
            throw new Error(`file ${fileName} does not exist`)
        }
        return result
    }
}

export const assets = new Assets()
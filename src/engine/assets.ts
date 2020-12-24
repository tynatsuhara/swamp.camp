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

        return Promise.all(promises)
    }

    getImageByFileName(fileName: string): HTMLImageElement {
        return this.map.get(fileName)
    }
}

export const assets = new Assets()
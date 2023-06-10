import { start } from "./game"

const main = async () => {
    await start()
    console.log("this is content that is only included in the native app!")
}

main()

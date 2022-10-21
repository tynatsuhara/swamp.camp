// WIP

const Features = {
    sprite: (key: String) => {},
    droppedItem: () => {},
    barrier: () => {},
}

export type Feature = keyof typeof Features

const addFeature = <F extends Feature, Fn extends typeof Features[F]>(
    feature: F,
    ...args: Parameters<Fn>
) => {
    Features[feature](args[0])
}

addFeature("sprite", "key example")

const adjustVolume = (
    initialVolume: number,
    newVolume: number,
    setVolume: (number) => void,
    duration = 1000,
    interval = 13,
): Promise<void> => {
    const delta = newVolume - initialVolume;

    if (!delta || !duration || !interval) {
        setVolume(newVolume);
        return Promise.resolve();
    }

    const ticks = Math.floor(duration / interval);
    let tick = 1;

    return new Promise(resolve => {
        const timer = setInterval(() => {
            setVolume(initialVolume + (swing(tick / ticks) * delta));

            tick++
            if (tick === (ticks + 1)) {
                clearInterval(timer);
                resolve();
            }
        }, interval);
    });
}

const swing = (p: number) => {
    return 0.5 - Math.cos(p * Math.PI) / 2;
}

export const AudioUtils = {
    adjustVolume
}